/**
 * Datos FICTICIOS para las pruebas del informe y para el PDF de ejemplo de
 * docs/evidencias/ (S17a): una niña de 2.º grado con 3 evaluaciones de
 * primario (una de otro profesional), partidas de los tres orígenes y 2
 * tareas. No corresponden a ninguna persona real.
 */
import type { DatosInforme, TareaInforme, TestInforme } from "@/lib/informes/modelo"
import type { OpcionesInforme } from "@/lib/informes/opciones"
import type { PartidaSeguimiento } from "@/lib/seguimiento/entrenamiento"
import type { BloqueCodigo } from "@/lib/test/bloques"

export const HOY_EJEMPLO = new Date("2026-11-27T15:00:00-03:00")

export const USUARIO_EJEMPLO = "00000000-0000-4000-8000-000000000001"
export const OTRO_EJEMPLO = "00000000-0000-4000-8000-000000000002"

type Fila = [BloqueCodigo, number, number]

/** Bloques de una evaluación de primario en el orden del test; denominación rápida con tiempo y errores. */
function primario(id: string, fecha: string, autor: string | null, filas: Fila[], denominacion?: { ms: number; errores: number }): TestInforme {
  const bloques: TestInforme["bloques"] = filas.map(([codigo, correctas, total], i) => ({
    bloque_codigo: codigo,
    orden: i + 1,
    correctas,
    total,
    tiempo_ms: null,
    errores: null,
  }))
  if (denominacion) {
    const mitad = Math.round(denominacion.ms / 2)
    const e1 = Math.floor(denominacion.errores / 2)
    const e2 = denominacion.errores - e1
    bloques.push({
      bloque_codigo: "denominacion_rapida",
      orden: filas.length + 1,
      correctas: 100 - denominacion.errores,
      total: 100,
      tiempo_ms: denominacion.ms,
      errores: denominacion.errores,
      detalle: [
        { ejercicio: "primario-1", tiempo_ms: mitad, errores: e1, correctas: 50 - e1, total: 50 },
        { ejercicio: "primario-2", tiempo_ms: denominacion.ms - mitad, errores: e2, correctas: 50 - e2, total: 50 },
      ],
    })
  }
  return { id, nivel: "primario", fecha, created_at: fecha, profesional_id: autor, bloques }
}

export const TESTS_EJEMPLO: TestInforme[] = [
  primario(
    "10000000-0000-4000-8000-000000000003",
    "2026-11-05T14:00:00-03:00",
    USUARIO_EJEMPLO,
    [
      ["discriminacion_auditiva", 5, 5],
      ["conciencia_fonologica", 5, 7],
      ["conciencia_silabica", 5, 6],
      ["memoria_fonologica", 4, 6],
      ["comprension_lectora", 2, 3],
      ["correspondencia_sonido_letra", 5, 6],
      ["reconocimiento_visual", 2, 2],
      ["lectura_pseudopalabras", 3, 7],
    ],
    { ms: 125_000, errores: 2 },
  ),
  primario(
    "10000000-0000-4000-8000-000000000002",
    "2026-09-18T10:30:00-03:00",
    OTRO_EJEMPLO,
    [
      ["discriminacion_auditiva", 4, 5],
      ["conciencia_fonologica", 4, 7],
      ["conciencia_silabica", 4, 6],
      ["memoria_fonologica", 4, 6],
      ["comprension_lectora", 2, 3],
      ["correspondencia_sonido_letra", 4, 6],
      ["reconocimiento_visual", 1, 2],
      ["lectura_pseudopalabras", 3, 7],
    ],
    { ms: 138_000, errores: 3 },
  ),
  primario(
    "10000000-0000-4000-8000-000000000001",
    "2026-08-28T11:00:00-03:00",
    USUARIO_EJEMPLO,
    [
      ["discriminacion_auditiva", 3, 5],
      ["conciencia_fonologica", 3, 7],
      ["conciencia_silabica", 3, 6],
      ["memoria_fonologica", 3, 6],
      ["comprension_lectora", 1, 3],
      ["correspondencia_sonido_letra", 4, 6],
      ["reconocimiento_visual", 1, 2],
      ["lectura_pseudopalabras", 2, 7],
    ],
    { ms: 151_000, errores: 4 },
  ),
]

function partida(
  juego: string,
  grado: 1 | 2 | 3,
  origen: PartidaSeguimiento["origen"],
  fecha: string,
  correctas: number,
  total: number,
  autor: string | null,
): PartidaSeguimiento {
  return {
    juego,
    grado,
    origen,
    correctas,
    total,
    porcentaje: Math.round((100 * correctas) / total),
    tiempo_ms: null,
    errores: null,
    created_at: fecha,
    profesional_id: origen === "practica" ? null : autor,
  }
}

const U = USUARIO_EJEMPLO
const O = OTRO_EJEMPLO

/** De la más reciente a la más vieja, como cargarPartidasSeguimiento. */
export const PARTIDAS_EJEMPLO: PartidaSeguimiento[] = [
  partida("rima", 2, "practica", "2026-11-26T18:10:00-03:00", 7, 8, null),
  partida("detective", 2, "tarea", "2026-11-24T17:40:00-03:00", 6, 8, U),
  partida("rima", 2, "tarea", "2026-11-24T17:30:00-03:00", 6, 8, U),
  partida("eco", 1, "consulta", "2026-11-19T15:00:00-03:00", 5, 8, U),
  partida("planeta", 1, "consulta", "2026-11-19T14:40:00-03:00", 6, 8, U),
  partida("memotono", 1, "practica", "2026-11-15T11:00:00-03:00", 5, 6, null),
  partida("rima", 1, "practica", "2026-11-12T19:00:00-03:00", 8, 8, null),
  partida("caza", 1, "consulta", "2026-11-05T15:20:00-03:00", 4, 6, U),
  partida("rompe", 1, "tarea", "2026-10-29T18:00:00-03:00", 5, 6, O),
  partida("detective", 1, "practica", "2026-10-25T10:00:00-03:00", 7, 8, null),
  partida("detective", 1, "consulta", "2026-10-22T15:00:00-03:00", 6, 8, O),
  partida("eco", 1, "practica", "2026-10-14T18:30:00-03:00", 4, 8, null),
  partida("planeta", 1, "consulta", "2026-10-08T15:00:00-03:00", 4, 8, U),
  partida("rima", 1, "consulta", "2026-09-24T15:00:00-03:00", 5, 8, O),
  partida("detective", 1, "consulta", "2026-09-10T15:00:00-03:00", 5, 8, U),
  partida("memotono", 1, "practica", "2026-09-02T19:00:00-03:00", 4, 6, null),
]

export const TAREAS_EJEMPLO: TareaInforme[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    nombre: "Rimas y sonidos",
    es_mision: false,
    estado: "hecha",
    created_at: "2026-11-20T16:00:00-03:00",
    completada_at: "2026-11-24T17:40:00-03:00",
    profesional_id: U,
    items: [
      { orden: 1, juego: "rima", grado: 2 },
      { orden: 2, juego: "detective", grado: 2 },
    ],
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    nombre: "Sílabas",
    es_mision: false,
    estado: "pendiente",
    created_at: "2026-11-25T16:00:00-03:00",
    completada_at: null,
    profesional_id: O,
    items: [{ orden: 1, juego: "rompe", grado: 2 }],
  },
]

export const OBSERVACIONES_EJEMPLO =
  "Martina mostró buena disposición en todas las sesiones. Se sugiere sostener la práctica de conciencia fonológica en casa, dos o tres veces por semana, y revisar la lectura de pseudopalabras en la próxima evaluación."

export function datosEjemplo(cambios: Partial<DatosInforme> = {}): DatosInforme {
  return {
    nino: { nombre: "Martina", apellido: "Fernández", fecha_nacimiento: "2019-03-14", etapa_escolar: "segundo" },
    vinculadoDesde: "2026-08-20T12:00:00-03:00",
    comparteHistorial: true,
    usuarioId: USUARIO_EJEMPLO,
    emisor: "Laura Gómez",
    tests: TESTS_EJEMPLO,
    partidas: PARTIDAS_EJEMPLO,
    habilitados: { rima: 3, detective: 2, memotono: 2 },
    tareas: TAREAS_EJEMPLO,
    nombresProfesionales: { [USUARIO_EJEMPLO]: "Laura Gómez" },
    ...cambios,
  }
}

/** Todas las secciones, los dos contenidos, todo el historial y observaciones. */
export function opcionesEjemplo(cambios: Partial<OpcionesInforme> = {}): OpcionesInforme {
  return {
    evaluacion: true,
    seguimiento: true,
    testId: TESTS_EJEMPLO[0].id,
    incluirRecomendacion: true,
    periodo: "todo",
    desde: "",
    hasta: "",
    secciones: { evolucion: true, denominacion: true, entrenamiento: true, tareas: true, practica: true },
    incluirOtrosProfesionales: true,
    observaciones: OBSERVACIONES_EJEMPLO,
    ...cambios,
  }
}
