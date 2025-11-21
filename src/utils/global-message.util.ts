import { AxiosError } from "axios";

/**
 * Mengembalikan pesan error global yang konsisten
 * @param err - Error apa saja
 * @returns string pesan user-friendly
 */
export function getErrorMessage(err: any): string {
  // 1. Null/undefined
  if (!err) return "Terjadi kesalahan. Silakan coba lagi.";

  // 2. Jika sudah string
  if (typeof err === "string") return err;

  // 3. Axios error
  if (err.isAxiosError) {
    const axiosErr = err as AxiosError;
    // Cek response dari server
    if (axiosErr.response?.data) {
      const data = axiosErr.response.data as any;
      if (typeof data === "string") return data;
      if (data.message) return data.message;
      if (data.error) return data.error;
    }
    return axiosErr.message || "Terjadi kesalahan jaringan. Coba lagi.";
  }

  // 4. Error object dengan message
  if (err.message) {
    if (typeof err.message === "string") return err.message;
    if (typeof err.message === "object")
      return err.message.message || JSON.stringify(err.message);
  }

  // 5. Fallback: stringify object error
  if (typeof err === "object") {
    try {
      return JSON.stringify(err);
    } catch {
      return "Terjadi kesalahan tidak terduga.";
    }
  }

  return "Terjadi kesalahan. Silakan coba lagi.";
}
