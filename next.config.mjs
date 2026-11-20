/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desde S13a, tsc da 0 errores: un error de tipos frena el build.
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
 
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig