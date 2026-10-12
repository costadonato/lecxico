"use client"

import { motion, type HTMLMotionProps, type Variants } from "motion/react"
import { EASE_SUAVE, PASO_CASCADA, RESORTE } from "@/components/motion/transiciones"

/*
 * Lista en cascada: el contenedor escalona la entrada de sus ItemCascada
 * (aparecen uno detrás de otro). Sirve para tarjetas, <li> y filas de tabla.
 *
 *   <ListaCascada as="ul">
 *     {items.map((i) => <ItemCascada as="li" key={i.id}>…</ItemCascada>)}
 *   </ListaCascada>
 */

const CONTENEDORES = {
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
  dl: motion.dl,
  section: motion.section,
  tbody: motion.tbody,
}

const ITEMS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  tr: motion.tr,
}

type PropsLista = Omit<HTMLMotionProps<"div">, "variants" | "initial" | "animate" | "whileInView"> & {
  as?: keyof typeof CONTENEDORES
  /** Segundos antes del primer elemento. */
  retraso?: number
  /** Segundos entre un elemento y el siguiente. */
  paso?: number
  /** Si es true, la cascada empieza cuando la lista entra en pantalla (para contenido más abajo). */
  enVista?: boolean
}

export function ListaCascada({
  as = "div",
  retraso = 0,
  paso = PASO_CASCADA,
  enVista = false,
  children,
  ...props
}: PropsLista) {
  const Comp = CONTENEDORES[as] as typeof motion.div
  const variantes: Variants = {
    oculto: {},
    visible: { transition: { staggerChildren: paso, delayChildren: retraso } },
  }
  const disparador = enVista
    ? { whileInView: "visible", viewport: { once: true, amount: 0.15 } }
    : { animate: "visible" }

  return (
    <Comp variants={variantes} initial="oculto" {...disparador} {...props}>
      {children}
    </Comp>
  )
}

const VARIANTES_ITEM: Variants = {
  oculto: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_SUAVE } },
}

type PropsItem = Omit<HTMLMotionProps<"div">, "variants"> & {
  as?: keyof typeof ITEMS
  /** Se eleva al pasar el mouse y se hunde al tocarlo. "suave": solo un poco (tono profesional). */
  elevar?: boolean | "suave"
}

export function ItemCascada({ as = "div", elevar = false, children, ...props }: PropsItem) {
  const Comp = ITEMS[as] as typeof motion.div
  return (
    <Comp
      variants={VARIANTES_ITEM}
      whileHover={elevar === "suave" ? { y: -3 } : elevar ? { y: -6, scale: 1.015 } : undefined}
      whileTap={elevar ? { scale: 0.98 } : undefined}
      transition={RESORTE}
      {...props}
    >
      {children}
    </Comp>
  )
}

/** Envoltorio que se eleva al pasar el mouse y se hunde al tocarlo (fuera de una cascada). */
export function Elevable({
  elevar = true,
  children,
  ...props
}: Omit<HTMLMotionProps<"div">, "whileHover" | "whileTap"> & { elevar?: true | "suave" }) {
  return (
    <motion.div
      whileHover={elevar === "suave" ? { y: -3 } : { y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={RESORTE}
      {...props}
    >
      {children}
    </motion.div>
  )
}
