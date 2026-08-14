import { MetadataRoute } from 'next';
import { CONTATO } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = CONTATO.siteUrl;

  // Só rotas estáticas que de fato existem no app/ — não há página de
  // produto individual (app/produtos/ é somente a listagem), então
  // nenhuma rota dinâmica de produto é gerada aqui.
  const routes = [
    { url: '', priority: 1 }, // Página inicial
    { url: '/produtos', priority: 0.9 },
    { url: '/about', priority: 0.7 },
    { url: '/contato', priority: 0.8 },
    { url: '/duvidas-frequentes', priority: 0.6 },
  ].map((route) => ({
    ...route,
    url: `${baseUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
  }));

  return routes;
} 