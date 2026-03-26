import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Plan Básico",
      price: "Gratis",
      description: "Perfecto para comenzar tu aventura de lectura",
      features: [
        "Acceso a 10 ejercicios básicos",
        "Seguimiento de progreso básico",
        "1 perfil de estudiante",
        "Soporte por email",
      ],
    },
    {
      name: "Plan Familiar",
      price: "$2,999/mes",
      description: "Ideal para familias con múltiples niños",
      features: [
        "Acceso ilimitado a todos los ejercicios",
        "Seguimiento detallado de progreso",
        "Hasta 3 perfiles de estudiantes",
        "Panel para padres",
        "Reportes mensuales",
        "Soporte prioritario",
      ],
      popular: true,
    },
    {
      name: "Plan Institucional",
      price: "Consultar",
      description: "Para escuelas y centros educativos",
      features: [
        "Acceso ilimitado para todos los estudiantes",
        "Panel de administración completo",
        "Perfiles ilimitados",
        "Reportes personalizados",
        "Capacitación para docentes",
        "Soporte dedicado 24/7",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Planes y <span className="text-primary">Precios</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para tu familia o institución educativa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Más Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.price === "Consultar" ? "Contactar" : "Comenzar Ahora"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/">
            <Button variant="ghost">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
