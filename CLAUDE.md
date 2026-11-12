# Lecxico — instrucciones para Claude Code

Plataforma web para profesionales, basada en Lecxico, para evaluar indicadores de dislexia y hacer el seguimiento de un entrenamiento lector en niños de 4 a 8 años. Es el Trabajo Final de Ingeniería en Informática (FTyCA-UNCa) de Camila Blanco y Donato Costa. Es un prototipo en un entorno de prueba, con datos ficticios. Lecxico es un concepto de Bautista Stampone; lecxico.com es otra plataforma, que no tiene relación con este repo.

Antes de cualquier tarea, leé `docs/estado-proyecto.md`: tiene el estado actual, el modelo de datos, las decisiones vigentes y el plan de slices. Si ese documento y el código no coinciden, manda el código. Las migraciones de `supabase/migrations/` describen la base exactamente.

## Cómo trabajamos

- El desarrollador describe el cambio, un chat de Claude arma el prompt y vos modificás los archivos.
- **No hagas commits, no cambies de rama, no hagas push ni merge.** Git lo maneja el desarrollador a mano.
- **No ejecutes migraciones contra Supabase.** Escribilas y probalas en un Postgres local; el desarrollador las aplica en el SQL Editor.
- Un slice por rama (`sN-nombre`). Si el pedido se sale del slice, avisá en el resumen en vez de hacerlo.

## Stack

- Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, shadcn/ui (`components/ui`), Motion (`motion/react`), tipografía Lexend.
- Supabase: Postgres, Auth y RLS, con `@supabase/ssr` (`lib/supabase/client.ts` y `server.ts`).
- Vitest para las pruebas de la lógica.
- Despliegue de prueba en Vercel desde `main`: https://lecxico-three.vercel.app

## Comandos (Windows, en cmd, no PowerShell)

```
npm install --legacy-peer-deps   # siempre con este flag (conflicto de peers de React 19)
npm run dev
npm run build
npx tsc --noEmit                 # el build ignora errores de tipos: correr siempre
npm test                         # Vitest
npm run coverage                 # Vitest con cobertura V8
```

`next.config.mjs` tiene `ignoreBuildErrors: true`: que el build pase no garantiza tipos correctos. Hoy `tsc` muestra **4 errores previos** en archivos de ejercicios heredados (`app/exercise/[id]`, `daily-challenge-card`, `game-generators`). No sumes errores nuevos.

Si el servidor local sirve páginas sin estilos después de un build: frenarlo, borrar `.next` y volver a correr `npm run dev`.

## Dónde está cada cosa

| Carpeta | Qué tiene |
| --- | --- |
| `app/` | Rutas. Internamente la evaluación se llama `test` (`/test`, `/test/inicial`, `/test/primaria`) |
| `components/` | Componentes compartidos. `components/ui` = shadcn; `components/test` = evaluación; `components/auth`, `components/ninos`, `components/personajes` (Lex y Lumo), `components/motion` |
| `lib/` | Lógica: `lib/test` (bloques, análisis, guardado), `lib/auth`, `lib/ninos`, `lib/vinculos.ts`, `lib/fechas.ts`, `lib/types/database.ts` |
| `supabase/migrations/` | Migraciones numeradas `NNNN_sN_nombre.sql` |
| `supabase/tests/` | Pruebas SQL de acceso indebido (métrica PA) |
| `docs/` | Estado del proyecto, prompts de cada slice y registro de revisiones con las especialistas |

El alias `@/` apunta a la raíz del repo (`@/components/...`, `@/lib/...`).

Antes de crear algo nuevo, buscá si ya existe y reutilizalo: `pagina-app.tsx` (MarcoPagina/PaginaApp), `seccion.tsx`, `fondo-decorado.tsx`, `app-header.tsx`, `confirmar-dialog.tsx`, `estados.tsx` (Cargando, EstadoVacio), `mensaje-alerta.tsx`, `resaltado.tsx`, `components/motion`, `components/test/resultados-evaluacion.tsx`, `lib/test/analisis.ts`, `lib/fechas.ts`, `lib/auth/perfil.ts`. Si algo se repite, extraelo a un componente compartido.

## Reglas de base de datos y seguridad

- Migración nueva = archivo nuevo con el número que indica el plan (`docs/estado-proyecto.md`). Comentado, idempotente, envuelto en `begin; … commit;`. **Una migración ya aplicada nunca se modifica.**
- Toda tabla nueva con RLS. Las escrituras sensibles van por funciones `security definer` con `set search_path = public` y permisos explícitos (`revoke` de `public` y `anon`, `grant` a `authenticated`).
- Ningún dato de un niño es accesible sin un vínculo activo con el profesional. Los mensajes de error no revelan si algo existe.
- Cada migración trae sus escenarios de acceso indebido en `supabase/tests/` (sesión anónima, otro niño, profesional sin vínculo, pendiente o dado de baja, etc.). Probalos en un Postgres local que simule Supabase (`auth.users`, roles `anon` y `authenticated`).
- Nunca uses `localStorage` para datos de usuario.
- La clave `service_role` solo se usa en el servidor de Next.js, desde `SUPABASE_SERVICE_ROLE_KEY`; nunca con prefijo `NEXT_PUBLIC_` ni en el navegador.

## Reglas de interfaz y textos

- Español rioplatense con voseo, frases cortas. El público incluye personas con dislexia.
- Textos visibles: "Evaluación de indicadores de dislexia" (o "Evaluación" si falta espacio), nunca "test" ni "prueba"; "vinculación", no "afiliación"; fechas dd/mm/aaaa. Las rutas y los nombres internos no cambian.
- La plataforma **no emite diagnósticos**. Nada de "detecta dislexia", "diagnóstico" ni "científicamente validado"; los resultados son orientativos.
- El niño no ve resultados de evaluaciones ni progreso; el profesional ve franjas y recomendación; el tutor recibe un informe a pedido.
- Estilo: los tokens de color de `app/globals.css` (rojo, celeste, sol, menta, lavanda, mandarina, con `-fuerte` y `-suave`), Lexend, Lex y Lumo, animaciones de `components/motion` que respetan reducir movimiento. Durante la evaluación, fondo liso (`fondo-nino`) sin formas flotantes: distraen.
- Accesibilidad WCAG 2.2 AA: contraste, foco visible, navegación por teclado, textos alternativos. Revisá en 375 px y en modo oscuro.

## Pruebas

- La lógica pura (cálculo de resultados, franjas, recomendación, desbloqueo de grados) va en `lib/` y lleva pruebas de Vitest al lado (`*.test.ts`).
- Meta de la V8: 80 % de líneas y 90 % de ramas en esos módulos. Cubrí cada condición por sus dos caminos.

## Un slice está hecho cuando

- `npm run build` pasa y `npx tsc --noEmit` no suma errores a los 4 previos.
- Las pruebas de Vitest pasan.
- La migración, si hay, se probó en Postgres local con sus escenarios de acceso.
- Se puede probar en la app con un profesional y un niño de prueba.
- `docs/estado-proyecto.md` está actualizado en lo que tocó el slice.

## Al terminar, resumí

1. Archivos creados, modificados y eliminados.
2. Decisiones que tomaste y que no estaban en el pedido.
3. Pasos para aplicar la migración (si hay) y para probar el slice a mano.
4. Resultado de build, `tsc` y tests.
