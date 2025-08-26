import React from "react";
import BasicMenu from "../../components/menus/BasicMenu";
import LoginComponent from "../../components/user/LoginComponent";

const LoginPage = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex flex-col">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 로그인 컴포넌트 중앙 정렬 */}
      <div className="flex flex-grow justify-center items-center border-2 border-blue-600">
        {/* LoginComponent 내부에서 카드 스타일 적용 */}
        <LoginComponent />
      </div>
    </div>
  );
};

export default LoginPage;
