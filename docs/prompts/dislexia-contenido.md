# Página /dislexia: contenido real, sin enlaces falsos

## Contexto
Rama `dislexia-contenido`. Leé primero `CLAUDE.md` y `docs/estado-proyecto.md`.

`app/dislexia/page.tsx` quedó del prototipo original. La información sobre qué es la dislexia se mantiene, pero la página tiene problemas:
- **Enlaces que no existen o que no son nuestros:** "Hacer la evaluación ahora" lleva a `/test-dislexia`, "Probar Lecxico" a `https://lecxico.vercel.app` (otra plataforma, no la nuestra) y "Hablar con un experto" a `/contact`.
- **Cosas que no ofrecemos o no son ciertas:**
  - "seguimiento psicopedagógico científicamente validado para garantizar tu progreso";
  - "se adapta a cada niño y adolescente";
  - "resultados inmediatos y personalizados" (los resultados los ve solo el profesional);
  - una evaluación que el niño haría solo para "conocer tu estilo de aprendizaje".
- **Destinatario equivocado:** le habla al niño ("tu cerebro", "tus superpoderes"). Nuestra plataforma es para profesionales, y esta página informativa la leen sobre todo familias y profesionales.

La definición del proyecto está en `docs/estado-proyecto.md` y es la misma que usó S7 para la landing (`app/page.tsx`). Tomala como referencia de tono y de lo que se puede afirmar.

## Leer antes de tocar
- `app/dislexia/page.tsx`
- `app/page.tsx` (landing de S7: chips "En desarrollo", aviso de que no es un diagnóstico, botones)
- `components/encabezado-publico.tsx`, `components/footer.tsx`

## Reglas
- No hacer commits ni cambiar de rama.
- Mantener el diseño, los componentes, los tonos, las animaciones, Lex y Lumo y el modo oscuro. Cambia el contenido; el layout solo donde haga falta.
- Español rioplatense con voseo, frases cortas. Le habla a **familias y profesionales**, no al niño.
- Ningún enlace a rutas que no existan en `app/` ni a sitios externos. Ninguna afirmación que la app no cumpla hoy o que no esté en `docs/estado-proyecto.md`. Prohibido: "científicamente validado", "garantiza", "diagnóstico" como algo que hace la app, "adolescentes", porcentajes de mejora.

## Tareas en `app/dislexia/page.tsx`

### 1. Hero
- Chip: "Información para familias y profesionales".
- Mantener el título ("Entender la dislexia es el primer paso para aprender sin miedo") y ajustar el párrafo a la tercera persona, sin "vos" dirigido al niño.

### 2. "¿Qué es la dislexia?" (se mantiene)
- Reescribir con la definición de la propuesta, en lenguaje simple: es un trastorno específico del aprendizaje; afecta la exactitud o la velocidad al leer y escribir palabras; persiste aun con una buena enseñanza; no tiene que ver con la inteligencia ni con el esfuerzo; detectarla y estimularla temprano es especialmente eficaz.
- Mantener el tono cálido y el recuadro final ("Con práctica, comprensión y las herramientas correctas…").

### 3. "Algunas señales comunes" (se mantiene)
- Cambiar las señales por algunas acordes a los bloques que evalúa la plataforma:
  - dificultad para reconocer o separar los sonidos de las palabras;
  - lectura lenta o con muchos errores para su edad;
  - dificultad para asociar letras y sonidos;
  - lentitud para nombrar cosas conocidas, como colores, letras o números.
- Sacar "las palabras se mezclan o se mueven", que no corresponde a la definición.
- Agregar debajo una línea: "Estas señales no alcanzan para saber si un niño tiene dislexia: la evaluación la hace un profesional."
- El recuadro "Este espacio está pensado para vos…" pasa a hablarles a las familias.

### 4. "Tus superpoderes únicos" (se mantiene, con otro tono)
- Título: "Mucho más que la dislexia". Texto: muchas personas con dislexia se destacan en otras áreas (creatividad, resolución de problemas, pensamiento visual), y conviene reconocer esas fortalezas.
- Mantener la lista, pero redactada como posibilidad ("pueden destacarse en…"), no como algo que todos tienen.

### 5. Sección de la evaluación (reemplazar "Descubrí tu forma de aprender")
- Título: "Cómo es la evaluación en Lecxico".
- Explicar lo que existe hoy:
  - la toma un profesional, con el niño frente a la pantalla;
  - tiene dos niveles: pre-lectores (sala de 4 y 5) y primeros lectores (1.º a 3.er grado);
  - se organiza por bloques de habilidades;
  - tiene audio en las consignas;
  - los resultados los ve el profesional, y son orientativos.
- Mantener la aclaración de que no reemplaza un diagnóstico profesional.
- La lista con tildes pasa a:
  - "La toma un profesional";
  - "Consignas con audio";
  - "Diseño accesible con contraste claro";
  - "Resultados orientativos para el profesional".
- Botón "Crear cuenta de profesional" → `/register`. Nada de `/test-dislexia`.

### 6. "Cómo te ayuda Lecxico" → "Cómo acompaña Lecxico"
- Cuatro tarjetas que reflejen la definición actual, con el chip "En desarrollo" igual que en la landing para lo que todavía no existe:
  - **Evaluación por bloques:** la toma el profesional (disponible).
  - **Juegos para practicar:** vinculados a los bloques, en tres grados de dificultad (en desarrollo).
  - **Siempre acompañado:** práctica en casa con el tutor y tareas del profesional (en desarrollo).
  - **Lex y Lumo:** acompañan al niño en cada actividad (disponible).
- Reemplazar el recuadro "se adapta a cada niño y adolescente" por uno que diga que la plataforma es para niños de 4 a 8 años y que busca ayudar a mejorar la lectura y la confianza, sin prometer resultados.

### 7. CTA final
- Título: "¿Trabajás con niños que están aprendiendo a leer?". Sacar "Únete a Lecxico hoy y descubre que leer puede ser tu superpoder".
- Botones: "Crear cuenta" → `/register` y "Cómo funciona" → `/#how-it-works`. Sacar `https://lecxico.vercel.app` y `/contact`.

### 8. Fuentes
- Al final del contenido, antes de "Volver al inicio", una línea chica: "Fuentes: International Dyslexia Association (2025); DISFAM." La URL de DISFAM es `https://disfam.org/dislexia/definicion/`, en una pestaña nueva con `rel="noopener noreferrer"`. Es el único enlace externo permitido, porque es una cita.

### 9. Limpieza
- Borrar imports e íconos que queden sin uso.

## Fuera de alcance
- La landing, el encabezado y el footer.
- Cualquier cambio de colores o de diseño general.

## Criterio de hecho
- `npm run build` pasa y `npx tsc --noEmit` no suma errores a los 4 previos.
- Buscar en `app/dislexia/page.tsx` sin resultados: `test-dislexia`, `lecxico.vercel.app`, `/contact`, `adolescente`, `científicamente`, `garantizar`, `inmediatos`.
- Todos los `href` de la página apuntan a rutas que existen en `app/`, salvo la cita de DISFAM.
- Revisión visual en 375 px y en escritorio, en modo claro y oscuro.

## Al terminar, resumí
- Los textos finales de cada sección.
- Los enlaces que quedaron y a dónde llevan.
- Imports o componentes eliminados.
