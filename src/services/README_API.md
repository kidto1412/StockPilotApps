# API client (axios) — usage notes

This project includes a centralized axios client at `services/api.ts` and endpoint helpers under `services/endpoints`.

Key exports

- `api` (default): axios instance configured with baseURL and interceptors
- `setAuthToken(token)`: set or clear the Authorization header for subsequent requests
- `setRefreshTokenHandler(fn)`: provide a function that returns a refreshed access token (used automatically on 401)

Auth helpers

- `services/endpoints/auth.endpoint.ts` exposes `login`, `logout`, and `refreshToken` helpers and wires a refresh handler to the client.

Examples

Login and use token (e.g. in a login screen):

```ts
import authEndpoint from "../services/endpoints/auth.endpoint";

async function handleLogin(email: string, password: string) {
  const data = await authEndpoint.login({ email, password });
  // auth token is set automatically; persist refreshToken if required
}
```

Restore token on app start (pseudo-code):

```ts
import { setAuthToken } from "../services/api";
// read persisted access token from secure storage (if you stored it)
const storedAccess = await SecureStore.getItemAsync("accessToken");
if (storedAccess) setAuthToken(storedAccess);
```

Notes & best-practices

- Keep long-lived secrets (refresh tokens) in secure storage (expo-secure-store or platform secure keystore).
- Keep the axios client centralized to share interceptors, error handling, and token plumbing in one place.
- Avoid logging sensitive request/response bodies in production.
- Return normalized errors from the client and handle them in UI components.

Next steps you may want to add

- Integrate `expo-secure-store` to persist refresh tokens and restore them on app start.
- Add exponential backoff retry on network errors for idempotent requests.
- Add TypeScript models for API responses for stronger typing.
