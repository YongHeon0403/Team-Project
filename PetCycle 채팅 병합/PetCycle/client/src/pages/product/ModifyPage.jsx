// client/src/pages/product/ModifyPage.jsx
import ProductModifyComponent from "../../components/product/ProductModifyComponent";
import useCustomLogin from "../../hooks/useCustomLogin";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ModifyPage() {
  const { isLogin, moveToLogin } = useCustomLogin();
  const nav = useNavigate();
  const loc = useLocation();
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!isLogin && !warnedRef.current) {
      warnedRef.current = true;
      alert("로그인이 필요합니다.");
      if (typeof moveToLogin === "function") {
        moveToLogin();
      } else {
        nav("/user/login", {
          replace: true,
          state: { from: loc.pathname + loc.search },
        });
      }
    }
  }, [isLogin, moveToLogin, nav, loc]);

  if (!isLogin) return null;

  return (
    <main className="flex-grow flex justify-center items-start py-8 px-4 bg-gray-50">
      <div className="w-full max-w-3xl">
        <ProductModifyComponent />
      </div>
    </main>
  );
}
