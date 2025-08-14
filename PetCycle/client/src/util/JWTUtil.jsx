import axios from "axios";
import { API_SERVER_HOST } from "../api/UserApi";
import { getCookie, setCookie } from "./CookieUtil";

const jwtAxios = axios.create();

// JWT 재발급 함수
const refreshJWT = async (accessToken, refreshToken) => {
  const host = API_SERVER_HOST;
  const header = { headers: { Authorization: `Bearer ${accessToken}` } };

  const res = await axios.get(
    `${host}/api/user/refresh?refreshToken=${refreshToken}`,
    header
  );

  console.log("----------------------");
  console.log(res.data);

  return res.data;
};

// before request interceptor
const beforeReq = (config) => {
  console.log("before request......");

  // ✅ user 쿠키에서 토큰 정보 꺼내기
  const userInfoString = getCookie("user");
  if (!userInfoString) {
    console.log("USER NOT FOUND, 쿠키가 없습니다.");
    return Promise.reject({
      response: { data: { error: "REQUIRE_LOGIN" } },
    });
  }

  const userInfo = JSON.parse(userInfoString);
  config.headers.Authorization = `Bearer ${userInfo.accessToken}`;
  console.log("Authorization 헤더 추가됨:", config.headers.Authorization);

  return config;
};

// fail request interceptor
const requestFail = (err) => {
  console.log("request error.......");
  return Promise.reject(err);
};

// before response interceptor
const beforeRes = async (res) => {
  console.log("before return response..........");
  console.log(res);

  const data = res.data;

  if (data && data.err === "ERROR_ACCESS_TOKEN") {
    // ✅ user 쿠키에서 토큰 정보 꺼내기
    const userCookieValue = getCookie("user");
    const userInfo = JSON.parse(userCookieValue);

    // 새로운 토큰 발급
    const result = await refreshJWT(
      userInfo.accessToken,
      userInfo.refreshToken
    );
    console.log("refreshJWT RESULT", result);

    // ✅ user 객체 업데이트 후 다시 쿠키 저장
    const newUserInfo = { ...userInfo, ...result };
    setCookie("user", JSON.stringify(newUserInfo), 1); // 1일

    // 원래 요청 재호출
    const originalRequest = res.config;
    originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;

    return await axios(originalRequest);
  }

  return res;
};

// fail response interceptor
const responseFail = (err) => {
  console.log("response fail error........");
  return Promise.reject(err);
};

// 인터셉터 등록
jwtAxios.interceptors.request.use(beforeReq, requestFail);
jwtAxios.interceptors.response.use(beforeRes, responseFail);

export default jwtAxios;
