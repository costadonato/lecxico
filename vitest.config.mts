import { defineConfig } from "vitest/config"

/**
 * Pruebas de la lógica pura de `lib/` (sin DOM ni base de datos).
 * `npm test` corre las pruebas; `npm run coverage` mide además la cobertura
 * con V8 y falla si no se llega a los umbrales de la propuesta del trabajo.
 */
export default defineConfig({
  // Resuelve el alias `@/` con los `paths` de tsconfig.json (soporte nativo de Vite 8).
  resolve: { tsconfigPaths: true },
  // tsconfig.json deja el JSX sin transformar ("preserve", para Next): las
  // pruebas con JSX (el PDF de S17a) usan el runtime automático de React.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "node",
    // components/**/*.test.tsx: el render del PDF (S17a), en Node con renderToBuffer.
    include: ["lib/**/*.test.ts", "components/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      // Solo los módulos de lógica que ya tienen pruebas. Cada slice agrega
      // acá los suyos (franjas, recomendación, desbloqueo de grados), así los
      // umbrales miden la métrica de la propuesta y no el resto de la app.
      include: [
        "lib/test/analisis.ts",
        "lib/test/bloques.ts",
        "lib/test/denominacion.ts",
        "lib/test/denominacion-config.ts",
        "lib/test/franjas.ts",
        "lib/auth/perfil.ts",
        "lib/tutor/errores.ts",
        "lib/tutor/etapa.ts",
        "lib/tutor/validaciones.ts",
        "lib/entrenamiento/juegos.ts",
        "lib/entrenamiento/bancos.ts",
        "lib/entrenamiento/rondas.ts",
        "lib/entrenamiento/presentacion.ts",
        "lib/entrenamiento/partidas.ts",
        "lib/entrenamiento/partida.ts",
        "lib/entrenamiento/memotono.ts",
        "lib/entrenamiento/denominacion-entrenamiento.ts",
        "lib/entrenamiento/tocalo.ts",
        "lib/entrenamiento/audio.ts",
        "lib/entrenamiento/seleccion.ts",
        "lib/entrenamiento/lee.ts",
        "lib/entrenamiento/eco.ts",
        "lib/entrenamiento/caza.ts",
        "lib/entrenamiento/memopalabras.ts",
        "lib/entrenamiento/ojo-lince.ts",
        "lib/entrenamiento/lluvia.ts",
        "lib/personajes.ts",
        "lib/inicio/actividad.ts",
        "lib/seguimiento/evaluaciones.ts",
        "lib/seguimiento/entrenamiento.ts",
        "lib/seguimiento/datos.ts",
        "lib/informes/opciones.ts",
        "lib/informes/periodo.ts",
        "lib/informes/modelo.ts",
      ],
      thresholds: {
        lines: 80,
        branches: 90,
      },
    },
  },
})