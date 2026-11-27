import { Font, StyleSheet } from "@react-pdf/renderer"
import type { ClaveFranja } from "@/lib/informes/modelo"

/*
 * Estilos del informe en PDF (S17a): A4, sobrio y legible, con los tokens de
 * color de app/globals.css. Pensado para imprimir: nada de fondos llenos de
 * color; solo tintes muy claros en chips, filas alternadas y bandas.
 */

/** 2 cm en puntos (1 cm = 28,35 pt). */
export const MARGEN = 56.7
/** Ancho útil de una página A4 (595,28 pt) con los márgenes de 2 cm. */
export const ANCHO_UTIL = 595.28 - 2 * MARGEN

export const COLOR = {
  texto: "#2a2420",
  atenuado: "#675d55",
  borde: "#e4dacd",
  alterna: "#f8f5f1",
  rojo: "#d42a2a",
  rojoFuerte: "#a81d22",
  rojoSuave: "#fde6e3",
  menta: "#34c38f",
  mentaFuerte: "#14724f",
  mentaSuave: "#ddf5ea",
  sol: "#ffc233",
  solFuerte: "#8a5300",
  solSuave: "#fff1cc",
  celeste: "#2fd0e6",
  celesteFuerte: "#0a7189",
  lavanda: "#9b7bf2",
  lavandaFuerte: "#5b3dc4",
  gris: "#b9b0a7",
  grisSuave: "#f1ede8",
}

/** Borde, texto y tinte de cada franja (chip, puntos y bandas). */
export const COLOR_FRANJA: Record<ClaveFranja, { borde: string; texto: string; suave: string }> = {
  correcto: { borde: COLOR.menta, texto: COLOR.mentaFuerte, suave: COLOR.mentaSuave },
  intermedio: { borde: COLOR.sol, texto: COLOR.solFuerte, suave: COLOR.solSuave },
  a_observar: { borde: COLOR.rojo, texto: COLOR.rojoFuerte, suave: COLOR.rojoSuave },
  sin_franja: { borde: COLOR.gris, texto: COLOR.atenuado, suave: COLOR.grisSuave },
}

/** Barras por semana: consulta en celeste, tarea en lavanda y práctica en menta (como TONO_ORIGEN). */
export const COLOR_ORIGEN = {
  consulta: { relleno: COLOR.celeste, borde: COLOR.celesteFuerte },
  tarea: { relleno: COLOR.lavanda, borde: COLOR.lavandaFuerte },
  practica: { relleno: COLOR.menta, borde: COLOR.mentaFuerte },
}

export const FAMILIA = "Lexend"


let registradas: string | null = null

/**
 * Registra Lexend (regular y bold, TTF con licencia OFL en public/fonts/).
 * `base` es la carpeta: una URL en el navegador ("https://…/fonts") o una
 * ruta del disco en Node (pruebas y PDF de ejemplo). Las palabras no se
 * cortan con guiones: la separación en sílabas de react-pdf es la del inglés.
 */
export function registrarFuentes(base: string) {
  if (registradas === base) return
  Font.register({
    family: FAMILIA,
    fonts: [
      { src: `${base}/Lexend-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/Lexend-Bold.ttf`, fontWeight: 700 },
    ],
  })
  Font.registerHyphenationCallback((palabra) => [palabra])
  registradas = base
}

export const s = StyleSheet.create({
  // Sin lineHeight en ningún estilo: en react-pdf 4.9 hace desaparecer el
  // número de página (texto dinámico) y mide mal las alturas (filas infladas
  // y tablas encimadas al pie). Lexend ya trae un interlineado amplio.
  pagina: {
    fontFamily: FAMILIA,
    fontSize: 9,
    color: COLOR.texto,
    paddingTop: MARGEN,
    paddingHorizontal: MARGEN,
    paddingBottom: MARGEN,
  },
  // Pie en dos piezas absolutas: una View con un Text dinámico adentro
  // pierde su posición en react-pdf 4.9 (queda fuera de la página).
  pie: {
    position: "absolute",
    bottom: 24,
    left: MARGEN,
    right: MARGEN,
    borderTopWidth: 0.5,
    borderTopColor: COLOR.borde,
    paddingTop: 5,
    fontSize: 7.5,
    color: COLOR.atenuado,
  },
  // Con left y right: sin ancho, el texto dinámico no se ve.
  numeroPagina: {
    position: "absolute",
    bottom: 24,
    left: MARGEN,
    right: MARGEN,
    paddingTop: 5,
    fontSize: 7.5,
    color: COLOR.atenuado,
    textAlign: "right",
  },
  encabezado: {
    paddingBottom: 10,
    marginBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: COLOR.rojo,
  },
  filaEncabezadoDoc: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tituloDocumento: { fontSize: 17, fontWeight: 700, marginTop: 10 },
  metaEncabezado: { alignItems: "flex-end", textAlign: "right", fontSize: 8.5, color: COLOR.atenuado, maxWidth: 260 },
  metaFuerte: { color: COLOR.texto, fontWeight: 700 },
  /** Bloque indivisible: nunca se achica para entrar al pie de una página. */
  grupo: { flexShrink: 0 },
  espacioSeccion: { height: 14 },
  tituloSeccion: { flexDirection: "row", alignItems: "center", marginBottom: 7 },
  barraSeccion: { width: 3.5, height: 14, backgroundColor: COLOR.rojo, marginRight: 7, borderRadius: 1 },
  textoTituloSeccion: { fontSize: 12.5, fontWeight: 700 },
  subtitulo: { fontSize: 10, fontWeight: 700, marginTop: 8, marginBottom: 4 },
  parrafo: { marginBottom: 4 },
  atenuado: { color: COLOR.atenuado },
  chico: { fontSize: 7.5, color: COLOR.atenuado },
  negrita: { fontWeight: 700 },
  vacio: {
    color: COLOR.atenuado,
    borderWidth: 0.5,
    borderColor: COLOR.borde,
    borderStyle: "dashed",
    borderRadius: 4,
    padding: 8,
  },
  // Datos del niño: dos columnas de etiqueta y valor.
  datos: { flexDirection: "row", flexWrap: "wrap" },
  dato: { width: "50%", paddingVertical: 3, paddingRight: 8, borderBottomWidth: 0.5, borderBottomColor: COLOR.borde },
  etiquetaDato: { fontSize: 7.5, color: COLOR.atenuado },
  valorDato: { fontWeight: 700 },
  // Tablas.
  filaEncabezado: {
    flexDirection: "row",
    borderTopWidth: 0.75,
    borderTopColor: COLOR.texto,
    borderBottomWidth: 0.75,
    borderBottomColor: COLOR.texto,
  },
  fila: { flexDirection: "row", flexShrink: 0, borderBottomWidth: 0.5, borderBottomColor: COLOR.borde },
  filaAlterna: { backgroundColor: COLOR.alterna },
  celda: { paddingVertical: 3.5, paddingHorizontal: 4 },
  /** Celda que es una View (con un chip): sin lineHeight. */
  celdaCaja: { paddingVertical: 3.5, paddingHorizontal: 4 },
  celdaEncabezado: { fontSize: 7.5, fontWeight: 700, color: COLOR.atenuado },
  derecha: { textAlign: "right" },
  detalleFila: { fontSize: 7.5, color: COLOR.atenuado, paddingHorizontal: 4, paddingBottom: 3.5, marginTop: -1.5 },
  // Chip de franja: borde y texto del color, tinte muy claro.
  chip: { alignSelf: "flex-start", borderWidth: 0.75, borderRadius: 7, paddingHorizontal: 5, paddingVertical: 0.5 },
  textoChip: { fontSize: 7.5, fontWeight: 700 },
  // Gráficos.
  grilla: { flexDirection: "row", justifyContent: "space-between", flexShrink: 0 },
  tarjeta: {
    width: (ANCHO_UTIL - 12) / 2,
    borderWidth: 0.5,
    borderColor: COLOR.borde,
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  cabezaTarjeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 3 },
  tituloTarjeta: { fontSize: 8.5, fontWeight: 700, flexShrink: 1, marginRight: 4 },
  leyenda: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  itemLeyenda: { flexDirection: "row", alignItems: "center", marginRight: 10, fontSize: 7.5, color: COLOR.atenuado },
  cuadroLeyenda: { width: 7, height: 7, marginRight: 3, borderWidth: 0.5 },
  // Recomendación.
  itemRecomendacion: {
    borderLeftWidth: 2,
    paddingLeft: 6,
    paddingVertical: 2,
    marginBottom: 5,
  },
  // Observaciones y aclaración final.
  observaciones: { borderWidth: 0.75, borderColor: COLOR.borde, borderRadius: 4, padding: 8 },
  aclaracion: { marginTop: 16, paddingTop: 8, borderTopWidth: 0.75, borderTopColor: COLOR.borde, fontSize: 8 },
})
