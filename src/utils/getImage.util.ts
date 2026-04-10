import { API_URL } from '@env';

const apiUrl = API_URL;
export function getImageUrl(path: string) {
  console.log(`${apiUrl}${path}`);
  return `${apiUrl}${path}`;
}
