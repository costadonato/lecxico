# S7 — Contenido verdadero en la página de inicio pública (landing)

## Contexto
Lecxico es el Trabajo Final de Ingeniería en Informática (FTyCA-UNCa) de Donato Costa y Camila Blanco. Es un prototipo funcional, en un entorno de prueba y con datos ficticios, basado en el concepto Lecxico de Bautista Stampone. Es una plataforma web para PROFESIONALES (psicopedagogos, fonoaudiólogos, docentes) que trabajan con niños de 4 a 8 años en dos niveles:
- Pre-lectores (sala de 4 y sala de 5): nivel "inicial" en el código.
- Primeros lectores (1.º a 3.er grado): nivel "primario" en el código.

El profesional toma una evaluación de indicadores de dislexia por bloques. NO es un diagnóstico: los resultados se ubican en franjas orientativas, no en normas. A partir de eso se recomienda un entrenamiento con juegos vinculados a los bloques, en 3 grados de dificultad. El niño siempre practica acompañado: en casa con su tutor, o con tareas que le asigna el profesional. El seguimiento se comparte entre los profesionales que el tutor autoriza. El tutor da su consentimiento al crear la cuenta del niño y puede pedir un informe. Los ejercicios se revisan con especialistas en psicopedagogía.

La landing actual (app/page.tsx) quedó del prototipo original y tiene información falsa para nuestra app:
- "Primera plataforma argentina".
- "100% Científico" y "validadas científicamente".
- Un rango de 6-17 años, modo adolescente y "Doble Interfaz".
- Inglés y Matemáticas/Discalculia.
- Cantidades de juegos inventadas.
- "Comenzar Gratis", y un "Conocer Más" que lleva a #about, que no existe.
- Un footer con redes y páginas que no existen.

Hay que reescribir el CONTENIDO manteniendo el estilo visual.

## Leer antes de tocar
- app/page.tsx, components/footer.tsx, components/encabezado-publico.tsx
- app/layout.tsx (metadata), app/sitemap.ts, app/robots.ts
- lib/test/bloques.ts (BLOQUES_POR_NIVEL, BLOQUE_NOMBRES, NIVEL_LABEL)
- Componentes que ya usa la landing: Resaltado, Personaje, Flotante, NumeroAnimado, FondoDecorado, ListaCascada/ItemCascada, Button y sus variantes, y los TONOS de color de las tarjetas.

## Reglas
- No hacer commits ni cambiar de rama.
- Cambiar solo el contenido de la landing y ajustes menores de layout. Mantener la estética, los componentes, los tonos de las tarjetas, las animaciones, Lex y Lumo, el modo oscuro y la tipografía.
- No escribir ninguna afirmación que la app no cumpla hoy o que no esté en la definición de arriba. Prohibido: "primera", "única", "científicamente validado", "100 %", "gratis", porcentajes de mejora, testimonios o cifras de usuarios.
- No usar las palabras "diagnóstico" ni "detecta dislexia" como algo que hace la app. Usar "indicadores" y "orientativo".
- Español rioplatense con voseo ("registrate", "conocé"), frases cortas (el público incluye personas con dislexia) y sin emojis en los textos.
- No inventar rutas: los enlaces solo pueden ir a rutas que existen en app/.

## Decisiones ya tomadas
1. La cantidad y los nombres de los bloques de cada nivel se toman de BLOQUES_POR_NIVEL y BLOQUE_NOMBRES. No hardcodear "5" ni "9": hoy el primario tiene 8 y cuando se sume Denominación Rápida tiene que actualizarse solo.
2. Las funciones que todavía no están construidas llevan un chip "En desarrollo" (estilo pequeño, coherente con los badges que ya existen): franjas y recomendación; entrenamiento con juegos; tareas y práctica en casa; seguimiento compartido; informe para el tutor. Las disponibles no llevan chip: evaluación de los dos niveles, vinculación profesional-niño con aceptación del tutor y consentimiento informado.
3. Se elimina la sección JUEGOS (con sus enlaces a /games/catalog) y se reemplaza por una sección de niveles.

## Tareas por archivo

### app/page.tsx
- **Hero**
  - Badge: "Trabajo Final · Ingeniería en Informática · UNCa". Sacar BanderaArgentina si queda sin uso, y borrar el componente si era solo de acá.
  - h1 con Resaltado, por ejemplo: "Evaluar indicadores de dislexia y acompañar el aprendizaje lector".
  - Párrafo: una plataforma para profesionales que trabajan con niños de 4 a 8 años, con evaluación por bloques, entrenamiento guiado por los resultados y seguimiento compartido. Mantener la voz de Lex y Lumo si queda natural, en una frase como mucho.
  - Botones: "Crear cuenta" → /register (variante principal) e "Iniciar sesión" → /login (variante claro u outline).
  - Las 3 estadísticas del dl pasan a ser: "4 a 8" / "años"; "2" / "niveles"; el total de bloques distintos de los dos niveles, calculado desde BLOQUES_POR_NIVEL con un Set, / "bloques de evaluación".
  - Mantener el escenario de Lex y Lumo. Cambiar el ícono Gamepad2 por uno acorde (ClipboardCheck o BookOpen).
- **CARACTERISTICAS** (6 a 8 tarjetas, con los mismos TONOS)
  - Evaluación por bloques que toma el profesional.
  - Franjas orientativas y recomendación, no un diagnóstico. En desarrollo.
  - Entrenamiento con juegos en 3 grados, vinculado a los bloques. En desarrollo.
  - Práctica en casa con el tutor y tareas del profesional. En desarrollo.
  - Seguimiento compartido entre profesionales autorizados por el tutor. En desarrollo.
  - Consentimiento informado del tutor y acceso solo con vínculo aceptado.
  - Ejercicios revisados con especialistas en psicopedagogía.
  - Lex y Lumo acompañan al niño en cada actividad.
  - Título de la sección: algo como "Pensado para el trabajo del profesional". Sacar "niños y adolescentes".
- **Nueva sección "Dos niveles"** en lugar de JUEGOS: dos tarjetas grandes (Pre-lectores: Sala de 4 y Sala de 5; Primeros lectores: 1.º a 3.er grado). Cada tarjeta lista sus bloques con BLOQUE_NOMBRES, en el orden de BLOQUES_POR_NIVEL, y muestra la cantidad calculada. Sin enlaces a juegos.
- **PASOS** (#how-it-works), en 4 o 5 pasos: el profesional se registra y vincula al niño; el tutor acepta el vínculo y da su consentimiento; el profesional toma la evaluación; recomendación y entrenamiento acompañado; seguimiento del progreso. Si un paso depende de algo en desarrollo, que el texto lo diga sin prometer fechas.
- **CTA final** (fondo-rojo): texto honesto, por ejemplo "¿Trabajás con niños que están aprendiendo a leer?". Botones "Crear cuenta" → /register y "Qué es la dislexia" → /dislexia.
- **Aviso** antes del footer, o dentro del CTA, en un párrafo chico y visible: "Lecxico ofrece resultados orientativos. No reemplaza la evaluación diagnóstica de un profesional." Y otra línea: "Prototipo en entorno de prueba, desarrollado como Trabajo Final de Ingeniería en Informática (FTyCA-UNCa), basado en el concepto Lecxico de Bautista Stampone."

### components/footer.tsx
- Descripción: "Plataforma para profesionales: evaluación de indicadores de dislexia y entrenamiento lector para niños de 4 a 8 años."
- Eliminar los enlaces a redes sociales (Facebook, Instagram y Twitter) y los imports que queden sin uso.
- Columnas solo con rutas reales: Plataforma (Cómo funciona /#how-it-works, Qué es la dislexia /dislexia); Cuenta (Iniciar sesión /login, Crear cuenta /register); Legal (Términos /terminos, Privacidad /privacidad).
- Copyright: "© 2026 Lecxico · Trabajo Final de Ingeniería en Informática, FTyCA-UNCa". Sacar "Todos los derechos reservados".

### components/encabezado-publico.tsx
- Solo revisar que los enlaces apunten a rutas o anclas existentes. No cambiar el diseño.

### app/layout.tsx (metadata)
- Crear una constante del sitio, por ejemplo en lib/sitio.ts: `export const SITIO_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lecxico-three.vercel.app"`. NUNCA usar lecxico.com, que es otra plataforma.
- title: "Lecxico — Evaluación de indicadores de dislexia y entrenamiento lector".
- description acorde a la definición, sin "primera" ni "validado científicamente".
- keywords sin "adolescentes" ni "neurociencia".
- Sacar authors.url, creator "@lecxico" y las imágenes og/twitter (/og-image.png y /twitter-image.png no existen en public/).
- Usar metadataBase con SITIO_URL.

### app/sitemap.ts y app/robots.ts
- Usar SITIO_URL.
- Sitemap: dejar solo las rutas públicas reales: /, /dislexia, /login, /register, /terminos, /privacidad.
- Robots: mantener los disallow existentes y cambiar solo la URL base.

## Fuera de alcance
- El contenido de /dislexia (tiene "niño y adolescente", va en otra tarea).
- Colores nuevos o cambios de paleta.
- La evaluación, los juegos y la base de datos.
- Borrar rutas viejas del prototipo (/games, etc.).

## Criterio de hecho
- `npm run build` pasa.
- `npx tsc --noEmit`: solo los 4 errores que ya existían.
- Búsqueda sin resultados en app/page.tsx, components/footer.tsx, app/layout.tsx, app/sitemap.ts y app/robots.ts de: "Primera plataforma", "adolescente", "6-17", "Gratis", "English", "Matemática", "lecxico.com", "#about", "100".
- Revisión visual en 375 px y en escritorio, en modo claro y oscuro: nada se corta, los chips "En desarrollo" se leen y las estadísticas animan bien.

## Al terminar
Resumen con los archivos tocados, los textos finales de cada sección, qué funciones quedaron marcadas como "En desarrollo" y cualquier componente o import eliminado.
