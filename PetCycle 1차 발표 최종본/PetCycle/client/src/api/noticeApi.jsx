// src/api/noticeApi.jsx
import axios from "axios";
import jwtAxios from "../util/JWTUtil";

const API_SERVER_HOST =
  import.meta.env.VITE_API_SERVER_HOST || "https://petcycle.dxcom.co.kr:8021";
const prefix = `${API_SERVER_HOST}/api/notices`;

export const getNoticeList = (page = 1, size = 10) =>
  axios.get(`${prefix}/list?page=${page}&size=${size}`);

export const getNotice = (id) => axios.get(`${prefix}/${id}`);

export const addNotice = (dto) => jwtAxios.post(prefix, dto);

export const updateNotice = (id, dto) => jwtAxios.put(`${prefix}/${id}`, dto);

export const removeNotice = (id) => jwtAxios.delete(`${prefix}/${id}`);
