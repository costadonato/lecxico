import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Política de <span className="text-primary">Privacidad</span>
          </h1>
          <p className="text-muted-foreground">{""}</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6 prose prose-slate max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Información que Recopilamos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  En Lecxico, recopilamos información necesaria para proporcionar nuestros servicios educativos. Esto
                  incluye:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Información de registro (nombre, edad, email del padre/tutor)</li>
                  <li>Datos de progreso educativo y estadísticas de uso</li>
                  <li>Información técnica (tipo de dispositivo, navegador, dirección IP)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Cómo Usamos tu Información</h2>
                <p className="text-muted-foreground leading-relaxed">Utilizamos la información recopilada para:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Proporcionar y mejorar nuestros servicios educativos</li>
                  <li>Personalizar la experiencia de aprendizaje</li>
                  <li>Generar reportes de progreso para padres y tutores</li>
                  <li>Comunicarnos contigo sobre actualizaciones y novedades</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Protección de Datos de Menores</h2>
                <p className="text-muted-foreground leading-relaxed">
                  La privacidad de los niños es nuestra máxima prioridad. Cumplimos con todas las regulaciones de
                  protección de datos de menores:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Requerimos consentimiento parental para usuarios menores de 13 años</li>
                  <li>No compartimos información personal de menores con terceros</li>
                  <li>Los datos se almacenan de forma segura y encriptada</li>
                  <li>Los padres pueden solicitar la eliminación de datos en cualquier momento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Compartir Información</h2>
                <p className="text-muted-foreground leading-relaxed">
                  No vendemos ni compartimos información personal con terceros para fines de marketing. Solo compartimos
                  datos cuando:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Es necesario para proporcionar el servicio (ej: proveedores de hosting)</li>
                  <li>Lo requiere la ley o autoridades competentes</li>
                  <li>Tienes tu consentimiento explícito</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Tus Derechos</h2>
                <p className="text-muted-foreground leading-relaxed">Tienes derecho a:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Acceder a tu información personal</li>
                  <li>Corregir datos inexactos</li>
                  <li>Solicitar la eliminación de tus datos</li>
                  <li>Exportar tus datos en formato legible</li>
                  <li>Retirar el consentimiento en cualquier momento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Seguridad</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información, incluyendo
                  encriptación, acceso restringido y auditorías regulares de seguridad.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Contacto</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Si tienes preguntas sobre esta política de privacidad o deseas ejercer tus derechos, contáctanos en:
                </p>
                <p className="text-muted-foreground">
                  Email: <span className="text-primary">lecxico.arg@gmail.com</span>
                </p>
              </section>
            </div>
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
