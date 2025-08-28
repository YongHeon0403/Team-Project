import axios from "axios";
import React from "react";

export const API_SERVER_HOST = "http://localhost:8080";

const host = `${API_SERVER_HOST}/api/auth`;

export const LoginPost = async (loginParam) => {
  console.log("로그인 요청 시작");
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const form = new FormData();
  form.append("email", loginParam.email);
  form.append("password", loginParam.password);

  const res = await axios.post(`${host}/login`, form, headers);

  return res.data;
};
