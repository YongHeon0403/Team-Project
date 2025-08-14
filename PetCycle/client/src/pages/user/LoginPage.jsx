import React from 'react';
import BasicMenu from "../../components/menus/BasicMenu";
import LoginComponent from "../../components/user/LoginComponent";

const LoginPage = () => {
    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column">

            {/* 상단 메뉴 */}
            <BasicMenu />

            {/* 로그인 컴포넌트 중앙 정렬 */}
            <div className="d-flex justify-content-center align-items-center flex-grow-1 border border-2 border-primary">
                {/* Bootstrap 카드 스타일을 LoginComponent 내부에서 적용하면 더 예쁨 */}
                <LoginComponent />
            </div>
        </div>
    );
}

export default LoginPage;
