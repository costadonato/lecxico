"use client"

import type React from "react"
import { ItemCascada, ListaCascada } from "@/components/motion/lista-cascada"
import { claseCuerpoTabla, claseFilaTabla } from "@/components/ui/table"
import { cn } from "@/lib/utils"

/** <tbody> cuyas filas aparecen en cascada (mismo estilo que TableBody). */
export function CuerpoTablaAnimado({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <ListaCascada as="tbody" data-slot="table-body" paso={0.05} className={cn(claseCuerpoTabla, className)}>
      {children}
    </ListaCascada>
  )
}

/** <tr> que entra en cascada (mismo estilo que TableRow). */
export function FilaTablaAnimada({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <ItemCascada as="tr" data-slot="table-row" className={cn(claseFilaTabla, className)}>
      {children}
    </ItemCascada>
  )
}
