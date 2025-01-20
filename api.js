import axios from "axios";

const baseURL =   "https://pickeat-backend.azurewebsites.net";

// const baseURL =   "https://pickeat-production.azurewebsites.net";

// const baseURL = "http://192.168.0.114:8080";

const api = axios.create({
  baseURL,
});

export default api;

