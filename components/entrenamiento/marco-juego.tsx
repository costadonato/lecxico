"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowLeft, Home, Play, RotateCcw, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BotonEscuchar } from "@/components/entrenamiento/boton-escuchar"
import { COLOR_BLOQUE } from "@/components/entrenamiento/colores-bloque"
import { Emoji } from "@/components/entrenamiento/dibujo"
import { COMPONENTES_JUEGO } from "@/components/entrenamiento/juegos"
import type { EventoRonda } from "@/components/entrenamiento/juegos/tipos"
import { AreaLetra, ProveedorLetra, useLetra } from "@/components/entrenamiento/proveedor-letra"
import { SwitchLetra } from "@/components/entrenamiento/switch-letra"
import { FondoDecorado } from "@/components/fondo-decorado"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { BarraPorcentaje } from "@/components/motion/barra-porcentaje"
import { NumeroAnimado } from "@/components/motion/numero-animado"
import { RESORTE } from "@/components/motion/transiciones"
import { Personaje } from "@/components/personajes/personaje"
import { TestBandaNino } from "@/components/test-banda-nino"
import { createClient } from "@/lib/supabase/client"
import { elegirPartida, itemsDe, type ItemBanco } from "@/lib/entrenamiento/bancos"
import { JUEGOS, type CodigoJuego, type Grado, type Nivel, type Origen } from "@/lib/entrenamiento/juegos"
import { guardarPartida, type LetraEntrenamiento, type PartidaGuardada } from "@/lib/entrenamiento/partidas"
import { ORIGEN_LABEL, fraseDe, textoProgreso, type Momento } from "@/lib/entrenamiento/presentacion"
import type { ResultadoRondas } from "@/lib/entrenamiento/rondas"
import { estiloNivel } from "@/lib/niveles"
import { useSalidaDelTest, type TextosSalida } from "@/lib/test/use-salida-test"
import { BLOQUE_NOMBRES } from "@/lib/test/bloques"
import { cn } from "@/lib/utils"

type Fase = "consigna" | "jugando" | "guardando" | "error" | "final"

const TEXTOS_SALIDA: TextosSalida = {
  titulo: "¿Salir de la partida?",
  descripcion: "La partida se descarta y no queda registrada.",
  confirmar: "Salir",
  cancelar: "Seguir jugando",
}

const POSE: Record<Momento, "explicando" | "pensando" | "festejando" | "alentando"> = {
  consigna: "explicando",
  pensando: "pensando",
  acierto: "festejando",
  reintento: "alentando",
  respuesta: "alentando",
  final: "festejando",
}

export interface PropsMarcoJuego {
  juego: CodigoJuego
  nivel: Nivel
  grado: Grado
  origen: Origen
  nino: { id: string; nombre: string; apellido: string }
  letraInicial: LetraEntrenamiento
  /** Grado habilitado en casa antes de esta partida. */
  habilitado: Grado
  /** Solo con origen "tarea". */
  tareaId?: string | null
  /** Destino de "Salir" y de "Volver al entrenamiento". */
  volverA: string
  /** Quién tiene la sesión: el niño (con el tutor) o el profesional (en consulta). */
  modo: "nino" | "profesional"
}

/**
 * Marco común de los juegos del entrenamiento: consigna → jugando → final.
 * Encabezado en píldora, barra de progreso, el personaje del juego que
 * responde a cada intento, el guardado de la partida y las pantallas
 * finales (el niño nunca ve aciertos ni porcentajes; el profesional, sí).
 * La mecánica de cada juego vive en components/entrenamiento/juegos/.
 */
export function MarcoJuego(props: PropsMarcoJuego) {
  return (
    <ProveedorLetra ninoId={props.nino.id} inicial={props.letraInicial}>
      <MarcoInterno {...props} />
    </ProveedorLetra>
  )
}

function MarcoInterno({ juego, nivel, grado, origen, nino, habilitado: habilitadoInicial, tareaId, volverA, modo }: PropsMarcoJuego) {
  const ficha = JUEGOS[juego]
  const nivelFicha = ficha.niveles[nivel]!
  const color = COLOR_BLOQUE[nivelFicha.bloque]
  const Juego = COMPONENTES_JUEGO[juego]
  const { letra } = useLetra()

  const [fase, setFase] = useState<Fase>("consigna")
  const [partida, setPartida] = useState<{ n: number; items: ItemBanco[] }>({ n: 0, items: [] })
  const [ronda, setRonda] = useState(0)
  const [momento, setMomento] = useState<Momento>("consigna")
  const [variacion, setVariacion] = useState(0)
  const [resultado, setResultado] = useState<ResultadoRondas | null>(null)
  const [guardada, setGuardada] = useState<PartidaGuardada | null>(null)
  const [habilitado, setHabilitado] = useState<Grado>(habilitadoInicial)
  const [desbloqueado, setDesbloqueado] = useState<Grado | null>(null)
  const [error, setError] = useState<string | null>(null)

  const enCurso = fase === "jugando" || fase === "guardando" || fase === "error"
  const { salir, dialogo } = useSalidaDelTest(enCurso, TEXTOS_SALIDA)

  const empezar = useCallback(() => {
    const items = elegirPartida(itemsDe(juego, nivel, grado), nivelFicha.partida[grado])
    setPartida((p) => ({ n: p.n + 1, items }))
    setRonda(0)
    setMomento("pensando")
    setVariacion((v) => v + 1)
    setResultado(null)
    setGuardada(null)
    setDesbloqueado(null)
    setError(null)
    setFase("jugando")
  }, [juego, nivel, grado, nivelFicha])

  const guardar = useCallback(
    async (res: ResultadoRondas) => {
      setFase("guardando")
      setError(null)
      try {
        const g = await guardarPartida(createClient(), {
          ninoId: nino.id,
          juego,
          grado,
          origen,
          correctas: res.correctas,
          total: res.total,
          detalle: res.detalle,
          tareaId,
        })
        setGuardada(g)
        setDesbloqueado(g.gradoHabilitado > habilitado ? g.gradoHabilitado : null)
        setHabilitado((h) => (g.gradoHabilitado > h ? g.gradoHabilitado : h))
        setMomento("final")
        setFase("final")
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar la partida. Probá de nuevo.")
        setFase("error")
      }
    },
    [nino.id, juego, grado, origen, tareaId, habilitado],
  )

  const alEvento = useCallback(
    (e: EventoRonda) => {
      setVariacion((v) => v + 1)
      if (e.tipo === "respuesta") {
        setMomento(e.fase)
      } else if (e.tipo === "siguiente") {
        setRonda(e.ronda)
        setMomento("pensando")
      } else {
        setRonda(e.resultado.total - 1)
        setResultado(e.resultado)
        void guardar(e.resultado)
      }
    },
    [guardar],
  )

  const frase = fraseDe(momento, variacion)

  return (
    <div className="fondo-nino relative isolate flex min-h-screen flex-col">
      {fase === "final" && <FondoDecorado variante="nino" />}

      {/* Encabezado en píldora */}
      <header className="sticky top-0 z-30 shrink-0 px-3 pt-3 sm:px-4">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 rounded-full border border-border/70 bg-card/85 py-1.5 pl-2 pr-2 shadow-media backdrop-blur-md sm:gap-3">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className={cn("grid size-12 shrink-0 place-items-center rounded-full", color.suave)}>
              <Emoji char={ficha.icono} className="size-8" />
            </span>
            <h1 className="min-w-0 truncate text-base font-bold text-foreground sm:text-lg">{ficha.nombre}</h1>
            <div className="hidden items-center gap-1.5 md:flex">
              <Chips bloque={modo === "profesional" ? BLOQUE_NOMBRES[nivelFicha.bloque] : null} claseBloque={color.chip} grado={grado} origen={origen} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <SwitchLetra />
            <button
              type="button"
              onClick={() => salir(volverA)}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-foreground outline-none transition-colors duration-200 hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/40 sm:px-4"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Salir
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5 md:hidden">
          <Chips bloque={modo === "profesional" ? BLOQUE_NOMBRES[nivelFicha.bloque] : null} claseBloque={color.chip} grado={grado} origen={origen} />
        </div>
      </header>

      {modo === "profesional" && <TestBandaNino nino={nino} nivel={nivel} prefijo="Entrenamiento de" />}

      <AreaLetra as="main" className="container mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-12 pt-4 sm:pt-6">
        {/* El lector de pantalla escucha las frases del personaje (las imágenes son decorativas). */}
        <p className="sr-only" aria-live="polite">
          {fase === "jugando" || fase === "final" ? frase : ""}
        </p>

        {fase === "consigna" && (
          <Consigna
            juego={juego}
            nivel={nivel}
            grado={grado}
            modo={modo}
            frase={frase}
            sinItems={itemsDe(juego, nivel, grado).length === 0 || !Juego}
            onComenzar={empezar}
          />
        )}

        {fase === "jugando" && Juego && (
          <>
            <BarraProgresoJuego
              actual={ronda}
              total={partida.items.length}
              unidad={nivelFicha.unidad}
              claseColor={color.zona}
            />
            <div className="mx-auto grid w-full max-w-5xl gap-4 lg:grid-cols-[15rem_1fr] lg:items-start lg:gap-8">
              <PersonajeJuego personaje={ficha.personaje} momento={momento} frase={frase} />
              <section
                aria-label={ficha.nombre}
                className="relative rounded-[2rem] border-2 border-white bg-card/90 p-4 shadow-media sm:p-8"
              >
                <Juego key={partida.n} nivel={nivel} grado={grado} items={partida.items} onRonda={alEvento} letra={letra} />
              </section>
            </div>
          </>
        )}

        {(fase === "guardando" || fase === "error") && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
            <div aria-hidden="true">
              <Personaje personaje={ficha.personaje} pose="pensando" animacion="respirar" claseImagen="w-28 sm:w-36" decorativo />
            </div>
            {fase === "guardando" ? (
              <p role="status" className="text-xl font-semibold text-muted-foreground">
                Guardando…
              </p>
            ) : (
              <div className="w-full max-w-md space-y-4">
                <MensajeAlerta tipo="error" texto={error ?? "No se pudo guardar la partida."} />
                <Button size="lg" onClick={() => resultado && guardar(resultado)} className="min-h-12">
                  <RotateCcw className="mr-2 size-5" aria-hidden="true" />
                  Reintentar
                </Button>
              </div>
            )}
          </div>
        )}

        {fase === "final" && guardada && resultado && (
          modo === "nino" ? (
            <FinalNino
              personaje={ficha.personaje}
              frase={frase}
              desbloqueado={desbloqueado}
              puedeRepetir={origen !== "tarea"}
              onOtraVez={empezar}
              volverA={volverA}
            />
          ) : (
            <FinalProfesional
              resultado={resultado}
              habilitado={habilitado}
              desbloqueado={desbloqueado}
              soloConsulta={ficha.soloConsulta}
              onOtraVez={empezar}
              volverA={volverA}
            />
          )
        )}
      </AreaLetra>
      {dialogo}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Piezas                                                              */
/* ------------------------------------------------------------------ */
/** Chips del encabezado. `bloque` es null cuando juega el niño: no ve nombres de bloque. */
function Chips({ bloque, claseBloque, grado, origen }: { bloque: string | null; claseBloque: string; grado: Grado; origen: Origen }) {
  const chip = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
  return (
    <>
      {bloque && <span className={cn(chip, claseBloque)}>{bloque}</span>}
      <span className={cn(chip, "bg-sol-suave text-sol-fuerte")}>Grado {grado}</span>
      <span className={cn(chip, "bg-muted text-muted-foreground")}>{ORIGEN_LABEL[origen]}</span>
    </>
  )
}

function BarraProgresoJuego({ actual, total, unidad, claseColor }: { actual: number; total: number; unidad: string; claseColor: string }) {
  const texto = textoProgreso(unidad, actual, total)
  return (
    <div className="mx-auto mb-4 w-full max-w-3xl sm:mb-6">
      <p className="mb-2 text-center text-base font-bold text-foreground sm:text-lg">{texto}</p>
      <div
        role="progressbar"
        aria-label="Progreso de la partida"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={Math.min(actual + 1, total)}
        aria-valuetext={texto}
        className="flex gap-1.5"
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="relative h-3.5 flex-1 overflow-hidden rounded-full bg-border/70">
            <motion.span
              className={cn("absolute inset-0 rounded-full", i === actual ? "bg-sol" : claseColor)}
              initial={false}
              animate={{ opacity: i <= actual ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * El personaje del juego con su globo. En celular va chico, arriba del
 * área de juego; en escritorio, al costado y más grande. Es decorativo: la
 * frase la lee el lector de pantalla por la región aria-live del marco.
 *
 * Cambia de pose en cada intento, y las imágenes tienen proporciones muy
 * distintas (Lumo pensando es angosto y alto; festejando, ancho y bajo).
 * Por eso se escala por la cara (`tamanoCara`, en la variable --cara) dentro
 * de una caja fija con los pies abajo: el personaje y el globo no saltan.
 * La caja entra la pose más ancha (2,5 caras) y la más alta (3,25 caras).
 */
function PersonajeJuego({ personaje, momento, frase }: { personaje: "lex" | "lumo"; momento: Momento; frase: string }) {
  const pose = POSE[momento]
  const animacion = momento === "acierto" || momento === "final" ? "saltar" : "flotarSuave"
  return (
    <div aria-hidden="true" className="lg:pt-6">
      <div className="lg:hidden">
        <Personaje
          key={`chico-${pose}`}
          personaje={personaje}
          pose={pose}
          animacion={animacion}
          mensaje={frase}
          ladoGlobo="derecha"
          decorativo
          sombra={false}
          tamanoCara="var(--cara)"
          claseImagen="h-20 w-16 [--cara:1.5rem] sm:h-28 sm:w-20 sm:[--cara:2rem]"
          claseGlobo="px-4 py-2.5 text-base max-w-[15rem]"
        />
      </div>
      <div className="sticky top-28 hidden lg:block">
        <Personaje
          key={`grande-${pose}`}
          personaje={personaje}
          pose={pose}
          animacion={animacion}
          mensaje={frase}
          ladoGlobo="arriba"
          decorativo
          tamanoCara="var(--cara)"
          claseImagen="h-64 w-48 [--cara:4.75rem]"
          claseGlobo="text-lg"
        />
      </div>
    </div>
  )
}

function Consigna({
  juego,
  nivel,
  grado,
  modo,
  frase,
  sinItems,
  onComenzar,
}: {
  juego: CodigoJuego
  nivel: Nivel
  grado: Grado
  modo: "nino" | "profesional"
  frase: string
  sinItems: boolean
  onComenzar: () => void
}) {
  const ficha = JUEGOS[juego]
  const nivelFicha = ficha.niveles[nivel]!
  const color = COLOR_BLOQUE[nivelFicha.bloque]

  return (
    // m-auto en el main (flex en columna): personaje y tarjeta juntos y centrados en los dos ejes.
    <section
      aria-labelledby="titulo-consigna"
      className="m-auto flex w-full max-w-[56rem] flex-col items-center gap-5 py-4 md:flex-row md:gap-8"
    >
      <div aria-hidden="true" className="flex shrink-0 justify-center">
        <Personaje
          personaje={ficha.personaje}
          pose="explicando"
          animacion="flotar"
          mensaje={frase}
          ladoGlobo="derecha"
          decorativo
          prioridad
          claseImagen="w-24 sm:w-32 md:w-44"
          claseGlobo="text-base sm:text-lg max-w-[14rem] md:hidden"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={RESORTE}
        className="relative w-full min-w-0 overflow-hidden rounded-[2rem] border-2 border-white bg-card shadow-elevada md:flex-1"
      >
        <div className={cn("flex items-center gap-4 px-6 py-5 sm:px-8", color.suave)}>
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white shadow-suave sm:size-20">
            <Emoji char={ficha.icono} className="size-12 sm:size-14" />
          </span>
          <h2 id="titulo-consigna" className={cn("text-2xl font-bold sm:text-3xl", color.texto)}>
            ¿Cómo se juega?
          </h2>
        </div>
        <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
          <p className="text-xl font-medium leading-relaxed text-foreground sm:text-2xl">{nivelFicha.consigna}</p>
          <BotonEscuchar texto={nivelFicha.consigna} etiqueta="Escuchar la consigna" tamano="chico" velocidad={0.9} />
          {modo === "profesional" && (
            <p className="rounded-2xl border border-border/80 bg-muted/60 px-4 py-3 text-base normal-case">
              <span className="font-bold">En el grado {grado}: </span>
              {nivelFicha.grados[grado]}.
            </p>
          )}
          {sinItems ? (
            <MensajeAlerta tipo="info" texto="Este grado todavía no tiene contenido para jugar." />
          ) : (
            <motion.button
              type="button"
              onClick={onComenzar}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex min-h-16 w-full items-center justify-center gap-3 rounded-full bg-primary px-8 text-xl font-bold text-primary-foreground shadow-boton outline-none focus-visible:ring-4 focus-visible:ring-ring/50 sm:w-auto"
            >
              <Play className="size-6 fill-current" aria-hidden="true" />
              Comenzar
            </motion.button>
          )}
        </div>
      </motion.div>
    </section>
  )
}

function FinalNino({
  personaje,
  frase,
  desbloqueado,
  puedeRepetir,
  onOtraVez,
  volverA,
}: {
  personaje: "lex" | "lumo"
  frase: string
  desbloqueado: Grado | null
  puedeRepetir: boolean
  onOtraVez: () => void
  volverA: string
}) {
  return (
    <section aria-labelledby="titulo-final" className="relative flex flex-1 flex-col items-center justify-center gap-8 py-8 text-center">
      <h2 id="titulo-final" className="sr-only">
        ¡Terminaste!
      </h2>
      <div aria-hidden="true">
        <Personaje
          personaje={personaje}
          pose="festejando"
          animacion="saltar"
          mensaje={frase}
          ladoGlobo="derecha"
          decorativo
          prioridad
          claseImagen="w-32 sm:w-44"
          claseGlobo="text-lg sm:text-2xl sm:px-7 sm:py-5 max-w-[14rem] sm:max-w-sm"
        />
      </div>
      {desbloqueado && <Premio grado={desbloqueado} />}
      <div className="flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        {puedeRepetir && (
          <Button size="lg" onClick={onOtraVez} className="min-h-14 rounded-full px-8 text-lg">
            <RotateCcw className="mr-2 size-5" aria-hidden="true" />
            Jugar otra vez
          </Button>
        )}
        <Button asChild size="lg" variant="outline" className="min-h-14 rounded-full px-8 text-lg">
          <Link href={volverA}>
            <Home className="mr-2 size-5" aria-hidden="true" />
            Volver al entrenamiento
          </Link>
        </Button>
      </div>
    </section>
  )
}

/** "¡Desbloqueaste el grado N!" con una estrella que entra girando y destellos que salen. */
function Premio({ grado }: { grado: Grado }) {
  const destellos = useMemo(() => Array.from({ length: 10 }, (_, i) => (i / 10) * Math.PI * 2), [])
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...RESORTE, delay: 0.4 }}
      className="relative flex flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-sol-suave px-8 py-6 shadow-elevada"
    >
      <div className="relative grid size-24 place-items-center">
        {destellos.map((angulo, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className={cn("absolute size-3 rounded-full", i % 2 ? "bg-celeste" : "bg-rojo")}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: Math.cos(angulo) * 80, y: Math.sin(angulo) * 80, opacity: [0, 1, 0] }}
            transition={{ duration: 1.1, delay: 0.6, ease: "easeOut" }}
          />
        ))}
        <motion.span
          aria-hidden="true"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ ...RESORTE, delay: 0.5 }}
          className="grid place-items-center"
        >
          <Emoji char="🌟" className="size-24" />
        </motion.span>
      </div>
      <p className="text-2xl font-bold text-sol-fuerte sm:text-3xl">¡Desbloqueaste el grado {grado}!</p>
      <p className="flex gap-1" aria-hidden="true">
        {[1, 2, 3].map((g) => (
          <Star key={g} className={cn("size-7", g <= grado ? "fill-sol text-sol-fuerte" : "fill-muted text-border")} />
        ))}
      </p>
    </motion.div>
  )
}

function FinalProfesional({
  resultado,
  habilitado,
  desbloqueado,
  soloConsulta,
  onOtraVez,
  volverA,
}: {
  resultado: ResultadoRondas
  habilitado: Grado
  desbloqueado: Grado | null
  soloConsulta: boolean
  onOtraVez: () => void
  volverA: string
}) {
  const pct = Math.round((100 * resultado.correctas) / resultado.total)
  const estilo = estiloNivel(pct)
  return (
    <section
      aria-labelledby="titulo-resultado"
      className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 py-8 normal-case [&_a]:normal-case [&_button]:normal-case"
    >
      <div className="rounded-[2rem] border-2 border-white bg-card p-6 shadow-elevada sm:p-8">
        <h2 id="titulo-resultado" className="text-2xl font-bold text-foreground">
          Resultado de la partida
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-celeste-suave px-4 py-3 text-celeste-fuerte">
            <dt className="text-sm font-semibold">Correctas</dt>
            <dd className="text-3xl font-bold tabular-nums">
              {resultado.correctas} / {resultado.total}
            </dd>
          </div>
          <div className={cn("rounded-2xl px-4 py-3", estilo.suave, estilo.texto)}>
            <dt className="text-sm font-semibold">Porcentaje</dt>
            <dd className="text-3xl font-bold">
              <NumeroAnimado valor={pct} sufijo="%" />
            </dd>
          </div>
        </dl>
        <BarraPorcentaje valor={pct} className="mt-4 h-3" />
        <p className="mt-3 text-sm text-muted-foreground">Un reintento acertado cuenta como error.</p>
        {!soloConsulta && (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-border/80 bg-muted/50 px-4 py-3 text-base">
            <Home className="mt-0.5 size-5 shrink-0 text-lavanda-fuerte" aria-hidden="true" />
            <span>
              En casa tiene habilitado hasta el grado {habilitado}.
              {desbloqueado && <strong className="font-bold"> Se desbloqueó con esta partida.</strong>}
            </span>
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={onOtraVez} className="min-h-12">
          <RotateCcw className="mr-2 size-5" aria-hidden="true" />
          Jugar otra vez
        </Button>
        <Button asChild size="lg" variant="outline" className="min-h-12">
          <Link href={volverA}>Volver a los juegos</Link>
        </Button>
      </div>
    </section>
  )
}
