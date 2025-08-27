import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, createSearchParams } from "react-router-dom";
import { loginPostAsync, logout } from "../slices/LoginSlice";

const useCustomLogin = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const loginState = useSelector((state) => state.LoginSlice); //---- 로그인 상태 읽어오기

  const isLogin = loginState.email ? true : false; //------- 로그인 여부 읽어오기

  /**********************************************************************************************************
   * 로그인 은 비동기 방식을 사용 한다. 그런데
   * 로그인 시에 createAsyncThunk()를 호출 하는데 왜 동기가 아닌 왜? 비동기로 호출 할까?
   * 로그인 과정이 일단  여러 단계를 거치게 되니 복잡하다.
   * 예를 들어 서버API 호출, 토큰 저장, 사용자 정보 응답등 여러 작업을 해야한다.
   * 또한 pending, fulfilled, rejected 에 따른 상태 관리도 해줘야 한다.
   * 그래서 createAsyncThunk 와 extraReducers 를 사용해서 간단하게 관리를 할수 있기 때문에 비동기를 사용한다.
   *
   *
   * 로그 아웃은 동기 방식(reducers는 동기방식)을 사용(로그아웃은 그래서 즉시 실행된다.)
   * 로그 아웃은 기능이 단순하다.
   * API 호출 없이, 토큰 삭제 혹은 Redux state 초기화처럼 동작 자체가 즉시 처리됩니다.
   * 그래서 동기 방식을 사용 합니다.
   */

  const doLogin = async (loginParam) => {
    //----- 로그인 실행 함수(loginParam 에는 id/pw가 들어간다)
    const action = await dispatch(loginPostAsync(loginParam)); // 로그인은 비동기 방식으로 호출하고 있다.

    return action.payload; // action 의 payload 속성을 이용해서 데이터(loginPost(param) 반환값) 를 전달 받는다.
  };

  const doLogout = () => {
    //--- 로그아웃 함수
    dispatch(logout()); // 동기 방식 호출 ( 즉시 호출됨)
  };

  const moveToPath = (path) => {
    //----- 페이지 이동
    navigate({ pathname: path }, { replace: true }); // path로 이동하고, 뒤로가기 했을때 로그인 화면을 볼수 없게한다.
  };

  /*******************************************************************************************************************
   * moveToLogin 과 moveToLoginReturn 차이? 둘다 /member/login 이동 한다.
   * moveToLogin 은 일반적으로 이벤트 핸들러(버튼 클릭 등) 안에서 호출된다.(이벤트 혹은 함수 호출시 사용)
   * moveToLoginReturn 은 <Navigate> 컴포넌트를 반환해서 리다이렉션을 수행한다.(이벤트 에는 적합하지 않다. )
   * jsx내에서 조건부 렌더링 됨과 동시에 이동할 때 주로 쓴다.
   * 예를 들어, 로그인 안 된 사용자를 강제로 로그인 페이지로 보내고 싶을때 사용한다.
   ********************************************************************************************************************/
  const moveToLogin = () => {
    //--- 로그인 페이지로 이동
    navigate({ pathname: "/user/login" }, { replace: true }); // path로 이동하고, 뒤로가기 했을때 로그인 화면을 볼수 없게한다.
  };

  const moveToLoginReturn = () => {
    //--- 로그인 페이지로 이동 컴포넌트
    return <Navigate replace to="/user/login" />;
  };

  // Axios 호출시 Access Token 이 없거나 권한이 없어서 문제가 발생할경우 예외 처리
  const exceptionHandle = (ex) => {
    //ex 는 exception
    console.log("Exception--------------------");
    console.log(ex);

    // ✅ 안전하게 읽기
    const errorMsg = ex?.response?.data?.error || "UNKNOWN";

    //createSearchParams 실행되면 URLSearchParams 인스턴스 생성(error=... 형태의 인코딩된 문자열 반환)
    const qs = createSearchParams({ error: errorMsg }).toString();

    /********************************************************************************************************************************
     * URLSearchParams 와 useSearchParams 공통점 ? 둘다 쿼리 스트링을 처리한다 입니다.
     *
     * URLSearchParams 와 useSearchParams 차이점?
     * URLSearchParams 는 브라우저 내장 API 이며, 순수하게 쿼리스트링을 생성·읽기·조작하는 데 쓰입니다.(리 렌더링 되지 않습니다.)
     * useSearchParams 는 리액티브 훅 입니다.
     *
     * useSearchParams 의 사용 예를 보겠습니다. 이전에 했던 내용의 복습입니다.
     * const [searchParams, setSearchParams] = useSearchParams();
     * searchParams: 현재 위치의 URLSearchParams 객체
     * setSearchParams(...): 쿼리스트링을 수정하면 URL이 자동으로 업데이트되고, 컴포넌트도 리렌더링 됩니다
     ********************************************************************************************************************************/

    if (errorMsg === "REQUIRE_LOGIN") {
      alert("로그인 해야만 합니다.");
      navigate({ pathname: "/user/login", search: `?${qs}` });
      return;
    }

    if (ex.response.data.error === "ERROR_ACCESSDENIED") {
      alert("해당 메뉴를 사용할 수 있는 권한이 없습니다.");
      navigate({ pathname: "/user/login", search: `?${qs}` });
      return;
    }
  };

  return {
    loginState,
    isLogin,
    doLogin,
    doLogout,
    moveToPath,
    moveToLogin,
    moveToLoginReturn,
    exceptionHandle,
  };
};

export default useCustomLogin;
