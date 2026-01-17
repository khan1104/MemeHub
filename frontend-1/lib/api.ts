import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

/* ================== ACCESS TOKEN (IN-MEMORY) ================== */
let accessToken = "";

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = "";
};

/* ================== AXIOS CONFIG ================== */
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const public_api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const protected_api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/* ================== REQUEST INTERCEPTOR ================== */
protected_api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  }
);

/* ================== REFRESH QUEUE ================== */
let isRefreshing = false;

type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: any) => void;
};

let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

/* ================== EXTENDED REQUEST TYPE ================== */
interface AxiosRequestWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/* ================== RESPONSE INTERCEPTOR ================== */
protected_api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestWithRetry;

    /* ❌ If refresh itself fails → logout */
    if (originalRequest?.url?.includes("/auth/refresh")) {
      clearAccessToken();
      window.dispatchEvent(new Event("auth-logout"));
      return Promise.reject(error);
    }

    /* 🔁 Handle 401 */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      /* ⏳ Queue if refresh already running */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return protected_api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const res = await public_api.post("/auth/refresh");
        const newToken = res.data.access_token;

        setAccessToken(newToken);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return protected_api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearAccessToken();
        window.dispatchEvent(new Event("auth-logout"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
