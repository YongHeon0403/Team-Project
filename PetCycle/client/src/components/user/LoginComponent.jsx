import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginPostAsync } from "../../slices/LoginSlice";
import { useNavigate } from "react-router-dom";
import useCustomLogin from "../../hooks/useCustomLogin";
import { setCookie } from "../../util/CookieUtil";

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

        // ✅ 토큰만 저장하는 대신, user 전체 정보를 쿠키에 저장
        setCookie("user", JSON.stringify(result), 1); // 1일

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
    <div className="card shadow p-4 w-100" style={{ maxWidth: "400px" }}>
      <div className="card-body">
        <h3 className="card-title text-center mb-4 text-primary">로그인</h3>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            이메일
          </label>
          <input
            type="text"
            className="form-control"
            id="email"
            name="email"
            value={loginParam.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            비밀번호
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={loginParam.password}
            onChange={handleChange}
          />
        </div>

        {message && (
          <div
            className={`mb-3 text-center ${
              message.startsWith("로그인 성공") ? "text-success" : "text-danger"
            }`}
          >
            {message}
          </div>
        )}

        <div className="d-grid">
          <button
            className="btn btn-primary"
            onClick={handleClickLogin}
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
