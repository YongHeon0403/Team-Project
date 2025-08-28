import axios from "axios";
import { API_SERVER_HOST } from "./UserApi";

const rest_api_key = `3e2c7046bd2a4ca111c7611c03e3aa48`; //REST 키값
const redirect_uri = `http://localhost:5173/user/kakao`;

const auth_code_path = `https://kauth.kakao.com/oauth/authorize`;

const access_token_url = `https://kauth.kakao.com/oauth/token`;

export const getKakaoLoginLink = () => {
  //REST 키 값, 로그인 후 이동할 RedirectURI 정보 를 가지는 링크를 저장한다.
  const kakaoURL = `${auth_code_path}?client_id=${rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`;

  return kakaoURL; // 카카오 로그인 페이지로 이동한다
};

export const getAccessToken = async (authCode) => {
  // authCode : 카카오 에서 전송해준 '인가 코드'

  const header = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const params = {
    grant_type: "authorization_code",
    client_id: rest_api_key,
    redirect_uri: redirect_uri,
    code: authCode,
  };

  //카카오 서버에 Access Token 을 요청하고 받아온다.
  const res = await axios.post(access_token_url, params, header);

  const accessToken = res.data.access_token;

  return accessToken;
};

/*******************************************************
 *  [React]
        ↓ 카카오 로그인 요청
    [카카오 서버]
        ↓ 인가코드 전달
    [React]
        ↓ 인가코드 → API 서버
    [API 서버]
        ↓ 인가코드 → 카카오 서버 (accessToken 요청)
    [카카오 서버]
        ↓ accessToken 반환
    [API 서버]
        ↓ accessToken → 카카오 서버 (사용자 정보 요청)
    [카카오 서버]
        ↓ 사용자 정보 반환
    [API 서버]
        ↓ 사용자 정보 → 프론트 or 리다이렉트
 *******************************************************/

export const getuserWithAccessToken = async (accessToken) => {
  const res = await axios.get(
    `${API_SERVER_HOST}/api/user/kakao?accessToken=${accessToken}`
  );
  /*
    const res = await axios.get(`${API_SERVER_HOST}/api/user/kakao`, {
        headers : {
            Authorization : `Bearer ${accessToken}`
        }
    });
    */
  return res.data;
};
