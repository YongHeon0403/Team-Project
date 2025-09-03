// client/src/pages/product/ModifyPage.jsx
import ProductModifyComponent from "../../components/product/ProductModifyComponent";
// import useCustomLogin from "../../hooks/useCustomLogin";                  // ★★★ 제거: 커스텀 훅 미사용
import { useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getCookie } from "../../util/CookieUtil";                          // ★★★ 추가: 쿠키로 로그인 확인

export default function ModifyPage() {
  // const { isLogin, moveToLogin } = useCustomLogin();                     // ★★★ 제거: Board 스타일로 교체
  const nav = useNavigate();
  const loc = useLocation();
  const warnedRef = useRef(false);
  const { productId } = useParams(); // ✅ 라우트에서 가져오기

  const isLogin = !!getCookie("user");                                      // ★★★ 추가: 쿠키 존재 여부로 로그인 판단

  useEffect(() => {
    if (!isLogin && !warnedRef.current) {
      warnedRef.current = true;
      alert("로그인이 필요합니다.");
      // ★★★ 변경: 커스텀 훅 대신 직접 라우팅 (Board와 동일 패턴)
      nav("/user/login", {
        replace: true,
        state: { from: loc.pathname + loc.search },
      });
    }
  }, [isLogin, nav, loc]);                                                   // ★★★ 의존성 정리

  if (!isLogin) return null;

  return (
    <main className="flex-grow flex justify-center items-start py-8 px-4 bg-gray-50">
      <div className="w-full max-w-3xl">
        {/* ✅ productId를 명시적으로 전달 */}
        <ProductModifyComponent productId={Number(productId)} />
      </div>
    </main>
  );
}
