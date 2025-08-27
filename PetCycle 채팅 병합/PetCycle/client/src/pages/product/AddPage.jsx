// client/src/pages/product/AddPage.jsx
import ProductAddComponent from "../../components/product/ProductAddComponent";
import useCustomLogin from "../../hooks/useCustomLogin";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AddPage() {
  const { isLogin, moveToLogin } = useCustomLogin();
  const nav = useNavigate();
  const loc = useLocation();
  const warnedRef = useRef(false);

  // 비로그인: 알림 -> 확인 후 로그인 이동 (복귀 경로 유지)
  useEffect(() => {
    if (!isLogin && !warnedRef.current) {
      warnedRef.current = true;
      alert("로그인이 필요합니다.");
      if (typeof moveToLogin === "function") {
        moveToLogin(); // 훅에서 /user/login 처리
      } else {
        nav("/user/login", {
          replace: true,
          state: { from: loc.pathname + loc.search },
        });
      }
    }
  }, [isLogin, moveToLogin, nav, loc]);

  if (!isLogin) return null; // 이동 중 깜빡임 방지

  return (
    <main className="flex-grow flex justify-center items-start py-8 px-4 bg-gray-50">
      <div className="w-full max-w-3xl">
        <ProductAddComponent />
      </div>
    </main>
  );
}
