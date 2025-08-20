import axios from "axios";
import { getCookie, setCookie } from "../util/CookieUtil";
import { API_SERVER_HOST } from "../api/UserApi";

/*****************************************************************************************************
 * 최초 로그인시 -> 액세트 토큰 과 리프레쉬 토큰을 을 서버로 부터 전송 받아서 쿠키에 저장
 * 액세스 토큰이 만료 된 경우 -> 클라이언트가 리프레쉬 토큰을 서버에 보내서 새로운 액세스 토큰을 요청하고 전송받는다.
 * 리프레쉬 토큰도 만료된 경우 -> 로그인 페이지로 리다이렉트 한다.
 *****************************************************************************************************/

/***************************************************************************************************************
 * todoApi.jsx 와 productApi.jsx 에  getOne , getList 함수가 있다
 * 공통점은 두 함수 모두 axios 가 아닌 jwtAxios 를 사용 한다는 점이다.
 * jwtAxios 는 axios 에 토큰 처리 기능이 추가되었다라고 생각 하면된다.
 * 코드의 흐름을 살펴보자.
 * getOne() 혹은 getList 가 호출 되었을때 jwtAxios.get 을 바로 실행하는게 아니라 인터셉터가 먼저 실행된다.
 * jwtAxios.interceptors.request.use( beforeReq, requestFail) 가 먼저 실행 되는 것이다.
 * 매개변수인 beforeReq , requestFail 함수가 호출된다.
 * 그런데 requestFail 는 오류가 발생 했을때만 호출된다.
 * 정상일때 config를 리턴 해준다.
 * 그런데 매개변수 뿐만 아니라 리턴으로도 사용되고 있는 config 는 어떤 객체일까?
 * config ?
 * config는 Axios 요청을 설정할 때 사용하는 옵션들을 담고 있는 객체로, 아래와 같은 주요 속성을 포함합니다
 * url, method (예: get, post)
 * baseURL, headers, params, data
 * timeout, withCredentials, responseType 등 다양한 설정이 가능합니다.
 * 정상처리가 되었다면
 * 수정된 config 객체를 반환하고
 * jwtAxios.interceptors.response.use(beforeRes, responseFail)  를 수행합니다.
 * 이후에 원래 수행 하려고 했던 getOne 혹은 getList가 수행 됩니다.
 ****************************************************************************************************************/

const jwtAxios = axios.create();

const refreshJWT = async (accessToken, refreshToken) => {
  // beforeRes() 에서 응답 데이터가 'ERROR_ACCESS_TOKEN' 와 같이
  // Access Token 관련 메세지인 경우 Refresh Token 을 활용해서 다시 호출 합니다.
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

//before request
const beforeReq = (config) => {
  console.log("before request......");

  const userInfo = getCookie("user");

  if (!userInfo) {
    //쿠키가 없다면
    console.log("USER Not FOUND");
    return Promise.reject(
      //Promise.reject 를 사용해서 에러를 강제로 던지고 requestFail(err) 를 호출한다.
      {
        response: { data: { error: "REQUIRE_LOGIN" } },
      }
    );
  }

  // 쿠키가 있다면 userInfo 객체안에 있는 accessToken 을 꺼내서 저장
  const { accessToken } = userInfo;

  // Authorization 헤더 처리
  config.headers.Authorization = `Bearer ${accessToken}`;

  return config;
};

//fail request
const requestFail = (err) => {
  //beforeReq에서 exception을 던지거나 Promise.reject(error)를 반환할 경우 호출됩니다 .

  console.log("request error.......");

  return Promise.reject(err); // 네트워크 단계로 전송 되지 않고 오류로 처리된다.
};

//before return response (서버로 부터 JWT 관련 응답을 res 로 받은후 )
const beforeRes = async (res) => {
  console.log("before return response..........");
  console.log(res);

  //ERROR_ACCESS_TOKEN
  const data = res.data;

  if (data && data.err === "ERROR_ACCESS_TOKEN") {
    // 만료된 토큰을 사용 했을 경우

    const userCookieValue = getCookie("user");

    // accessToken 와 refreshToken 을 서버로 전송해서 새로운 토큰을 받아온다.
    const result = await refreshJWT(
      userCookieValue.accessToken,
      userCookieValue.refreshToken
    );
    console.log("refreshJWT RESULT", result);

    userCookieValue.accessToken = result.accessToken;
    userCookieValue.refreshToken = result.refreshToken;

    //JSON.stringify : 자바스크립트 객체를 문자열형태(JSON) 로 만든다.
    setCookie("user", JSON.stringify(userCookieValue));

    //원래의 호출(getOne, getList)
    const originalResult = res.config; //응답 객체(res)에 포함된 원래 요청 설정(config) 을 참조한다.

    originalResult.headers.Authorization = `Bearer ${result.accessToken}`;

    // 서버로 부터 새로 발급받은 accessToken과 원래 요청(getOne, getLsit) 을 서버에 요청한다.
    return await axios(originalResult); // axios 뒤에 get/post가 없는데 어떤 방식의 호출일까?
    // 원래 요청이 GET 방식 이었다면 res.config.method가 "get"으로 남아 있습니다. psot 였다면 post가 남아 있습니다.
    // 만약 method 설정이 빠져 있다면 Axios는 기본으로 GET 방식으로 요청합니다.
  }

  return res;
};

//fail response                 //서버가 status 코드 기반 오류를 반환한 경우 responseFail 을 호출 합니다.(HTTP 오류 (401, 500 등))
const responseFail = (err) => {
  //beforeRes에서 exception을 던지거나 Promise.reject(error)를 반환할 경우 호출됩니다 .
  console.log("response fail error........");

  return Promise.reject(err); // err 에는 내부에 정의된 "Network Error" Request failed with status code 401" 같은 메시지를 갖게 됩니다.
};

//인터셉터를 사용해서 JWT 관련 요청을 먼저 보낸다
jwtAxios.interceptors.request.use(beforeReq, requestFail); // 정상 요청 경우 beforeRes(res) 호출, 오류 요청인 경우 responseFail(err) 호출
//인터셉터를 사용해서 JWT 응답을 받는다. 이후에 실제 요청(getOne 등등..) 을 보낸다.
jwtAxios.interceptors.response.use(beforeRes, responseFail); //정상 응답인 경우 beforeRes(res) 호출, 오류 응답인 경우 responseFail(err) 호출

export default jwtAxios;
