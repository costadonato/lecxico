# S6 — Base de trabajo: Vitest con cobertura, primeras pruebas y limpieza

## Contexto
Estás en la rama `s6-base-de-trabajo`. En este slice ya se agregaron a mano `CLAUDE.md` y la carpeta `docs/` (estado del proyecto, registro de revisiones y prompts). No los modifiques salvo lo que se pide al final.

El proyecto no tiene pruebas automáticas. La propuesta del trabajo final fija una métrica de cobertura: 80 % o más de líneas y 90 % o más de ramas en los módulos de lógica (cálculo de resultados, franjas, recomendación y desbloqueo), medida con Vitest y su proveedor de cobertura V8. Este slice deja Vitest listo y prueba el primer módulo de lógica, para que los slices siguientes solo agreguen sus pruebas.

## Leer antes de tocar
- `CLAUDE.md`
- `docs/estado-proyecto.md` (secciones "Plan de slices" y "Stack y configuración")
- `package.json`, `tsconfig.json`, `.gitignore`
- `lib/test/analisis.ts` y `lib/test/bloques.ts`

## Reglas
- No hacer commits ni cambiar de rama.
- Instalar dependencias siempre con `--legacy-peer-deps`.
- No tocar código de la app fuera de lo que se pide: este slice no cambia ninguna pantalla.
- No modificar `lib/test/analisis.ts`. Si al probarlo encontrás un comportamiento que parece un error, no lo corrijas: anotalo en el resumen.

## Tareas

### 1. Vitest
- Instalar como dependencias de desarrollo: `vitest`, `@vitest/coverage-v8` y `vite-tsconfig-paths` (para que el alias `@/` funcione en las pruebas). Usar versiones compatibles entre sí.
- Crear `vitest.config.ts` en la raíz:
  - plugin `tsconfigPaths()`;
  - `environment: "node"` (la lógica no necesita DOM);
  - `include: ["lib/**/*.test.ts"]`;
  - cobertura con `provider: "v8"`, reportes `text` y `html`, carpeta `coverage/`, e `include` limitado a los módulos de lógica que tienen pruebas: por ahora `lib/test/analisis.ts`. Dejar un comentario que explique que cada slice agrega acá sus módulos (franjas, recomendación, desbloqueo).
  - Umbrales solo para esos módulos: `lines: 80`, `branches: 90`.
- Agregar a `package.json` los scripts `"test": "vitest run"`, `"test:watch": "vitest"` y `"coverage": "vitest run --coverage"`.
- Verificar que `next build` no intente compilar `vitest.config.ts` ni los `*.test.ts` de forma que rompa el build. Si `tsc` marca errores nuevos por los tipos de Vitest, resolverlo sin agregar `"types"` globales que afecten al resto (importar `describe`, `it`, `expect` desde `vitest` en cada archivo).

### 2. Pruebas de `lib/test/analisis.ts`
Crear `lib/test/analisis.test.ts`. Construir los datos de prueba con un helper chico (`bloque(codigo, orden, correctas, total)`). Casos mínimos:

**porcentajeBloque**
- 7 de 10 → 70; redondeo (2 de 3 → 67, 1 de 3 → 33).
- total 0 → 0 (sin dividir por cero).
- 0 de 5 → 0; 5 de 5 → 100.

**bloquesMasDebiles**
- Lista vacía → vacía.
- Todos al 100 % → vacía.
- Un solo bloque con el menor acierto → ese bloque.
- Empate en el mínimo con bloques de distinto tamaño (1/2 y 3/6) → los dos, ordenados por `orden` aunque vengan desordenados.
- Comparación exacta sin redondeo: 2/3 frente a 67/100 no son empate; el más débil es 2/3 (66,67 %).
- Bloques con `total` 0 se ignoran (no cuentan como 0 %).
- Si solo hay bloques con `total` 0 → vacía.

**ordenRecomendacion**
- Ordena de menor a mayor acierto.
- Empates por `orden` del test.
- Excluye bloques con `total` 0.
- No modifica el arreglo recibido (comparar contra una copia).

Al terminar, `npm run coverage` tiene que mostrar 100 % de líneas y de ramas en `analisis.ts`. Si alguna rama queda sin cubrir, agregar el caso.

### 3. Limpieza
- Borrar `AUDIT_REPORT.json`, `EXECUTIVE_SUMMARY.md` y `PERSONALIZATION_SETUP.md` de la raíz (son de la auditoría del prototipo v0 y describen cosas que ya no existen). Antes, buscar que ningún archivo los referencie.
- `.gitignore`: la última línea quedó pegada como `next-env.d.ts.claude/`. Separarla en dos líneas, `next-env.d.ts` y `.claude/`, y agregar `/coverage`.

### 4. Documentación
- En `docs/estado-proyecto.md`, en "Stack y configuración", agregar en una línea cómo correr las pruebas y la cobertura. No cambiar nada más del documento.

## Fuera de alcance
- Pruebas de componentes o de pantallas.
- Pruebas SQL de acceso (llegan con la primera migración, en S8).
- Corregir los 4 errores previos de TypeScript.
- Cambios en `next.config.mjs`.

## Criterio de hecho
- `npm test` pasa.
- `npm run coverage` pasa los umbrales, con 100 % de líneas y ramas en `analisis.ts`.
- `npm run build` pasa.
- `npx tsc --noEmit`: solo los 4 errores previos.

## Al terminar, resumí
- Archivos creados, modificados y eliminados.
- Versiones instaladas.
- La salida de `npm run coverage` (tabla de texto).
- Cualquier comportamiento de `analisis.ts` que te haya parecido un error.
