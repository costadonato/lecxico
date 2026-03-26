import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HelpCircle, Mail, MessageCircle, Phone } from "lucide-react"

export default function SupportPage() {
  const faqs = [
    {
      question: "¿Cómo creo una cuenta para mi hijo?",
      answer: "Puedes crear una cuenta desde la página de registro seleccionando el modo infantil o adolescente.",
    },
    {
      question: "¿Puedo tener múltiples perfiles?",
      answer: "Sí, con el Plan Familiar puedes crear hasta 3 perfiles de estudiantes.",
    },
    {
      question: "¿Los ejercicios están validados científicamente?",
      answer: "Todos nuestros ejercicios están basados en investigaciones de neurociencia y psicopedagogía.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Centro de <span className="text-primary">Soporte</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Encuentra respuestas o contáctanos directamente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <Mail className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Email</CardTitle>
              <CardDescription>Respuesta en 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">lecxico.arg@gmail.com</p>
              <Button variant="outline" className="w-full bg-transparent">
                Enviar Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageCircle className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Chat en Vivo</CardTitle>
              <CardDescription>Lun-Vie 9am-6pm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Chatea con nuestro equipo</p>
              <Button variant="outline" className="w-full bg-transparent">
                Iniciar Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Teléfono</CardTitle>
              <CardDescription>Lun-Vie 9am-6pm</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">+54 11 1234-5678</p>
              <Button variant="outline" className="w-full bg-transparent">
                Llamar Ahora
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-1" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Envíanos un Mensaje</CardTitle>
            <CardDescription>Completa el formulario y te responderemos pronto</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Tu nombre" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input id="subject" placeholder="¿En qué podemos ayudarte?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" placeholder="Describe tu consulta..." rows={5} />
              </div>
              <Button className="w-full">Enviar Mensaje</Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="ghost">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
