/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lirp.cdn-website.com',
      'images.unsplash.com'
    ],
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
