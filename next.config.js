/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 13.5: Server Actions ainda são experimentais (só ficaram
  // estáveis, sem flag, a partir do Next 14). Necessário para as
  // Server Actions de app/meus-pedidos/actions.ts e
  // app/admin/produtos/actions.ts (upload de imagem de produto).
  // serverActionsBodySizeLimit é uma chave própria (não fica dentro de
  // serverActions) nesta versão — confirmado em node_modules/next.
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: '5mb',
  },
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
      },
      {
        // Supabase Storage — imagens de produto enviadas pelo admin
        // (bucket jantunes_midia). Wildcard porque o subdomínio muda
        // por projeto Supabase (<project-ref>.supabase.co).
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
  api: {
    bodyParser: true,
  }
}

module.exports = nextConfig
