/**
 * Modelo del informe en PDF (S17a; S17b suma la variante del tutor).
 *
 * construirInforme(datos, opciones, variante) devuelve un objeto JSON plano
 * con TODO lo que se imprime ya calculado: textos, filas de las tablas y
 * series de los gráficos (de lib/seguimiento/). El PDF
 * (components/informes/pdf/) no calcula nada: solo dibuja el modelo.
 *
 * - Variante "profesional": franjas, bandas y, si se pide, la recomendación.
 * - Variante "tutor": NUNCA lleva franjas, bandas ni recomendación (ni sus
 *   claves en el objeto), ni observaciones.
 *
 * Filtros: el período (en días de Argentina), la autoría (tests y partidas
 * de consulta o de tarea de otros profesionales, y sus tareas; la práctica en
 * casa no tiene autor y siempre entra) y las secciones elegidas.
 */
import type { Nivel } from "@/lib/entrenamiento/juegos"
import type { GradosHabilitados } from "@/lib/entrenamiento/partidas"
import { juegosPorBloque, nombreJuego } from "@/lib/entrenamiento/presentacion"
import { autoriaIncluida, type OpcionesInforme } from "@/lib/informes/opciones"
import {
  diaArgentina,
  enRango,
  formatearDia,
  instanteDelDia,
  rangoDelPeriodo,
  type RangoInforme,
} from "@/lib/informes/periodo"
import {
  partidasPorSemana,
  rangoDelPeriodo as rangoDeSemanas,
  resumenPorJuego,
  resumenSemanas,
  type PartidaSeguimiento,
} from "@/lib/seguimiento/entrenamiento"
import {
  bandasDeFranja,
  nivelesConEvaluaciones,
  resumenBloque,
  resumenDenominacion,
  serieDeBloque,
  serieDenominacion,
  serieEvaluaciones,
  type Banda,
  type EvaluacionParaSerie,
  type PuntoDeBloque,
  type PuntoDenominacion,
} from "@/lib/seguimiento/evaluaciones"
import { porcentajeBloque } from "@/lib/test/analisis"
import {
  BLOQUES_POR_NIVEL,
  BLOQUE_NOMBRES,
  ETAPAS_ESCOLARES,
  NIVEL_LABEL,
  nivelParaEtapa,
  type EtapaEscolar,
} from "@/lib/test/bloques"
import { formatearTiempo } from "@/lib/test/denominacion"
import {
  FRANJA_LABEL,
  SIN_FRANJA_LABEL,
  TEXTO_QUE_SON_FRANJAS,
  TEXTO_SIN_FRANJA,
  franjaDeBloque,
  gradoParaFranja,
  recomendacion,
  textoGradoFranjas,
  type BloqueParaFranja,
  type Franja,
} from "@/lib/test/franjas"
import type { DetalleEjercicioDenominacion, TestBloqueResultado } from "@/lib/types/database"

export type VarianteInforme = "profesional" | "tutor"

/* ------------------------------------------------------------------ */
/*  Datos de entrada (lib/informes/datos.ts los carga)                  */
/* ------------------------------------------------------------------ */

export type BloqueInforme = BloqueParaFranja &
  Pick<TestBloqueResultado, "tiempo_ms" | "errores"> & { detalle?: DetalleEjercicioDenominacion[] | null }

/** Una evaluación visible con sus bloques (TestConBloques cumple). */
export interface TestInforme extends EvaluacionParaSerie {
  profesional_id: string | null
  bloques: BloqueInforme[]
}

export interface TareaInforme {
  id: string
  nombre: string | null
  es_mision: boolean
  estado: "pendiente" | "hecha"
  created_at: string
  completada_at: string | null
  /** Quien la asignó; null si borró su cuenta. */
  profesional_id: string | null
  items: { orden: number; juego: string; grado: number }[]
}

export interface DatosInforme {
  nino: { nombre: string; apellido: string; fecha_nacimiento: string; etapa_escolar: EtapaEscolar }
  /** Vínculo del profesional que emite (variante profesional). */
  vinculadoDesde: string | null
  comparteHistorial: boolean
  /** El usuario actual: el filtro de autoría compara contra él. */
  usuarioId: string
  /** "Nombre Apellido" de quien emite el informe, o null (variante tutor). */
  emisor: string | null
  tests: readonly TestInforme[]
  partidas: readonly PartidaSeguimiento[]
  habilitados: GradosHabilitados
  tareas: readonly TareaInforme[]
  /** Nombre de cada profesional que la RLS deja leer (id → "Nombre Apellido"). */
  nombresProfesionales: Readonly<Record<string, string>>
}

/* ------------------------------------------------------------------ */
/*  Modelo de salida                                                    */
/* ------------------------------------------------------------------ */

export type ClaveFranja = Franja | "sin_franja"

/** Chip de franja: el PDF lo pinta con el color de `clave` y siempre con su texto. */
export interface ChipFranjaModelo {
  clave: ClaveFranja
  texto: string
}

/** Una celda: texto (con "\n" para un renglón aparte) o un chip de franja. */
export type CeldaModelo = string | ChipFranjaModelo

export interface ColumnaModelo {
  titulo: string
  /** Ancho relativo (flex). */
  ancho: number
  alinear?: "derecha"
}

export interface TablaModelo {
  columnas: ColumnaModelo[]
  filas: CeldaModelo[][]
}

export interface FilaBloqueModelo {
  bloque: string
  aciertos: number
  total: number
  /** "80 %", o "—" en denominación rápida (se mide por tiempo y errores). */
  porcentaje: string
  /** Solo en la variante profesional. */
  franja?: ChipFranjaModelo
  /** Denominación rápida: tiempo y errores del bloque y de cada ejercicio. */
  detalle: string[]
}

export interface RecomendacionModelo {
  bloques: { bloque: string; franja: ChipFranjaModelo; juegos: string[] }[]
  /** Si ningún bloque quedó en "intermedio" ni "a observar". */
  vacio: string | null
  nota: string
}

export interface EvaluacionModelo {
  titulo: string
  /** "Todavía no hay evaluaciones…" si no hay ninguna para mostrar. */
  vacio: string | null
  subtitulo: string | null
  registradoPor: string | null
  filas: FilaBloqueModelo[]
  /** Solo en la variante profesional: qué son las franjas, sin franja, grado usado. */
  leyendas?: string[]
  /** Solo en la variante profesional y con "Incluir recomendación". */
  recomendacion?: RecomendacionModelo
}

export interface PuntoGraficoModelo {
  /** dd/mm, para el eje. */
  etiqueta: string
  /** dd/mm/aaaa. */
  fecha: string
  /** 0 a 100. */
  valor: number
  franja?: ClaveFranja
}

export interface GraficoBloqueModelo {
  bloque: string
  puntos: PuntoGraficoModelo[]
  /** Solo en la variante profesional: las franjas de fondo, o null sin referencia. */
  bandas?: Banda[] | null
  ultimaFranja?: ChipFranjaModelo
  resumen: string
}

export interface PuntoDenominacionModelo {
  etiqueta: string
  fecha: string
  segundos: number
  tiempo: string
  errores: number
  aciertosPorcentaje: number
  franja?: ClaveFranja
}

export interface SeccionBase {
  titulo: string
  /** "Sin registros en el período." (u otro motivo) si no hay nada para mostrar. */
  vacio: string | null
}

export interface EvolucionModelo extends SeccionBase {
  niveles: { nivel: string; graficos: GraficoBloqueModelo[] }[]
  /** Las evaluaciones del período (fecha, nivel y, si hay de otros, quién la registró). */
  evaluaciones: TablaModelo | null
  leyendas?: string[]
}

export interface DenominacionModelo extends SeccionBase {
  niveles: {
    nivel: string
    puntos: PuntoDenominacionModelo[]
    ultimaFranja?: ChipFranjaModelo
    resumen: string
    tabla: TablaModelo
    /** Si las evaluaciones del nivel no tienen tiempo registrado. */
    vacio: string | null
  }[]
  nota: string
}

export interface SemanaModelo {
  /** dd/mm del lunes. */
  etiqueta: string
  consulta: number
  tarea: number
  practica: number
  total: number
}

export interface EntrenamientoModelo extends SeccionBase {
  semanas: SemanaModelo[]
  /** La semana con más partidas (alto del eje). */
  maximo: number
  resumenSemanas: string
  porJuego: TablaModelo | null
}

export interface TablaSeccionModelo extends SeccionBase {
  resumen: string | null
  tabla: TablaModelo | null
}

export interface SeguimientoModelo {
  evolucion: EvolucionModelo | null
  denominacion: DenominacionModelo | null
  entrenamiento: EntrenamientoModelo | null
  tareas: TablaSeccionModelo | null
  practica: TablaSeccionModelo | null
}

export interface ModeloInforme {
  variante: VarianteInforme
  titulo: string
  emisor: string | null
  fechaEmision: string
  /** "27/08/2026 al 27/11/2026", "Todo el historial (hasta …)", o null sin seguimiento. */
  periodo: string | null
  nino: { etiqueta: string; valor: string }[]
  nombreArchivo: string
  evaluacion: EvaluacionModelo | null
  seguimiento: SeguimientoModelo | null
  observaciones: string | null
  aclaracion: string
  confidencialidad: string
  pie: string
}

/* ------------------------------------------------------------------ */
/*  Textos                                                              */
/* ------------------------------------------------------------------ */

export const SIN_REGISTROS = "Sin registros en el período."
export const OTRO_PROFESIONAL = "Otro profesional"

export const ACLARACION_PROFESIONAL =
  "Este informe es orientativo y no constituye un diagnóstico. Las franjas son referencias provisorias derivadas de la bibliografía, no normas poblacionales. La interpretación de los resultados corresponde al profesional."

export const CONFIDENCIALIDAD = "Contiene datos personales de un niño. Uso confidencial (Ley 25.326)."

export const PIE = "Lecxico · Confidencial"

const aclaracionTutor = (nombre: string) =>
  `Este informe no es un diagnóstico. Si tenés dudas sobre los resultados, consultá con el profesional que acompaña a ${nombre}.`

const TITULOS = {
  evaluacion: "Informe de evaluación",
  seguimiento: "Informe de seguimiento",
  ambos: "Informe de evaluación y seguimiento",
  tutor: "Informe de evaluaciones y entrenamiento",
}

const ESTADO_TAREA: Record<TareaInforme["estado"], string> = { pendiente: "Pendiente", hecha: "Hecha" }

const plural = (n: number, singular: string, pluralTxt: string) => `${n} ${n === 1 ? singular : pluralTxt}`
const errores = (n: number) => plural(n, "error", "errores")

const chip = (franja: Franja | null): ChipFranjaModelo => ({
  clave: franja ?? "sin_franja",
  texto: franja ? FRANJA_LABEL[franja] : SIN_FRANJA_LABEL,
})

/** "dd/mm/aaaa" de una fecha ISO o "aaaa-mm-dd", en hora de Argentina; "—" si no hay. */
function fecha(iso: string | null | undefined): string {
  const dia = iso ? diaArgentina(iso) : null
  return dia ? formatearDia(dia) : "—"
}

const fechaCorta = (iso: string) => fecha(iso).slice(0, 5)

/** Años cumplidos el día `hoy` ("aaaa-mm-dd") desde `nacimiento` ("aaaa-mm-dd"); null si no se puede. */
function edadEn(nacimiento: string, hoy: string): number | null {
  const n = diaArgentina(nacimiento)
  if (!n) return null
  const [an, mn, dn] = n.split("-").map(Number)
  const [ah, mh, dh] = hoy.split("-").map(Number)
  const edad = ah - an - (mh < mn || (mh === mn && dh < dn) ? 1 : 0)
  return edad >= 0 ? edad : null
}

/** Sin tildes, sin ñ ni espacios: "José María" → "Jose-Maria". */
function paraArchivo(texto: string): string {
  return (
    texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "Nino"
  )
}

/** "Informe-Lecxico_Perez-Juan_2026-11-27.pdf". */
export function nombreArchivoInforme(nino: { nombre: string; apellido: string }, dia: string): string {
  return `Informe-Lecxico_${paraArchivo(nino.apellido)}-${paraArchivo(nino.nombre)}_${dia}.pdf`
}

/* ------------------------------------------------------------------ */
/*  Construcción                                                        */
/* ------------------------------------------------------------------ */

interface Contexto {
  datos: DatosInforme
  opciones: OpcionesInforme
  profesional: boolean
  rango: RangoInforme
  hoy: Date
  /** Nombre de un autor para la columna "Registrado por". */
  autor: (id: string | null) => string
  /** true si un autor no es el usuario actual (incluye null). */
  esDeOtro: (id: string | null) => boolean
}

export function construirInforme(
  datos: DatosInforme,
  opciones: OpcionesInforme,
  variante: VarianteInforme,
  hoy: Date = new Date(),
): ModeloInforme {
  const profesional = variante === "profesional"
  const diaHoy = diaArgentina(hoy) ?? "1970-01-01"
  // Con fechas inválidas (validarOpciones lo impide) se toma todo el historial.
  const rango = rangoDelPeriodo(opciones.periodo, hoy, opciones) ?? { desde: null, hasta: null }
  const ctx: Contexto = {
    datos,
    opciones,
    profesional,
    rango,
    hoy,
    autor: (id) => (id && datos.nombresProfesionales[id]) || OTRO_PROFESIONAL,
    esDeOtro: (id) => id !== datos.usuarioId,
  }
  return {
    variante,
    titulo: !profesional
      ? TITULOS.tutor
      : opciones.evaluacion && opciones.seguimiento
        ? TITULOS.ambos
        : opciones.evaluacion
          ? TITULOS.evaluacion
          : TITULOS.seguimiento,
    emisor: datos.emisor,
    fechaEmision: formatearDia(diaHoy),
    periodo: opciones.seguimiento ? textoPeriodo(rango, diaHoy) : null,
    nino: datosDelNino(datos, profesional, diaHoy),
    nombreArchivo: nombreArchivoInforme(datos.nino, diaHoy),
    evaluacion: opciones.evaluacion ? seccionEvaluacion(ctx) : null,
    seguimiento: opciones.seguimiento ? seccionSeguimiento(ctx) : null,
    observaciones: profesional && opciones.observaciones.trim() ? opciones.observaciones.trim() : null,
    aclaracion: profesional ? ACLARACION_PROFESIONAL : aclaracionTutor(datos.nino.nombre),
    confidencialidad: CONFIDENCIALIDAD,
    pie: PIE,
  }
}

function textoPeriodo(rango: RangoInforme, diaHoy: string): string {
  if (rango.desde && rango.hasta) return `${formatearDia(rango.desde)} al ${formatearDia(rango.hasta)}`
  return `Todo el historial (hasta el ${formatearDia(diaHoy)})`
}

function datosDelNino(datos: DatosInforme, profesional: boolean, diaHoy: string): ModeloInforme["nino"] {
  const { nino } = datos
  const edad = edadEn(nino.fecha_nacimiento, diaHoy)
  const etapa = ETAPAS_ESCOLARES.find((e) => e.valor === nino.etapa_escolar)?.label ?? nino.etapa_escolar
  const filas = [
    { etiqueta: "Nombre y apellido", valor: `${nino.nombre} ${nino.apellido}` },
    {
      etiqueta: "Fecha de nacimiento",
      valor: `${fecha(nino.fecha_nacimiento)}${edad === null ? "" : ` (${plural(edad, "año", "años")})`}`,
    },
    { etiqueta: "Etapa escolar", valor: etapa },
    { etiqueta: "Nivel", valor: NIVEL_LABEL[nivelParaEtapa(nino.etapa_escolar)] },
  ]
  if (profesional) filas.push({ etiqueta: "Vinculado desde", valor: fecha(datos.vinculadoDesde) })
  return filas
}

/** Las evaluaciones que entran según la autoría (el período no se aplica a la evaluación elegida). */
const testsPorAutoria = (ctx: Contexto) =>
  ctx.datos.tests.filter((t) =>
    autoriaIncluida(t.profesional_id, ctx.datos.usuarioId, ctx.opciones.incluirOtrosProfesionales),
  )

/* ---------------------------- Evaluación ---------------------------- */

function filaBloque(nivel: Nivel, b: BloqueInforme, ctx: Contexto, grado: ReturnType<typeof gradoParaFranja>): FilaBloqueModelo {
  const esDenominacion = b.bloque_codigo === "denominacion_rapida"
  const detalle: string[] = []
  if (esDenominacion) {
    if (b.tiempo_ms != null && b.errores != null) {
      detalle.push(`Tiempo ${formatearTiempo(b.tiempo_ms)} y ${errores(b.errores)}.`)
      ;(b.detalle ?? []).forEach((e, i) => {
        detalle.push(`Ejercicio ${i + 1}: ${formatearTiempo(e.tiempo_ms)}, ${errores(e.errores)} (${e.correctas} / ${e.total}).`)
      })
    } else {
      detalle.push("Sin tiempo registrado.")
    }
  }
  return {
    bloque: BLOQUE_NOMBRES[b.bloque_codigo],
    aciertos: b.correctas,
    total: b.total,
    porcentaje: esDenominacion ? "—" : `${porcentajeBloque(b.correctas, b.total)} %`,
    ...(ctx.profesional ? { franja: chip(franjaDeBloque(nivel, b, grado)) } : {}),
    detalle,
  }
}

function seccionEvaluacion(ctx: Contexto): EvaluacionModelo {
  const titulo = "Evaluación"
  const test = testsPorAutoria(ctx).find((t) => t.id === ctx.opciones.testId)
  if (!test) {
    return {
      titulo,
      vacio:
        ctx.datos.tests.length === 0
          ? "Todavía no hay evaluaciones registradas."
          : "La evaluación elegida no está disponible.",
      subtitulo: null,
      registradoPor: null,
      filas: [],
    }
  }
  const grado = gradoParaFranja(test.nivel, ctx.datos.nino.etapa_escolar)
  const bloques = [...test.bloques].sort((a, b) => a.orden - b.orden)
  const modelo: EvaluacionModelo = {
    titulo,
    vacio: null,
    subtitulo: `Evaluación del ${fecha(test.fecha)} · Nivel ${NIVEL_LABEL[test.nivel]}`,
    registradoPor: ctx.esDeOtro(test.profesional_id) ? ctx.autor(test.profesional_id) : null,
    filas: bloques.map((b) => filaBloque(test.nivel, b, ctx, grado)),
  }
  if (!ctx.profesional) return modelo

  const conFranja = bloques.map((b) => ({ bloque_codigo: b.bloque_codigo, franja: franjaDeBloque(test.nivel, b, grado) }))
  modelo.leyendas = leyendasFranjas(test.nivel, conFranja, grado)
  if (ctx.opciones.incluirRecomendacion) {
    const juegos = new Map(
      juegosPorBloque(test.nivel, { incluirSoloConsulta: true }).map((g) => [g.bloque, g.juegos.map((j) => j.nombre)]),
    )
    const { recomendados } = recomendacion(test.nivel, test.bloques, grado)
    modelo.recomendacion = {
      bloques: recomendados.map((b) => ({
        bloque: BLOQUE_NOMBRES[b.bloque_codigo],
        franja: chip(b.franja),
        juegos: juegos.get(b.bloque_codigo) ?? [],
      })),
      vacio:
        recomendados.length === 0
          ? "En esta evaluación todos los bloques con franja quedaron en «Correcto». No hay una recomendación específica."
          : null,
      nota: "Es una orientación a partir de esta evaluación: qué trabajar con el niño lo decide el profesional.",
    }
  }
  return modelo
}

function leyendasFranjas(
  nivel: Nivel,
  bloques: { bloque_codigo: BloqueInforme["bloque_codigo"]; franja: Franja | null }[],
  grado: ReturnType<typeof gradoParaFranja>,
): string[] {
  const leyendas = [TEXTO_QUE_SON_FRANJAS]
  if (bloques.some((b) => b.franja === null)) leyendas.push(`${SIN_FRANJA_LABEL}: ${TEXTO_SIN_FRANJA}`)
  const textoGrado = textoGradoFranjas(nivel, bloques, grado)
  if (textoGrado) leyendas.push(textoGrado)
  return leyendas
}

/* ---------------------------- Seguimiento --------------------------- */

function seccionSeguimiento(ctx: Contexto): SeguimientoModelo {
  const { secciones } = ctx.opciones
  const tests = testsPorAutoria(ctx).filter((t) => enRango(t.fecha, ctx.rango))
  // Niveles con evaluaciones en el período, con el actual del niño primero.
  const nivelActual = nivelParaEtapa(ctx.datos.nino.etapa_escolar)
  const niveles = nivelesConEvaluaciones(tests).sort((a, b) => Number(b === nivelActual) - Number(a === nivelActual))
  const partidas = ctx.datos.partidas.filter((p) => enRango(p.created_at, ctx.rango))
  const conAutoria = partidas.filter(
    (p) =>
      p.origen === "practica" ||
      autoriaIncluida(p.profesional_id, ctx.datos.usuarioId, ctx.opciones.incluirOtrosProfesionales),
  )
  return {
    evolucion: secciones.evolucion ? evolucion(ctx, tests, niveles) : null,
    denominacion: secciones.denominacion ? denominacion(ctx, tests, niveles) : null,
    entrenamiento: secciones.entrenamiento ? entrenamiento(ctx, conAutoria, nivelActual) : null,
    tareas: secciones.tareas ? tareas(ctx) : null,
    // La práctica en casa no tiene autor: siempre entra, sin filtro de autoría.
    practica: secciones.practica ? practica(partidas.filter((p) => p.origen === "practica")) : null,
  }
}

/** "Conciencia Silábica: de 50 % a 83 % en 3 evaluaciones." (sin franja, para el tutor). */
function resumenSinFranja(bloque: string, puntos: readonly PuntoDeBloque[]): string {
  const ultimo = puntos[puntos.length - 1]
  if (puntos.length === 1) return `${bloque}: ${ultimo.porcentaje} % en 1 evaluación.`
  return `${bloque}: de ${puntos[0].porcentaje} % a ${ultimo.porcentaje} % en ${puntos.length} evaluaciones.`
}

function evolucion(ctx: Contexto, tests: readonly TestInforme[], niveles: Nivel[]): EvolucionModelo {
  const titulo = "Evolución de las evaluaciones"
  if (tests.length === 0) return { titulo, vacio: SIN_REGISTROS, niveles: [], evaluaciones: null }

  let haySinReferencia = false
  const porNivel = niveles.map((nivel) => {
    const grado = gradoParaFranja(nivel, ctx.datos.nino.etapa_escolar)
    const serie = serieEvaluaciones(tests, nivel, grado)
    const graficos = BLOQUES_POR_NIVEL[nivel]
      // Denominación rápida tiene su propia sección (tiempo y errores).
      .filter((b) => b !== "denominacion_rapida")
      .flatMap((bloque): GraficoBloqueModelo[] => {
        const puntos = serieDeBloque(serie, bloque)
        if (puntos.length === 0) return []
        const nombre = BLOQUE_NOMBRES[bloque]
        const base = puntos.map((p) => ({ etiqueta: fechaCorta(p.fecha), fecha: fecha(p.fecha), valor: p.porcentaje }))
        if (!ctx.profesional) return [{ bloque: nombre, puntos: base, resumen: resumenSinFranja(nombre, puntos) }]
        const bandas = bandasDeFranja(nivel, bloque, grado)
        if (!bandas) haySinReferencia = true
        return [
          {
            bloque: nombre,
            puntos: base.map((p, i) => ({ ...p, franja: chip(puntos[i].franja).clave })),
            bandas,
            ultimaFranja: chip(puntos[puntos.length - 1].franja),
            resumen: resumenBloque(bloque, puntos),
          },
        ]
      })
    return { nivel: `Nivel ${NIVEL_LABEL[nivel]}`, graficos }
  })

  const hayDeOtros = tests.some((t) => ctx.esDeOtro(t.profesional_id))
  const cronologicos = [...tests].sort(
    (a, b) => (Date.parse(a.fecha) || 0) - (Date.parse(b.fecha) || 0) || (Date.parse(a.created_at) || 0) - (Date.parse(b.created_at) || 0),
  )
  const evaluaciones: TablaModelo = {
    columnas: [
      { titulo: "Fecha", ancho: 1 },
      { titulo: "Nivel", ancho: 1 },
      ...(hayDeOtros ? [{ titulo: "Registrado por", ancho: 2 }] : []),
    ],
    filas: cronologicos.map((t) => [
      fecha(t.fecha),
      NIVEL_LABEL[t.nivel],
      ...(hayDeOtros ? [ctx.autor(t.profesional_id)] : []),
    ]),
  }

  const modelo: EvolucionModelo = { titulo, vacio: null, niveles: porNivel, evaluaciones }
  if (ctx.profesional) {
    modelo.leyendas = [
      "Cada gráfico muestra el porcentaje de aciertos del bloque en cada evaluación del período, con las franjas de fondo.",
      ...(haySinReferencia ? [`${SIN_FRANJA_LABEL}: el gráfico va sin franjas de fondo.`] : []),
    ]
  }
  return modelo
}

function denominacion(ctx: Contexto, tests: readonly TestInforme[], niveles: Nivel[]): DenominacionModelo {
  const titulo = "Denominación rápida"
  const nota = "Se mide por tiempo y errores. Menos tiempo es mejor."
  if (tests.length === 0) return { titulo, vacio: SIN_REGISTROS, niveles: [], nota }

  const porNivel = niveles
    .filter((nivel) => tests.some((t) => t.nivel === nivel && t.bloques.some((b) => b.bloque_codigo === "denominacion_rapida")))
    .map((nivel) => {
      const grado = gradoParaFranja(nivel, ctx.datos.nino.etapa_escolar)
      const serie: PuntoDenominacion[] = serieDenominacion(tests, nivel, grado)
      const puntos: PuntoDenominacionModelo[] = serie.map((p) => ({
        etiqueta: fechaCorta(p.fecha),
        fecha: fecha(p.fecha),
        segundos: p.segundos,
        tiempo: formatearTiempo(p.tiempoMs),
        errores: p.errores,
        aciertosPorcentaje: p.aciertosPorcentaje,
        ...(ctx.profesional ? { franja: chip(p.franja).clave } : {}),
      }))
      const columnas: ColumnaModelo[] = [
        { titulo: "Fecha", ancho: 1.2 },
        { titulo: "Tiempo", ancho: 1, alinear: "derecha" },
        { titulo: "Errores", ancho: 1, alinear: "derecha" },
        { titulo: "Aciertos", ancho: 1, alinear: "derecha" },
        ...(ctx.profesional ? [{ titulo: "Franja", ancho: 1.6 }] : []),
      ]
      const filas: CeldaModelo[][] = serie.map((p) => [
        fecha(p.fecha),
        formatearTiempo(p.tiempoMs),
        String(p.errores),
        `${p.aciertosPorcentaje} %`,
        ...(ctx.profesional ? [chip(p.franja)] : []),
      ])
      const ultimo = serie[serie.length - 1]
      const resumen = ctx.profesional
        ? resumenDenominacion(serie)
        : serie.length === 0
          ? "Sin tiempo registrado en estas evaluaciones."
          : `Tiempo de ${formatearTiempo(serie[0].tiempoMs)} a ${formatearTiempo(ultimo.tiempoMs)} en ${plural(serie.length, "evaluación", "evaluaciones")}.`
      return {
        nivel: `Nivel ${NIVEL_LABEL[nivel]}`,
        puntos,
        ...(ctx.profesional && ultimo ? { ultimaFranja: chip(ultimo.franja) } : {}),
        resumen,
        tabla: { columnas, filas },
        vacio: serie.length === 0 ? "Sin tiempo registrado en las evaluaciones del período." : null,
      }
    })

  return {
    titulo,
    vacio: porNivel.length === 0 ? "Las evaluaciones del período no tienen denominación rápida." : null,
    niveles: porNivel,
    nota,
  }
}

/** Autores distintos de las partidas de consulta y de tarea de un juego ("—" si solo hay práctica). */
function autoresDe(ctx: Contexto, partidas: readonly PartidaSeguimiento[]): string {
  const ids = [...new Set(partidas.filter((p) => p.origen !== "practica").map((p) => p.profesional_id))]
  return ids.length === 0 ? "—" : ids.map(ctx.autor).filter((n, i, todos) => todos.indexOf(n) === i).join(", ")
}

function entrenamiento(ctx: Contexto, partidas: readonly PartidaSeguimiento[], nivelActual: Nivel): EntrenamientoModelo {
  const titulo = "Entrenamiento por juego"
  if (partidas.length === 0) {
    return { titulo, vacio: SIN_REGISTROS, semanas: [], maximo: 0, resumenSemanas: "", porJuego: null }
  }
  const todo = rangoDeSemanas("todo", partidas, ctx.hoy)
  const semanas = partidasPorSemana(partidas, {
    desde: ctx.rango.desde ? instanteDelDia(ctx.rango.desde) : todo.desde,
    hasta: ctx.rango.hasta ? instanteDelDia(ctx.rango.hasta) : todo.hasta,
  })
  const hayDeOtros = partidas.some((p) => p.origen !== "practica" && ctx.esDeOtro(p.profesional_id))
  const filas = resumenPorJuego(partidas, ctx.datos.habilitados, { nivel: nivelActual }).map((r) => [
    `${r.nombre}\nHasta grado ${r.gradoMaximo}`,
    r.gradoHabilitado ? `Grado ${r.gradoHabilitado}` : "No se juega en casa",
    String(r.partidas.consulta),
    String(r.partidas.tarea),
    String(r.partidas.practica),
    `${r.ultimo.porcentaje} %\n${fecha(r.ultimo.fecha)}`,
    `${r.mejorPorcentaje} %`,
    ...(hayDeOtros ? [autoresDe(ctx, partidas.filter((p) => p.juego === r.juego))] : []),
  ])
  return {
    titulo,
    vacio: null,
    semanas: semanas.map((s) => ({
      etiqueta: fechaCorta(s.semana),
      consulta: s.consulta,
      tarea: s.tarea,
      practica: s.practica,
      total: s.total,
    })),
    maximo: Math.max(0, ...semanas.map((s) => s.total)),
    resumenSemanas: resumenSemanas(semanas),
    porJuego: {
      columnas: [
        { titulo: "Juego", ancho: 2.6 },
        { titulo: "En casa", ancho: 1.3 },
        { titulo: "Consulta", ancho: 1, alinear: "derecha" },
        { titulo: "Tarea", ancho: 0.9, alinear: "derecha" },
        { titulo: "Práctica", ancho: 1, alinear: "derecha" },
        { titulo: "Último", ancho: 1.3, alinear: "derecha" },
        { titulo: "Mejor", ancho: 0.9, alinear: "derecha" },
        ...(hayDeOtros ? [{ titulo: "Registrado por", ancho: 2 }] : []),
      ],
      filas,
    },
  }
}

function tareas(ctx: Contexto): TablaSeccionModelo {
  const titulo = "Tareas"
  const lista = ctx.datos.tareas
    .filter((t) => enRango(t.created_at, ctx.rango))
    .filter((t) => autoriaIncluida(t.profesional_id, ctx.datos.usuarioId, ctx.opciones.incluirOtrosProfesionales))
    .sort((a, b) => (Date.parse(a.created_at) || 0) - (Date.parse(b.created_at) || 0))
  if (lista.length === 0) return { titulo, vacio: SIN_REGISTROS, resumen: null, tabla: null }

  const hechas = lista.filter((t) => t.estado === "hecha").length
  const hayDeOtros = lista.some((t) => ctx.esDeOtro(t.profesional_id))
  return {
    titulo,
    vacio: null,
    resumen: `${plural(lista.length, "tarea asignada", "tareas asignadas")} en el período; ${plural(hechas, "hecha", "hechas")}.`,
    tabla: {
      columnas: [
        { titulo: "Tarea", ancho: 1.6 },
        { titulo: "Juegos", ancho: 3 },
        { titulo: "Asignada", ancho: 1.1 },
        { titulo: "Estado", ancho: 1 },
        { titulo: "Realizada", ancho: 1.1 },
        ...(hayDeOtros ? [{ titulo: "Registrado por", ancho: 1.6 }] : []),
      ],
      filas: lista.map((t) => [
        t.nombre?.trim() || (t.es_mision ? "Misión" : "Tarea"),
        [...t.items]
          .sort((a, b) => a.orden - b.orden)
          .map((i) => `${nombreJuego(i.juego)} (grado ${i.grado})`)
          .join("\n") || "—",
        fecha(t.created_at),
        ESTADO_TAREA[t.estado],
        t.estado === "hecha" ? fecha(t.completada_at) : "—",
        ...(hayDeOtros ? [ctx.autor(t.profesional_id)] : []),
      ]),
    },
  }
}

function practica(partidas: readonly PartidaSeguimiento[]): TablaSeccionModelo {
  const titulo = "Práctica en casa"
  if (partidas.length === 0) return { titulo, vacio: SIN_REGISTROS, resumen: null, tabla: null }
  const porJuego = new Map<string, { partidas: number; gradoMaximo: number; ultima: string }>()
  for (const p of partidas) {
    const fila = porJuego.get(p.juego)
    if (!fila) {
      porJuego.set(p.juego, { partidas: 1, gradoMaximo: p.grado, ultima: p.created_at })
      continue
    }
    fila.partidas++
    fila.gradoMaximo = Math.max(fila.gradoMaximo, p.grado)
    if ((Date.parse(p.created_at) || 0) > (Date.parse(fila.ultima) || 0)) fila.ultima = p.created_at
  }
  const filas = [...porJuego.entries()].sort((a, b) => b[1].partidas - a[1].partidas || a[0].localeCompare(b[0]))
  return {
    titulo,
    vacio: null,
    resumen: `${plural(partidas.length, "partida", "partidas")} de práctica en casa en el período, en ${plural(filas.length, "juego", "juegos")}.`,
    tabla: {
      columnas: [
        { titulo: "Juego", ancho: 2.4 },
        { titulo: "Partidas", ancho: 1, alinear: "derecha" },
        { titulo: "Grado más alto", ancho: 1.3, alinear: "derecha" },
        { titulo: "Última partida", ancho: 1.3, alinear: "derecha" },
      ],
      filas: filas.map(([juego, f]) => [nombreJuego(juego), String(f.partidas), String(f.gradoMaximo), fecha(f.ultima)]),
    },
  }
}
