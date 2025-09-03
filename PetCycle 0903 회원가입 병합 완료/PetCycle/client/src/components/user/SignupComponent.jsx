// 회원가입
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const initState = {
  email: "",
  password: "",
  confirmPassword: "",
  username: "",
  nickname: "",
  phoneNumber: "",
  region: "",
};

const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const usernameRegExp = /^[가-힣]{2,}|[a-zA-Z]{4,}$/;
const nicknameRegExp = /^[가-힣]{2,}|[a-zA-Z]{4,}$/;
const phoneNumberRegExp = /^010-\d{4}-\d{4}$/;

const SignupComponent = () => {
  // useState의 초기값으로 initState를 사용합니다.
  const [signupData, setSignupData] = useState(initState);

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [emailAvailability, setEmailAvailability] = useState(null);
  const [nicknameAvailability, setNicknameAvailability] = useState(null);
  const [phoneNumberAvailability, setPhoneNumberAvailability] = useState(null);

  const [emailValidity, setEmailValidity] = useState(false);
  const [passwordValidity, setPasswordValidity] = useState(false);
  const [usernameValidity, setUsernameValidity] = useState(false);
  const [nicknameValidity, setNicknameValidity] = useState(false);
  const [phoneNumberValidity, setPhoneNumberValidity] = useState(false);

  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === "phoneNumber") {
      processedValue = value.replace(/[^0-9]/g, "");
      if (processedValue.length > 3 && processedValue.length <= 7) {
        processedValue =
          processedValue.substring(0, 3) + "-" + processedValue.substring(3);
      } else if (processedValue.length > 7) {
        processedValue =
          processedValue.substring(0, 3) +
          "-" +
          processedValue.substring(3, 7) +
          "-" +
          processedValue.substring(7, 11);
      }
    }

    setSignupData({ ...signupData, [name]: processedValue });
    setMessage("");
  };

  const checkEmail = async (email) => {
    if (!email) {
      setEmailAvailability(null);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/check-email",
        { email }
      );
      setEmailAvailability(response.data.isAvailable);
    } catch (error) {
      console.error("이메일 중복 확인 실패:", error);
      setEmailAvailability(false);
    }
  };

  const checkNickname = async (nickname) => {
    if (!nickname) {
      setNicknameAvailability(null);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/check-nickname",
        { nickname }
      );
      setNicknameAvailability(response.data.isAvailable);
    } catch (error) {
      console.error("닉네임 중복 확인 실패:", error);
      setNicknameAvailability(false);
    }
  };

  const checkPhoneNumber = async (phoneNumber) => {
    if (!phoneNumber) {
      setPhoneNumberAvailability(null);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/check-phone-number",
        { phoneNumber }
      );
      setPhoneNumberAvailability(response.data.isAvailable);
    } catch (error) {
      console.error("휴대폰 번호 중복 확인 실패:", error);
      setPhoneNumberAvailability(false);
    }
  };

  useEffect(() => {
    const emailTimer = setTimeout(() => {
      checkEmail(signupData.email);
    }, 500);

    const nicknameTimer = setTimeout(() => {
      checkNickname(signupData.nickname);
    }, 500);

    const phoneNumberTimer = setTimeout(() => {
      checkPhoneNumber(signupData.phoneNumber);
    }, 500);

    setEmailValidity(emailRegExp.test(signupData.email));
    setPasswordValidity(passwordRegExp.test(signupData.password));
    setPasswordMatch(signupData.password === signupData.confirmPassword);
    setUsernameValidity(usernameRegExp.test(signupData.username));
    setNicknameValidity(nicknameRegExp.test(signupData.nickname));
    setPhoneNumberValidity(phoneNumberRegExp.test(signupData.phoneNumber));

    return () => {
      clearTimeout(emailTimer);
      clearTimeout(nicknameTimer);
      clearTimeout(phoneNumberTimer);
    };
  }, [signupData]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        if (isSuccess) {
          navigate("/user/login");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, isSuccess, navigate]);

  const handleCancel = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailValidity || emailAvailability === false) {
      setMessage("이메일 형식 또는 중복을 확인해주세요.");
      setIsSuccess(false);
      return;
    }
    if (!passwordValidity) {
      setMessage("비밀번호는 영문, 숫자 조합 8자리 이상이어야 합니다.");
      setIsSuccess(false);
      return;
    }
    if (!passwordMatch) {
      setMessage("비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
      setIsSuccess(false);
      return;
    }
    if (!usernameValidity) {
      setMessage("이름은 한글 2글자 이상, 영문 4글자 이상이어야 합니다.");
      setIsSuccess(false);
      return;
    }
    if (!nicknameValidity || nicknameAvailability === false) {
      setMessage("닉네임 형식 또는 중복을 확인해주세요.");
      setIsSuccess(false);
      return;
    }
    if (!phoneNumberValidity || phoneNumberAvailability === false) {
      setMessage("휴대폰 번호 형식 또는 중복을 확인해주세요.");
      setIsSuccess(false);
      return;
    }
    if (!signupData.region) {
      setMessage("지역을 선택해주세요.");
      setIsSuccess(false);
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/auth/signup", {
        email: signupData.email,
        password: signupData.password,
        phoneNumber: signupData.phoneNumber,
        username: signupData.username,
        nickname: signupData.nickname,
        region: signupData.region,
      });
      setMessage("회원가입이 완료되었습니다.");
      setIsSuccess(true);
    } catch (error) {
      console.error("회원가입 실패:", error);
      setMessage("회원가입에 실패했습니다. 다시 시도해주세요.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h2 className="text-2xl font-bold mb-4">회원가입</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-center text-sm font-bold ${
            isSuccess
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        {/* 이메일 */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
            이메일
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={signupData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          {signupData.email.length > 0 && (
            <p
              className={`mt-2 text-sm ${
                emailValidity && emailAvailability
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {!emailValidity
                ? "올바르지 않은 이메일 형식입니다."
                : emailAvailability
                ? "사용 가능한 이메일입니다."
                : "중복되는 이메일입니다."}
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="password"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={signupData.password}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          {signupData.password.length > 0 && (
            <p
              className={`mt-2 text-sm ${
                passwordValidity ? "text-green-500" : "text-red-500"
              }`}
            >
              {passwordValidity
                ? "사용가능한 비밀번호입니다."
                : "영문, 숫자 조합 8자리 이상"}
            </p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div className="mb-6">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="confirmPassword"
          >
            비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={signupData.confirmPassword}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          {signupData.password.length > 0 &&
            signupData.confirmPassword.length > 0 && (
              <p
                className={`mt-2 text-sm ${
                  passwordMatch ? "text-green-500" : "text-red-500"
                }`}
              >
                {passwordMatch
                  ? "비밀번호가 일치합니다."
                  : "비밀번호가 일치하지 않습니다."}
              </p>
            )}
        </div>

        {/* 이름 */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="username"
          >
            이름
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={signupData.username}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          {signupData.username.length > 0 && (
            <p
              className={`mt-2 text-sm ${
                usernameValidity ? "text-green-500" : "text-red-500"
              }`}
            >
              {usernameValidity
                ? "사용가능한 이름 형식입니다."
                : "한글 2글자 이상, 영어 4글자 이상"}
            </p>
          )}
        </div>

        {/* 닉네임 */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="nickname"
          >
            닉네임
          </label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={signupData.nickname}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          {signupData.nickname.length > 0 && (
            <p
              className={`mt-2 text-sm ${
                nicknameValidity && nicknameAvailability
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {!nicknameValidity
                ? "한글 2글자 이상, 영어 4글자 이상"
                : nicknameAvailability
                ? "사용 가능한 닉네임입니다."
                : "중복되는 닉네임입니다."}
            </p>
          )}
        </div>

        {/* 휴대폰 번호 */}
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="phoneNumber"
          >
            휴대폰 번호
          </label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={signupData.phoneNumber}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          {signupData.phoneNumber.length > 0 && (
            <p
              className={`mt-2 text-sm ${
                phoneNumberValidity && phoneNumberAvailability
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {!phoneNumberValidity
                ? "올바르지 않은 휴대폰 번호 형식입니다."
                : phoneNumberAvailability
                ? "사용 가능한 휴대폰 번호입니다."
                : "중복되는 휴대폰 번호입니다."}
            </p>
          )}
        </div>

        {/* 지역 */}
        <div className="mb-6">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="region"
          >
            지역
          </label>
          <select
            id="region"
            name="region"
            value={signupData.region}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">지역을 선택하세요</option>
            <option value="서울">서울</option>
            <option value="경기">경기</option>
            <option value="인천">인천</option>
            <option value="강원">강원</option>
            <option value="충북">충북</option>
            <option value="충남">충남</option>
            <option value="세종">세종</option>
            <option value="대전">대전</option>
            <option value="경북">경북</option>
            <option value="경남">경남</option>
            <option value="대구">대구</option>
            <option value="울산">울산</option>
            <option value="부산">부산</option>
            <option value="전북">전북</option>
            <option value="전남">전남</option>
            <option value="광주">광주</option>
            <option value="제주">제주</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            회원가입
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            취소(메인페이지로 이동)
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignupComponent;
