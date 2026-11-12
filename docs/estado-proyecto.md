# Lecxico — Estado del proyecto

Última actualización: 12/11/2026 (S6). Reemplaza al documento "Estado del proyecto tras la etapa de gestión de usuarios (slices 1 a 5)" del 9/10/2026.

**Cómo se usa:** es la fuente de contexto para cualquier chat o Claude Code que trabaje en el repo. Cada PR actualiza las secciones que toca (estado de slices, modelo de datos, decisiones, pendientes). Si este documento y el código no coinciden, manda el código; las migraciones de `supabase/migrations/` describen la base exactamente.

Documentos relacionados: `CLAUDE.md` (reglas para Claude Code), `docs/revisiones-especialistas.md` (registro de revisiones), `docs/prompts/` (prompt de cada slice). El plan completo con fechas está en el documento "Lecxico — Plan de desarrollo hasta el 4 de diciembre" y en el tablero de Trello del equipo.

## Resumen

La gestión de usuarios está implementada y probada de punta a punta: registro por rol, autenticación, vinculación profesional–niño por invitación, evaluación tomada por el profesional al niño, historial y recomendación. La evaluación tiene los estilos del resto de la app. Falta adaptar todo a la definición vigente de la propuesta V8 (contraseña del tutor, historial compartido, denominación rápida en primeros lectores, franjas, perfil del niño sin resultados) y construir el entrenamiento, las tareas y el seguimiento.

## Plan de slices

Meta: desarrollo cerrado el viernes 4/12/2026; verificación y documentación del 7 al 11/12; defensa la semana del 14/12.

| Slice | Qué entrega | Dueño | Fechas | Migración | Estado |
| --- | --- | --- | --- | --- | --- |
| 1 a 5 | Esquema y RLS, registro y auth, vinculación, selección del niño, detalle e historial | Camila | ago–oct | 0001 a 0004 | Hecho |
| Estilos de la evaluación | `/test/inicial` y `/test/primaria` con los estilos del perfil del niño, tests sin cambios (PR #7) | Donato | 11/11 | — | Hecho |
| S6 Base de trabajo | `CLAUDE.md`, `docs/`, Vitest con cobertura, limpieza | Donato | 12–15/11 | — | En curso |
| S7 Contenido del home | Landing, footer y metadata con información real | Donato | 12–15/11 | — | En curso |
| S8 Contraseña y acciones del tutor | Contraseña verificada en el servidor; elección de compartir historial; reglas de acceso a lo compartido; eliminación de la cuenta del niño; compromiso del profesional | Camila | 12–22/11 | 0005 | Pendiente |
| S9 Denominación rápida | Cronómetro y carga de errores; se suma a primeros lectores (9 bloques); guarda tiempo y errores | Donato | 16–22/11 | 0006 | Pendiente |
| S10 Perfil del niño sin resultados | El perfil deja de mostrar evaluaciones; el niño pierde acceso a sus evaluaciones en la base | Donato | 16–22/11 | 0006 | Pendiente |
| S11 Franjas y recomendación | Cortes en el código, franjas con pruebas, recomendación por franja | Camila | 23–26/11 | — | Pendiente |
| S12 Datos del entrenamiento | Juegos, partidas y tareas; desbloqueo del 80 % en el servidor | Camila | 23–29/11 | 0007 | Pendiente |
| S13 Área de entrenamiento | Marco de juego, pantalla del niño, primeros juegos | Donato | 23–29/11 | — | Pendiente |
| S14 Juegos restantes | 14 combinaciones bloque-nivel | Donato | 26/11–4/12 | — | Pendiente |
| S15 Tareas del profesional | Armar y asignar tareas; la recomendación enlaza a juegos | Camila | 30/11–2/12 | usa 0007 | Pendiente |
| S16 Gráficos de seguimiento | Evolución por bloque y progreso del entrenamiento | Donato | 30/11–4/12 | — | Pendiente |
| S17 Informes | PDF del profesional; informe a pedido del tutor por correo | Camila | 1–4/12 | 0008 | Pendiente |
| S18 Verificación | Matriz PA, cobertura, auditoría WCAG, comparación con la práctica actual | Los dos | 7–11/12 | — | Pendiente |

**Criterio de corte (V8):** si hay atraso se asegura, en este orden: (1) evaluación y control de acceso; (2) recomendación; (3) entrenamiento mínimo, un juego por bloque y nivel; (4) seguimiento. Lo que no se complete pasa a trabajo futuro.

**Migraciones:** los números están reservados en la tabla. Se aplican en orden de número; si una con número mayor está lista antes, espera o se renumera antes del merge. Las aplica el dueño del slice, con el PR aprobado.

## Stack y configuración

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind 4 + shadcn/ui + Motion + Supabase (Postgres + Auth) con `@supabase/ssr`. Vitest para pruebas. Despliegue de prueba en Vercel desde `main`: https://lecxico-three.vercel.app. Repositorio: https://github.com/costadonato/lecxico.

**Pruebas:** `npm test` corre las pruebas de Vitest (`lib/**/*.test.ts`) y `npm run coverage` suma la cobertura V8 de los módulos de lógica listados en `vitest.config.ts`, con umbrales de 80 % de líneas y 90 % de ramas (reporte HTML en `coverage/`).

**Cuidados conocidos:**

- `next.config.mjs` tiene `ignoreBuildErrors: true`: hay que correr `npx tsc --noEmit`. Quedan 4 errores previos en archivos de ejercicios (`exercise/[id]`, `daily-challenge-card`, `game-generators`).
- No trabajar con el repo dentro de OneDrive: bloquea `.next` (errores tipo `EINVAL: readlink`). Clonar en una carpeta local.
- `.env.local` no está en git. Cada uno tiene el suyo con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (y más adelante `SUPABASE_SERVICE_ROLE_KEY`).
- `supabase/seed_dev.sql` se usó solo en el slice 1. **No volver a correrlo:** borra y recrea perfiles con sus vínculos y evaluaciones. Para vincular usuarios de prueba se usa la app.

**Configuración fuera del código:**

- Supabase → Authentication → URL Configuration: Site URL `https://lecxico-three.vercel.app`; Redirect URLs `http://localhost:3000/**` y `https://lecxico-three.vercel.app/**`.
- Supabase → Providers: Email con contraseña mínima de 8. "Confirm email" puede desactivarse para pruebas, pero tiene que estar activado antes de mostrar la app. Google activado con un cliente OAuth en modo prueba.
- El servidor de mails de Supabase solo envía mails de autenticación a miembros de la organización y pocas veces por hora. Para el informe del tutor (S17) hace falta otro servicio de envío; está pendiente decidir cuál.

**Para probar la seguridad desde el SQL Editor** se simula un usuario así:

```sql
begin;
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub', '<UID>', 'role', 'authenticated')::text, true);
-- consultas a probar
rollback;
```

## Definición vigente (propuesta V8)

La definición funcional es la de la propuesta V8 (reuniones del 14/10 y 28/10/2026). Las marcadas **(V8)** todavía no están implementadas.

**Usuarios y cuentas**

- Dos roles: **profesional** y **niño**. La entidad se llama "niño" en todo el sistema; no hay adolescentes ni adultos.
- El profesional se registra solo (email y contraseña, o Google). **(V8)** Al registrarse acepta un compromiso de uso responsable de los datos (casilla).
- La cuenta del niño la crea y la administra **el tutor**, con el email del tutor. Un email = una cuenta. El tutor no es un usuario aparte: su email y teléfono son datos del niño.
- El niño no inicia sesión solo: la sesión la abre el tutor y el niño usa la plataforma siempre acompañado.
- Hoy se inicia sesión con email en los dos roles. El nombre de usuario es único y sirve para que el profesional encuentre al niño.
- Consentimiento = aceptación de Términos y Condiciones al registrarse, obligatoria; la fecha la fija la base y no se puede revertir.
- Nombre y apellido se guardan con formato "Juan Pérez", aplicado por la base.
- **(V8)** Las acciones del tutor exigen volver a ingresar la contraseña, que el servidor verifica antes de ejecutarlas: aceptar o rechazar invitaciones, elegir si comparte el historial, dar de baja vínculos, modificar la etapa escolar, pedir el informe y eliminar la cuenta del niño.
- **(V8)** El tutor puede eliminar la cuenta del niño con todos sus datos.

**Vinculación**

- Relación muchos a muchos con estado: pendiente → activa → inactiva (baja lógica).
- Solo el profesional invita, buscando al niño por su nombre de usuario exacto. No se puede listar usuarios.
- El tutor acepta o rechaza desde la campanita; rechazar borra la invitación. El profesional puede cancelar una invitación pendiente.
- Antes de que el tutor acepte, el profesional no ve ningún dato del niño.
- La baja la puede hacer cualquiera de los dos; volver a vincular = invitación nueva. Al darse de baja, el profesional pierde el acceso a todo, incluidas las evaluaciones que tomó él.
- **(V8)** La invitación muestra quién invita y qué verá. Al aceptarla, el tutor elige si ese profesional accede a lo registrado por los demás profesionales; la elección vale para todo el vínculo. **Hoy** un profesional con vínculo activo ve todo el historial.
- El aviso por correo de las invitaciones queda diferido; por ahora es solo la campanita.

**Evaluación de indicadores**

- Solo la toma un profesional, a un niño con vínculo activo, desde su propia cuenta y en presencia del niño.
- El nivel se deriva de la etapa escolar: sala de 4 y 5 → inicial (pre-lectores); 1.º, 2.º y 3.º grado → primario (primeros lectores).
- Si se interrumpe, se descarta. Salir a mitad de camino pide confirmación.
- Los resultados se guardan por bloque, con correctas y total. **(V8)** En denominación rápida se guardan además el tiempo total y la cantidad de errores, que ingresa el profesional.
- **(V8)** Primeros lectores pasa a 9 bloques al sumar denominación rápida rediseñada.
- En la interfaz se llama "Evaluación de indicadores de dislexia"; internamente sigue siendo `test`.
- No se muestra si se detectaron indicadores: solo el desglose por bloque y una línea neutra ("Esta evaluación es orientativa y no reemplaza un diagnóstico profesional").
- **Hoy** la recomendación ordena los bloques del último test de menor a mayor acierto. **(V8)** Pasa a franjas: dos valores de corte por bloque y nivel, fijados por revisión bibliográfica, ubican cada bloque en "correcto", "intermedio" o "a observar"; la recomendación señala los bloques en "intermedio" y "a observar", en el orden del test, con los juegos vinculados. Un bloque sin referencia bibliográfica queda "sin franja de referencia" y fuera de la recomendación. Solo lo ve el profesional.

**Qué ve cada uno**

- **Hoy** el perfil del niño muestra el historial de sus evaluaciones. **(V8)** El perfil del niño (que comparten niño y tutor) no muestra resultados de evaluaciones ni el progreso del entrenamiento: solo las actividades y el grado alcanzado en cada juego. El tutor accede a esa información con un informe a pedido que recibe por correo como enlace con acceso autenticado, que vence a los 7 días.

**Entrenamiento (V8, a diseñar con las especialistas hasta el 20/11)**

- Al menos un juego por bloque y nivel (14 combinaciones), con 3 grados; el siguiente grado se desbloquea con una partida de al menos 80 % de aciertos en el anterior.
- El niño juega siempre acompañado: práctica en casa con el tutor, y tareas que asigna el profesional (cualquier juego y grado). Las partidas de práctica y de tareas se registran igual y se distinguen en el seguimiento.
- Lex y Lumo responden a cada intento dentro del juego.

## Modelo de datos actual

Seis tablas, todas con RLS. Usuarios sin sesión (anon) no acceden a ninguna.

```
profiles ( id uuid PK = auth.users.id, rol ('profesional'|'nino'), nombre, apellido,
  nombre_usuario UNIQUE (minúsculas, ^[a-z0-9._]{3,30}$), acepta_tyc, fecha_aceptacion_tyc, created_at )

ninos ( profile_id PK, fecha_nacimiento, etapa_escolar ('sala_4'|'sala_5'|'primero'|'segundo'|'tercero'),
  tutor_email (sincronizado por trigger), tutor_telefono, ultima_conexion, ultimo_entrenamiento, ultima_prueba )

profesional_nino ( id PK, profesional_id, nino_id, estado ('pendiente'|'activa'|'inactiva'),
  fecha_invitacion, fecha_afiliacion (= fecha de vinculación), fecha_baja, UNIQUE (profesional_id, nino_id) )

test ( id PK, nino_id, profesional_id (null si el profesional borró su cuenta), nivel ('inicial'|'primario'),
  fecha, puntaje_total, porcentaje_total, conclusion, created_at )

test_bloque_resultado ( id PK, test_id, bloque_codigo, orden, correctas, total > 0, UNIQUE (test_id, bloque_codigo) )

entrenamientos ( id PK, user_id = niño (borrado en cascada), juego, puntaje, created_at )
  -- existe con RLS pero ningún juego escribe; S12 la reemplaza
```

**Bloques de la evaluación** (`lib/test/bloques.ts`, en orden):

| Nivel | Bloques |
| --- | --- |
| Inicial (5) | discriminacion_auditiva · conciencia_fonologica · conciencia_silabica · memoria_fonologica ("Memoria Auditiva") · denominacion_rapida |
| Primario (8; 9 con S9) | discriminacion_auditiva · conciencia_fonologica · conciencia_silabica · memoria_fonologica · comprension_lectora · correspondencia_sonido_letra · reconocimiento_visual · lectura_pseudopalabras |

**Quién puede ver qué (RLS actual):**

| Tabla | Lectura | Escritura |
| --- | --- | --- |
| profiles | La propia; un profesional, la del niño con vínculo activo; un niño, la de profesionales que lo invitaron o están vinculados | La propia, solo nombre, apellido, nombre_usuario y acepta_tyc |
| ninos | El propio niño; un profesional con vínculo activo | El propio niño, solo fecha_nacimiento, etapa_escolar, tutor_telefono y ultima_conexion |
| profesional_nino | Las dos partes | Solo mediante funciones |
| test, test_bloque_resultado | El niño (se quita en S10); los profesionales con vínculo activo | Solo `guardar_test` |
| entrenamientos | El niño; profesionales con vínculo activo | El propio niño (insert) |

**Funciones:** `nivel_para_etapa`, `es_profesional_vinculado`, `es_profesional_del_nino_actual`, `guardar_test`, `nombre_usuario_disponible`, `invitar_nino`, `responder_invitacion`, `cancelar_invitacion`, `desvincular`, `vinculos_del_profesional`, `ninos_para_test`, `formatear_nombre`.

**Triggers:** `handle_new_user`, `sincronizar_tutor_email`, `proteger_campos_profile`, `formatear_nombres_profile`.

## Migraciones

| Migración | Qué hace | Estado |
| --- | --- | --- |
| 0001_slice1_esquema_rls.sql | Tablas, RLS, `guardar_test`, funciones de vínculo, trigger de alta | Aplicada |
| 0002_slice2_auth.sql | Usuario disponible, email del tutor sincronizado, TyC obligatorio, edición limitada por columnas | Aplicada |
| 0003_slice3_vinculacion.sql | Funciones de invitación y vinculación; borra tablas viejas | Aplicada |
| 0004_slice4_seleccion_nombres.sql | `ninos_para_test`, `formatear_nombre` | Aplicada |
| 0005 (S8) · 0006 (S9 y S10) · 0007 (S12) · 0008 (S17) | Reservadas | — |

## Pantallas y rutas

| Ruta | Quién | Qué muestra |
| --- | --- | --- |
| `/`, `/dislexia` | Público | Landing e información sobre dislexia |
| `/login`, `/register` | Público | Inicio de sesión y registro por rol |
| `/recuperar`, `/restablecer`, `/auth/callback` | Público | Recuperación de contraseña y confirmación de mail |
| `/terminos`, `/privacidad` | Público | "Contenido en preparación" |
| `/completar-perfil` | Con sesión | Profesional que entró con Google sin nombre de usuario |
| `/dashboard` | Los dos | Profesional: Evaluación, Mis niños. Niño: Entrenamiento, Mis profesionales, Mi perfil |
| `/test` | Profesional | Tabla para elegir el niño a evaluar |
| `/test/inicial?nino=<id>`, `/test/primaria?nino=<id>` | Profesional | La evaluación de cada nivel |
| `/ninos`, `/ninos/[id]`, `/ninos/[id]/tests/[testId]` | Profesional | Gestión de niños, detalle con recomendación e historiales, desglose |
| `/mis-profesionales` | Niño | Profesionales vinculados |
| `/perfil`, `/perfil/evaluaciones/[testId]` | Niño | Datos personales e historial de evaluaciones (se retira en S10) |
| `/entrenamiento`, `/games/...`, `/exercise/[id]`, `/progress` | Niño | Juegos heredados del prototipo, sin conectar al modelo (se rehacen en S13) |

## Interfaz

- Componentes de la evaluación en `components/test/`: `marco-evaluacion`, `barra-progreso-evaluacion`, `tarjeta-pregunta`, `boton-opcion`, `boton-audio`, `final-evaluacion`, `resultados-evaluacion` (resultados reutilizables, tema oscuro y claro) e `historial-evaluaciones`.
- Durante la evaluación: fondo liso (`fondo-nino`) sin formas flotantes; encabezado tipo píldora como `AppHeader`.
- Pendiente para más adelante: darle más color a la interfaz (hoy predomina el crema).

## Pendientes chicos

- [ ] Iniciar sesión con email o nombre de usuario. El prompt está armado; requiere `SUPABASE_SERVICE_ROLE_KEY` y una función que solo pueda usar `service_role`. Los errores no deben revelar si un usuario existe.
- [ ] `/dislexia`: el botón "Hacer la evaluación ahora" apunta a `/test-dislexia`, que no existe; el texto todavía habla de adolescentes.
- [ ] Contenido real de `/terminos` y `/privacidad` (borrador v0.1, sin validez legal para producción).
- [ ] Algunos mensajes de error de las funciones SQL todavía dicen "test" (la interfaz bloquea esos casos antes).
- [ ] Los 4 errores de TypeScript y, después, desactivar `ignoreBuildErrors`.
- [ ] Mail de aviso de invitación al tutor (TODO en `invitar_nino`).
