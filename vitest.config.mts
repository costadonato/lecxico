import { defineConfig } from "vitest/config"

/**
 * Pruebas de la lógica pura de `lib/` (sin DOM ni base de datos).
 * `npm test` corre las pruebas; `npm run coverage` mide además la cobertura
 * con V8 y falla si no se llega a los umbrales de la propuesta del trabajo.
 */
export default defineConfig({
  // Resuelve el alias `@/` con los `paths` de tsconfig.json (soporte nativo de Vite 8).
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      // Solo los módulos de lógica que ya tienen pruebas. Cada slice agrega
      // acá los suyos (franjas, recomendación, desbloqueo de grados), así los
      // umbrales miden la métrica de la propuesta y no el resto de la app.
      include: ["lib/test/analisis.ts"],
      thresholds: {
        lines: 80,
        branches: 90,
      },
    },
  },
})
