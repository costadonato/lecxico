import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Clock, Play, Lock } from "lucide-react"
import Link from "next/link"

interface ExerciseCardProps {
  id: number
  title: string
  description: string
  icon: React.ElementType
  color: string
  difficulty: string
  xp: number
  duration?: string
  locked?: boolean
  category?: string
}

export function ExerciseCard({
  id,
  title,
  description,
  icon: Icon,
  color,
  difficulty,
  xp,
  duration,
  locked = false,
  category,
}: ExerciseCardProps) {
  return (
    <Card
      className={`border-2 transition-all ${
        locked ? "opacity-60" : "hover:border-primary hover:shadow-lg cursor-pointer hover:scale-[1.02]"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div
            className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center ${locked ? "opacity-50" : ""}`}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          {locked && <Lock className="w-5 h-5 text-muted-foreground" />}
        </div>
        <CardTitle className="text-xl pt-2">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold px-3 py-1 bg-muted rounded-full">{difficulty}</span>
            {duration && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{duration}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-secondary">
              <Star className="w-4 h-4 fill-secondary" />
              <span className="text-sm font-bold">+{xp}</span>
            </div>
          </div>
          {!locked && (
            <Button size="sm" className="rounded-full" asChild>
              <Link href={`/exercise/${id}`}>
                <Play className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
