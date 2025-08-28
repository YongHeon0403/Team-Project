import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAccessToken, getuserWithAccessToken } from "../../api/kakaoApi";
import { useDispatch } from "react-redux";
import { login } from "../../slices/LoginSlice";
import useCustomLogin from "../../hooks/useCustomLogin";

//소셜 로그인 한 경우 카카오 서버가 여기로 데이터를 보내준다.
//카카오 앱에서 설정한 Redirect URI 경로(http://localhost:5173/user/kakao)에 대한 처리 페이지 이다.
const KakaoRedirectPage = () => {
  //소셜 로그인 후 이동할 경로
  const { moveToPath } = useCustomLogin();

  //쿼리 스트링을 searchParams 에 저장
  const [searchParams] = useSearchParams(); // 카카오 서버에서 보내준 데이터가 저장됨
  //읽어온 쿼리 스트링에서 code가 가르키는 값(인가코드)을 저장
  const authCode = searchParams.get("code");

  const dispatch = useDispatch();

  useEffect(() => {
    getAccessToken(authCode).then((accessToken) => {
      console.log("accessToken 값 체크");
      console.log(accessToken); //카카오서버는 클라이언트 에게 인가코드(authCode)를 받고 accessToken 을 전송 했다.

      //accessToken 을 API 서버에 전송하고 email 을 받는다.
      getuserWithAccessToken(accessToken).then((userInfo) => {
        console.log("-----------------");
        console.log(userInfo); //userInfo 에는 사용자의 모든 정보가 넘어온다.

        // 동기 방식의 login 호출(소셜 로그인은 이미 인증을 마치고 돌아온 상태이기 때문에 Redux에서 처리할 때는 굳이 비동기 처리가 필요 없다.)
        dispatch(login(userInfo));

        if (userInfo && !userInfo.social) {
          //소셜 회원이 아니라면(true 이면 소셜 회원)
          moveToPath("/");
        } else {
          //DB에 없는 사용자 이거나  소셜 로그인만 했던 사용자 라면
          moveToPath("/user/modify");
        }
      });
    });
  }, [authCode]); // 인가코드(authCode)가 변경될때 마다 getAccessToken() 호출

  return (
    <div>
      <div>Kakao Login Redirect</div>
      <div>{authCode}</div> {/* 카카오에서 전송해준 '인가코드'  */}
    </div>
  );
};

export default KakaoRedirectPage;
