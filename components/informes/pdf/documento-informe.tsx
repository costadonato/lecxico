import { Fragment } from "react"
import { Document, Page, Text, View } from "@react-pdf/renderer"
import { COLOR, COLOR_FRANJA, s } from "@/components/informes/pdf/estilos"
import { BarrasSemanas, GraficosDenominacion, GrillaBloques } from "@/components/informes/pdf/graficos"
import {
  ChipPdf,
  Leyendas,
  LogoPdf,
  Subtitulo,
  TablaBloques,
  TablaPdf,
  TituloSeccion,
  Vacio,
} from "@/components/informes/pdf/piezas"
import type {
  DenominacionModelo,
  EntrenamientoModelo,
  EvaluacionModelo,
  EvolucionModelo,
  ModeloInforme,
  TablaSeccionModelo,
} from "@/lib/informes/modelo"

/*
 * El informe en PDF (S17a): A4, márgenes de 2 cm. Dibuja el modelo de
 * lib/informes/modelo.ts tal cual, sin calcular nada. Las fuentes se
 * registran antes con registrarFuentes (estilos.ts).
 *
 * Cada sección devuelve un fragmento, no una View: los bloques indivisibles
 * (wrap={false}) quedan como hijos directos de la página. Anidados dentro de
 * Views que se parten, el paginador de react-pdf 4.9 los aplasta al pie de
 * la página en vez de pasarlos a la siguiente. Cada título va en el mismo
 * bloque que el comienzo de su contenido: nunca queda solo al pie.
 */

/** Espacio antes de cada sección; va dentro del primer bloque, así viaja con el título. */
const Espacio = () => <View style={s.espacioSeccion} />

function Encabezado({ modelo }: { modelo: ModeloInforme }) {
  return (
    <View style={[s.grupo, s.encabezado]} wrap={false}>
      <View style={s.filaEncabezadoDoc}>
        <LogoPdf />
        <View style={s.metaEncabezado}>
          {modelo.emisor && (
            <Text>
              Emitido por <Text style={s.metaFuerte}>{modelo.emisor}</Text>
            </Text>
          )}
          <Text>
            Fecha de emisión <Text style={s.metaFuerte}>{modelo.fechaEmision}</Text>
          </Text>
          {modelo.periodo && (
            <Text>
              Período <Text style={s.metaFuerte}>{modelo.periodo}</Text>
            </Text>
          )}
        </View>
      </View>
      <Text style={s.tituloDocumento}>{modelo.titulo}</Text>
    </View>
  )
}

function DatosNino({ modelo }: { modelo: ModeloInforme }) {
  return (
    <View style={s.grupo} wrap={false}>
      <TituloSeccion>Datos del niño</TituloSeccion>
      <View style={s.datos}>
        {modelo.nino.map((d) => (
          <View key={d.etiqueta} style={s.dato}>
            <Text style={s.etiquetaDato}>{d.etiqueta}</Text>
            <Text style={s.valorDato}>{d.valor}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

/** Título y aviso de "sin registros", juntos. */
function SeccionVacia({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <View style={s.grupo} wrap={false}>
      <Espacio />
      <TituloSeccion>{titulo}</TituloSeccion>
      <Vacio>{texto}</Vacio>
    </View>
  )
}

function SeccionEvaluacion({ ev, profesional }: { ev: EvaluacionModelo; profesional: boolean }) {
  if (ev.vacio) return <SeccionVacia titulo={ev.titulo} texto={ev.vacio} />
  const rec = ev.recomendacion
  return (
    <>
      <TablaBloques
        filas={ev.filas}
        conFranja={profesional}
        antes={
          <>
            <Espacio />
            <TituloSeccion>{ev.titulo}</TituloSeccion>
            <Text style={[s.parrafo, s.negrita]}>{ev.subtitulo}</Text>
            {ev.registradoPor && <Text style={[s.parrafo, s.atenuado]}>Registrada por {ev.registradoPor}.</Text>}
          </>
        }
      />
      {ev.leyendas && <Leyendas textos={ev.leyendas} />}
      {rec?.vacio && (
        <View style={[s.grupo, { marginTop: 8 }]} wrap={false}>
          <Subtitulo>Recomendación</Subtitulo>
          <Text style={s.parrafo}>{rec.vacio}</Text>
        </View>
      )}
      {rec?.bloques.map((b, i) => (
        <View key={b.bloque} style={[s.grupo, i === 0 ? { marginTop: 8 } : {}]} wrap={false}>
          {i === 0 && <Subtitulo>Recomendación</Subtitulo>}
          <View style={[s.itemRecomendacion, { borderLeftColor: COLOR_FRANJA[b.franja.clave].borde }]}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 1 }}>
              <Text style={[s.negrita, { marginRight: 6 }]}>{b.bloque}</Text>
              <ChipPdf chip={b.franja} />
            </View>
            {b.juegos.length > 0 && (
              <Text style={s.atenuado}>
                Juegos para practicar: <Text style={{ color: COLOR.texto }}>{b.juegos.join(", ")}</Text>
              </Text>
            )}
          </View>
        </View>
      ))}
      {rec && <Text style={s.chico}>{rec.nota}</Text>}
    </>
  )
}

function SeccionEvolucion({ evo }: { evo: EvolucionModelo }) {
  if (evo.vacio) return <SeccionVacia titulo={evo.titulo} texto={evo.vacio} />
  const variosNiveles = evo.niveles.length > 1
  return (
    <>
      {evo.niveles.map((n, i) => (
        <GrillaBloques
          key={n.nivel}
          graficos={n.graficos}
          antes={
            <>
              {i === 0 && <Espacio />}
              {i === 0 && <TituloSeccion>{evo.titulo}</TituloSeccion>}
              {i === 0 && evo.leyendas && <Leyendas textos={evo.leyendas} />}
              {variosNiveles && <Subtitulo>{n.nivel}</Subtitulo>}
              <View style={{ height: 4 }} />
            </>
          }
        />
      ))}
      {evo.evaluaciones && <TablaPdf tabla={evo.evaluaciones} antes={<Subtitulo>Evaluaciones del período</Subtitulo>} />}
    </>
  )
}

function SeccionDenominacion({ den }: { den: DenominacionModelo }) {
  if (den.vacio) return <SeccionVacia titulo={den.titulo} texto={den.vacio} />
  return (
    <>
      {den.niveles.map((n, i) => (
        <Fragment key={n.nivel}>
          <View style={s.grupo} wrap={false}>
            {i === 0 && (
              <>
                <Espacio />
                <TituloSeccion>{den.titulo}</TituloSeccion>
                <Text style={[s.parrafo, s.atenuado]}>{den.nota}</Text>
              </>
            )}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 4 }}>
              <Text style={[s.negrita, { fontSize: 10, marginRight: 6 }]}>{n.nivel}</Text>
              {n.ultimaFranja && <ChipPdf chip={n.ultimaFranja} />}
            </View>
            {n.vacio ? (
              <Vacio>{n.vacio}</Vacio>
            ) : (
              <>
                <GraficosDenominacion puntos={n.puntos} />
                <Text style={[s.chico, { marginTop: 3, marginBottom: 5 }]}>{n.resumen}</Text>
              </>
            )}
          </View>
          {!n.vacio && <TablaPdf tabla={n.tabla} />}
        </Fragment>
      ))}
    </>
  )
}

function SeccionEntrenamiento({ ent }: { ent: EntrenamientoModelo }) {
  if (ent.vacio) return <SeccionVacia titulo={ent.titulo} texto={ent.vacio} />
  return (
    <>
      <BarrasSemanas
        semanas={ent.semanas}
        maximo={ent.maximo}
        antes={
          <>
            <Espacio />
            <TituloSeccion>{ent.titulo}</TituloSeccion>
            <Subtitulo>Partidas por semana</Subtitulo>
          </>
        }
        despues={<Text style={[s.chico, { marginTop: 3 }]}>{ent.resumenSemanas}</Text>}
      />
      {ent.porJuego && <TablaPdf tabla={ent.porJuego} antes={<Subtitulo>Por juego</Subtitulo>} />}
    </>
  )
}

function SeccionTabla({ seccion }: { seccion: TablaSeccionModelo }) {
  if (seccion.vacio || !seccion.tabla) return <SeccionVacia titulo={seccion.titulo} texto={seccion.vacio ?? ""} />
  return (
    <TablaPdf
      tabla={seccion.tabla}
      antes={
        <>
          <Espacio />
          <TituloSeccion>{seccion.titulo}</TituloSeccion>
          {seccion.resumen && <Text style={s.parrafo}>{seccion.resumen}</Text>}
        </>
      }
    />
  )
}

export function DocumentoInforme({ modelo }: { modelo: ModeloInforme }) {
  const seg = modelo.seguimiento
  const profesional = modelo.variante === "profesional"
  return (
    <Document title={modelo.titulo} author={modelo.emisor ?? "Lecxico"} creator="Lecxico" producer="Lecxico" language="es-AR">
      <Page size="A4" style={s.pagina}>
        <Encabezado modelo={modelo} />
        <DatosNino modelo={modelo} />

        {modelo.evaluacion && <SeccionEvaluacion ev={modelo.evaluacion} profesional={profesional} />}

        {seg?.evolucion && <SeccionEvolucion evo={seg.evolucion} />}
        {seg?.denominacion && <SeccionDenominacion den={seg.denominacion} />}
        {seg?.entrenamiento && <SeccionEntrenamiento ent={seg.entrenamiento} />}
        {seg?.tareas && <SeccionTabla seccion={seg.tareas} />}
        {seg?.practica && <SeccionTabla seccion={seg.practica} />}

        {modelo.observaciones && (
          <View style={s.grupo} wrap={false}>
            <Espacio />
            <TituloSeccion>Observaciones del profesional</TituloSeccion>
            <View style={s.observaciones}>
              <Text>{modelo.observaciones}</Text>
            </View>
          </View>
        )}

        <View style={[s.grupo, s.aclaracion]} wrap={false}>
          <Text style={[s.negrita, { marginBottom: 3 }]}>{modelo.aclaracion}</Text>
          <Text style={s.atenuado}>{modelo.confidencialidad}</Text>
        </View>

        <View style={s.pie} fixed>
          <Text>{modelo.pie}</Text>
        </View>
        <Text
          style={s.numeroPagina}
          fixed
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
        />
      </Page>
    </Document>
  )
}
