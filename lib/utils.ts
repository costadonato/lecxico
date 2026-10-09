import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/* Sombras propias de globals.css: sin esto, tailwind-merge las toma como
   colores de sombra y no las reemplaza al combinar clases. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ['suave', 'media', 'elevada', 'boton', 'boton-presionado', 'brillo-celeste', 'brillo-rojo'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
