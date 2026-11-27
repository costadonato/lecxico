# Cobertura de las pruebas

Lista definida por el equipo. La propuesta nombra cuatro módulos de lógica: cálculo de resultados, franjas, recomendación y desbloqueo.

Qué entra en la medición de cobertura de Vitest (V8) y qué no, con el motivo. La lista de módulos medidos es el `include` de `coverage` en `vitest.config.mts`; si cambia uno, cambia el otro. Umbrales: 80 % de líneas y 90 % de ramas (punto 2 de la Definición de Hecho en `CLAUDE.md`). `npm run coverage` falla si no se alcanzan.

## Los cuatro módulos de la propuesta

| Módulo de la propuesta | Dónde está |
| --- | --- |
| Cálculo de resultados | `lib/test/analisis.ts` y `lib/test/denominacion.ts` |
| Franjas | `lib/test/franjas.ts` |
| Recomendación | `lib/test/franjas.ts` |
| Desbloqueo | En la base: `grados_habilitados` y `guardar_partida` de la migración 0008, probadas con SQL en `supabase/tests/0008_entrenamiento.sql`. En el cliente: `gradoTrasPartida` de `lib/entrenamiento/juegos.ts` (la misma regla del 80 %, con sus pruebas) y la lectura del grado que devuelve la base en `lib/entrenamiento/partidas.ts` (`guardarPartida`, `gradosHabilitados`, `gradoDe`) |

## Módulos medidos

35 módulos.

| Área | Módulo | Qué tiene |
| --- | --- | --- |
| Evaluación | `lib/test/analisis.ts` | Cálculo de resultados: aciertos, porcentajes y totales (sin denominación rápida) |
| Evaluación | `lib/test/denominacion.ts` | Cálculo de resultados de denominación rápida: puntaje por ejercicio, suma del bloque, tiempo y validación de las secuencias |
| Evaluación | `lib/test/denominacion-config.ts` | Cuadrículas fijas de denominación rápida por nivel |
| Evaluación | `lib/test/bloques.ts` | Bloques de cada nivel y nivel según la etapa escolar |
| Evaluación | `lib/test/franjas.ts` | Franjas por bloque y recomendación |
| Cuentas | `lib/auth/perfil.ts` | Perfil del usuario actual y perfil incompleto (recibe el cliente de Supabase) |
| Cuentas | `lib/auth/validaciones.ts` | Validaciones de los formularios de cuenta: nombre de usuario, correo, contraseña y fecha de nacimiento |
| Cuentas | `lib/auth/rutas.ts` | Rutas protegidas y solo para invitados; redirección interna segura |
| Tutor | `lib/tutor/errores.ts` | Resultado y mensajes de las acciones del tutor |
| Tutor | `lib/tutor/etapa.ts` | Cambio de etapa escolar |
| Tutor | `lib/tutor/validaciones.ts` | Validación de los datos que llegan a las acciones del tutor |
| Entrenamiento | `lib/entrenamiento/juegos.ts` | Catálogo de juegos, porcentaje de una partida y desbloqueo (`gradoTrasPartida`) |
| Entrenamiento | `lib/entrenamiento/bancos.ts` | Acceso tipado a los bancos de contenido |
| Entrenamiento | `lib/entrenamiento/rondas.ts` | Rondas y regla del reintento |
| Entrenamiento | `lib/entrenamiento/presentacion.ts` | Textos y orden en pantalla: grupos por bloque y por franja, frases, orígenes |
| Entrenamiento | `lib/entrenamiento/partidas.ts` | Envoltorios de las funciones de la 0008 (reciben el cliente de Supabase) |
| Entrenamiento | `lib/entrenamiento/partida.ts` | Armado de una partida |
| Entrenamiento | `lib/entrenamiento/audio.ts` | Reproductor único de audio |
| Entrenamiento | `lib/entrenamiento/memotono.ts` | Memotono: secuencias de una partida |
| Entrenamiento | `lib/entrenamiento/denominacion-entrenamiento.ts` | Nombrá rápido: cuadrículas generadas |
| Entrenamiento | `lib/entrenamiento/tocalo.ts` | ¡Rápido, tocalo!: partida y resultado |
| Entrenamiento | `lib/entrenamiento/seleccion.ts` | Puntaje de los juegos de selección |
| Entrenamiento | `lib/entrenamiento/lee.ts` | Leé y descubrí: preguntas de una partida |
| Entrenamiento | `lib/entrenamiento/eco.ts` | Eco de palabras: corrección fonológica |
| Entrenamiento | `lib/entrenamiento/caza.ts` | Caza errores: palabras de la oración y objetivos |
| Entrenamiento | `lib/entrenamiento/memopalabras.ts` | Memopalabras: conjuntos de una partida |
| Entrenamiento | `lib/entrenamiento/ojo-lince.ts` | Ojo de lince: cuadrículas de una partida |
| Entrenamiento | `lib/entrenamiento/lluvia.ts` | Lluvia: plan, reloj y puntaje |
| Seguimiento | `lib/seguimiento/evaluaciones.ts` | Evolución por bloque para los gráficos |
| Seguimiento | `lib/seguimiento/entrenamiento.ts` | Partidas por semana y por origen, resumen por juego |
| Seguimiento | `lib/seguimiento/datos.ts` | Lectura de los datos del seguimiento (recibe el cliente de Supabase) |
| Inicio | `lib/inicio/actividad.ts` | Actividad reciente del inicio del profesional |
| Interfaz | `lib/personajes.ts` | Personajes y poses de Lex y Lumo |
| Interfaz | `lib/niveles.ts` | Nivel de color de un porcentaje de acierto |
| Interfaz | `lib/fechas.ts` | Formato de fechas, edad y tiempo relativo |

## Archivos de `lib/` que no se miden

| Categoría | Archivos | Motivo |
| --- | --- | --- |
| Acceso a Supabase o al servidor | `lib/supabase/admin.ts`, `client.ts`, `server.ts`; `lib/tutor/acciones.ts`, `verificar-contrasena.ts`; `lib/test/guardar-test.ts`, `ninos-para-test.ts`; `lib/ninos/detalle.ts`; `lib/vinculos.ts` | Dependen de la base, de la sesión o del servidor de Next.js. Se verifican con las pruebas SQL (`supabase/tests/`) y en la aplicación |
| Hooks de React | `lib/auth/use-nombre-usuario.ts`, `use-perfil-pagina.ts`; `lib/entrenamiento/use-audio.ts`; `lib/hooks/use-voz.ts`; `lib/test/use-acceso-test.ts`, `use-salida-test.tsx` | Necesitan el DOM y un componente montado; las pruebas de Vitest corren en Node |
| Tipos, textos y constantes | `lib/types/database.ts`, `game-telemetry.ts`; `lib/sitio.ts`; `lib/compromiso.ts`; `lib/utils.ts` (envoltorio de librerías) | No tienen lógica propia para probar |
| Código heredado del prototipo | `lib/auth-utils.ts` | Simulación en `localStorage`, a retirar |

## Resultado de hoy

`npm run coverage` del 27/11/2026:

| Medida | Resultado |
| --- | --- |
| Líneas | 99,89 % (982/983) |
| Ramas | 98,38 % (733/745) |
| Sentencias | 99,6 % (1250/1255) |
| Funciones | 100 % (389/389) |
| Archivos de prueba | 34 |
| Pruebas | 615 |
