/*
 * ECO DE PALABRAS: CORRECCIÓN FONOLÓGICA (S14a)
 * ------------------------------------------------------------------
 * El niño escucha una palabra y la escribe. Cuenta como bien una escritura
 * que SUENA igual (bentana, kamiza, girafa): lo que se entrena es la
 * correspondencia sonido-letra, no la ortografía. No se exigen tildes.
 * Cuenta como error todo lo que cambia el sonido: omisiones, agregados,
 * inversiones, r por rr en el medio (pero / perro) y cambios de letra.
 *
 * suenaIgual compara las dos escrituras después de normalizarlas
 * (normalizarSonido), en este orden:
 *   1. minúsculas; güe/güi → marcador interno de "u que suena", para que
 *      no se confunda con gue/gui; sin tildes (la ñ se conserva);
 *   2. ch se aparta (para que la h y la c no la rompan);
 *   3. h muda fuera de ch;
 *   4. ll → y, e y al final → i;
 *   5. qu → k; gue/gui → g dura; g delante de e, i → j;
 *   6. z, y c delante de e, i → s; c delante de a, o, u, de una
 *      consonante o al final → k;
 *   7. v → b, y después nb → mb.
 */

/** Marcador interno de la u que suena (güe, güi). No es una letra del teclado. */
const U_QUE_SUENA = "ü"
const CH = "ç"
const G_DURA = "ɣ"

const SIN_TILDE: Record<string, string> = { á: "a", é: "e", í: "i", ó: "o", ú: "u", à: "a", è: "e", ì: "i", ò: "o", ù: "u" }

/** Forma "sonora" de una escritura, para comparar cómo suena. */
export function normalizarSonido(texto: string): string {
  let s = texto.normalize("NFC").toLowerCase().trim()
  // 1. güe/güi conservan la u que suena; el resto de las diéresis se ignora.
  s = s.replace(/gü([ei])/g, `g${U_QUE_SUENA}$1`).replace(/ü/g, (m, i, t) => (t[i - 1] === "g" ? m : "u"))
  s = s.replace(/[áéíóúàèìòù]/g, (c) => SIN_TILDE[c])
  // 2. ch.
  s = s.replace(/ch/g, CH)
  // 3. h muda.
  s = s.replace(/h/g, "")
  // 4. ll → y; y al final → i.
  s = s.replace(/ll/g, "y").replace(/y$/, "i")
  // 5. qu → k; gue/gui → g dura; g delante de e, i → j.
  s = s.replace(/qu/g, "k")
  s = s.replace(/gu([ei])/g, `${G_DURA}$1`)
  s = s.replace(/g([ei])/g, "j$1")
  s = s.replace(new RegExp(G_DURA, "g"), "g")
  // 6. z → s; c delante de e, i → s; c delante de a, o, u, consonante o al final → k.
  s = s.replace(/z/g, "s")
  s = s.replace(/c([ei])/g, "s$1")
  s = s.replace(/c/g, "k")
  // 7. v → b; nb → mb.
  s = s.replace(/v/g, "b").replace(/nb/g, "mb")
  return s.replace(new RegExp(CH, "g"), "ch")
}

/** true si `escrita` suena igual que `palabra`. */
export function suenaIgual(escrita: string, palabra: string): boolean {
  return escrita.trim() !== "" && normalizarSonido(escrita) === normalizarSonido(palabra)
}

/** true si la escribió exactamente igual (sin distinguir mayúsculas). */
export function escritaIgual(escrita: string, palabra: string): boolean {
  return escrita.normalize("NFC").toLowerCase() === palabra.normalize("NFC").toLowerCase()
}

/**
 * Para cada letra de `palabra`, true si cambia respecto de `escrita` (no
 * está en la subsecuencia común más larga). Sirve para resaltar, en "Se
 * escribe así", las letras que el niño escribió distinto (incluida la tilde).
 */
export function letrasQueCambian(escrita: string, palabra: string): boolean[] {
  const a = [...escrita.normalize("NFC").toLowerCase()]
  const b = [...palabra.normalize("NFC").toLowerCase()]
  // Tabla de la subsecuencia común más larga.
  const t = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1])
    }
  }
  const cambia = b.map(() => true)
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      cambia[j] = false
      i++
      j++
    } else if (t[i + 1][j] >= t[i][j + 1]) i++
    else j++
  }
  return cambia
}

/** Detalle de una palabra: el de las rondas más lo que escribió en cada intento. */
export interface DetalleEco {
  item: string
  correcta: boolean
  intentos: 1 | 2
  escrito: string[]
}

/** Agrega a cada ronda lo que escribió el niño en cada intento. */
export function detalleEco<D extends { item: string; correcta: boolean; intentos: 1 | 2 }>(
  detalle: readonly D[],
  escritos: readonly (readonly string[])[],
): (D & { escrito: string[] })[] {
  return detalle.map((d, i) => ({ ...d, escrito: [...(escritos[i] ?? [])] }))
}

/** Letras del teclado en pantalla. */
export const QWERTY: readonly (readonly string[])[] = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["Z", "X", "C", "V", "B", "N", "M"],
]

export const ABECEDARIO: readonly string[] = [..."ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"]

/** Letras extra que se permiten sobre el largo de la palabra. */
export const LETRAS_DE_MAS = 4

/** true si la tecla física es una letra que se puede escribir (a-z o ñ). */
export function esLetraDelTeclado(tecla: string): boolean {
  return /^[a-zñ]$/i.test(tecla)
}
