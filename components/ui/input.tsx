import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground/80 selection:bg-sol-suave selection:text-foreground dark:bg-input/30 border-input h-11 w-full min-w-0 rounded-xl border-[1.5px] bg-white px-4 py-1 text-base shadow-[inset_0_1px_2px_rgb(74_52_30/0.06)] transition-[color,box-shadow,border-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-foreground/40',
        'focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-4',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
