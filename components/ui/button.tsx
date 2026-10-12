import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
 * Botones con "volumen": un borde inferior interno que se aplasta al tocarlos
 * (se hunden 2px). Es CSS a propósito: funciona igual con asChild (Link) y
 * en toda la app; con prefers-reduced-motion la transición queda en 0.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-[translate,box-shadow,background-color,color,border-color] duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/40 focus-visible:ring-4 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:translate-y-[2px] motion-reduce:active:translate-y-0",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-boton hover:bg-rojo-fuerte active:shadow-boton-presionado',
        destructive:
          'bg-destructive text-white shadow-boton hover:bg-destructive/90 active:shadow-boton-presionado focus-visible:ring-destructive/30 dark:bg-destructive/60',
        outline:
          'border-[1.5px] border-border bg-card text-foreground shadow-suave hover:border-primary/40 hover:bg-rojo-suave/60 hover:text-rojo-fuerte dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-boton hover:bg-secondary/85 active:shadow-boton-presionado',
        ghost:
          'text-foreground hover:bg-muted hover:text-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline active:translate-y-0',
        /* Acento celeste de Lumo (texto blanco sobre celeste fuerte: AA). */
        celeste:
          'bg-celeste-fuerte text-white shadow-boton hover:bg-celeste-fuerte/90 active:shadow-boton-presionado',
        /* Botón claro para usar sobre fondos rojos u oscuros. */
        claro:
          'bg-white text-rojo-fuerte shadow-boton hover:bg-rojo-suave active:shadow-boton-presionado',
      },
      size: {
        default: 'h-11 px-5 py-2 has-[>svg]:px-4',
        sm: 'h-9 rounded-lg gap-1.5 px-3.5 text-sm has-[>svg]:px-3',
        lg: 'h-13 rounded-2xl px-7 text-lg has-[>svg]:px-6',
        icon: 'size-11',
        'icon-sm': 'size-9 rounded-lg',
        'icon-lg': 'size-13 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
