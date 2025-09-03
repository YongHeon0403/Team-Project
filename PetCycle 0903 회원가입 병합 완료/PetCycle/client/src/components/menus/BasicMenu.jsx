// client/src/components/menus/BasicMenu.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";
import useWebSocket from "../../hooks/useWebSocket"; // ← 추가

const BasicMenu = () => {
  const loginState = useSelector((state) => state.LoginSlice);
  const { doLogout, moveToPath } = useCustomLogin();

  // 내 아이디(서버에서 notice.{username} 구독에 쓰는 값)
  // 프로젝트에 맞게 userId(숫자)나 username/email 중 하나로 맞춰줘
  const myId = loginState.userId ?? loginState.email ?? null;

  // 웹소켓 훅: hasNewChat(배지 표시), clearChatBadge(클릭 시 끄기)
  const { hasNewChat, clearChatBadge } = useWebSocket(myId);

  const handleLogout = () => {
    doLogout();
    alert("로그아웃 되었습니다.");
    moveToPath("/");
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
              {/* ✅ 로그인 상태에서만 보이는 "내 채팅" + 빨간점 */}
              <li className="relative">
                <Link
                  className="text-xl font-bold hover:text-blue-300"
                  to="/chat/list"
                  onClick={clearChatBadge} // 들어가면 배지 끄기
                >
                  내 채팅
                </Link>

                {/* 빨간점 배지 */}
                {hasNewChat && (
                  <span
                    className="absolute -top-1 -right-3 inline-block w-2.5 h-2.5 bg-red-500 rounded-full"
                    aria-label="새 채팅 알림"
                  />
                )}
              </li>

              <li>
                <Link
                  className="text-xl font-bold hover:text-blue-300"
                  to="/user/profile"
                >
                  내 정보
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
