/*
 * RONDAS DE UNA PARTIDA (lógica pura, sin React)
 * ------------------------------------------------------------------
 * Regla del reintento (validación con las especialistas del 19/11):
 *   - Primer intento correcto: la ronda cuenta como correcta.
 *   - Primer intento incorrecto: se avisa sin mostrar la respuesta y se
 *     permite UN reintento.
 *   - Reintento correcto: la ronda cuenta como error.
 *   - Reintento incorrecto: se muestra la respuesta correcta y se sigue.
 *
 * Fases de una ronda:
 *   esperando  → el niño todavía no respondió.
 *   reintento  → falló el primer intento y puede probar otra vez.
 *   acierto    → acertó (en el primer intento o en el reintento).
 *   respuesta  → falló los dos intentos: se muestra la respuesta correcta.
 *   terminada  → no quedan rondas.
 * Desde "acierto" y "respuesta", la acción "siguiente" pasa de ronda.
 */

export type FaseRonda = "esperando" | "reintento" | "acierto" | "respuesta" | "terminada"

/** Detalle de cada ronda, para la columna `detalle` de entrenamiento_partida. */
export interface DetalleRonda {
  /** id del ítem del banco. */
  item: string
  correcta: boolean
  intentos: 1 | 2
}

export interface EstadoRondas {
  /** ids de los ítems de la partida, en el orden en que se juegan. */
  items: string[]
  /** Índice de la ronda actual (igual a items.length al terminar). */
  actual: number
  fase: FaseRonda
  /** Una entrada por ronda resuelta. */
  detalle: DetalleRonda[]
}

export type AccionRonda = { tipo: "responder"; correcta: boolean } | { tipo: "siguiente" }

export interface ResultadoRondas {
  correctas: number
  total: number
  detalle: DetalleRonda[]
}

export function iniciarRondas(items: readonly string[]): EstadoRondas {
  return { items: [...items], actual: 0, fase: items.length === 0 ? "terminada" : "esperando", detalle: [] }
}

export function reducirRondas(estado: EstadoRondas, accion: AccionRonda): EstadoRondas {
  const item = estado.items[estado.actual]

  if (accion.tipo === "responder") {
    if (estado.fase === "esperando") {
      if (accion.correcta) {
        return { ...estado, fase: "acierto", detalle: [...estado.detalle, { item, correcta: true, intentos: 1 }] }
      }
      return { ...estado, fase: "reintento" }
    }
    if (estado.fase === "reintento") {
      // En el reintento la ronda cuenta como error, acierte o no.
      return {
        ...estado,
        fase: accion.correcta ? "acierto" : "respuesta",
        detalle: [...estado.detalle, { item, correcta: false, intentos: 2 }],
      }
    }
    // Ya resuelta o terminada: se ignora (doble toque).
    return estado
  }

  if (estado.fase !== "acierto" && estado.fase !== "respuesta") return estado
  const siguiente = estado.actual + 1
  return { ...estado, actual: siguiente, fase: siguiente >= estado.items.length ? "terminada" : "esperando" }
}

/** Correctas, total y detalle de las rondas resueltas. */
export function resultadoRondas(estado: EstadoRondas): ResultadoRondas {
  return {
    correctas: estado.detalle.filter((d) => d.correcta).length,
    total: estado.items.length,
    detalle: estado.detalle,
  }
}

/** true si el último intento resuelto fue un acierto en el reintento (cuenta como error). */
export function aciertoEnReintento(estado: EstadoRondas): boolean {
  const ultimo = estado.detalle[estado.actual]
  return estado.fase === "acierto" && ultimo?.intentos === 2
}
