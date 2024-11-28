import { MetadataRoute } from 'next';
import { products } from '@/data/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://locacaodetoalhas.vercel.app';

  const routes = [
    { url: '', priority: 1 }, // Página inicial
    { url: '/produtos', priority: 0.9 },
    { url: '/sobre', priority: 0.7 },
    { url: '/contato', priority: 0.8 },
    { url: '/duvidas-frequentes', priority: 0.6 },
  ].map((route) => ({
    ...route,
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }));
  

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/produtos/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...productRoutes];
} 