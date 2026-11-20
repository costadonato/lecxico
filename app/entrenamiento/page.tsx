"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ClipboardList, Play } from "lucide-react"
import { CatalogoJuegos } from "@/components/entrenamiento/catalogo-juegos"
import { Emoji } from "@/components/entrenamiento/dibujo"
import { AreaLetra, ProveedorLetra } from "@/components/entrenamiento/proveedor-letra"
import { SwitchLetra } from "@/components/entrenamiento/switch-letra"
import { ChipEnDesarrollo } from "@/components/chip-en-desarrollo"
import { Cargando } from "@/components/estados"
import { MensajeAlerta } from "@/components/mensaje-alerta"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import { PaginaApp } from "@/components/pagina-app"
import { Personaje } from "@/components/personajes/personaje"
import { createClient } from "@/lib/supabase/client"
import { usePerfilPagina } from "@/lib/auth/use-perfil-pagina"
import { JUEGOS } from "@/lib/entrenamiento/juegos"
import { gradosHabilitados, tareasPendientes, type GradosHabilitados, type TareaPendiente } from "@/lib/entrenamiento/partidas"
import { juegoDisponible, rutaJugar } from "@/lib/entrenamiento/presentacion"
import { nivelParaEtapa } from "@/lib/test/bloques"
import type { Nino } from "@/lib/types/database"

type Carga =
  | { estado: "cargando" }
  | { estado: "error"; mensaje: string }
  | { estado: "listo"; grados: GradosHabilitados; tareas: TareaPendiente[] }

/**
 * Área de entrenamiento del niño (con el tutor): bienvenida con Lex, las
 * tareas que le dejó su profesional y los juegos de su nivel por bloque.
 * Solo para el rol niño; un profesional va a /dashboard.
 */
export default function EntrenamientoPage() {
  const pagina = usePerfilPagina("nino")

  return (
    <PaginaApp pagina={pagina} titulo="Entrenamiento" ancho="max-w-6xl">
      {({ profile, nino }) =>
        nino ? (
          <AreaNino ninoId={profile.id} nombre={profile.nombre} nino={nino} />
        ) : (
          <MensajeAlerta tipo="error" texto="No se encontraron los datos del niño. Recargá la página." />
        )
      }
    </PaginaApp>
  )
}

function AreaNino({ ninoId, nombre, nino }: { ninoId: string; nombre: string; nino: Nino }) {
  const nivel = nivelParaEtapa(nino.etapa_escolar)
  const [carga, setCarga] = useState<Carga>({ estado: "cargando" })

  useEffect(() => {
    let cancelado = false
    const supabase = createClient()
    Promise.all([gradosHabilitados(supabase, ninoId), tareasPendientes(supabase, ninoId)])
      .then(([grados, tareas]) => !cancelado && setCarga({ estado: "listo", grados, tareas }))
      .catch((e: Error) => !cancelado && setCarga({ estado: "error", mensaje: e.message }))
    return () => {
      cancelado = true
    }
  }, [ninoId])

  return (
    <ProveedorLetra ninoId={ninoId} inicial={nino.letra_entrenamiento ?? "mayuscula"}>
      <AreaLetra className="space-y-10">
        {/* Bienvenida */}
        <section className="flex flex-col items-center justify-between gap-6 rounded-[2rem] border-2 border-white bg-card/80 px-5 py-6 shadow-media backdrop-blur-sm sm:flex-row sm:px-8">
          <Personaje
            personaje="lex"
            pose="volando"
            animacion="flotar"
            mensaje={`¡Hola, ${nombre}! Elegí un juego y jugamos.`}
            ladoGlobo="derecha"
            prioridad
            decorativo
            claseImagen="w-24 sm:w-32"
            claseGlobo="text-lg sm:text-xl max-w-[13rem] sm:max-w-sm"
          />
          <div className="flex items-center gap-3 rounded-full bg-lavanda-suave py-1.5 pl-4 pr-1.5">
            <span className="text-sm font-semibold normal-case text-lavanda-fuerte">Tipo de letra</span>
            <SwitchLetra />
          </div>
        </section>

        {carga.estado === "cargando" && <Cargando texto="Preparando los juegos…" />}
        {carga.estado === "error" && <MensajeAlerta tipo="error" texto={carga.mensaje} />}
        {carga.estado === "listo" && (
          <>
            {carga.tareas.length > 0 && <Tareas tareas={carga.tareas} />}
            <CatalogoJuegos
              nivel={nivel}
              modo="nino"
              grados={carga.grados}
              hrefGrado={(juego, grado) => rutaJugar(juego, grado)}
            />
          </>
        )}
      </AreaLetra>
    </ProveedorLetra>
  )
}

/** "Tareas de tu profesional": cada tarea pendiente con sus juegos y un botón para jugar. */
function Tareas({ tareas }: { tareas: TareaPendiente[] }) {
  return (
    <section aria-labelledby="titulo-tareas" className="space-y-4">
      <h2 id="titulo-tareas" className="flex items-center gap-3 text-xl font-bold text-foreground sm:text-2xl">
        <span className="grid size-11 place-items-center rounded-2xl bg-rojo-suave text-rojo-fuerte">
          <ClipboardList className="size-5" aria-hidden="true" />
        </span>
        Tareas de tu profesional
      </h2>
      <ListaCascada as="ul" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {tareas.map((t) => (
          <ItemCascada as="li" key={t.id} className="rounded-[2rem] border-2 border-white bg-card p-5 shadow-media">
            <p className="mb-3 text-lg font-bold text-foreground">
              {t.nombre ?? (t.esMision ? "Misión" : "Tarea")}
            </p>
            <ul className="space-y-2">
              {t.items.map((i) => {
                const juego = JUEGOS[i.juego]
                const disponible = juegoDisponible(i.juego)
                return (
                  <li key={i.orden} className="flex items-center gap-3 rounded-2xl bg-muted/60 p-2 pr-2.5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white shadow-suave">
                      <Emoji char={juego.icono} className="size-9" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold leading-tight">{juego.nombre}</span>
                      <span className="text-sm text-muted-foreground">Grado {i.grado}</span>
                    </span>
                    {disponible ? (
                      <Link
                        href={rutaJugar(i.juego, i.grado, t.id)}
                        aria-label={`Jugar ${juego.nombre}, grado ${i.grado}`}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-base font-bold text-primary-foreground shadow-boton outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
                      >
                        <Play className="size-4 fill-current" aria-hidden="true" />
                        Jugar
                      </Link>
                    ) : (
                      <ChipEnDesarrollo texto="Próximamente" />
                    )}
                  </li>
                )
              })}
            </ul>
          </ItemCascada>
        ))}
      </ListaCascada>
    </section>
  )
}
