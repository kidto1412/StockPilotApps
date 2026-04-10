import { API_URL } from '@env';

const apiUrl = API_URL;

const getOrigin = (url: string) => {
  const normalized = url.replace(/\/$/, '');
  const match = normalized.match(/^(https?:\/\/[^/]+)/i);
  return match ? match[1] : normalized;
};

export function getImageUrl(path: string) {
  if (!path) return '';

  const apiOrigin = getOrigin(apiUrl);

  // If backend already returns full URL, use it directly.
  if (/^https?:\/\//i.test(path)) {
    // On physical device, replace localhost image host with API host.
    return path.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i,
      apiOrigin,
    );
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiOrigin}${normalizedPath}`;
}
