import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-background border-t" role="contentinfo">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group" aria-label="Lecxico - Inicio">
              <Image
                src="/images/lecxico-logo.png"
                alt="Lecxico"
                width={140}
                height={48}
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
            </Link>
            {/* </CHANGE> */}
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              <span className="font-semibold text-foreground">Lecxico</span> — Primera plataforma argentina para niños y
              adolescentes con dislexia
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center group"
                aria-label="Síguenos en Facebook"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/lecxico?igsh=MXIzMTdqdWRvcjd3dw=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center group"
                aria-label="Síguenos en Instagram"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 4.041v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.504-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center group"
                aria-label="Síguenos en Twitter"
              >
                <svg
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Producto Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg relative inline-block group">
              Producto
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <nav aria-label="Producto">
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/#features"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center group"
                  >
                    <span className="relative">
                      Características
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#how-it-works"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center group"
                  >
                    <span className="relative">
                      Cómo Funciona
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center group"
                  >
                    <span className="relative">
                      Precios
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Recursos Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg relative inline-block group">
              Recursos
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <nav aria-label="Recursos">
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/blog"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center group"
                  >
                    <span className="relative">
                      Blog
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center group"
                  >
                    <span className="relative">
                      Guías
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center group"
                  >
                    <span className="relative">
                      Soporte
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Empresa Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-lg relative inline-block group">
              Empresa
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </h3>
            <nav aria-label="Empresa">
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center group"
                  >
                    <span className="relative">
                      Nosotros
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center group"
                  >
                    <span className="relative">
                      Contacto
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center group"
                  >
                    <span className="relative">
                      Privacidad
                      <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t mt-12 pt-8">
          <p className="text-center text-sm text-muted-foreground">© 2025 Lecxico. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
