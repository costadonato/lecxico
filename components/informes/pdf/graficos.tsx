import type { ReactNode } from "react"
import { Circle, Line, Polyline, Rect, Svg, Text, View } from "@react-pdf/renderer"
import { ChipPdf } from "@/components/informes/pdf/piezas"
import { ANCHO_UTIL, COLOR, COLOR_FRANJA, COLOR_ORIGEN, FAMILIA, s } from "@/components/informes/pdf/estilos"
import type { GraficoBloqueModelo, PuntoDenominacionModelo, SemanaModelo } from "@/lib/informes/modelo"

/*
 * Gráficos del informe en PDF, dibujados a mano con el SVG de react-pdf a
 * partir de las series del modelo (que salen de lib/seguimiento/). Cada
 * gráfico lleva debajo su resumen en texto, como en S16.
 */

const ANCHO_TARJETA = (ANCHO_UTIL - 12) / 2 - 12
const TEXTO_EJE = { fontSize: 5.5, fontFamily: FAMILIA }

interface Area {
  ancho: number
  alto: number
  izq: number
  der: number
  arriba: number
  abajo: number
}

const anchoPlot = (a: Area) => a.ancho - a.izq - a.der
const altoPlot = (a: Area) => a.alto - a.arriba - a.abajo

/** x de cada punto, repartidos en el ancho (uno solo va al medio). */
function xs(n: number, a: Area): number[] {
  if (n === 1) return [a.izq + anchoPlot(a) / 2]
  return Array.from({ length: n }, (_, i) => a.izq + (i * anchoPlot(a)) / (n - 1))
}

/** Cada cuántas etiquetas del eje X se escribe una, para que no se pisen. */
const pasoEtiquetas = (n: number, maximo: number) => Math.max(1, Math.ceil(n / maximo))

function EjeX({ etiquetas, x, a }: { etiquetas: string[]; x: number[]; a: Area }) {
  const paso = pasoEtiquetas(etiquetas.length, 7)
  return (
    <>
      {etiquetas.map((e, i) =>
        i % paso === 0 || i === etiquetas.length - 1 ? (
          <Text key={i} x={x[i]} y={a.alto - 3} style={TEXTO_EJE} fill={COLOR.atenuado} textAnchor="middle">
            {e}
          </Text>
        ) : null,
      )}
    </>
  )
}

/** Líneas guía horizontales con su valor a la izquierda. */
function Guias({ valores, y, a, sufijo }: { valores: number[]; y: (v: number) => number; a: Area; sufijo: string }) {
  return (
    <>
      {valores.map((v) => (
        <Line key={v} x1={a.izq} x2={a.ancho - a.der} y1={y(v)} y2={y(v)} stroke={COLOR.borde} strokeWidth={0.5} />
      ))}
      {valores.map((v) => (
        <Text key={`t${v}`} x={a.izq - 3} y={y(v) + 2} style={TEXTO_EJE} fill={COLOR.atenuado} textAnchor="end">
          {`${v}${sufijo}`}
        </Text>
      ))}
    </>
  )
}

/**
 * Línea de porcentajes (0 a 100 %) con las franjas de fondo, si las hay.
 * Los puntos llevan el color de su franja; sin franjas, el del texto.
 */
function LineaPorcentaje({
  puntos,
  bandas,
  ancho = ANCHO_TARJETA,
  alto = 92,
}: {
  puntos: { etiqueta: string; valor: number; franja?: keyof typeof COLOR_FRANJA }[]
  bandas?: GraficoBloqueModelo["bandas"]
  ancho?: number
  alto?: number
}) {
  const a: Area = { ancho, alto, izq: 22, der: 12, arriba: 5, abajo: 12 }
  const y = (v: number) => a.arriba + (1 - v / 100) * altoPlot(a)
  const x = xs(puntos.length, a)
  return (
    <Svg width={ancho} height={alto}>
      {bandas?.map((b) => (
        <Rect
          key={b.franja}
          x={a.izq}
          y={y(b.hasta)}
          width={anchoPlot(a)}
          height={y(b.desde) - y(b.hasta)}
          fill={COLOR_FRANJA[b.franja].suave}
        />
      ))}
      <Guias valores={[0, 50, 100]} y={y} a={a} sufijo=" %" />
      {puntos.length > 1 && (
        <Polyline
          points={puntos.map((p, i) => `${x[i]},${y(p.valor)}`).join(" ")}
          stroke={COLOR.texto}
          strokeWidth={1}
          fill="none"
        />
      )}
      {puntos.map((p, i) => (
        <Circle
          key={i}
          cx={x[i]}
          cy={y(p.valor)}
          r={2.3}
          fill={p.franja ? COLOR_FRANJA[p.franja].texto : COLOR.texto}
          stroke="#ffffff"
          strokeWidth={0.75}
        />
      ))}
      <EjeX etiquetas={puntos.map((p) => p.etiqueta)} x={x} a={a} />
    </Svg>
  )
}

/** Tarjeta de un bloque: nombre, chip de la última franja, la línea y el resumen. */
export function TarjetaBloque({ grafico }: { grafico: GraficoBloqueModelo }) {
  return (
    <View style={s.tarjeta}>
      <View style={s.cabezaTarjeta}>
        <Text style={s.tituloTarjeta}>{grafico.bloque}</Text>
        {grafico.ultimaFranja && <ChipPdf chip={grafico.ultimaFranja} />}
      </View>
      <LineaPorcentaje puntos={grafico.puntos} bandas={grafico.bandas} />
      <Text style={[s.chico, { marginTop: 2 }]}>{grafico.resumen}</Text>
    </View>
  )
}

/**
 * Grilla de 2 columnas; cada fila de tarjetas va entera en una página. Lo
 * que va `antes` (título, leyendas) queda pegado a la primera fila.
 */
export function GrillaBloques({ graficos, antes }: { graficos: GraficoBloqueModelo[]; antes?: ReactNode }) {
  const filas: GraficoBloqueModelo[][] = []
  for (let i = 0; i < graficos.length; i += 2) filas.push(graficos.slice(i, i + 2))
  const fila = (f: GraficoBloqueModelo[], i: number) => (
    <View key={i} style={s.grilla} wrap={false}>
      {f.map((g) => (
        <TarjetaBloque key={g.bloque} grafico={g} />
      ))}
      {f.length === 1 && <View style={{ width: (ANCHO_UTIL - 12) / 2 }} />}
    </View>
  )
  return (
    <>
      <View style={s.grupo} wrap={false}>
        {antes}
        {filas.slice(0, 1).map(fila)}
      </View>
      {filas.slice(1).map((f, i) => fila(f, i + 1))}
    </>
  )
}

/**
 * Valor "redondo" y par para el tope del eje (2, 4, 10, 20, 40, 100…), al
 * menos `minimo`: así la mitad también es un entero.
 */
function tope(maximo: number, minimo = 2): number {
  const v = Math.max(maximo, minimo)
  const potencia = 10 ** Math.floor(Math.log10(v))
  for (const m of [1, 2, 4, 5, 10]) {
    const t = m * potencia
    if (t >= v && t % 2 === 0) return t
  }
  return 10 * potencia
}

/** Línea de un valor cualquiera (segundos de denominación rápida), sin bandas. */
function LineaValor({ puntos, ancho, alto = 80, sufijo }: { puntos: { etiqueta: string; valor: number }[]; ancho: number; alto?: number; sufijo: string }) {
  const a: Area = { ancho, alto, izq: 24, der: 12, arriba: 5, abajo: 12 }
  const max = tope(Math.max(...puntos.map((p) => p.valor)) * 1.1, 10)
  const y = (v: number) => a.arriba + (1 - v / max) * altoPlot(a)
  const x = xs(puntos.length, a)
  return (
    <Svg width={ancho} height={alto}>
      <Guias valores={[0, max / 2, max]} y={y} a={a} sufijo={sufijo} />
      {puntos.length > 1 && (
        <Polyline points={puntos.map((p, i) => `${x[i]},${y(p.valor)}`).join(" ")} stroke={COLOR.texto} strokeWidth={1} fill="none" />
      )}
      {puntos.map((p, i) => (
        <Circle key={i} cx={x[i]} cy={y(p.valor)} r={2.3} fill={COLOR.celesteFuerte} stroke="#ffffff" strokeWidth={0.75} />
      ))}
      <EjeX etiquetas={puntos.map((p) => p.etiqueta)} x={x} a={a} />
    </Svg>
  )
}

/** Denominación rápida: tiempo (segundos) y aciertos (%), uno al lado del otro, sin bandas. */
export function GraficosDenominacion({ puntos }: { puntos: PuntoDenominacionModelo[] }) {
  const ancho = (ANCHO_UTIL - 12) / 2
  return (
    <View style={s.grilla}>
      <View style={{ width: ancho }}>
        <Text style={[s.chico, s.negrita, { marginBottom: 2 }]}>Tiempo (segundos)</Text>
        <LineaValor puntos={puntos.map((p) => ({ etiqueta: p.etiqueta, valor: p.segundos }))} ancho={ancho} sufijo=" s" />
      </View>
      <View style={{ width: ancho }}>
        <Text style={[s.chico, s.negrita, { marginBottom: 2 }]}>Aciertos (%)</Text>
        <LineaPorcentaje puntos={puntos.map((p) => ({ etiqueta: p.etiqueta, valor: p.aciertosPorcentaje }))} ancho={ancho} alto={80} />
      </View>
    </View>
  )
}

const ORIGENES_BARRAS = [
  { clave: "consulta", texto: "Consulta" },
  { clave: "tarea", texto: "Tarea" },
  { clave: "practica", texto: "Práctica en casa" },
] as const

/** Partidas por semana, apiladas por origen (consulta abajo, después tarea y práctica). */
export function BarrasSemanas({
  semanas,
  maximo,
  antes,
  despues,
}: {
  semanas: SemanaModelo[]
  maximo: number
  antes?: ReactNode
  despues?: ReactNode
}) {
  const a: Area = { ancho: ANCHO_UTIL, alto: 120, izq: 22, der: 4, arriba: 6, abajo: 13 }
  const max = tope(maximo, 4)
  const y = (v: number) => a.arriba + (1 - v / max) * altoPlot(a)
  const paso = anchoPlot(a) / Math.max(1, semanas.length)
  const anchoBarra = Math.min(22, paso * 0.7)
  const centro = (i: number) => a.izq + paso * i + paso / 2
  return (
    <View style={s.grupo} wrap={false}>
      {antes}
      <Svg width={a.ancho} height={a.alto}>
        <Guias valores={[0, max / 2, max]} y={y} a={a} sufijo="" />
        {semanas.map((sem, i) => {
          let base = 0
          return ORIGENES_BARRAS.map(({ clave }) => {
            const n = sem[clave]
            if (n === 0) return null
            const desde = base
            base += n
            return (
              <Rect
                key={`${i}-${clave}`}
                x={centro(i) - anchoBarra / 2}
                y={y(desde + n)}
                width={anchoBarra}
                height={y(desde) - y(desde + n)}
                fill={COLOR_ORIGEN[clave].relleno}
                stroke={COLOR_ORIGEN[clave].borde}
                strokeWidth={0.5}
              />
            )
          })
        })}
        {semanas.map((sem, i) =>
          i % pasoEtiquetas(semanas.length, 13) === 0 || i === semanas.length - 1 ? (
            <Text key={`e${i}`} x={centro(i)} y={a.alto - 3} style={TEXTO_EJE} fill={COLOR.atenuado} textAnchor="middle">
              {sem.etiqueta}
            </Text>
          ) : null,
        )}
      </Svg>
      <View style={s.leyenda}>
        {ORIGENES_BARRAS.map(({ clave, texto }) => (
          <View key={clave} style={s.itemLeyenda}>
            <View style={[s.cuadroLeyenda, { backgroundColor: COLOR_ORIGEN[clave].relleno, borderColor: COLOR_ORIGEN[clave].borde }]} />
            <Text>{texto}</Text>
          </View>
        ))}
        <Text style={s.chico}>Cada barra es una semana (de lunes a domingo); la fecha es la del lunes.</Text>
      </View>
      {despues}
    </View>
  )
}
