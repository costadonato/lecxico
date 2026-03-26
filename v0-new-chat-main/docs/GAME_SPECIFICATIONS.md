# Especificaciones Técnicas y Pedagógicas - Juegos Modo Niño
## Lecxico Platform - Versión 1.0

---

## 1. AUDITORÍA DE JUEGOS ACTUALES

### Juegos Existentes Analizados
- **Rompe y Une** (Segmentación silábica)
- **Cuenta Conmigo** (Conteo básico)
- **Lluvia de Palabras** (Velocidad lectora)
- **Eco de Palabras** (Memoria verbal)
- **Historias con Huecos** (Comprensión contextual)

### Problemas Identificados

| Categoría | Problema | Severidad | Recomendación |
|-----------|----------|-----------|---------------|
| **UX** | Falta de progresión adaptativa automática | Alta | Implementar sistema adaptativo basado en rendimiento |
| **Accesibilidad** | Contraste insuficiente en algunos botones | Media | Aplicar WCAG AA (ratio 4.5:1 mínimo) |
| **Feedback** | Mensajes de error poco empáticos | Media | Reformular con lenguaje positivo y constructivo |
| **Telemetría** | Métricas inconsistentes entre juegos | Alta | Estandarizar schema de eventos |
| **Audio** | Falta de audio alternativo en todas las consignas | Alta | Agregar TTS para todas las instrucciones |
| **Performance** | Assets no optimizados (imágenes grandes) | Media | Comprimir y usar formatos modernos (WebP, AVIF) |
| **Gamificación** | Recompensas poco variadas | Baja | Agregar microrecompensas y animaciones |

---

## 2. ESPECIFICACIONES DE 8 MICRO-JUEGOS

### JUEGO 1: Cazador de Sonidos
**Categoría:** Conciencia Fonológica

#### Nombre
Cazador de Sonidos

#### Objetivo Pedagógico
Desarrollar conciencia fonológica mediante identificación de sonidos iniciales en palabras. Fortalece la discriminación auditiva y la asociación grafema-fonema.

**Evidencia:** La conciencia fonológica es un predictor clave del éxito lector (National Reading Panel, 2000). [NEEDS_VERIFICATION: Efectividad específica del formato digital vs. papel]

#### Edad Recomendada
6-8 años (1º-2º grado)

#### Niveles y Progresión

| Nivel | Dificultad | Características |
|-------|-----------|-----------------|
| 1 | Fácil | 3 palabras, sonidos vocálicos iniciales (A, E, I, O, U) |
| 2 | Medio | 4 palabras, consonantes simples (M, P, S, L) |
| 3 | Difícil | 5 palabras, consonantes complejas (R, RR, CH, LL) |
| 4 | Avanzado | 6 palabras, grupos consonánticos (BR, TR, PL) |

**Criterio de avance:** 3 aciertos consecutivos → +1 nivel. 2 errores consecutivos → -1 nivel.

#### Dinámica (Step-by-Step)

1. **Inicio (5s)**
   - Lex aparece y dice: "¡Vamos a cazar sonidos! Escuchá bien."
   - Audio: Reproducir sonido objetivo (ej: /m/)

2. **Presentación (10s)**
   - Mostrar 3-6 imágenes con palabras
   - Cada imagen tiene botón de audio para escuchar la palabra

3. **Interacción (30-60s)**
   - Usuario toca imagen que empieza con el sonido objetivo
   - Feedback inmediato visual y auditivo

4. **Resultado (5s)**
   - Acierto: Animación de estrella + sonido de éxito + "¡Genial!"
   - Error: Animación suave + "Probá otra vez" + repetir sonido objetivo

5. **Siguiente ronda (2s)**
   - Transición suave a siguiente palabra
   - Contador de progreso visible

#### Recursos Visuales/Audio

**Visuales:**
- Imágenes PNG/WebP 512x512px, optimizadas <50KB cada una
- Paleta: Colores primarios saturados (HSL: S>70%, L=50-70%)
- Animaciones: Lottie JSON <100KB para feedback
- Iconos: Lucide React (ya disponibles)

**Audio:**
- Formato: MP3 128kbps o WebM Opus
- Duración: 1-3 segundos por sonido
- Voz: Femenina/masculina neutra, tono amigable
- Efectos: Sonido de éxito (campanita), error suave (whoosh)

**Assets requeridos:**
```
/public/games/cazador-sonidos/
  ├── images/
  │   ├── avion.webp
  │   ├── manzana.webp
  │   ├── pelota.webp
  │   └── ... (30 imágenes base)
  ├── audio/
  │   ├── sounds/
  │   │   ├── m.mp3
  │   │   ├── p.mp3
  │   │   └── ... (20 fonemas)
  │   ├── words/
  │   │   ├── manzana.mp3
  │   │   └── ... (30 palabras)
  │   └── feedback/
  │       ├── success.mp3
  │       └── error.mp3
  └── animations/
      ├── star.json (Lottie)
      └── sparkle.json
```

#### Feedback Positivo/Negativo

**Acierto:**
- "¡Excelente! Encontraste el sonido /m/"
- "¡Sos un cazador de sonidos increíble!"
- "¡Perfecto! Escuchaste muy bien"

**Error:**
- "Casi, casi. Escuchá otra vez el sonido"
- "Probá con otra imagen. ¡Vos podés!"
- "Mmm, no es esa. Escuchá bien: /m/"

**Tono:** Siempre positivo, evitar "mal", "incorrecto", "error". Usar "probá otra vez", "casi", "escuchá de nuevo".

#### Métricas a Registrar

```json
{
  "eventType": "game_attempt",
  "gameId": "cazador-sonidos",
  "sessionId": "uuid-v4",
  "userId": "user-123",
  "timestamp": "2025-01-15T10:30:00Z",
  "level": 2,
  "targetSound": "m",
  "selectedWord": "manzana",
  "isCorrect": true,
  "attemptNumber": 1,
  "timeToAnswer": 4.5,
  "hintsUsed": 0,
  "audioPlayed": ["target_sound", "word_manzana"],
  "metadata": {
    "deviceType": "tablet",
    "sessionDuration": 120,
    "consecutiveCorrect": 3
  }
}
```

#### Criterio Mínimo de Éxito

**Por sesión (5-10 minutos):**
- Completar al menos 8 intentos
- Accuracy ≥ 60%
- Usar ≤ 3 pistas

**Por 4 semanas (12-16 sesiones):**
- Accuracy promedio ≥ 75%
- Progresión a nivel 3 o superior
- Reducción de tiempo promedio por respuesta en 20%
- Retention rate ≥ 70% (volver al menos 3 veces/semana)

#### Pseudocódigo Adaptativo

```typescript
interface AdaptiveSystem {
  currentLevel: number
  consecutiveCorrect: number
  consecutiveErrors: number
  sessionAccuracy: number
}

function adjustDifficulty(state: AdaptiveSystem, isCorrect: boolean): AdaptiveSystem {
  let newState = { ...state }
  
  if (isCorrect) {
    newState.consecutiveCorrect++
    newState.consecutiveErrors = 0
    
    // Subir nivel tras 3 aciertos consecutivos
    if (newState.consecutiveCorrect >= 3 && newState.currentLevel < 4) {
      newState.currentLevel++
      newState.consecutiveCorrect = 0
      showEncouragement("¡Subiste de nivel! 🎉")
    }
  } else {
    newState.consecutiveErrors++
    newState.consecutiveCorrect = 0
    
    // Bajar nivel tras 2 errores consecutivos (pero no menos de 1)
    if (newState.consecutiveErrors >= 2 && newState.currentLevel > 1) {
      newState.currentLevel--
      newState.consecutiveErrors = 0
      showEncouragement("Volvamos a practicar un poquito más")
    }
    
    // Ofrecer pista automática tras 3 errores
    if (newState.consecutiveErrors >= 3) {
      offerAutoHint()
    }
  }
  
  return newState
}
```

#### Observaciones y Notas de Accesibilidad

**WCAG AA Compliance:**
- ✅ Contraste texto/fondo ≥ 4.5:1
- ✅ Botones ≥ 44x44px (touch target)
- ✅ Alternativa de audio para todas las consignas
- ✅ Navegación por teclado (Tab, Enter, Space)
- ✅ ARIA labels en todos los elementos interactivos
- ✅ Pausar/reanudar en cualquier momento
- ✅ Sin animaciones automáticas que duren >5s
- ✅ Opción de reducir movimiento (prefers-reduced-motion)

**Consideraciones especiales:**
- Evitar rojo/verde como únicos indicadores (daltonismo)
- Usar iconos + color + texto para feedback
- Permitir ajustar velocidad de audio (0.8x, 1x, 1.2x)
- Timeout generoso: 60s por intento (no forzar rapidez)

---

### JUEGO 2: Palabras Mágicas
**Categoría:** Vocabulario y Asociación Semántica

#### Nombre
Palabras Mágicas

#### Objetivo Pedagógico
Ampliar vocabulario receptivo y expresivo mediante asociación imagen-palabra. Fortalece la memoria semántica y la lectura de palabras completas (ruta léxica).

**Evidencia:** La exposición repetida a vocabulario en contexto mejora la retención (Beck et al., 2013). [NEEDS_VERIFICATION: Efectividad del formato matching digital]

#### Edad Recomendada
6-9 años (1º-3º grado)

#### Niveles y Progresión

| Nivel | Vocabulario | Cantidad | Tiempo |
|-------|------------|----------|--------|
| 1 | Objetos cotidianos (casa, mesa, perro) | 4 pares | 90s |
| 2 | Animales y naturaleza | 6 pares | 120s |
| 3 | Acciones y verbos | 6 pares | 120s |
| 4 | Emociones y abstractos | 8 pares | 150s |

#### Dinámica (Step-by-Step)

1. **Inicio (5s)**
   - Lex: "¡Unamos imágenes con palabras!"
   - Mostrar tablero con imágenes y palabras mezcladas

2. **Presentación (10s)**
   - Lado izquierdo: 4-8 imágenes
   - Lado derecho: 4-8 palabras escritas (desordenadas)
   - Botón de audio en cada palabra

3. **Interacción (60-150s)**
   - Usuario toca imagen, luego palabra correspondiente
   - Línea conecta ambos elementos
   - Feedback inmediato al completar par

4. **Validación (5s)**
   - Al completar todos los pares: verificación automática
   - Mostrar aciertos/errores con animación

5. **Resultado (10s)**
   - Puntuación: estrellas según accuracy y tiempo
   - Mensaje motivador personalizado

#### Recursos Visuales/Audio

**Visuales:**
- Ilustraciones simples, estilo flat design
- Fondo neutro (blanco/gris claro)
- Palabras: Fuente sans-serif, tamaño 24-32px, peso 600
- Líneas de conexión: Animadas con Framer Motion

**Audio:**
- TTS para cada palabra (voz clara, pausada)
- Música de fondo suave (opcional, desactivable)
- Efectos: "pop" al conectar, "ding" al acertar

#### Feedback Positivo/Negativo

**Acierto:**
- "¡Perfecto! CASA y 🏠 van juntos"
- "¡Excelente memoria! Todas correctas"
- "¡Sos un experto en palabras! ⭐⭐⭐"

**Error parcial:**
- "Casi todas bien. Revisemos estas dos"
- "¡Muy bien! Solo una se confundió"

#### Métricas a Registrar

```json
{
  "eventType": "game_session",
  "gameId": "palabras-magicas",
  "sessionId": "uuid-v4",
  "userId": "user-123",
  "timestamp": "2025-01-15T10:35:00Z",
  "level": 2,
  "totalPairs": 6,
  "correctPairs": 5,
  "incorrectPairs": 1,
  "timeToComplete": 95.3,
  "hintsUsed": 1,
  "wordsPlayed": ["casa", "perro", "gato", "mesa", "silla", "árbol"],
  "accuracy": 0.83,
  "metadata": {
    "avgTimePerPair": 15.9,
    "fastestPair": 8.2,
    "slowestPair": 28.5
  }
}
```

#### Criterio Mínimo de Éxito

**Por sesión:**
- Completar al menos 1 nivel completo
- Accuracy ≥ 70%
- Tiempo < 150% del tiempo objetivo

**Por 4 semanas:**
- Accuracy promedio ≥ 85%
- Vocabulario reconocido: +30 palabras nuevas
- Tiempo promedio reducido en 25%

#### Pseudocódigo Adaptativo

```typescript
function selectVocabulary(userHistory: VocabularyHistory): Word[] {
  // Spaced repetition: priorizar palabras con más errores
  const weakWords = userHistory.words
    .filter(w => w.accuracy < 0.7)
    .sort((a, b) => a.lastSeen - b.lastSeen)
  
  const strongWords = userHistory.words
    .filter(w => w.accuracy >= 0.7)
  
  // 70% palabras débiles, 30% repaso
  const selected = [
    ...weakWords.slice(0, 5),
    ...strongWords.slice(0, 2)
  ]
  
  return shuffle(selected)
}
```

#### Observaciones y Notas de Accesibilidad

- ✅ Alto contraste en texto (negro sobre blanco)
- ✅ Opción de escuchar cada palabra ilimitadamente
- ✅ Sin límite de tiempo estricto (solo sugerido)
- ✅ Botón "Reintentar" siempre visible
- ✅ Feedback visual + auditivo + textual

---

### JUEGO 3: Lectura Rápida
**Categoría:** Fluidez Lectora

#### Nombre
Lectura Rápida (Flash Words)

#### Objetivo Pedagógico
Mejorar velocidad de reconocimiento de palabras frecuentes mediante exposición breve. Automatiza la decodificación y libera recursos cognitivos para comprensión.

**Evidencia:** La práctica de lectura repetida mejora fluidez (Therrien, 2004). El método de presentación rápida (RSVP) puede mejorar velocidad sin sacrificar comprensión (Rayner et al., 2016). [NEEDS_VERIFICATION: Efectividad en niños <8 años]

#### Edad Recomendada
7-11 años (2º-5º grado)

#### Niveles y Progresión

| Nivel | Duración Flash | Longitud Palabra | Frecuencia |
|-------|---------------|------------------|------------|
| 1 | 1500ms | 3-4 letras | Muy alta (100+ por millón) |
| 2 | 1000ms | 4-5 letras | Alta (50-100 ppm) |
| 3 | 750ms | 5-7 letras | Media (10-50 ppm) |
| 4 | 500ms | 7-10 letras | Baja (<10 ppm) |

#### Dinámica (Step-by-Step)

1. **Preparación (3s)**
   - Lex: "¡Leé rápido y elegí la correcta!"
   - Countdown: 3... 2... 1...

2. **Flash (0.5-1.5s)**
   - Palabra aparece en centro de pantalla
   - Tamaño grande (48-64px)
   - Fondo neutro

3. **Desaparece (0s)**
   - Palabra se oculta

4. **Opciones (30s)**
   - Mostrar 4 opciones (1 correcta + 3 distractores similares)
   - Usuario selecciona la que vio

5. **Feedback (2s)**
   - Mostrar palabra original
   - Confirmar acierto/error

#### Recursos Visuales/Audio

**Visuales:**
- Fondo: Gris claro (#F5F5F5)
- Texto: Negro (#000000), fuente monoespaciada
- Animación: Fade in/out suave (200ms)
- Opciones: Botones grandes con hover state

**Audio:**
- Tick de countdown
- Whoosh al aparecer palabra
- Ding/buzz para feedback

#### Feedback Positivo/Negativo

**Acierto:**
- "¡Leíste súper rápido! 🚀"
- "¡Tus ojos son veloces!"
- "¡Perfecto! Palabra: CASA"

**Error:**
- "Era CASA, no CAMA. ¡Casi!"
- "Probá de nuevo, vas bien"

#### Métricas a Registrar

```json
{
  "eventType": "flash_word_attempt",
  "gameId": "lectura-rapida",
  "sessionId": "uuid-v4",
  "userId": "user-123",
  "timestamp": "2025-01-15T10:40:00Z",
  "level": 2,
  "word": "pelota",
  "flashDuration": 1000,
  "selectedOption": "pelota",
  "isCorrect": true,
  "reactionTime": 2.3,
  "distractors": ["pilota", "pelata", "poleta"],
  "metadata": {
    "wordFrequency": 75,
    "wordLength": 6,
    "consecutiveCorrect": 5
  }
}
```

#### Criterio Mínimo de Éxito

**Por sesión:**
- Completar 15-20 palabras
- Accuracy ≥ 65%
- Tiempo de reacción < 5s promedio

**Por 4 semanas:**
- Accuracy ≥ 80%
- Progresión a nivel 3
- Velocidad de lectura: +20 palabras por minuto

#### Pseudocódigo Adaptativo

```typescript
function adjustFlashDuration(state: FlashState): number {
  const { accuracy, level, consecutiveCorrect } = state
  
  // Reducir duración si accuracy alta
  if (accuracy > 0.85 && consecutiveCorrect >= 5) {
    return Math.max(500, state.flashDuration - 100)
  }
  
  // Aumentar duración si accuracy baja
  if (accuracy < 0.6) {
    return Math.min(1500, state.flashDuration + 200)
  }
  
  return state.flashDuration
}
```

#### Observaciones y Notas de Accesibilidad

- ✅ Opción de ajustar duración manualmente
- ✅ Modo "sin tiempo" para práctica
- ✅ Fuente de alto contraste
- ✅ Opción de escuchar palabra después
- ⚠️ Advertencia: Puede causar fatiga visual. Limitar a 5 min/sesión

---

### JUEGO 4: Historias Ilustradas
**Categoría:** Comprensión Lectora

#### Nombre
Historias Ilustradas

#### Objetivo Pedagógico
Desarrollar comprensión lectora mediante narrativas cortas con apoyo visual. Trabaja inferencia, secuenciación y memoria de trabajo.

**Evidencia:** Las ilustraciones mejoran comprensión en lectores principiantes (Carney & Levin, 2002). Las preguntas intercaladas aumentan retención (Roediger & Karpicke, 2006).

#### Edad Recomendada
7-11 años (2º-5º grado)

#### Niveles y Progresión

| Nivel | Longitud | Complejidad | Preguntas |
|-------|----------|-------------|-----------|
| 1 | 30-50 palabras | Narrativa simple, presente | 3 literales |
| 2 | 50-80 palabras | Pasado simple, diálogos | 3 (2 lit + 1 inf) |
| 3 | 80-120 palabras | Conectores, causa-efecto | 4 (2 lit + 2 inf) |
| 4 | 120-180 palabras | Metáforas, múltiples personajes | 5 (2 lit + 3 inf) |

#### Dinámica (Step-by-Step)

1. **Introducción (5s)**
   - Lex: "¡Leamos una historia juntos!"
   - Mostrar título e ilustración principal

2. **Lectura (60-180s)**
   - Texto en párrafos cortos
   - Ilustraciones intercaladas
   - Opción de audio (TTS o narración)
   - Resaltar palabra al leer (karaoke style)

3. **Preguntas (30s cada una)**
   - Pregunta de comprensión
   - 3-4 opciones de respuesta
   - Feedback inmediato

4. **Resumen (10s)**
   - Puntuación total
   - Mensaje personalizado
   - Opción de releer

#### Recursos Visuales/Audio

**Visuales:**
- Ilustraciones estilo storybook (acuarela digital)
- Texto: Fuente legible (OpenDyslexic o Comic Sans), 18-22px
- Espaciado: 1.5-2x line-height
- Colores: Paleta cálida y amigable

**Audio:**
- Narración profesional (voz cálida, expresiva)
- Música de fondo ambiental (muy suave)
- Efectos de sonido para acciones (pasos, puertas, etc.)

#### Feedback Positivo/Negativo

**Acierto:**
- "¡Exacto! Leíste con mucha atención"
- "¡Bien! Entendiste la historia perfectamente"

**Error:**
- "Mmm, releamos esta parte juntos"
- "Casi. ¿Qué decía aquí? [resaltar párrafo]"

#### Métricas a Registrar

```json
{
  "eventType": "story_session",
  "gameId": "historias-ilustradas",
  "sessionId": "uuid-v4",
  "userId": "user-123",
  "timestamp": "2025-01-15T10:45:00Z",
  "storyId": "el-gato-curioso",
  "level": 2,
  "wordCount": 75,
  "readingTime": 95.5,
  "audioUsed": true,
  "questions": [
    {
      "questionId": "q1",
      "type": "literal",
      "isCorrect": true,
      "timeToAnswer": 8.2
    },
    {
      "questionId": "q2",
      "type": "inferential",
      "isCorrect": false,
      "timeToAnswer": 15.3
    }
  ],
  "accuracy": 0.67,
  "wordsPerMinute": 47,
  "metadata": {
    "rereadCount": 1,
    "pauseCount": 2
  }
}
```

#### Criterio Mínimo de Éxito

**Por sesión:**
- Completar 1-2 historias
- Accuracy ≥ 60% en preguntas
- Leer hasta el final (no abandonar)

**Por 4 semanas:**
- Accuracy ≥ 75%
- Velocidad: +10 palabras por minuto
- Responder correctamente ≥70% preguntas inferenciales

#### Pseudocódigo Adaptativo

```typescript
function selectStory(userHistory: ReadingHistory): Story {
  const { avgAccuracy, avgWPM, lastStories } = userHistory
  
  // Seleccionar nivel basado en accuracy
  let targetLevel = 1
  if (avgAccuracy > 0.75) targetLevel = 2
  if (avgAccuracy > 0.85 && avgWPM > 60) targetLevel = 3
  if (avgAccuracy > 0.90 && avgWPM > 80) targetLevel = 4
  
  // Evitar repetir historias recientes
  const availableStories = stories
    .filter(s => s.level === targetLevel)
    .filter(s => !lastStories.includes(s.id))
  
  return randomChoice(availableStories)
}
```

#### Observaciones y Notas de Accesibilidad

- ✅ Opción de audio completo (no solo TTS)
- ✅ Ajustar tamaño de fuente (16-28px)
- ✅ Modo alto contraste
- ✅ Pausar/reanudar en cualquier momento
- ✅ Marcador de progreso visual
- ✅ Opción de releer párrafos individuales

---

### JUEGO 5: Eco de Palabras Plus
**Categoría:** Memoria Verbal de Trabajo

#### Nombre
Eco de Palabras Plus

#### Objetivo Pedagógico
Fortalecer memoria verbal de trabajo mediante repetición de secuencias de palabras. Mejora span auditivo y atención sostenida.

**Evidencia:** El entrenamiento de memoria de trabajo puede mejorar habilidades cognitivas relacionadas (Melby-Lervåg & Hulme, 2013). [NEEDS_VERIFICATION: Transferencia a lectura en niños con dislexia]

#### Edad Recomendada
7-11 años (2º-5º grado)

#### Niveles y Progresión

| Nivel | Cantidad Palabras | Velocidad | Categoría |
|-------|------------------|-----------|-----------|
| 1 | 2-3 palabras | Lenta (1 palabra/2s) | Objetos comunes |
| 2 | 3-4 palabras | Media (1 palabra/1.5s) | Animales |
| 3 | 4-5 palabras | Media-rápida (1 palabra/1s) | Mixto |
| 4 | 5-7 palabras | Rápida (1 palabra/0.8s) | Abstracto |

#### Dinámica (Step-by-Step)

1. **Preparación (3s)**
   - Lex: "¡Escuchá y repetí en orden!"
   - Mostrar cantidad de palabras a recordar

2. **Presentación (4-14s)**
   - Reproducir secuencia de palabras
   - Mostrar imagen de cada palabra brevemente
   - Sin texto escrito

3. **Pausa (2s)**
   - Pantalla en blanco
   - Mensaje: "¿Cuál era el orden?"

4. **Respuesta (30s)**
   - Mostrar todas las palabras desordenadas
   - Usuario toca en el orden correcto
   - Feedback visual al seleccionar cada una

5. **Validación (3s)**
   - Reproducir secuencia original
   - Mostrar aciertos/errores

#### Recursos Visuales/Audio

**Visuales:**
- Imágenes simples, fondo transparente
- Animación de "pulso" al reproducir cada palabra
- Números de orden (1, 2, 3...) al seleccionar

**Audio:**
- Voz clara, pausada
- Tono neutro (no emocional para no distraer)
- Efecto de "ding" al seleccionar correctamente

#### Feedback Positivo/Negativo

**Acierto:**
- "¡Memoria perfecta! Todas en orden 🧠"
- "¡Increíble! Recordaste las 5 palabras"

**Error parcial:**
- "Casi. Eran: GATO - MESA - SOL"
- "¡Bien! 3 de 4 correctas"

#### Métricas a Registrar

```json
{
  "eventType": "memory_game_attempt",
  "gameId": "eco-palabras-plus",
  "sessionId": "uuid-v4",
  "userId": "user-123",
  "timestamp": "2025-01-15T10:50:00Z",
  "level": 2,
  "sequenceLength": 4,
  "targetSequence": ["gato", "mesa", "sol", "flor"],
  "userSequence": ["gato", "mesa", "flor", "sol"],
  "correctPositions": 2,
  "accuracy": 0.5,
  "timeToComplete": 18.7,
  "metadata": {
    "maxSpan": 4,
    "avgSpan": 3.2
  }
}
```

#### Criterio Mínimo de Éxito

**Por sesión:**
- Completar 8-10 secuencias
- Accuracy ≥ 60%
- Span máximo ≥ 3 palabras

**Por 4 semanas:**
- Accuracy ≥ 75%
- Span máximo ≥ 5 palabras
- Mejora de +1 palabra en span promedio

#### Pseudocódigo Adaptativo

```typescript
function adjustSequenceLength(state: MemoryState): number {
  const { accuracy, currentSpan, consecutiveCorrect } = state
  
  // Aumentar span tras 2 aciertos perfectos
  if (accuracy === 1.0 && consecutiveCorrect >= 2) {
    return Math.min(7, currentSpan + 1)
  }
  
  // Reducir span tras 2 errores con accuracy <50%
  if (accuracy < 0.5 && state.consecutiveErrors >= 2) {
    return Math.max(2, currentSpan - 1)
  }
  
  return currentSpan
}
```

#### Observaciones y Notas de Accesibilidad

- ✅ Opción de repetir secuencia 1 vez
- ✅ Velocidad ajustable (lenta/media/rápida)
- ✅ Apoyo visual (imágenes) además de audio
- ✅ Sin penalización por tiempo
- ✅ Feedback constructivo en errores

---

## 3. JUEGOS ESPECÍFICOS PARA DISCALCULIA

### JUEGO 6: Línea Numérica
**Categoría:** Sentido Numérico (Discalculia)

#### Nombre
Línea Numérica

#### Objetivo Pedagógico
Desarrollar representación mental de magnitudes numéricas mediante posicionamiento en recta numérica. Fortalece el sentido numérico y la estimación.

**Evidencia:** La práctica con líneas numéricas mejora precisión en estimación y cálculo (Siegler & Ramani, 2009). Efectivo en niños con discalculia (Kucian et al., 2011).

#### Edad Recomendada
6-10 años (1º-4º grado)

#### Niveles y Progresión

| Nivel | Rango | Incrementos | Dificultad |
|-------|-------|-------------|------------|
| 1 | 0-10 | Enteros | Números visibles |
| 2 | 0-20 | Enteros | Solo extremos visibles |
| 3 | 0-100 | Múltiplos de 5 | Solo extremos |
| 4 | 0-100 | Cualquier número | Solo extremos |

#### Dinámica (Step-by-Step)

1. **Presentación (5s)**
   - Mostrar línea numérica horizontal
   - Marcar extremos (0 y 10/20/100)
   - Lex: "¿Dónde va el número X?"

2. **Interacción (30s)**
   - Usuario arrastra marcador sobre la línea
   - Feedback visual en tiempo real (distancia)
   - Soltar para confirmar posición

3. **Validación (3s)**
   - Mostrar posición correcta
   - Calcular error (distancia)
   - Feedback según precisión

4. **Siguiente (2s)**
   - Nuevo número
   - Progreso visible

#### Recursos Visuales/Audio

**Visuales:**
- Línea gruesa (8px), color primario
- Marcador: Círculo grande (60px), arrastrable
- Animación de "snap" al soltar
- Zona de tolerancia visual (±10% verde, ±20% amarillo)

**Audio:**
- TTS del número objetivo
- Sonido de "deslizar" al arrastrar
- Feedback: Campanita (preciso), aplauso (cercano), "casi" (lejano)

#### Feedback Positivo/Negativo

**Muy preciso (<5% error):**
- "¡Perfecto! El 7 va justo ahí 🎯"

**Cercano (5-15% error):**
- "¡Muy bien! Casi exacto"

**Lejano (>15% error):**
- "Mmm, el 7 va más cerca del 10. Probá otra vez"

#### Métricas a Registrar

```json
{
  "eventType": "number_line_attempt",
  "gameId": "linea-numerica",
  "sessionId": "uuid-v4",
  "userId": "user-123",
  "timestamp": "2025-01-15T11:00:00Z",
  "level": 2,
  "range": [0, 20],
  "targetNumber": 7,
  "userPosition": 6.8,
  "correctPosition": 7.0,
  "errorPercent": 1.0,
  "timeToPlace": 5.3,
  "metadata": {
    "avgError": 8.5,
    "improvementRate": 0.15
  }
}
```

#### Criterio Mínimo de Éxito

**Por sesión:**
- Completar 10-15 números
- Error promedio <20%
- Mejora visible en últimos 5 intentos

**Por 4 semanas:**
- Error promedio <10%
- Progresión a nivel 3
- Tiempo de respuesta <8s promedio

#### Pseudocódigo Adaptativo

```typescript
function calculateFeedback(error: number, range: number): Feedback {
  const errorPercent = (error / range) * 100
  
  if (errorPercent < 5) {
    return { type: "excellent", stars: 3, message: "¡Perfecto!" }
  } else if (errorPercent < 15) {
    return { type: "good", stars: 2, message: "¡Muy bien!" }
  } else {
    return { type: "retry", stars: 1, message: "Probá otra vez" }
  }
}
```

#### Observaciones y Notas de Accesibilidad

- ✅ Línea con alto contraste
- ✅ Marcador grande (fácil de arrastrar)
- ✅ Feedback visual + auditivo
- ✅ Sin límite de tiempo estricto
- ✅ Opción de usar teclado (flechas) en lugar de arrastrar

---

### JUEGO 7: Comparador Visual
**Categoría:** Comparación de Magnitudes (Discalculia)

#### Nombre
Comparador Visual

#### Objetivo Pedagógico
Desarrollar habilidad de comparación rápida de cantidades mediante representaciones visuales. Fortalece el sentido numérico no simbólico.

**Evidencia:** La comparación de magnitudes es fundamental para el desarrollo matemático (Halberda et al., 2008). Déficit en esta área es común en discalculia (Piazza et al., 2010).

#### Edad Recomendada
6-9 años (1º-3º grado)

#### Niveles y Progresión

| Nivel | Rango | Diferencia | Representación |
|-------|-------|------------|----------------|
| 1 | 1-10 | Grande (≥3) | Objetos discretos |
| 2 | 1-20 | Media (2-3) | Objetos discretos |
| 3 | 1-50 | Pequeña (1-2) | Puntos/barras |
| 4 | 1-100 | Variable | Abstracto (números) |

#### Dinámica (Step-by-Step)

1. **Presentación (2s)**
   - Mostrar dos grupos de objetos lado a lado
   - Lex: "¿Cuál tiene más?"

2. **Flash (1-3s)**
   - Mostrar grupos brevemente
   - Evitar conteo uno por uno (forzar estimación)

3. **Respuesta (10s)**
   - Usuario toca el lado con más objetos
   - Feedback inmediato

4. **Validación (2s)**
   - Mostrar cantidades exactas
   - Confirmar respuesta

#### Recursos Visuales/Audio

**Visuales:**
- Objetos: Círculos de colores, distribuidos aleatoriamente
- Tamaño variable para evitar usar área como pista
- Animación de "zoom" al seleccionar

**Audio:**
- Pregunta: "¿Cuál tiene más?"
- Feedback: "¡Sí! 8 es más que 5"

#### Feedback Positivo/Negativo

**Acierto:**
- "¡Correcto! 8 > 5"
- "¡Excelente ojo! Viste que había más"

**Error:**
- "Mmm, este lado tenía 8 y este 5. ¿Cuál es mayor?"

#### Métricas a Registrar

```json
{
  "eventType": "comparison_attempt",
  "gameId": "comparador-visual",
  "sessionId": "uuid-v4",
  "userId": "user-123",
  "timestamp": "2025-01-15T11:05:00Z",
  "level": 2,
  "leftQuantity": 8,
  "rightQuantity": 5,
  "difference": 3,
  "userChoice": "left",
  "isCorrect": true,
  "reactionTime": 1.8,
  "flashDuration": 2000,
  "metadata": {
    "accuracyByDifference": {
      "1": 0.65,
      "2": 0.80,
      "3+": 0.95
    }
  }
}
```

#### Criterio Mínimo de Éxito

**Por sesión:**
- Completar 15-20 comparaciones
- Accuracy ≥ 70%
- Tiempo de reacción <3s promedio

**Por 4 semanas:**
- Accuracy ≥ 85%
- Accuracy con diferencia=1: ≥70%
- Progresión a nivel 3

#### Pseudocódigo Adaptativo

```typescript
function adjustDifficulty(state: ComparisonState): ComparisonState {
  const { accuracy, level } = state
  
  // Reducir diferencia si accuracy alta
  if (accuracy > 0.85 && level < 4) {
    return {
      ...state,
      level: level + 1,
      minDifference: Math.max(1, state.minDifference - 1)
    }
  }
  
  // Aumentar diferencia si accuracy baja
  if (accuracy < 0.65 && level > 1) {
    return {
      ...state,
      level: level - 1,
      minDifference: Math.min(5, state.minDifference + 1)
    }
  }
  
  return state
}
```

#### Observaciones y Notas de Accesibilidad

- ✅ Objetos de alto contraste
- ✅ Distribución aleatoria (evitar patrones)
- ✅ Tamaño de objetos variable (evitar usar área)
- ✅ Opción de mostrar números después
- ✅ Sin penalización por tiempo

---

### JUEGO 8: Operaciones Visuales
**Categoría:** Cálculo con Apoyo Visual (Discalculia)

#### Nombre
Operaciones Visuales

#### Objetivo Pedagógico
Desarrollar comprensión de operaciones básicas (suma/resta) mediante representaciones concretas. Transición de concreto a abstracto.

**Evidencia:** El uso de manipulativos virtuales mejora comprensión matemática (Moyer-Packenham & Westenskow, 2013). Efectivo en discalculia (Butterworth & Laurillard, 2010).

#### Edad Recomendada
6-10 años (1º-4º grado)

#### Niveles y Progresión

| Nivel | Operación | Rango | Apoyo Visual |
|-------|-----------|-------|--------------|
| 1 | Suma | 1-10 | Objetos + animación |
| 2 | Suma/Resta | 1-20 | Objetos + números |
| 3 | Suma/Resta | 1-50 | Barras + números |
| 4 | Multiplicación | Tablas 2-5 | Grupos + números |

#### Dinámica (Step-by-Step)

1. **Presentación (5s)**
   - Mostrar operación: "3 + 5 = ?"
   - Lex: "¡Sumemos juntos!"

2. **Visualización (5s)**
   - Mostrar 3 objetos
   - Animación: Aparecen 5 objetos más
   - Agrupar todos juntos

3. **Conteo (10s)**
   - Usuario puede tocar objetos para contar
   - Números aparecen al tocar (1, 2, 3...)

4. **Respuesta (20s)**
   - Mostrar teclado numérico (0-9)
   - Usuario ingresa resultado

5. **Validación (3s)**
   - Feedback visual y auditivo
   - Mostrar proceso completo si error

#### Recursos Visuales/Audio

**Visuales:**
- Objetos: Cubos 3D coloridos
- Animación: Objetos "vuelan" y se agrupan
- Números grandes, fuente clara
- Teclado numérico grande (botones 60x60px)

**Audio:**
- Narración: "Tres más cinco es igual a..."
- Conteo: "Uno, dos, tres..." al tocar objetos
- Feedback: Celebración o ánimo

#### Feedback Positivo/Negativo

**Acierto:**
- "¡Perfecto! 3 + 5 = 8 🎉"
- "¡Sumaste genial! Mirá: [mostrar objetos]"

**Error:**
- "Mmm, contemos juntos: 1, 2, 3... 8 en total"
- "Casi. Mirá: [repetir animación]"

#### Métricas a Registrar

```json
{
  "eventType": "operation_attempt",
  "gameId": "operaciones-visuales",
  "sessionId": "uuid-v4",
  "userId": "user-123",
  "timestamp": "2025-01-15T11:10:00Z",
  "level": 2,
  "operation": "addition",
  "operand1": 3,
  "operand2": 5,
  "correctAnswer": 8,
  "userAnswer": 8,
  "isCorrect": true,
  "timeToAnswer": 12.5,
  "objectsTouched": 8,
  "visualAidUsed": true,
  "metadata": {
    "accuracyByOperation": {
      "addition": 0.85,
      "subtraction": 0.70
    }
  }
}
```

#### Criterio Mínimo de Éxito

**Por sesión:**
- Completar 10-15 operaciones
- Accuracy ≥ 65%
- Usar apoyo visual cuando necesario

**Por 4 semanas:**
- Accuracy ≥ 80%
- Reducir uso de apoyo visual en 30%
- Tiempo promedio <15s por operación

#### Pseudocódigo Adaptativo

```typescript
function selectOperation(userHistory: MathHistory): Operation {
  const { weakOperations, strongOperations } = userHistory
  
  // 70% operaciones débiles, 30% repaso
  const operations = [
    ...weakOperations.slice(0, 7),
    ...strongOperations.slice(0, 3)
  ]
  
  return shuffle(operations)[0]
}

function adjustVisualSupport(accuracy: number): VisualLevel {
  if (accuracy < 0.6) return "full" // Objetos + animación + conteo
  if (accuracy < 0.8) return "partial" // Objetos + números
  return "minimal" // Solo números
}
```

#### Observaciones y Notas de Accesibilidad

- ✅ Objetos grandes, fáciles de tocar
- ✅ Conteo auditivo disponible
- ✅ Opción de repetir animación
- ✅ Teclado numérico grande
- ✅ Sin límite de tiempo
- ✅ Feedback constructivo en errores

---

## 4. SISTEMA ADAPTATIVO GLOBAL

### Arquitectura del Sistema

```typescript
interface AdaptiveEngine {
  userId: string
  currentSession: Session
  userProfile: UserProfile
  adaptiveRules: AdaptiveRules
}

interface UserProfile {
  age: number
  grade: number
  diagnosedConditions: string[] // ["dyslexia", "dyscalculia"]
  skillLevels: {
    phonologicalAwareness: number // 1-10
    vocabulary: number
    fluency: number
    comprehension: number
    numericalSense: number
    calculation: number
  }
  preferences: {
    audioSpeed: number // 0.8, 1.0, 1.2
    fontSize: number // 16-28
    colorScheme: "default" | "highContrast"
  }
}

interface Session {
  sessionId: string
  gameId: string
  startTime: Date
  attempts: Attempt[]
  currentLevel: number
  consecutiveCorrect: number
  consecutiveErrors: number
  hintsUsed: number
}

interface Attempt {
  attemptId: string
  timestamp: Date
  isCorrect: boolean
  timeToAnswer: number
  difficulty: number
  metadata: Record<string, any>
}
```

### Reglas de Adaptación

```typescript
class AdaptiveRules {
  // Regla 1: Ajuste de nivel por rendimiento
  adjustLevel(session: Session): number {
    const { consecutiveCorrect, consecutiveErrors, currentLevel } = session
    
    // Subir nivel
    if (consecutiveCorrect >= 3 && currentLevel < 10) {
      return currentLevel + 1
    }
    
    // Bajar nivel
    if (consecutiveErrors >= 2 && currentLevel > 1) {
      return currentLevel - 1
    }
    
    return currentLevel
  }
  
  // Regla 2: Pistas automáticas
  shouldOfferHint(session: Session): boolean {
    const { consecutiveErrors, hintsUsed } = session
    
    // Ofrecer pista tras 3 errores consecutivos
    if (consecutiveErrors >= 3 && hintsUsed < 3) {
      return true
    }
    
    return false
  }
  
  // Regla 3: Spaced Repetition
  selectContent(userHistory: UserHistory, gameId: string): Content {
    const weakContent = userHistory.getWeakContent(gameId)
    const dueForReview = userHistory.getDueForReview(gameId)
    const newContent = userHistory.getNewContent(gameId)
    
    // Prioridad: débil > revisión > nuevo
    const pool = [
      ...weakContent.slice(0, 5),
      ...dueForReview.slice(0, 3),
      ...newContent.slice(0, 2)
    ]
    
    return shuffle(pool)[0]
  }
  
  // Regla 4: Ajuste de dificultad por tiempo
  adjustDifficultyByTime(session: Session): DifficultyAdjustment {
    const avgTime = session.getAverageTimeToAnswer()
    const targetTime = session.getTargetTime()
    
    if (avgTime < targetTime * 0.7) {
      // Usuario muy rápido → aumentar dificultad
      return { action: "increase", reason: "fast_response" }
    }
    
    if (avgTime > targetTime * 1.5) {
      // Usuario lento → reducir dificultad
      return { action: "decrease", reason: "slow_response" }
    }
    
    return { action: "maintain", reason: "optimal_pace" }
  }
  
  // Regla 5: Detección de fatiga
  detectFatigue(session: Session): boolean {
    const recentAttempts = session.attempts.slice(-5)
    const recentAccuracy = recentAttempts.filter(a => a.isCorrect).length / 5
    const recentTime = recentAttempts.reduce((sum, a) => sum + a.timeToAnswer, 0) / 5
    
    // Fatiga si accuracy baja Y tiempo aumenta
    if (recentAccuracy < 0.5 && recentTime > session.getAverageTimeToAnswer() * 1.3) {
      return true
    }
    
    return false
  }
  
  // Regla 6: Recomendación de descanso
  shouldRecommendBreak(session: Session): boolean {
    const duration = Date.now() - session.startTime.getTime()
    const fatigueDetected = this.detectFatigue(session)
    
    // Descanso tras 10 min o si hay fatiga
    if (duration > 10 * 60 * 1000 || fatigueDetected) {
      return true
    }
    
    return false
  }
}
```

### Implementación de Spaced Repetition

```typescript
interface SpacedRepetitionItem {
  contentId: string
  lastSeen: Date
  timesReviewed: number
  accuracy: number
  nextReview: Date
  interval: number // días
}

class SpacedRepetition {
  // Algoritmo SM-2 simplificado
  calculateNextReview(item: SpacedRepetitionItem, performance: number): SpacedRepetitionItem {
    let newInterval = item.interval
    
    if (performance >= 0.8) {
      // Buen rendimiento → aumentar intervalo
      newInterval = item.interval * 2
    } else if (performance >= 0.6) {
      // Rendimiento medio → mantener intervalo
      newInterval = item.interval
    } else {
      // Bajo rendimiento → resetear intervalo
      newInterval = 1
    }
    
    return {
      ...item,
      lastSeen: new Date(),
      timesReviewed: item.timesReviewed + 1,
      accuracy: performance,
      nextReview: addDays(new Date(), newInterval),
      interval: newInterval
    }
  }
  
  // Seleccionar contenido para revisión
  selectForReview(items: SpacedRepetitionItem[]): SpacedRepetitionItem[] {
    const now = new Date()
    
    return items
      .filter(item => item.nextReview <= now)
      .sort((a, b) => {
        // Prioridad: accuracy baja > vencido hace más tiempo
        if (a.accuracy !== b.accuracy) {
          return a.accuracy - b.accuracy
        }
        return a.nextReview.getTime() - b.nextReview.getTime()
      })
  }
}
```

---

## 5. ESQUEMAS JSON PARA SUPABASE

### Tabla: game_sessions

```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  game_id VARCHAR(50) NOT NULL,
  session_start TIMESTAMP NOT NULL DEFAULT NOW(),
  session_end TIMESTAMP,
  level_start INTEGER NOT NULL,
  level_end INTEGER,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  time_spent_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game ON game_sessions(game_id);
CREATE INDEX idx_game_sessions_date ON game_sessions(session_start);
```

### Tabla: game_attempts

```sql
CREATE TABLE game_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id),
  attempt_number INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  level INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_to_answer FLOAT NOT NULL,
  hint_used BOOLEAN DEFAULT FALSE,
  content_id VARCHAR(100), -- ID del contenido específico (palabra, número, etc.)
  user_response TEXT,
  correct_response TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_game_attempts_session ON game_attempts(session_id);
CREATE INDEX idx_game_attempts_content ON game_attempts(content_id);
```

### Tabla: user_progress

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  game_id VARCHAR(50) NOT NULL,
  current_level INTEGER DEFAULT 1,
  max_level_reached INTEGER DEFAULT 1,
  total_sessions INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  accuracy FLOAT DEFAULT 0,
  last_played TIMESTAMP,
  skill_metrics JSONB, -- Métricas específicas por juego
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_game ON user_progress(game_id);
```

### Tabla: spaced_repetition_items

```sql
CREATE TABLE spaced_repetition_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  game_id VARCHAR(50) NOT NULL,
  content_id VARCHAR(100) NOT NULL,
  content_type VARCHAR(50), -- "word", "number", "operation", etc.
  last_seen TIMESTAMP NOT NULL,
  times_reviewed INTEGER DEFAULT 0,
  accuracy FLOAT DEFAULT 0,
  next_review TIMESTAMP NOT NULL,
  interval_days INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id, content_id)
);

CREATE INDEX idx_sr_items_user ON spaced_repetition_items(user_id);
CREATE INDEX idx_sr_items_next_review ON spaced_repetition_items(next_review);
```

### Ejemplos de Payloads JSON

#### Evento: Inicio de sesión

```json
{
  "eventType": "session_start",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "gameId": "cazador-sonidos",
  "timestamp": "2025-01-15T10:30:00Z",
  "level": 2,
  "metadata": {
    "deviceType": "tablet",
    "platform": "web",
    "userAgent": "Mozilla/5.0..."
  }
}
```

#### Evento: Intento de ejercicio

```json
{
  "eventType": "exercise_attempt",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "attemptId": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "user-123",
  "gameId": "cazador-sonidos",
  "timestamp": "2025-01-15T10:31:30Z",
  "attemptNumber": 5,
  "level": 2,
  "contentId": "word-manzana",
  "targetSound": "m",
  "userResponse": "manzana",
  "correctResponse": "manzana",
  "isCorrect": true,
  "timeToAnswer": 4.5,
  "hintUsed": false,
  "metadata": {
    "audioPlayed": ["target_sound", "word_manzana"],
    "consecutiveCorrect": 3
  }
}
```

#### Evento: Fin de sesión

```json
{
  "eventType": "session_end",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user-123",
  "gameId": "cazador-sonidos",
  "timestamp": "2025-01-15T10:40:00Z",
  "levelStart": 2,
  "levelEnd": 3,
  "totalAttempts": 12,
  "correctAttempts": 10,
  "accuracy": 0.83,
  "hintsUsed": 2,
  "timeSpentSeconds": 600,
  "completed": true,
  "metadata": {
    "maxConsecutiveCorrect": 5,
    "avgTimePerAttempt": 50,
    "levelUpAchieved": true
  }
}
```

---

## 6. CHECKLIST DE ACCESIBILIDAD Y UX

### Accesibilidad (WCAG AA)

#### Visual
- [ ] Contraste texto/fondo ≥ 4.5:1 (texto normal)
- [ ] Contraste texto/fondo ≥ 3:1 (texto grande >18px)
- [ ] Tamaño de fuente ≥ 16px (ajustable hasta 28px)
- [ ] Line-height ≥ 1.5 para párrafos
- [ ] Opción de alto contraste
- [ ] Opción de reducir movimiento (prefers-reduced-motion)
- [ ] Sin uso de color como único indicador
- [ ] Iconos + texto para acciones importantes

#### Auditivo
- [ ] Alternativa de audio para todas las consignas
- [ ] Subtítulos/transcripciones disponibles
- [ ] Control de volumen independiente
- [ ] Opción de desactivar música de fondo
- [ ] Velocidad de audio ajustable (0.8x, 1x, 1.2x)

#### Motor
- [ ] Touch targets ≥ 44x44px
- [ ] Espaciado entre botones ≥ 8px
- [ ] Navegación por teclado completa (Tab, Enter, Space, Arrows)
- [ ] Sin requerir gestos complejos (pellizcar, rotar)
- [ ] Opción de usar teclado en lugar de arrastrar
- [ ] Timeout generoso (≥60s) o desactivable

#### Cognitivo
- [ ] Instrucciones simples y claras
- [ ] Opción de repetir instrucciones
- [ ] Feedback inmediato y constructivo
- [ ] Sin sobrecarga de información
- [ ] Progreso visible en todo momento
- [ ] Opción de pausar/reanudar
- [ ] Sin penalización por tiempo (excepto en juegos de velocidad)

#### ARIA y Semántica
- [ ] Roles ARIA apropiados (button, region, alert)
- [ ] Labels descriptivos en todos los controles
- [ ] Live regions para feedback dinámico
- [ ] Estructura de headings lógica (h1, h2, h3)
- [ ] Landmarks (main, nav, aside)

### UX Infantil

#### Engagement
- [ ] Mascota (Lex/Lumo) presente y activa
- [ ] Feedback positivo constante
- [ ] Microrecompensas (estrellas, sonidos, animaciones)
- [ ] Progreso visible (barra, contador)
- [ ] Celebraciones al completar niveles
- [ ] Variedad en actividades (evitar monotonía)

#### Claridad
- [ ] Objetivo del juego claro desde el inicio
- [ ] Controles intuitivos (sin tutorial extenso)
- [ ] Feedback visual + auditivo + textual
- [ ] Errores explicados constructivamente
- [ ] Siguiente paso siempre obvio

#### Motivación
- [ ] Dificultad adaptativa (ni muy fácil ni muy difícil)
- [ ] Sensación de progreso constante
- [ ] Recompensas frecuentes (cada 2-3 aciertos)
- [ ] Mensajes personalizados
- [ ] Opción de repetir para mejorar puntuación

#### Seguridad Emocional
- [ ] Sin mensajes negativos ("mal", "incorrecto", "error")
- [ ] Lenguaje positivo ("probá otra vez", "casi", "vamos")
- [ ] Sin comparaciones con otros niños
- [ ] Sin presión de tiempo excesiva
- [ ] Opción de salir sin penalización

---

## 7. RECOMENDACIONES DE ASSETS Y OPTIMIZACIÓN

### Formatos y Tamaños

#### Imágenes

| Tipo | Formato | Tamaño | Compresión |
|------|---------|--------|------------|
| Ilustraciones | WebP | 512x512px | 80% quality |
| Iconos | SVG | Vectorial | Minificado |
| Fotos | WebP/AVIF | 1024x1024px | 75% quality |
| Sprites | PNG | Variable | TinyPNG |

**Estrategia:**
- Usar `<picture>` con fallback: WebP → AVIF → PNG
- Lazy loading para imágenes fuera de viewport
- Preload para imágenes críticas (mascota, primer nivel)
- Sprites para iconos pequeños (reducir HTTP requests)

#### Audio

| Tipo | Formato | Bitrate | Duración |
|------|---------|---------|----------|
| Voz (TTS) | MP3/WebM Opus | 64-96 kbps | 1-5s |
| Efectos | MP3 | 128 kbps | <1s |
| Música | MP3 | 128 kbps | Loop 30-60s |

**Estrategia:**
- Usar Web Audio API para efectos (mejor control)
- Preload audio crítico (feedback, mascota)
- Lazy load música de fondo
- Comprimir con Audacity (normalizar, reducir ruido)

#### Animaciones

| Tipo | Formato | Tamaño | Duración |
|------|---------|--------|----------|
| Feedback | Lottie JSON | <50KB | 0.5-2s |
| Transiciones | CSS/Framer Motion | N/A | 0.2-0.5s |
| Mascota | Lottie JSON | <100KB | 1-3s |

**Estrategia:**
- Preferir CSS animations para transiciones simples
- Lottie para animaciones complejas (exportar desde After Effects)
- Framer Motion para animaciones interactivas
- Evitar GIFs (usar video o Lottie)

### Estructura de Carpetas

```
/public/
├── games/
│   ├── cazador-sonidos/
│   │   ├── images/
│   │   │   ├── avion.webp
│   │   │   ├── manzana.webp
│   │   │   └── ...
│   │   ├── audio/
│   │   │   ├── sounds/
│   │   │   ├── words/
│   │   │   └── feedback/
│   │   └── animations/
│   │       ├── star.json
│   │       └── sparkle.json
│   ├── palabras-magicas/
│   │   └── ...
│   └── ...
├── mascots/
│   ├── lex-happy.json
│   ├── lex-thinking.json
│   ├── lumo-excited.json
│   └── ...
└── shared/
    ├── audio/
    │   ├── success.mp3
    │   ├── error.mp3
    │   └── click.mp3
    └── animations/
        ├── confetti.json
        └── loading.json
```

### Optimización de Carga

```typescript
// Preload crítico
const preloadAssets = [
  '/mascots/lex-happy.json',
  '/shared/audio/success.mp3',
  '/shared/audio/error.mp3'
]

// Lazy load por juego
const loadGameAssets = async (gameId: string) => {
  const images = await import(`/public/games/${gameId}/images`)
  const audio = await import(`/public/games/${gameId}/audio`)
  return { images, audio }
}

// Service Worker para cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('lecxico-v1').then((cache) => {
      return cache.addAll(preloadAssets)
    })
  )
})
```

---

## 8. KPIs Y MÉTRICAS DE ÉXITO

### KPIs por Juego

| Métrica | Objetivo | Cálculo |
|---------|----------|---------|
| **Accuracy** | ≥75% | (correctos / total) × 100 |
| **Completion Rate** | ≥80% | (sesiones completadas / iniciadas) × 100 |
| **Avg Time per Attempt** | Variable | Σ(tiempo) / total intentos |
| **Hints Rate** | ≤20% | (intentos con pista / total) × 100 |
| **Retention 7d** | ≥60% | Usuarios que vuelven en 7 días |
| **Level Progression** | +1 nivel/semana | Nivel promedio por semana |
| **Engagement Time** | 5-10 min/sesión | Tiempo promedio por sesión |

### Métricas Agregadas (Plataforma)

```typescript
interface PlatformMetrics {
  // Engagement
  dailyActiveUsers: number
  weeklyActiveUsers: number
  avgSessionsPerWeek: number
  avgTimePerSession: number // minutos
  
  // Performance
  overallAccuracy: number // 0-1
  avgLevelAcrossGames: number
  skillImprovementRate: number // % mejora por semana
  
  // Retention
  retention1d: number // % usuarios que vuelven al día siguiente
  retention7d: number
  retention30d: number
  churnRate: number
  
  // Completion
  gamesCompletedPerWeek: number
  avgCompletionRate: number
  
  // Adaptive System
  avgLevelAdjustmentsPerSession: number
  hintsUsageRate: number
  fatigueDetectionRate: number
}
```

### Dashboards para Educadores

```typescript
interface EducatorDashboard {
  studentId: string
  studentName: string
  
  // Resumen semanal
  weeklyStats: {
    sessionsCompleted: number
    totalTime: number // minutos
    gamesPlayed: string[]
    avgAccuracy: number
    levelProgression: Record<string, number> // gameId → nivel
  }
  
  // Alertas
  alerts: Alert[]
  
  // Recomendaciones
  recommendations: Recommendation[]
  
  // Gráficos
  charts: {
    accuracyOverTime: DataPoint[]
    timeSpentByGame: Record<string, number>
    skillRadar: SkillLevel[]
  }
}

interface Alert {
  type: "low_accuracy" | "low_engagement" | "fatigue" | "plateau"
  severity: "low" | "medium" | "high"
  message: string
  gameId?: string
  actionable: string // Qué hacer al respecto
}

interface Recommendation {
  type: "game" | "level" | "frequency" | "support"
  message: string
  gameId?: string
  priority: number
}
```

### Queries SQL para KPIs

```sql
-- Accuracy por juego (últimos 7 días)
SELECT 
  game_id,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_attempts,
  ROUND(
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100,
    2
  ) as accuracy_percent
FROM game_attempts ga
JOIN game_sessions gs ON ga.session_id = gs.id
WHERE gs.session_start >= NOW() - INTERVAL '7 days'
  AND gs.user_id = 'user-123'
GROUP BY game_id;

-- Retention 7 días
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE 
    WHEN last_played >= NOW() - INTERVAL '7 days' 
    THEN user_id 
  END) as active_users,
  ROUND(
    COUNT(DISTINCT CASE 
      WHEN last_played >= NOW() - INTERVAL '7 days' 
      THEN user_id 
    END)::FLOAT / COUNT(DISTINCT user_id) * 100,
    2
  ) as retention_7d_percent
FROM user_progress;

-- Progresión de nivel (últimas 4 semanas)
SELECT 
  DATE_TRUNC('week', session_start) as week,
  game_id,
  AVG(level_end) as avg_level
FROM game_sessions
WHERE user_id = 'user-123'
  AND session_start >= NOW() - INTERVAL '4 weeks'
  AND completed = true
GROUP BY week, game_id
ORDER BY week, game_id;
```

---

## 9. PROTOCOLO DE LA VERDAD - REFERENCIAS

### Afirmaciones con Evidencia

1. **Conciencia fonológica como predictor de lectura**
   - Fuente: National Reading Panel (2000). Teaching children to read: An evidence-based assessment of the scientific research literature on reading and its implications for reading instruction.
   - URL: https://www.nichd.nih.gov/publications/pubs/nrp/documents/report.pdf

2. **Vocabulario y exposición repetida**
   - Fuente: Beck, I. L., McKeown, M. G., & Kucan, L. (2013). Bringing words to life: Robust vocabulary instruction (2nd ed.). Guilford Press.

3. **Lectura repetida y fluidez**
   - Fuente: Therrien, W. J. (2004). Fluency and comprehension gains as a result of repeated reading: A meta-analysis. Remedial and Special Education, 25(4), 252-261.

4. **Ilustraciones y comprensión**
   - Fuente: Carney, R. N., & Levin, J. R. (2002). Pictorial illustrations still improve students' learning from text. Educational Psychology Review, 14(1), 5-26.

5. **Líneas numéricas y sentido numérico**
   - Fuente: Siegler, R. S., & Ramani, G. B. (2009). Playing linear number board games—but not circular ones—improves low-income preschoolers' numerical understanding. Journal of Educational Psychology, 101(3), 545-560.

6. **Líneas numéricas en discalculia**
   - Fuente: Kucian, K., Grond, U., Rotzer, S., Henzi, B., Schönmann, C., Plangger, F., ... & von Aster, M. (2011). Mental number line training in children with developmental dyscalculia. NeuroImage, 57(3), 782-795.

7. **Comparación de magnitudes**
   - Fuente: Halberda, J., Mazzocco, M. M., & Feigenson, L. (2008). Individual differences in non-verbal number acuity correlate with maths achievement. Nature, 455(7213), 665-668.

8. **Déficit en comparación (discalculia)**
   - Fuente: Piazza, M., Facoetti, A., Trussardi, A. N., Berteletti, I., Conte, S., Lucangeli, D., ... & Zorzi, M. (2010). Developmental trajectory of number acuity reveals a severe impairment in developmental dyscalculia. Cognition, 116(1), 33-41.

9. **Manipulativos virtuales**
   - Fuente: Moyer-Packenham, P. S., & Westenskow, A. (2013). Effects of virtual manipulatives on student achievement and mathematics learning. International Journal of Virtual and Personal Learning Environments, 4(3), 35-50.

10. **Manipulativos en discalculia**
    - Fuente: Butterworth, B., & Laurillard, D. (2010). Low numeracy and dyscalculia: identification and intervention. ZDM Mathematics Education, 42(6), 527-539.

### Afirmaciones que Requieren Verificación

1. **[NEEDS_VERIFICATION]** Efectividad del formato digital vs. papel para conciencia fonológica
   - Razón: Aunque hay evidencia de que la conciencia fonológica mejora la lectura, la efectividad específica de juegos digitales vs. actividades en papel no está completamente establecida para niños de 6-8 años.

2. **[NEEDS_VERIFICATION]** Efectividad del formato matching digital para vocabulario
   - Razón: La asociación imagen-palabra es efectiva, pero la superioridad del formato digital interactivo sobre métodos tradicionales necesita más investigación.

3. **[NEEDS_VERIFICATION]** RSVP (Rapid Serial Visual Presentation) en niños <8 años
   - Razón: La mayoría de estudios sobre RSVP se han realizado con adultos o niños mayores. La efectividad y seguridad en niños pequeños requiere más evidencia.

4. **[NEEDS_VERIFICATION]** Transferencia de entrenamiento de memoria de trabajo a lectura en dislexia
   - Razón: Aunque el entrenamiento de memoria de trabajo puede mejorar la memoria, la transferencia específica a habilidades de lectura en niños con dislexia es debatida en la literatura.

---

## 10. IMPLEMENTACIÓN TÉCNICA - GUÍA RÁPIDA

### Stack Recomendado

```typescript
// Framework
- Next.js 15 (App Router)
- React 19
- TypeScript 5

// UI
- Tailwind CSS 4
- shadcn/ui
- Framer Motion (animaciones)
- Lottie React (animaciones complejas)

// Audio
- Howler.js (gestión de audio)
- Web Speech API (TTS)

// Database
- Supabase (PostgreSQL + Auth + Storage)

// Analytics
- Vercel Analytics
- Custom telemetry (Supabase)

// Testing
- Vitest (unit tests)
- Playwright (E2E)
```

### Estructura de Componentes

```typescript
// Componente base de juego
interface GameProps {
  userId: string
  gameId: string
  initialLevel?: number
  onComplete: (result: GameResult) => void
  onExit: () => void
}

interface GameResult {
  score: number
  accuracy: number
  timeSpent: number
  levelReached: number
  metrics: GameMetrics
}

// Hook personalizado para lógica de juego
function useGameLogic(gameId: string, userId: string) {
  const [level, setLevel] = useState(1)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [session, setSession] = useState<Session | null>(null)
  
  const adaptiveEngine = useAdaptiveEngine(userId, gameId)
  
  const handleAttempt = (isCorrect: boolean, metadata: any) => {
    // Registrar intento
    const attempt = createAttempt(isCorrect, metadata)
    setAttempts([...attempts, attempt])
    
    // Ajustar dificultad
    const newLevel = adaptiveEngine.adjustLevel(isCorrect)
    setLevel(newLevel)
    
    // Guardar en Supabase
    saveAttempt(attempt)
  }
  
  return { level, attempts, handleAttempt }
}
```

### Ejemplo de Implementación

```typescript
// components/games/cazador-sonidos.tsx
"use client"

import { useState, useEffect } from "react"
import { useGameLogic } from "@/hooks/use-game-logic"
import { useTTS } from "@/hooks/use-tts"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mascot } from "@/components/mascot"

interface CazadorSonidosProps {
  userId: string
  onComplete: (result: GameResult) => void
}

export function CazadorSonidos({ userId, onComplete }: CazadorSonidosProps) {
  const { level, attempts, handleAttempt } = useGameLogic("cazador-sonidos", userId)
  const { speak } = useTTS()
  
  const [currentSound, setCurrentSound] = useState<Sound | null>(null)
  const [options, setOptions] = useState<Word[]>([])
  
  useEffect(() => {
    // Cargar contenido según nivel
    loadContent(level).then(({ sound, words }) => {
      setCurrentSound(sound)
      setOptions(words)
      speak(sound.phoneme)
    })
  }, [level])
  
  const handleAnswer = (word: Word) => {
    const isCorrect = word.startsWithSound(currentSound.phoneme)
    handleAttempt(isCorrect, { word: word.text, sound: currentSound.phoneme })
    
    if (isCorrect) {
      showFeedback("success")
      setTimeout(loadNextRound, 1500)
    } else {
      showFeedback("error")
      speak(`Probá otra vez. El sonido es ${currentSound.phoneme}`)
    }
  }
  
  return (
    <div className="space-y-6">
      <Mascot 
        emotion={attempts.length > 0 && attempts[attempts.length - 1].isCorrect ? "happy" : "thinking"}
        message={getMascotMessage(attempts)}
      />
      
      <Card>
        <div className="grid grid-cols-2 gap-4">
          {options.map((word) => (
            <Button
              key={word.id}
              onClick={() => handleAnswer(word)}
              className="h-32"
            >
              <img src={word.image || "/placeholder.svg"} alt={word.text} />
            </Button>
          ))}
        </div>
      </Card>
    </div>
  )
}
```

---

## CONCLUSIÓN

Este documento proporciona especificaciones completas para 8 juegos educativos optimizados para niños de 6-11 años con dificultades de aprendizaje (dislexia y discalculia). Cada juego está diseñado siguiendo principios de neuroeducación, gamificación y accesibilidad, con métricas claras de éxito y un sistema adaptativo robusto.

**Próximos pasos:**
1. Implementar juegos uno por uno siguiendo las especificaciones
2. Crear assets visuales y de audio según las guías
3. Configurar base de datos Supabase con los schemas proporcionados
4. Implementar sistema adaptativo global
5. Realizar pruebas de usabilidad con niños reales
6. Iterar basándose en feedback y métricas

**Contacto para dudas:**
- Diseño instruccional: [Consultar con psicopedagogo]
- Implementación técnica: [Equipo de desarrollo]
- Accesibilidad: [Especialista WCAG]
