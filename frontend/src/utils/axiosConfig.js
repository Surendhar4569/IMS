import axios from "axios";
// import https from "https";

const vgtAPI = axios.create({
  baseURL: import.meta.env.VITE_EMS_API_URL,
  // httpsAgent: new https.Agent({
  //   rejectUnauthorized: false,
  // }),
});

vgtAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("external_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default vgtAPI;
