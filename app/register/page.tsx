"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { AuthError } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, Loader2, MailCheck } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { BotonGoogle } from "@/components/auth/boton-google"
import { Campo, CasillaTyC } from "@/components/auth/campos"
import { CampoNombreUsuario } from "@/components/auth/campo-nombre-usuario"
import { useNombreUsuario, type EstadoNombreUsuario } from "@/lib/auth/use-nombre-usuario"
import { emailValido, errorPassword, fechaNacimientoValida, hoyISO, PASSWORD_MIN } from "@/lib/auth/validaciones"
import { ETAPAS_ESCOLARES, type EtapaEscolar } from "@/lib/test/bloques"

type TipoCuenta = "profesional" | "nino"
type Errores = Record<string, string | undefined>

/* ------------------------------------------------------------------ */
/*  signUp                                                             */
/* ------------------------------------------------------------------ */
type ResultadoRegistro =
  | { tipo: "sesion" }
  | { tipo: "confirmar"; email: string }
  | { tipo: "existe" }
  | { tipo: "error"; mensaje: string }

function mensajeErrorSignUp(error: AuthError): string {
  const msg = error.message.toLowerCase()
  if (error.code === "weak_password") return "La contraseña es demasiado débil. Probá con una más larga o combiná letras y números."
  if (error.code === "email_address_invalid") return "El email no es válido."
  if (error.code === "over_email_send_rate_limit" || error.status === 429)
    return "Se hicieron demasiados intentos. Esperá unos minutos y probá de nuevo."
  // Cualquier error del trigger de alta llega con este texto genérico.
  if (msg.includes("database error saving new user"))
    return "No se pudo crear la cuenta. Revisá los datos (por ejemplo, que el nombre de usuario siga disponible) y probá de nuevo."
  return "Ocurrió un error al crear la cuenta. Probá de nuevo en unos minutos."
}

/** `data` sigue el contrato de metadata de handle_new_user (supabase/migrations/0002). */
async function registrar(email: string, password: string, data: Record<string, unknown>): Promise<ResultadoRegistro> {
  const emailLimpio = email.trim()
  const { data: res, error } = await createClient().auth.signUp({
    email: emailLimpio,
    password,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data },
  })
  if (error) {
    console.error("signUp:", error)
    if (error.code === "user_already_exists" || error.code === "email_exists") return { tipo: "existe" }
    return { tipo: "error", mensaje: mensajeErrorSignUp(error) }
  }
  // Con la confirmación de email activa, Supabase no revela si el email ya
  // existía: devuelve un usuario sin identidades.
  if (res.user && res.user.identities?.length === 0) return { tipo: "existe" }
  if (res.session) return { tipo: "sesion" }
  return { tipo: "confirmar", email: emailLimpio }
}

/**
 * Error a mostrar bajo el nombre de usuario al enviar. "formato" y "ocupado"
 * no necesitan uno: CampoNombreUsuario ya muestra su mensaje.
 */
function errorNombreUsuario(estado: EstadoNombreUsuario): string | undefined {
  if (estado === "vacio") return "Elegí un nombre de usuario."
  if (estado === "error") return "No se pudo verificar el nombre de usuario. Probá de nuevo."
  return undefined
}

/* ------------------------------------------------------------------ */
/*  PÁGINA                                                             */
/* ------------------------------------------------------------------ */
export default function RegisterPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<1 | 2>(1)
  const [tipo, setTipo] = useState<TipoCuenta | null>(null)
  const [emailConfirmacion, setEmailConfirmacion] = useState<string | null>(null)

  const onRegistrado = (r: { tipo: "sesion" } | { tipo: "confirmar"; email: string }) => {
    if (r.tipo === "sesion") {
      router.push("/dashboard")
      router.refresh()
    } else {
      setEmailConfirmacion(r.email)
    }
  }

  return (
    <AuthShell
      accion={
        <Button variant="ghost" asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      }
    >
      <div className="w-full max-w-2xl">
        <div className="border-2 border-primary rounded-xl p-6 sm:p-8">
          {emailConfirmacion ? (
            <ConfirmacionEnviada email={emailConfirmacion} />
          ) : paso === 1 ? (
            <SeleccionTipo tipo={tipo} onTipo={setTipo} onSiguiente={() => setPaso(2)} />
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="mb-4 flex items-center gap-1 text-sm text-primary hover:underline font-medium"
              >
                <ArrowLeft className="w-4 h-4" /> Cambiar tipo de cuenta
              </button>
              {tipo === "profesional" ? (
                <FormProfesional onRegistrado={onRegistrado} />
              ) : (
                <FormNino onRegistrado={onRegistrado} />
              )}
            </>
          )}
        </div>
        {!emailConfirmacion && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Iniciá sesión
            </Link>
          </p>
        )}
      </div>
    </AuthShell>
  )
}

/* ------------------------------------------------------------------ */
/*  PASO 1 — TIPO DE CUENTA                                            */
/* ------------------------------------------------------------------ */
function SeleccionTipo({
  tipo,
  onTipo,
  onSiguiente,
}: {
  tipo: TipoCuenta | null
  onTipo: (t: TipoCuenta) => void
  onSiguiente: () => void
}) {
  const opciones: { valor: TipoCuenta; titulo: string; descripcion: string }[] = [
    {
      valor: "profesional",
      titulo: "Soy profesional",
      descripcion: "Quiero tomar el test y hacer seguimiento del entrenamiento de los niños que acompaño.",
    },
    {
      valor: "nino",
      titulo: "Crear la cuenta de un niño",
      descripcion: "La completa la madre, el padre o el tutor/a, con su propio email.",
    },
  ]

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-8">¿Qué cuenta querés crear?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            onClick={() => onTipo(o.valor)}
            className={`rounded-xl border-2 p-6 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              tipo === o.valor
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-white border-border text-foreground hover:border-primary/50"
            }`}
          >
            <p className="text-xl font-bold mb-3">{o.titulo}</p>
            <p className={`text-sm leading-relaxed ${tipo === o.valor ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
              {o.descripcion}
            </p>
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <Button size="lg" disabled={tipo === null} onClick={onSiguiente} className="px-8">
          SIGUIENTE →
        </Button>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  FORMULARIO — PROFESIONAL                                           */
/* ------------------------------------------------------------------ */
type OnRegistrado = (r: { tipo: "sesion" } | { tipo: "confirmar"; email: string }) => void

function FormProfesional({ onRegistrado }: { onRegistrado: OnRegistrado }) {
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [usuario, setUsuario] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmacion, setConfirmacion] = useState("")
  const [acepta, setAcepta] = useState(false)
  const [errores, setErrores] = useState<Errores>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const nombreUsuario = useNombreUsuario(usuario)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorGeneral(null)
    const nuevos: Errores = {
      nombre: nombre.trim() ? undefined : "Completá tu nombre.",
      apellido: apellido.trim() ? undefined : "Completá tu apellido.",
      email: !email.trim() ? "Completá tu email." : emailValido(email) ? undefined : "El email no es válido.",
      password: errorPassword(password, confirmacion) ?? undefined,
      acepta: acepta ? undefined : "Tenés que aceptar los Términos y Condiciones y la Política de Privacidad.",
    }
    setEnviando(true)
    const estadoUsuario = await nombreUsuario.verificarAhora()
    nuevos.usuario = errorNombreUsuario(estadoUsuario)
    setErrores(nuevos)
    if (Object.values(nuevos).some(Boolean) || estadoUsuario !== "disponible") {
      setEnviando(false)
      return
    }

    const r = await registrar(email, password, {
      rol: "profesional",
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      nombre_usuario: nombreUsuario.nombre,
      acepta_tyc: true,
    })
    setEnviando(false)
    if (r.tipo === "existe") setErrores({ email: "Ya existe una cuenta con ese email." })
    else if (r.tipo === "error") setErrorGeneral(r.mensaje)
    else onRegistrado(r)
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-6">Cuenta de profesional</h2>
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo id="nombre" label="Nombre/s" placeholder="Juan" value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} autoComplete="given-name" />
              <Campo id="apellido" label="Apellido/s" placeholder="Pérez" value={apellido} onChange={(e) => setApellido(e.target.value)} error={errores.apellido} autoComplete="family-name" />
            </div>
            <CampoNombreUsuario
              id="usuario"
              label="Nombre de usuario"
              value={usuario}
              onChange={setUsuario}
              estado={nombreUsuario.estado}
              error={errores.usuario}
            />
            <Campo id="email" label="Email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errores.email} autoComplete="email" />
            <CamposPassword
              password={password}
              confirmacion={confirmacion}
              onPassword={setPassword}
              onConfirmacion={setConfirmacion}
              error={errores.password}
            />
            <CasillaTyC id="acepta" checked={acepta} onChange={setAcepta} error={errores.acepta} />

            {errorGeneral && <ErrorGeneral mensaje={errorGeneral} />}

            <Button type="submit" size="lg" className="w-full" disabled={enviando}>
              {enviando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</> : "CREAR CUENTA"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
          </div>
          <BotonGoogle texto="Registrarme con Google" />
        </CardContent>
      </Card>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  FORMULARIO — NIÑO (lo completa el tutor)                           */
/* ------------------------------------------------------------------ */
function FormNino({ onRegistrado }: { onRegistrado: OnRegistrado }) {
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [usuario, setUsuario] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState("")
  const [etapa, setEtapa] = useState<EtapaEscolar | null>(null)
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [password, setPassword] = useState("")
  const [confirmacion, setConfirmacion] = useState("")
  const [acepta, setAcepta] = useState(false)
  const [errores, setErrores] = useState<Errores>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const nombreUsuario = useNombreUsuario(usuario)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorGeneral(null)
    const nuevos: Errores = {
      nombre: nombre.trim() ? undefined : "Completá el nombre del niño.",
      apellido: apellido.trim() ? undefined : "Completá el apellido del niño.",
      fechaNacimiento: !fechaNacimiento
        ? "Completá la fecha de nacimiento."
        : fechaNacimientoValida(fechaNacimiento) ? undefined : "La fecha de nacimiento no es válida.",
      etapa: etapa ? undefined : "Elegí la etapa escolar.",
      email: !email.trim() ? "Completá el email del tutor." : emailValido(email) ? undefined : "El email no es válido.",
      telefono: !telefono.trim() || /^[0-9+()\-\s]{6,20}$/.test(telefono.trim()) ? undefined : "El teléfono no es válido.",
      password: errorPassword(password, confirmacion) ?? undefined,
      acepta: acepta ? undefined : "Tenés que aceptar los Términos y Condiciones y la Política de Privacidad.",
    }
    setEnviando(true)
    const estadoUsuario = await nombreUsuario.verificarAhora()
    nuevos.usuario = errorNombreUsuario(estadoUsuario)
    setErrores(nuevos)
    if (Object.values(nuevos).some(Boolean) || estadoUsuario !== "disponible") {
      setEnviando(false)
      return
    }

    // tutor_email no se manda: la base lo toma del email de la cuenta.
    const r = await registrar(email, password, {
      rol: "nino",
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      nombre_usuario: nombreUsuario.nombre,
      acepta_tyc: true,
      fecha_nacimiento: fechaNacimiento,
      etapa_escolar: etapa,
      tutor_telefono: telefono.trim() || null,
    })
    setEnviando(false)
    if (r.tipo === "existe") setErrores({ email: "Ya existe una cuenta con ese email. Usá un email distinto para cada niño." })
    else if (r.tipo === "error") setErrorGeneral(r.mensaje)
    else onRegistrado(r)
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-center mb-2">Cuenta de un niño</h2>
      <p className="text-center text-sm text-muted-foreground mb-6">La completa la madre, el padre o el tutor/a.</p>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-5">
            <h3 className="font-semibold">Datos del niño</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo id="nombre" label="Nombre/s" value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} />
              <Campo id="apellido" label="Apellido/s" value={apellido} onChange={(e) => setApellido(e.target.value)} error={errores.apellido} />
            </div>
            <CampoNombreUsuario
              id="usuario"
              label="Nombre de usuario del niño"
              value={usuario}
              onChange={setUsuario}
              estado={nombreUsuario.estado}
              error={errores.usuario}
              ayuda="Es el nombre con el que su profesional lo va a encontrar."
            />
            <Campo
              id="fechaNacimiento"
              label="Fecha de nacimiento"
              type="date"
              max={hoyISO()}
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              error={errores.fechaNacimiento}
            />
            <div className="space-y-2">
              <span className="block uppercase font-bold text-xs tracking-wide">Etapa escolar</span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Etapa escolar">
                {ETAPAS_ESCOLARES.map((e) => (
                  <button
                    key={e.valor}
                    type="button"
                    role="radio"
                    aria-checked={etapa === e.valor}
                    onClick={() => setEtapa(e.valor)}
                    className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      etapa === e.valor
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-white border-border text-foreground hover:border-primary/50"
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              {errores.etapa && <p className="text-sm text-destructive">{errores.etapa}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-5">
            <h3 className="font-semibold">Datos del tutor</h3>
            <Campo
              id="email"
              label="Email del tutor"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errores.email}
              autoComplete="email"
              ayuda="Con este email vas a iniciar sesión en la cuenta del niño. Si tenés más de un niño a cargo, usá un email distinto para cada cuenta."
            />
            <Campo
              id="telefono"
              label="Teléfono (opcional)"
              type="tel"
              placeholder="11 2345-6789"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              error={errores.telefono}
              autoComplete="tel"
            />
            <CamposPassword
              password={password}
              confirmacion={confirmacion}
              onPassword={setPassword}
              onConfirmacion={setConfirmacion}
              error={errores.password}
            />
            <CasillaTyC
              id="acepta"
              checked={acepta}
              onChange={setAcepta}
              error={errores.acepta}
              prefijo="Como madre, padre o tutor/a, acepto"
              sufijo=" en nombre del niño"
            />
          </CardContent>
        </Card>

        {errorGeneral && <ErrorGeneral mensaje={errorGeneral} />}

        <Button type="submit" size="lg" className="w-full" disabled={enviando}>
          {enviando ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</> : "CREAR CUENTA DEL NIÑO"}
        </Button>
      </form>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  PIEZAS COMUNES                                                     */
/* ------------------------------------------------------------------ */
function CamposPassword({
  password,
  confirmacion,
  onPassword,
  onConfirmacion,
  error,
}: {
  password: string
  confirmacion: string
  onPassword: (v: string) => void
  onConfirmacion: (v: string) => void
  error?: string
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Campo id="password" label="Contraseña" type="password" placeholder={`Mínimo ${PASSWORD_MIN} caracteres`} value={password} onChange={(e) => onPassword(e.target.value)} autoComplete="new-password" />
        <Campo id="confirmacion" label="Confirmar contraseña" type="password" placeholder="Repetí la contraseña" value={confirmacion} onChange={(e) => onConfirmacion(e.target.value)} autoComplete="new-password" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

function ErrorGeneral({ mensaje }: { mensaje: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{mensaje}</AlertDescription>
    </Alert>
  )
}

function ConfirmacionEnviada({ email }: { email: string }) {
  return (
    <div className="text-center space-y-4 py-6">
      <MailCheck className="w-12 h-12 text-primary mx-auto" />
      <h2 className="text-2xl font-semibold">Te enviamos un email para confirmar la cuenta</h2>
      <p className="text-muted-foreground">
        Abrí el enlace que enviamos a <span className="font-semibold text-foreground">{email}</span> para activar la cuenta.
        Si no lo ves, revisá la carpeta de spam.
      </p>
      <Button asChild variant="outline">
        <Link href="/login">Ir a iniciar sesión</Link>
      </Button>
    </div>
  )
}
