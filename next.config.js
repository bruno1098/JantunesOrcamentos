/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lirp.cdn-website.com',
      'images.unsplash.com',
      'www.dipilatti.com.br',
      'img-estoquenow.s3.amazonaws.com'
      
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    experimental: {
    optimizeCss: true,
  },
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lirp.cdn-website.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  api: {
    bodyParser: true,
  }
}

module.exports = nextConfig
