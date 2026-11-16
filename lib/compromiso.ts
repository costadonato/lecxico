/**
 * Compromiso de uso responsable de los datos que acepta el profesional al
 * registrarse (o en /completar-perfil). Se guarda en
 * profiles.acepta_compromiso (supabase/migrations/0005). Lo muestran
 * CasillaCompromiso (components/auth/campos.tsx) y su diálogo.
 */

export const COMPROMISO_TEXTO_CORTO = "Acepto el compromiso de uso responsable de los datos de los niños."

export const COMPROMISO_TITULO = "Compromiso de uso responsable de los datos"

export const COMPROMISO_INTRO =
  "Lecxico guarda información de niños: sus datos, los de su tutor y los resultados de sus evaluaciones y entrenamientos. Al registrarte como profesional, te comprometés a:"

export const COMPROMISO_PUNTOS: readonly { titulo: string; texto: string }[] = [
  {
    titulo: "Trabajar con el niño.",
    texto: "Invitar solo a niños con los que trabajás, y cuyo tutor esté de acuerdo.",
  },
  {
    titulo: "Usar los datos solo para acompañar al niño.",
    texto: "No usarlos con fines comerciales, de publicidad ni para otro fin.",
  },
  {
    titulo: "Mantener la confidencialidad.",
    texto: "No compartir los datos ni los resultados con personas ajenas al trabajo con el niño, salvo que el tutor lo autorice.",
  },
  {
    titulo: "Tomar las evaluaciones como corresponde.",
    texto: "Siempre en presencia del niño y desde tu propia cuenta.",
  },
  {
    titulo: "Recordar que los resultados son orientativos.",
    texto: "Lecxico no emite diagnósticos. La interpretación de los resultados es tu responsabilidad profesional.",
  },
  {
    titulo: "Cuidar el acceso a tu cuenta.",
    texto: "No compartir tu contraseña ni dejar la sesión abierta en equipos de otras personas.",
  },
  {
    titulo: "Darte de baja cuando termines.",
    texto: "Si dejás de trabajar con un niño, desvinculate.",
  },
  {
    titulo: "Respetar la ley.",
    texto: "Cumplir con la Ley 25.326 de Protección de Datos Personales.",
  },
]

export const COMPROMISO_CIERRE =
  "Tu condición de profesional es declarativa: el prototipo no verifica título ni matrícula. Lecxico es un prototipo en entorno de prueba, desarrollado como Trabajo Final de Ingeniería en Informática (FTyCA-UNCa)."
