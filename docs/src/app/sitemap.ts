import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, 'https://mesh.nylon.sh').toString();

  return [
    {
      url: url('/'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...source.getPages().map((page) => ({
      url: url(page.url),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
