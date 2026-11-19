# Poses nuevas de Lex y Lumo

## Contexto

Por la validación del 19/11, el entrenamiento necesita más poses de los personajes para la consigna, el acierto, el error y el final. Hay 8 imágenes nuevas (4 de Lex y 4 de Lumo), ya recortadas, sin fondo y en WebP, en `public/images/personajes/`. Tarjeta de Trello: "Imágenes nuevas de Lex y Lumo".

## Qué hacer

1. Verificá que estén estos 8 archivos en `public/images/personajes/`:
   lex-explicando.webp, lex-festejando.webp, lex-alentando.webp, lex-pensando.webp,
   lumo-explicando.webp, lumo-festejando.webp, lumo-alentando.webp, lumo-pensando.webp.
   Si falta alguno, frená y avisá.
2. En `lib/personajes.ts`, agregá estas poses después de la que ya existe en cada personaje. Las imágenes ya vienen recortadas, así que no llevan `encuadre`.

En `POSES_LEX`, después de `volando`:

```ts
  explicando: {
    src: "/images/personajes/lex-explicando.webp",
    ancho: 815,
    alto: 1182,
    alt: "Lex, el niño superhéroe de traje rojo, señalando hacia un costado como si mostrara algo",
    cara: { x: 318, y: 283, diametro: 364 },
  },
  festejando: {
    src: "/images/personajes/lex-festejando.webp",
    ancho: 910,
    alto: 1173,
    alt: "Lex, el niño superhéroe de traje rojo, saltando de alegría con los brazos en alto",
    cara: { x: 384, y: 302, diametro: 363 },
  },
  alentando: {
    src: "/images/personajes/lex-alentando.webp",
    ancho: 823,
    alto: 1151,
    alt: "Lex, el niño superhéroe de traje rojo, sonriendo con el pulgar arriba",
    cara: { x: 298, y: 304, diametro: 418 },
  },
  pensando: {
    src: "/images/personajes/lex-pensando.webp",
    ancho: 712,
    alto: 1169,
    alt: "Lex, el niño superhéroe de traje rojo, pensando con una mano en el mentón",
    cara: { x: 286, y: 268, diametro: 380 },
  },
```

En `POSES_LUMO`, después de `holograma`:

```ts
  explicando: {
    src: "/images/personajes/lumo-explicando.webp",
    ancho: 789,
    alto: 1046,
    alt: "Lumo, el robot rojo, señalando hacia un costado como si mostrara algo",
    cara: { x: 300, y: 156, diametro: 411 },
  },
  festejando: {
    src: "/images/personajes/lumo-festejando.webp",
    ancho: 761,
    alto: 931,
    alt: "Lumo, el robot rojo, saltando de alegría con los brazos en alto",
    cara: { x: 410, y: 158, diametro: 375 },
  },
  alentando: {
    src: "/images/personajes/lumo-alentando.webp",
    ancho: 647,
    alto: 1052,
    alt: "Lumo, el robot rojo, sonriendo con el pulgar arriba",
    cara: { x: 290, y: 150, diametro: 376 },
  },
  pensando: {
    src: "/images/personajes/lumo-pensando.webp",
    ancho: 437,
    alto: 1021,
    alt: "Lumo, el robot rojo, pensando con una mano en el mentón y tres puntitos en la pantalla",
    cara: { x: 240, y: 146, diametro: 372 },
  },
```

3. No cambies `poseInicial` ni las poses existentes, y no uses las poses nuevas en ninguna pantalla todavía: las va a usar S13.

## Verificación

- `npx tsc --noEmit` no suma errores a los 4 que ya existen.
- Con `npm run dev`, armá una página de prueba temporal que muestre `<Personaje>` y `<CaraPersonaje>` con las 8 poses nuevas, para confirmar que la imagen y el avatar redondo se ven bien. Borrala al terminar: no va al commit.

## Al terminar

Resumí los archivos tocados. No hagas commit ni cambies de rama.
