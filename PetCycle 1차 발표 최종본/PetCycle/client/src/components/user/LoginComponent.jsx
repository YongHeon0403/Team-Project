import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { loginPostAsync } from "../../slices/LoginSlice";
import { useNavigate } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";
import { setCookie } from "../../util/CookieUtil";
import KakaoLoginComponent from "./KakaoLoginComponent.jsx";

const initState = {
  email: "",
  password: "",
};

const LoginComponent = () => {
  const [loginParam, setLoginParam] = useState({ ...initState });
  const { moveToPath } = useCustomLogin();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginParam({
      ...loginParam,
      [e.target.name]: e.target.value,
    });
  };

  const handleClickLogin = async () => {
    setMessage("");
    setIsLoading(true);

    try {
      const result = await dispatch(loginPostAsync(loginParam)).unwrap();

      if (result.error) {
        setMessage("로그인 실패: " + result.error);
      } else {
        setMessage("로그인 성공!");
        setCookie("user", JSON.stringify(result), 1);
        moveToPath("/");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "로그인 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-center mb-6 text-blue-600 text-2xl font-bold">
        로그인
      </h3>

      <div className="mb-4">
        <label htmlFor="email" className="block mb-1 font-medium">
          이메일
        </label>
        <input
          type="text"
          id="email"
          name="email"
          value={loginParam.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block mb-1 font-medium">
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={loginParam.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {message && (
        <div
          className={`mb-4 text-center font-medium ${
            message.startsWith("로그인 성공")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      <button
        className={`w-full py-2 px-4 rounded text-white font-semibold ${
          isLoading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-500"
        }`}
        onClick={handleClickLogin}
        disabled={isLoading}
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>
      <KakaoLoginComponent />
    </div>
  );
};

export default LoginComponent;
