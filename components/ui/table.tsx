'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/** Clases de una fila; las reutiliza la fila animada (components/tabla-animada). */
export const claseFilaTabla =
  'hover:bg-rojo-suave/35 data-[state=selected]:bg-muted border-b border-border/70 transition-colors'

/** Clases del cuerpo; las reutiliza el cuerpo animado (components/tabla-animada). */
export const claseCuerpoTabla = '[&_tr:last-child]:border-0'

function Table({
  className,
  tarjetasEnCelular = false,
  ...props
}: React.ComponentProps<'table'> & {
  /** En celular cada fila se muestra como tarjeta (cada <td> necesita data-label). */
  tarjetasEnCelular?: boolean
}) {
  return (
    <div
      data-slot="table-container"
      className={cn(
        'relative w-full',
        tarjetasEnCelular ? 'md:overflow-x-auto md:overflow-y-hidden' : 'overflow-x-auto overflow-y-hidden',
      )}
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-base', tarjetasEnCelular && 'tabla-tarjetas', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('bg-muted/70 [&_tr]:border-b [&_tr]:border-border [&_tr]:hover:bg-transparent', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(claseCuerpoTabla, className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(claseFilaTabla, className)}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-muted-foreground h-12 px-4 py-2 text-left align-middle text-sm leading-snug font-semibold [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-4 py-3.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
