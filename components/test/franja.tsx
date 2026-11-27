import { Badge } from "@/components/ui/badge"
import { ESTILO_NIVEL } from "@/lib/niveles"
import type { BloqueCodigo, Nivel } from "@/lib/test/bloques"
import {
  FRANJA_LABEL,
  SIN_FRANJA_LABEL,
  TEXTO_QUE_SON_FRANJAS,
  TEXTO_SIN_FRANJA,
  textoGradoFranjas,
  type Franja,
  type GradoFranja,
} from "@/lib/test/franjas"

/*
 * Piezas visuales de las franjas (S11), compartidas por el desglose de una
 * evaluación (resultados-evaluacion.tsx) y por "Franjas y recomendación" en
 * /ninos/[id]. El color nunca es la única señal: el chip siempre lleva texto.
 */

type ClaveEstilo = Franja | "sin_franja"

const clave = (franja: Franja | null): ClaveEstilo => franja ?? "sin_franja"

/**
 * badge: variante del chip; barra y texto: relleno y número de la fila (los
 * tokens --nivel-*); destacado: borde y fondo suave del ítem de la
 * recomendación (solo intermedio y a observar); contenedor: el recuadro
 * sutil de cada grupo de juegos de la recomendación en consulta (S11b), que
 * deja a las tarjetas blancas como lo que más se ve.
 */
export const ESTILO_FRANJA: Record<
  ClaveEstilo,
  {
    badge: "menta" | "sol" | "rojo" | "neutro";
    barra: string;
    texto: string;
    destacado: string;
    contenedor: string;
  }
> = {
  correcto: {
    badge: "menta",
    barra: ESTILO_NIVEL.alto.barra,
    texto: ESTILO_NIVEL.alto.texto,
    destacado: "",
    contenedor: "border-menta/40 bg-menta/15",
  },
  intermedio: {
    badge: "sol",
    barra: ESTILO_NIVEL.medio.barra,
    texto: ESTILO_NIVEL.medio.texto,
    destacado: "border-sol/50 bg-sol-suave/50",
    contenedor: "border-sol/50 bg-sol/20",
  },
  a_observar: {
    badge: "rojo",
    barra: ESTILO_NIVEL.critico.barra,
    texto: ESTILO_NIVEL.critico.texto,
    destacado: "border-rojo/30 bg-rojo-suave/50",
    contenedor: "border-rojo/30 bg-rojo/10",
  },
  sin_franja: {
    badge: "neutro",
    barra: "bg-muted-foreground/40",
    texto: "text-muted-foreground",
    destacado: "",
    contenedor: "border-border/70 bg-muted/40",
  },
};

export const estiloFranja = (franja: Franja | null) => ESTILO_FRANJA[clave(franja)]

/** Chip con el texto de la franja ("Correcto", "Intermedio", "A observar" o "Sin franja de referencia"). */
export function ChipFranja({ franja, className }: { franja: Franja | null; className?: string }) {
  return (
    <Badge variant={estiloFranja(franja).badge} className={className}>
      {franja ? FRANJA_LABEL[franja] : SIN_FRANJA_LABEL}
    </Badge>
  )
}

/**
 * Aclaraciones de las franjas: qué son (siempre), qué significa "sin franja
 * de referencia" (si hay algún bloque sin franja) y qué grado se usó (si un
 * bloque que depende del grado tiene franja). Los textos están en
 * lib/test/franjas.ts: el informe en PDF (S17) usa los mismos.
 */
export function LeyendasFranjas({
  nivel,
  bloques,
  grado,
  mostrarQueSon = true,
}: {
  nivel: Nivel
  bloques: readonly { bloque_codigo: BloqueCodigo; franja: Franja | null }[]
  grado: GradoFranja | null
  /** La explicación general; /ninos/[id] puede omitirla si ya la muestra en otro lado. */
  mostrarQueSon?: boolean
}) {
  const haySinFranja = bloques.some((b) => b.franja === null)
  const textoGrado = textoGradoFranjas(nivel, bloques, grado)

  return (
    <div className="space-y-1.5 text-sm text-muted-foreground">
      {mostrarQueSon && <p>{TEXTO_QUE_SON_FRANJAS}</p>}
      {haySinFranja && (
        <p>
          <span className="font-semibold">{SIN_FRANJA_LABEL}:</span> {TEXTO_SIN_FRANJA}
        </p>
      )}
      {textoGrado && <p>{textoGrado}</p>}
    </div>
  )
}
