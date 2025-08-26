import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";

const BasicMenu = () => {
  const loginState = useSelector((state) => state.LoginSlice);

  const { doLogout, moveToPath } = useCustomLogin();

  const handleLogout = () => {
    doLogout(); // 토큰/스토어 정리
    alert("로그아웃 되었습니다."); // 알림 원하면 사용
    moveToPath("/"); // 메인으로 즉시 이동(replace)
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* 왼쪽 메뉴 */}
        <ul className="flex space-x-6">
          <li>
            <Link className="text-xl font-bold hover:text-blue-300" to="/">
              Main
            </Link>
          </li>
          <li>
            <Link
              className="text-xl font-bold hover:text-blue-300"
              to="/board/list"
            >
              게시판
            </Link>
          </li>
          <li>
            <Link
              className="text-xl font-bold hover:text-blue-300"
              to="/product/list"
            >
              상품
            </Link>
          </li>
          <li>
            <Link
              className="text-xl font-bold hover:text-blue-300"
              to="/notice/list"
            >
              공지사항
            </Link>
          </li>
          {loginState.email && (
            <>
              <li>
                <Link
                  className="text-xl font-bold hover:text-blue-300"
                  to="/pet/list"
                >
                  펫 프로필
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* 오른쪽 로그인/로그아웃 버튼 */}
        <div>
          {!loginState.email ? (
            <Link
              className="bg-yellow-400 text-black font-medium px-4 py-2 rounded hover:bg-yellow-300"
              to="/user/login"
            >
              Login
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="bg-yellow-400 text-black font-medium px-4 py-2 rounded hover:bg-yellow-300"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default BasicMenu;
