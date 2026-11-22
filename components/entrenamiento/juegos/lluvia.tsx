"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"
import { CloudRain } from "lucide-react"
import { BotonSeguir } from "@/components/entrenamiento/boton-seguir"
import { Emoji } from "@/components/entrenamiento/dibujo"
import { ResumenSeleccion, type TextosResumen } from "@/components/entrenamiento/seleccion"
import type { PropsJuego } from "@/components/entrenamiento/juegos/tipos"
import { useRondas } from "@/components/entrenamiento/use-rondas"
import { RESORTE } from "@/components/motion/transiciones"
import { Personaje } from "@/components/personajes/personaje"
import type { Grado, Nivel } from "@/lib/entrenamiento/juegos"
import {
  COLORES_LLUVIA,
  carrilesQueEntran,
  crearReloj,
  gotasVisibles,
  nombreElemento,
  objetivosAparecidos,
  planLluvia,
  resultadoLluvia,
  type CategoriaLluvia,
  type ConteoLluvia,
  type Gota,
  type ItemLluvia,
  type PlanLluvia,
  type Reloj,
} from "@/lib/entrenamiento/lluvia"
import { puntajeSeleccion, seleccionPerfecta, type PuntajeSeleccion } from "@/lib/entrenamiento/seleccion"
import { cn } from "@/lib/utils"

const TEXTOS_RESUMEN: TextosResumen = {
  encontrados: ["atrapado", "atrapados"],
  omitidos: ["se escapó", "se escaparon"],
  equivocados: ["toque de más", "toques de más"],
}

/** Cuánto dura el efecto de un toque antes de que el elemento desaparezca. */
const EFECTO_TOQUE_MS = 450

/**
 * Lluvia (inicial: complementario de denominación rápida; primario: de
 * reconocimiento visual). Durante 30 segundos caen elementos por carriles y
 * el niño toca solo los iguales a la muestra. La partida son 3 lluvias.
 *
 * Antes de cada lluvia, una tarjeta con la muestra grande y "¡Que empiece la
 * lluvia!": nada empieza solo. Durante la lluvia la muestra queda arriba,
 * chica, y el tiempo es una barrita que se vacía (sin números). Un objetivo
 * tocado estalla; un distractor se sacude en rojo y desaparece; un objetivo
 * que llega abajo se desvanece. A los 30 s se desvanece lo que queda y
 * aparece el resumen con "Seguir".
 *
 * Técnica: el plan (qué cae, cuándo y por dónde) es lógica pura
 * (lib/entrenamiento/lluvia.ts). Un solo requestAnimationFrame mueve los
 * elementos con estilos directos: React solo vuelve a dibujar cuando entra
 * o sale un elemento. El reloj se pausa si la pestaña queda oculta.
 *
 * Con reducir movimiento nada cae: cada elemento aparece en una casilla fija
 * de su carril y se desvanece después del mismo tiempo. El movimiento es
 * parte esencial de la actividad (excepción de WCAG 2.2.2). Cada elemento es
 * un botón (Tab y Enter o Espacio).
 */
export function Lluvia({ nivel, grado, items, onRonda }: PropsJuego<ItemLluvia>) {
  const conteos = useRef<ConteoLluvia[]>([])
  const r = useRondas(items, onRonda, { completar: (res) => resultadoLluvia(res, conteos.current) })
  if (!r.item) return null
  const ronda = r.estado.actual
  return (
    <RondaLluvia
      key={ronda}
      nivel={nivel}
      grado={grado}
      item={r.item}
      ronda={r}
      onTerminar={(conteo) => {
        conteos.current[ronda] = conteo
      }}
    />
  )
}

type Fase = "antes" | "lloviendo" | "fin"

function RondaLluvia({
  nivel,
  grado,
  item,
  ronda: r,
  onTerminar,
}: {
  nivel: Nivel
  grado: Grado
  item: ItemLluvia
  ronda: ReturnType<typeof useRondas<ItemLluvia>>
  onTerminar: (conteo: ConteoLluvia) => void
}) {
  // Respeta MotionConfig (reducedMotion="user" en la app: la preferencia del sistema).
  const reducir = useReducedMotionConfig() ?? false
  const [fase, setFase] = useState<Fase>("antes")
  const [plan, setPlan] = useState<PlanLluvia | null>(null)
  const [visibles, setVisibles] = useState<number[]>([])
  const [tocadas, setTocadas] = useState<Record<number, "bien" | "mal">>({})
  const [puntaje, setPuntaje] = useState<PuntajeSeleccion | null>(null)
  const [anchoCarril, setAnchoCarril] = useState(120)

  const zona = useRef<HTMLDivElement>(null)
  const barra = useRef<HTMLDivElement>(null)
  const elementos = useRef(new Map<number, HTMLDivElement>())
  const reloj = useRef<Reloj | null>(null)
  const tocadasRef = useRef(new Map<number, "bien" | "mal">())
  const ocultas = useRef(new Set<number>())
  const visiblesRef = useRef<number[]>([])
  const temporizadores = useRef<ReturnType<typeof setTimeout>[]>([])

  const empezar = () => {
    const ancho = zona.current?.clientWidth ?? 600
    const carriles = carrilesQueEntran(nivel, ancho)
    setAnchoCarril(ancho / carriles)
    setPlan(planLluvia(item, nivel, grado, { carriles }))
    reloj.current = crearReloj()
    setFase("lloviendo")
  }

  const terminar = useCallback(
    (p: PlanLluvia) => {
      const objetivos = objetivosAparecidos(p)
      const marcados = [...tocadasRef.current.keys()]
      const pj = puntajeSeleccion({ objetivos, marcados })
      setPuntaje(pj)
      onTerminar({ aparecieron: objetivos.length, tocados: pj.encontrados, equivocados: pj.equivocados })
      setFase("fin")
      r.resolver(seleccionPerfecta(pj))
    },
    [onTerminar, r],
  )
  const terminarRef = useRef(terminar)
  terminarRef.current = terminar

  // Un solo bucle de animación: mueve los elementos con estilos directos.
  useEffect(() => {
    if (fase !== "lloviendo" || !plan || !reloj.current) return
    const rel = reloj.current
    let cuadro = 0
    const tick = () => {
      const t = rel.transcurrido()
      if (t >= plan.duracionMs) {
        terminarRef.current(plan)
        return
      }
      const vis = gotasVisibles(plan, t)
      const ids = vis.map((v) => v.gota.id).filter((id) => !ocultas.current.has(id))
      if (ids.length !== visiblesRef.current.length || ids.some((id, i) => id !== visiblesRef.current[i])) {
        visiblesRef.current = ids
        setVisibles(ids)
      }
      const alto = zona.current?.clientHeight ?? 400
      for (const { gota, progreso } of vis) {
        const el = elementos.current.get(gota.id)
        if (!el || tocadasRef.current.has(gota.id)) continue
        // Se desvanece al llegar abajo (y, sin movimiento, al final de su tiempo).
        el.style.opacity = progreso > 0.9 ? String(Math.max(0, (1 - progreso) / 0.1)) : "1"
        if (!reducir) el.style.transform = `translate3d(0, ${progreso * (alto - el.offsetHeight)}px, 0)`
      }
      if (barra.current) barra.current.style.transform = `scaleX(${1 - t / plan.duracionMs})`
      cuadro = requestAnimationFrame(tick)
    }
    cuadro = requestAnimationFrame(tick)

    // Pestaña oculta: se pausa y, al volver, sigue sin contar ese tiempo.
    const alCambiarVisibilidad = () => (document.hidden ? rel.pausar() : rel.reanudar())
    document.addEventListener("visibilitychange", alCambiarVisibilidad)
    return () => {
      cancelAnimationFrame(cuadro)
      document.removeEventListener("visibilitychange", alCambiarVisibilidad)
    }
  }, [fase, plan, reducir])

  // Al desmontar (salir o pasar de lluvia), se limpia todo.
  useEffect(() => {
    const t = temporizadores.current
    return () => t.forEach(clearTimeout)
  }, [])

  const tocar = (gota: Gota) => {
    if (fase !== "lloviendo" || tocadasRef.current.has(gota.id)) return
    const resultado = gota.esObjetivo ? "bien" : "mal"
    tocadasRef.current.set(gota.id, resultado)
    setTocadas((t) => ({ ...t, [gota.id]: resultado }))
    temporizadores.current.push(setTimeout(() => ocultas.current.add(gota.id), EFECTO_TOQUE_MS))
  }

  const muestra = (chica: boolean) => (
    <div className={cn("flex flex-wrap items-center justify-center", chica ? "gap-2" : "gap-4")}>
      {item.objetivos.map((o) => (
        <span
          key={o}
          className={cn(
            "grid place-items-center rounded-2xl border-[3px] border-white bg-white shadow-media",
            item.categoria === "palabras"
              ? chica
                ? "h-11 px-3"
                : "h-20 px-6"
              : chica
                ? "size-11"
                : "size-24 sm:size-28",
          )}
        >
          <span className="sr-only">{nombreElemento(item.categoria, o)}</span>
          <Contenido categoria={item.categoria} valor={o} tamano={chica ? "chico" : "grande"} />
        </span>
      ))}
    </div>
  )

  if (fase === "antes") {
    return (
      <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-6 outline-none">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={RESORTE}
          className="relative flex w-full max-w-2xl flex-col items-center gap-5 overflow-hidden rounded-[2rem] border-[3px] border-white bg-gradient-to-b from-celeste-suave via-white to-sol-suave px-6 py-6 shadow-elevada sm:flex-row sm:px-8"
        >
          <div aria-hidden="true" className="shrink-0">
            <Personaje
              personaje="lumo"
              pose="explicando"
              animacion="flotarSuave"
              decorativo
              claseImagen="w-20 sm:w-28"
            />
          </div>
          <div className="flex flex-1 flex-col items-center gap-4 text-center">
            <p className="text-xl font-bold text-foreground sm:text-2xl">
              {item.objetivos.length === 1 ? "Tocá solo este" : "Tocá solo estos"}
            </p>
            {muestra(false)}
          </div>
        </motion.div>
        {/* La zona se mide antes de empezar para saber cuántos carriles entran. */}
        <div ref={zona} aria-hidden="true" className="-mx-3 h-0 w-[calc(100%+1.5rem)] sm:mx-0 sm:w-full" />
        <motion.button
          type="button"
          onClick={empezar}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex min-h-16 items-center justify-center gap-3 whitespace-nowrap rounded-full bg-celeste-fuerte px-6 text-lg font-bold text-white shadow-boton outline-none focus-visible:ring-4 focus-visible:ring-celeste/60 sm:px-10 sm:text-2xl"
        >
          <CloudRain className="size-7" aria-hidden="true" />
          ¡Que empiece la lluvia!
        </motion.button>
      </div>
    )
  }

  const gotas = plan?.gotas ?? []

  return (
    <div ref={r.refRonda} tabIndex={-1} className="flex flex-col items-center gap-3 outline-none sm:gap-4">
      {/* La muestra, chica, a la vista todo el tiempo. */}
      <div className="flex items-center gap-3 rounded-full bg-white/90 py-1.5 pl-4 pr-2 shadow-suave">
        <span className="text-base font-bold text-foreground">Tocá solo:</span>
        {muestra(true)}
      </div>

      {/* El tiempo que queda: una barrita fina que se vacía, sin números. */}
      <div aria-hidden="true" className="h-2 w-full max-w-md overflow-hidden rounded-full bg-border/60">
        <div
          ref={barra}
          className="h-full origin-left rounded-full bg-celeste-fuerte"
          style={{ transform: `scaleX(${fase === "fin" ? 0 : 1})` }}
        />
      </div>

      <motion.div
        ref={zona}
        role="group"
        aria-label="Zona de la lluvia"
        className="relative -mx-3 h-[26rem] w-[calc(100%+1.5rem)] overflow-hidden rounded-[2rem] border-[3px] border-white bg-gradient-to-b from-celeste-suave via-[#eef9fc] to-white shadow-media sm:mx-0 sm:h-[30rem] sm:w-full"
      >
        <GotitasDeFondo apagadas={fase === "fin" || reducir} />
        <Nubes />
        {/* Al terminar, lo que queda en pantalla se desvanece. */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: fase === "fin" ? 0 : 1 }}
          transition={{ duration: 0.6 }}
        >
          {plan &&
            visibles.map((id) => {
              const gota = gotas[id]
              const estado = tocadas[id]
              const ancho = 100 / plan.carriles
              return (
                <div
                  key={id}
                  ref={(el) => {
                    if (el) elementos.current.set(id, el)
                    else elementos.current.delete(id)
                  }}
                  className="absolute left-0 top-0 flex justify-center px-1 will-change-transform"
                  style={{
                    left: `${gota.carril * ancho}%`,
                    width: `${ancho}%`,
                    top: reducir ? `calc(${gota.fila} * (100% / ${plan.filas}))` : 0,
                    height: reducir ? `calc(100% / ${plan.filas})` : undefined,
                    alignItems: "center",
                  }}
                >
                  <GotaBoton
                    gota={gota}
                    categoria={item.categoria}
                    estado={estado}
                    anchoCarril={anchoCarril}
                    onTocar={() => tocar(gota)}
                    deshabilitada={fase !== "lloviendo"}
                  />
                </div>
              )
            })}
        </motion.div>
        <AnimatePresence>
          {fase === "fin" && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 grid place-items-center text-3xl font-bold text-celeste-fuerte"
            >
              ¡Paró la lluvia!
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {fase === "fin" && puntaje && <ResumenSeleccion puntaje={puntaje} textos={TEXTOS_RESUMEN} />}
      {r.resuelta && <BotonSeguir ultima={r.ultima} onClick={r.siguiente} />}
    </div>
  )
}

/** Un elemento que cae: todos con el mismo fondo; el contenido según la categoría. */
function GotaBoton({
  gota,
  categoria,
  estado,
  anchoCarril,
  onTocar,
  deshabilitada,
}: {
  gota: Gota
  categoria: CategoriaLluvia
  estado: "bien" | "mal" | undefined
  anchoCarril: number
  onTocar: () => void
  deshabilitada: boolean
}) {
  const esPalabra = categoria === "palabras"
  // Las palabras se achican para entrar en su carril (sin cortarse).
  const tamanoPalabra = esPalabra ? Math.min(22, (anchoCarril - 16) / (gota.valor.length * 0.7)) : undefined
  return (
    <motion.button
      type="button"
      onClick={onTocar}
      disabled={deshabilitada || estado !== undefined}
      aria-label={nombreElemento(categoria, gota.valor)}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={
        estado === "bien"
          ? { scale: [1, 1.35], opacity: [1, 0] }
          : estado === "mal"
            ? { x: [0, -8, 8, -6, 6, 0], opacity: [1, 1, 1, 1, 1, 0] }
            : { opacity: 1, scale: 1 }
      }
      transition={estado ? { duration: EFECTO_TOQUE_MS / 1000, ease: "easeOut" } : RESORTE}
      className={cn(
        "relative grid place-items-center rounded-2xl border-[3px] bg-white shadow-media outline-none",
        "focus-visible:ring-4 focus-visible:ring-celeste-fuerte/60 disabled:cursor-default",
        esPalabra ? "h-14 w-full min-w-11 px-1" : "size-[4.5rem] max-w-full",
        estado === "bien"
          ? "border-menta bg-menta-suave"
          : estado === "mal"
            ? "border-rojo bg-rojo-suave"
            : "border-white",
      )}
      style={tamanoPalabra ? { fontSize: `${tamanoPalabra}px` } : undefined}
    >
      <Contenido categoria={categoria} valor={gota.valor} tamano="medio" />
      {estado === "bien" && <Destello />}
    </motion.button>
  )
}

/** Destellos que salen al atrapar un objetivo. */
function Destello() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <motion.span
            key={i}
            className={cn("absolute left-1/2 top-1/2 size-2.5 rounded-full", i % 2 ? "bg-sol" : "bg-menta")}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: Math.cos(a) * 46, y: Math.sin(a) * 46, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
        )
      })}
    </span>
  )
}

/** Gotitas finas que caen de fondo, para el clima de lluvia. Decorativas; sin movimiento, no se muestran. */
const GOTITAS = Array.from({ length: 16 }, (_, i) => ({
  izquierda: (i * 37) % 100,
  retraso: ((i * 13) % 20) / 10,
  duracion: 1.1 + ((i * 7) % 8) / 10,
}))

function GotitasDeFondo({ apagadas }: { apagadas: boolean }) {
  if (apagadas) return null
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {GOTITAS.map((g, i) => (
        <motion.span
          key={i}
          className="absolute top-0 h-6 w-[2px] rounded-full bg-celeste/50"
          style={{ left: `${g.izquierda}%` }}
          initial={{ y: "-10%", opacity: 0 }}
          animate={{ y: ["0%", "2400%"], opacity: [0, 0.8, 0] }}
          transition={{ duration: g.duracion, delay: g.retraso, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  )
}

/** Nubes decorativas arriba de la zona. */
function Nubes() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex justify-around opacity-70">
      {["-translate-y-3", "-translate-y-5", "-translate-y-2", "-translate-y-4"].map((c, i) => (
        <span key={i} className={cn("block", c)}>
          <Emoji char="☁️" className="size-14 sm:size-16" />
        </span>
      ))}
    </div>
  )
}

function Contenido({
  categoria,
  valor,
  tamano,
}: {
  categoria: CategoriaLluvia
  valor: string
  tamano: "chico" | "medio" | "grande"
}) {
  if (categoria === "colores") {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "block rounded-full border-2 border-foreground/10",
          tamano === "chico" ? "size-7" : tamano === "medio" ? "size-11" : "size-16 sm:size-20",
        )}
        style={{ backgroundColor: COLORES_LLUVIA[valor] }}
      />
    )
  }
  if (categoria === "objetos") {
    return (
      <Emoji
        char={valor}
        className={tamano === "chico" ? "size-8" : tamano === "medio" ? "size-12" : "size-16 sm:size-20"}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "whitespace-nowrap font-bold leading-none text-foreground",
        categoria === "vocales" && (tamano === "chico" ? "text-2xl" : tamano === "medio" ? "text-4xl" : "text-6xl"),
        categoria === "palabras" && tamano === "chico" && "text-lg",
        categoria === "palabras" && tamano === "grande" && "text-3xl sm:text-4xl",
      )}
    >
      {valor}
    </span>
  )
}
