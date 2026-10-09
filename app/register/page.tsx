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
import { AlertCircle, ArrowLeft, Baby, Check, Loader2, Stethoscope, UserRound } from "lucide-react"
import { AuthShell } from "@/components/auth/auth-shell"
import { BotonGoogle } from "@/components/auth/boton-google"
import { Campo, CasillaTyC } from "@/components/auth/campos"
import { CampoNombreUsuario } from "@/components/auth/campo-nombre-usuario"
import { LumoCara } from "@/components/personajes/lumo-cara"
import { cn } from "@/lib/utils"
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
      personaje="lex"
      mensaje={emailConfirmacion ? "¡Ya casi! Revisá tu email." : "¡Hola! Soy Lex. ¡Qué bueno que quieras sumarte!"}
      accion={
        <Button variant="ghost" asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      }
    >
      <div className="w-full max-w-2xl">
        <div className="rounded-[2rem] border border-border/80 bg-card p-6 shadow-elevada sm:p-8">
          {emailConfirmacion ? (
            <ConfirmacionEnviada email={emailConfirmacion} />
          ) : paso === 1 ? (
            <SeleccionTipo tipo={tipo} onTipo={setTipo} onSiguiente={() => setPaso(2)} />
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="mb-4 flex items-center gap-1 rounded-full px-1 text-base text-primary hover:underline font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40"
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
          <p className="text-center text-base text-muted-foreground mt-6">
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
  const opciones: { valor: TipoCuenta; titulo: string; descripcion: string; icono: typeof Stethoscope; tono: string }[] = [
    {
      valor: "profesional",
      titulo: "Soy profesional",
      descripcion: "Quiero realizar la evaluación de indicadores de dislexia y hacer seguimiento del entrenamiento de los niños que acompaño.",
      icono: Stethoscope,
      tono: "bg-celeste-suave text-celeste-fuerte",
    },
    {
      valor: "nino",
      titulo: "Crear la cuenta de un niño",
      descripcion: "La completa la madre, el padre o el tutor/a, con su propio email.",
      icono: Baby,
      tono: "bg-sol-suave text-sol-fuerte",
    },
  ]

  return (
    <>
      <h2 className="text-2xl font-bold text-center mb-8">¿Qué cuenta querés crear?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {opciones.map((o) => {
          const elegido = tipo === o.valor
          const Icono = o.icono
          return (
            <button
              key={o.valor}
              type="button"
              aria-pressed={elegido}
              onClick={() => onTipo(o.valor)}
              className={cn(
                "group relative rounded-3xl border-2 p-6 text-left transition-[border-color,background-color,box-shadow,translate] duration-200 hover:-translate-y-1 motion-reduce:hover:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
                elegido
                  ? "border-primary bg-rojo-suave/60 shadow-brillo-rojo"
                  : "border-border bg-card shadow-suave hover:border-primary/40 hover:shadow-media",
              )}
            >
              {elegido && (
                <span className="absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-4" />
                </span>
              )}
              <span className={cn("mb-4 grid size-14 place-items-center rounded-2xl", o.tono)}>
                <Icono className="size-7" />
              </span>
              <p className="text-xl font-bold mb-2">{o.titulo}</p>
              <p className="text-base leading-relaxed text-muted-foreground">{o.descripcion}</p>
            </button>
          )
        })}
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
      <h2 className="text-2xl font-bold text-center mb-6">Cuenta de profesional</h2>
      <Card className="border-border/60 bg-background/50 shadow-none">
        <CardContent>
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

          <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
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
      <h2 className="text-2xl font-bold text-center mb-2">Cuenta de un niño</h2>
      <p className="text-center text-base text-muted-foreground mb-6">La completa la madre, el padre o el tutor/a.</p>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Card className="border-border/60 bg-background/50 shadow-none">
          <CardContent className="space-y-5">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <span className="grid size-9 place-items-center rounded-xl bg-sol-suave text-sol-fuerte"><Baby className="size-5" /></span>
              Datos del niño
            </h3>
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
              <span className="block text-base font-semibold">Etapa escolar</span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Etapa escolar">
                {ETAPAS_ESCOLARES.map((e) => (
                  <button
                    key={e.valor}
                    type="button"
                    role="radio"
                    aria-checked={etapa === e.valor}
                    onClick={() => setEtapa(e.valor)}
                    className={cn(
                      "rounded-full border-2 px-4 py-2 text-base font-semibold transition-[background-color,border-color,color,translate] active:translate-y-px focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40",
                      etapa === e.valor
                        ? "bg-primary border-primary text-primary-foreground shadow-boton"
                        : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-rojo-suave/40",
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
              {errores.etapa && <p className="text-sm text-destructive">{errores.etapa}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/50 shadow-none">
          <CardContent className="space-y-5">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <span className="grid size-9 place-items-center rounded-xl bg-lavanda-suave text-lavanda-fuerte"><UserRound className="size-5" /></span>
              Datos del tutor
            </h3>
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
      <div className="mx-auto grid size-24 place-items-center rounded-[1.75rem] bg-pantalla shadow-brillo-celeste">
        <LumoCara estado="feliz" tamano={80} />
      </div>
      <h2 className="text-2xl font-bold">Te enviamos un email para confirmar la cuenta</h2>
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
