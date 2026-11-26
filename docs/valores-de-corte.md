# Valores de corte de las franjas

Resumen para el repo de los valores de corte que usa S11 (`lib/test/franjas.ts`, constante `CORTES`). La fundamentación completa va en el informe final.

Son **valores provisorios fijados por revisión bibliográfica** (equipo y director, 23/11/2026). **No son normas poblacionales.** Las franjas son orientativas: la plataforma no emite diagnósticos.

## Regla general

Cada bloque cae en una de tres franjas según dos cortes, convertidos a aciertos sobre el total de ítems que hoy tiene el bloque (criterio de Cuetos et al., 2015):

- **Correcto:** desde M − 1 DE.
- **Intermedio:** entre M − 1,5 DE y M − 1 DE.
- **A observar:** por debajo de M − 1,5 DE.

Cada corte guarda el total de ítems para el que vale. Si un bloque guardado tiene otro total (por ejemplo, una evaluación vieja), queda **sin franja de referencia**.

## Bloques por aciertos

| Nivel | Bloque | Total | Correcto | Intermedio | A observar |
| --- | --- | --- | --- | --- | --- |
| Inicial | Discriminación auditiva | 6 | 4 a 6 | 3 | 0 a 2 |
| Inicial | Conciencia fonológica | 3 | 2 a 3 | 1 | 0 |
| Inicial | Conciencia silábica | 7 | 4 a 7 | 3 | 0 a 2 |
| Inicial | Memoria auditiva (`memoria_fonologica`) | 4 | 3 a 4 | 2 | 0 a 1 |
| Inicial | Denominación rápida | — | sin franja de referencia | | |
| Primario | Discriminación auditiva | 5 | 4 a 5 | 3 | 0 a 2 |
| Primario | Conciencia fonológica | 7 | 5 a 7 | 4 | 0 a 3 |
| Primario | Conciencia silábica | 6 | 4 a 6 | 3 | 0 a 2 |
| Primario | Memoria auditiva (`memoria_fonologica`) | 6 | 5 a 6 | 4 | 0 a 3 |
| Primario | Comprensión lectora | 3 | 3 | 2 | 0 a 1 |
| Primario | Correspondencia sonido-letra, 2.º y 3.º | 6 | 6 | 5 | 0 a 4 |
| Primario | Correspondencia sonido-letra, 1.º | 6 | 5 a 6 | 4 | 0 a 3 |
| Primario | Reconocimiento visual | 2 | 2 | 1 | 0 |
| Primario | Lectura de pseudopalabras | 7 | 5 a 7 | 4 | 0 a 3 |

## Denominación rápida del primario: tiempo y errores

Vale para el bloque completo: 2 cuadrículas de 50 estímulos (total 100), con el tiempo y los errores sumados.

**Tiempo**, en segundos enteros del bloque (`Math.round(tiempo_ms / 1000)`, el mismo redondeo que muestra la pantalla):

| Grado | Correcto | Intermedio | A observar |
| --- | --- | --- | --- |
| 1.º | hasta 137 s (2:17) | 138 a 146 s | 147 s o más |
| 2.º | hasta 121 s (2:01) | 122 a 131 s | 132 s o más |
| 3.º | hasta 101 s (1:41) | 102 a 109 s | 110 s o más |

**Errores** (los tres grados): 0 o 1, correcto; 2, intermedio; 3 o más, a observar.

**Combinación:** el bloque toma la franja más baja entre la de tiempo y la de errores. Un tiempo mayor nunca sube la franja.

## Cuándo un bloque queda sin franja de referencia

- Denominación rápida de inicial, siempre.
- Denominación rápida de primario sin tiempo o sin errores (evaluaciones anteriores a S9).
- Un bloque cuyo total no coincide con el del corte.
- Correspondencia sonido-letra y denominación rápida del primario cuando no se conoce el grado.
- Un bloque sin ejercicios (total 0).

El grado sale de la **etapa escolar actual del niño**, porque la tabla `test` no la guarda (ver "Pendientes y riesgos" en `docs/estado-proyecto.md`).

## Decisiones del equipo (23/11/2026)

Se listan las decisiones; su fundamentación va en el informe final.

- **Discriminación auditiva y conciencia silábica del primario:** se toman como piso los valores de 4 años.
- **Reconocimiento visual:** franja propia para sus 2 ítems (2 correcto, 1 intermedio, 0 a observar).
- **Comprensión lectora:** criterio de Betts (1946).
- **Correspondencia sonido-letra:** 1.º tiene un corte propio, por las letras espejo.
- **Denominación rápida:** desvío estimado; el bloque toma la franja más baja entre tiempo y errores.
- **Redondeo:** el tiempo se compara en segundos enteros, con el mismo redondeo que se muestra en pantalla (m:ss).

## Fuentes

- Cuetos, Suárez-Coalla, Molina y Llenderrozas (2015 y 2017). *Pediatría Atención Primaria*.
- Sebastián y Hernández-Gil (2012). *Psicothema*.
- Querejeta (2017). *Revista de Psicología (UNLP)*.
- Seymour, Aro y Erskine (2003). *British Journal of Psychology*.
- Betts (1946).
- Fonseca, Corrado, Lasala, García-Blanco y Simian (2019). *Ocnos*.
- Outón y Ferraces (2021). *Dyslexia*.
- Pearson (2017). *Dislexia: una forma diferente de leer*.
- Semrud-Clikeman y Teeter Ellison (2011). *Neuropsicología infantil*.
- Dehaene (2014). *El cerebro lector*.
