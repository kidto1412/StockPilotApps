// // src/api/client.ts
// import { useAuthStore } from "@/stores/auth.store";
// import axios, { InternalAxiosRequestConfig } from "axios";
// import * as SecureStore from "expo-secure-store";

// // const apiUrl = process.env.EXPO_PUBLIC_API_URL;

// const api = axios.create({
//   baseURL: apiUrl,
//   timeout: 15000,
// });

// // GET TOKEN
// async function getToken() {
//   return await SecureStore.getItemAsync("token");
// }

// async function getRefreshToken() {
//   return await SecureStore.getItemAsync("refreshToken");
// }

// // SAVE TOKEN
// async function saveToken(token: string) {
//   await SecureStore.setItemAsync("token", token);
// }

// // REMOVE TOKEN
// async function clearAuth() {
//   await SecureStore.deleteItemAsync("token");
//   await SecureStore.deleteItemAsync("refreshToken");
// }

// api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
//   const token = await getToken();
//   if (token) {
//     config.headers.set("Authorization", `Bearer ${token}`);
//   }
//   return config;
// });

// api.interceptors.response.use(
//   (response) => response,

//   async (error) => {
//     const status = error.response?.status;
//     const message =
//       error.response?.data?.message || error.message || "Terjadi kesalahan";
//     // --- 401 Unauthorized ---
//     if (error.response?.status === 401) {
//       const { logout } = useAuthStore.getState();

//       // optional: refresh token logic
//       // ...

//       logout();
//     }

//     return Promise.reject({ status, message, originalError: error });
//   }
// );

// export default api;
