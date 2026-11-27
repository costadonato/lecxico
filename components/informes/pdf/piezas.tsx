import type { ReactNode } from "react"
import { Circle, Path, Svg, Text, View } from "@react-pdf/renderer"
import { COLOR, COLOR_FRANJA, s } from "@/components/informes/pdf/estilos"
import type { CeldaModelo, ChipFranjaModelo, FilaBloqueModelo, TablaModelo } from "@/lib/informes/modelo"

/*
 * Piezas del informe en PDF (S17a). Solo dibujan lo que viene en el modelo
 * (lib/informes/modelo.ts): no calculan nada.
 */

/** El logo de Lecxico (mismos trazos que components/logo-lecxico.tsx), en el rojo de marca. */
export function LogoPdf({ ancho = 104 }: { ancho?: number }) {
  return (
    <Svg viewBox="0 0 272 44" width={ancho} height={(ancho * 44) / 272}>
      <Path d="M2 2 V41.9 H27" stroke={COLOR.rojo} strokeWidth={2.4} fill="none" />
      <Path d="M39 3.1 H65 M39 22 H65 M39 40.9 H65" stroke={COLOR.rojo} strokeWidth={2.4} fill="none" />
      <Path d="M112.6 9.5 A20 20 0 1 0 112.6 34.5" stroke={COLOR.rojo} strokeWidth={2.4} fill="none" />
      <Path d="M121.5 2 L154.5 42 M154.5 2 L121.5 42" stroke={COLOR.rojo} strokeWidth={2.4} fill="none" />
      <Path d="M167 2 V42" stroke={COLOR.rojo} strokeWidth={2.4} fill="none" />
      <Path d="M214.6 9.5 A20 20 0 1 0 214.6 34.5" stroke={COLOR.rojo} strokeWidth={2.4} fill="none" />
      <Circle cx={249} cy={22} r={19.9} stroke={COLOR.rojo} strokeWidth={2.4} fill="none" />
    </Svg>
  )
}

/**
 * Título de sección con la barra roja. Cada sección lo agrupa (wrap={false})
 * con el comienzo de su contenido, así nunca queda solo al pie de una
 * página: minPresenceAhead no alcanza cuando el título es el primer hijo.
 */
export function TituloSeccion({ children }: { children: ReactNode }) {
  return (
    <View style={s.tituloSeccion}>
      <View style={s.barraSeccion} />
      <Text style={s.textoTituloSeccion}>{children}</Text>
    </View>
  )
}

export function Subtitulo({ children }: { children: ReactNode }) {
  return <Text style={s.subtitulo}>{children}</Text>
}

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <View style={s.vacio}>
      <Text>{children}</Text>
    </View>
  )
}

/** Chip de franja: siempre con texto; el color acompaña. */
export function ChipPdf({ chip }: { chip: ChipFranjaModelo }) {
  const c = COLOR_FRANJA[chip.clave]
  return (
    <View style={[s.chip, { borderColor: c.borde, backgroundColor: c.suave }]}>
      <Text style={[s.textoChip, { color: c.texto }]}>{chip.texto}</Text>
    </View>
  )
}

function Celda({ celda, ancho, derecha }: { celda: CeldaModelo; ancho: number; derecha?: boolean }) {
  if (typeof celda === "string") {
    return <Text style={[s.celda, { flex: ancho }, derecha ? s.derecha : {}]}>{celda}</Text>
  }
  return (
    <View style={[s.celdaCaja, { flex: ancho }]}>
      <ChipPdf chip={celda} />
    </View>
  )
}

/**
 * Tabla con encabezado y filas alternadas. Lo que va `antes` (el título de
 * la sección o un subtítulo), el encabezado y la primera fila van juntos:
 * un título nunca queda solo al pie de una página. Las filas no se parten.
 */
export function TablaPdf({ tabla, antes }: { tabla: TablaModelo; antes?: ReactNode }) {
  const fila = (celdas: CeldaModelo[], i: number) => (
    <View key={i} style={[s.fila, i % 2 === 1 ? s.filaAlterna : {}]} wrap={false}>
      {celdas.map((celda, j) => (
        <Celda key={j} celda={celda} ancho={tabla.columnas[j].ancho} derecha={tabla.columnas[j].alinear === "derecha"} />
      ))}
    </View>
  )
  return (
    <>
      <View style={s.grupo} wrap={false}>
        {antes}
        <View style={s.filaEncabezado}>
          {tabla.columnas.map((c) => (
            <Text key={c.titulo} style={[s.celda, s.celdaEncabezado, { flex: c.ancho }, c.alinear ? s.derecha : {}]}>
              {c.titulo}
            </Text>
          ))}
        </View>
        {tabla.filas.slice(0, 1).map(fila)}
      </View>
      {tabla.filas.slice(1).map((f, i) => fila(f, i + 1))}
    </>
  )
}

const COLUMNAS_BLOQUES = [
  { titulo: "Bloque", ancho: 3 },
  { titulo: "Aciertos", ancho: 1, derecha: true },
  { titulo: "Total", ancho: 0.8, derecha: true },
  { titulo: "Porcentaje", ancho: 1.1, derecha: true },
]

/**
 * Tabla de bloques de la evaluación (9 filas como mucho): va entera, junto
 * con lo que va `antes`. Denominación rápida suma su tiempo y errores debajo.
 */
export function TablaBloques({ filas, conFranja, antes }: { filas: FilaBloqueModelo[]; conFranja: boolean; antes?: ReactNode }) {
  const columnas = conFranja ? [...COLUMNAS_BLOQUES, { titulo: "Franja", ancho: 1.9, derecha: false }] : COLUMNAS_BLOQUES
  return (
    <View style={s.grupo} wrap={false}>
      {antes}
      <View style={s.filaEncabezado}>
        {columnas.map((c) => (
          <Text key={c.titulo} style={[s.celda, s.celdaEncabezado, { flex: c.ancho }, c.derecha ? s.derecha : {}]}>
            {c.titulo}
          </Text>
        ))}
      </View>
      {filas.map((f, i) => (
        <View key={f.bloque} style={[s.fila, { flexDirection: "column" }, i % 2 === 1 ? s.filaAlterna : {}]}>
          <View style={{ flexDirection: "row" }}>
            <Text style={[s.celda, s.negrita, { flex: 3 }]}>{f.bloque}</Text>
            <Text style={[s.celda, s.derecha, { flex: 1 }]}>{f.aciertos}</Text>
            <Text style={[s.celda, s.derecha, { flex: 0.8 }]}>{f.total}</Text>
            <Text style={[s.celda, s.derecha, { flex: 1.1 }]}>{f.porcentaje}</Text>
            {conFranja && f.franja && (
              <View style={[s.celdaCaja, { flex: 1.9 }]}>
                <ChipPdf chip={f.franja} />
              </View>
            )}
          </View>
          {f.detalle.length > 0 && <Text style={s.detalleFila}>{f.detalle.join("  ·  ")}</Text>}
        </View>
      ))}
    </View>
  )
}

export function Leyendas({ textos }: { textos: string[] }) {
  return (
    <View style={[s.grupo, { marginTop: 5 }]} wrap={false}>
      {textos.map((t) => (
        <Text key={t} style={[s.chico, { marginBottom: 2 }]}>
          {t}
        </Text>
      ))}
    </View>
  )
}
