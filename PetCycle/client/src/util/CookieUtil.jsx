import { Cookies } from "react-cookie";
import React from "react";

const cookies = new Cookies();

export const setCookie = (name, value, days) => {
  const expires = new Date();
  //expires.getUTCDate() : expires 가 가리키는 날짜의 UTC 기준 일(day) 값을 반환(현재 시간이 아닌 일(day) 을 반환한다.)
  // 예를 들어 expires가 2025년 7월 11일 15시 UTC 라면 11(day)을 반환한다.
  // 일(day) 만 처리 하므로 년,월 을 따로 처리해서 가져와야 한다.
  // UTC ? 세계 표준 시각입니다.
  // UTC 왜 쓰나? 시간대 차이 없이 항상 전 세계에서 동일한 시간으로 다루고 싶어서
  // 예를 들면, 서버, 로그, 쿠키 만요 시간, API 요청 시간 등 시간대 혼동을 막기 위해 많이 쓴다.

  expires.setUTCDate(expires.getUTCDate() + days); // 보관 기한

  return cookies.set(name, value, { path: "/", expires: expires });
};

export const getCookie = (name) => {
  return cookies.get(name);
};

export const removeCookie = (name, path = "/") => {
  cookies.remove(name, { path });
};
