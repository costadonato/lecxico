import type { LucideIcon } from "lucide-react"

interface AchievementBadgeProps {
  id: number
  title: string
  icon: LucideIcon
  unlocked: boolean
}

export function AchievementBadge({ title, icon: Icon, unlocked }: AchievementBadgeProps) {
  return (
    <div
      className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-2 ${
        unlocked ? "bg-secondary/20 border-2 border-secondary" : "bg-muted border-2 border-border opacity-50"
      }`}
    >
      <Icon className={`w-6 h-6 ${unlocked ? "text-secondary" : "text-muted-foreground"}`} />
      <span className="text-xs text-center font-semibold px-1">{title}</span>
    </div>
  )
}
