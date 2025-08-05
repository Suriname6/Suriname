import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
});

export default instance;
