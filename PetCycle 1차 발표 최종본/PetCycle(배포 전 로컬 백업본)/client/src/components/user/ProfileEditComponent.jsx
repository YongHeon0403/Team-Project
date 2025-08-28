// client/src/components/user/ProfileEditComponent.jsx
import React, { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../../api/UserProfileApi";
import { getCookie, setCookie } from "../../util/CookieUtil";
import { useNavigate } from "react-router-dom";

export default function ProfileEditComponent() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // [CHG] 수직 정렬용 단일 폼 상태 + 비밀번호 섹션 추가
  const [form, setForm] = useState({
    email: "",
    nickname: "",
    region: "",
    phoneNumber: "",
    currentPassword: "",    // [ADD] 현재 비밀번호
    newPassword: "",        // [ADD] 새 비밀번호
    newPasswordConfirm: "", // [ADD] 새 비밀번호 확인
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const me = await getMyProfile();
        setForm((prev) => ({
          ...prev,
          email: me.email || "",
          nickname: me.nickname || "",
          region: me.region || "",
          phoneNumber: me.phoneNumber || "",
        }));
      } catch (e) {
        console.error(e);
        setError("내 프로필 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // [ADD] 비밀번호 섹션 유효성 검사
  const validatePasswordSection = () => {
    const { currentPassword, newPassword, newPasswordConfirm } = form;

    // 세 필드 중 하나라도 입력되면 → 비밀번호 변경 모드로 간주
    const wantsPasswordChange =
      currentPassword.trim() || newPassword.trim() || newPasswordConfirm.trim();

    if (!wantsPasswordChange) return { ok: true };

    if (!currentPassword.trim())
      return { ok: false, msg: "현재 비밀번호를 입력해주세요." };
    if (!newPassword.trim())
      return { ok: false, msg: "새 비밀번호를 입력해주세요." };
    if (newPassword.length < 4)
      return { ok: false, msg: "새 비밀번호는 4자 이상이어야 합니다." };
    if (newPassword !== newPasswordConfirm)
      return { ok: false, msg: "새 비밀번호와 확인 값이 일치하지 않습니다." };

    return { ok: true, wantsPasswordChange: true };
  };

  // [CHG] 수직 정렬 UI + 비밀번호 섹션 포함 저장 로직
  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const pwCheck = validatePasswordSection();
    if (!pwCheck.ok) {
      setError(pwCheck.msg);
      return;
    }

    try {
      setSaving(true);

      // 기본 프로필 필드
      const payload = {
        nickname: form.nickname,
        region: form.region,
        phoneNumber: form.phoneNumber,
      };

      // [ADD] 비밀번호 변경을 원하는 경우에만 포함해서 전송
      if (pwCheck.wantsPasswordChange) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const updated = await updateMyProfile(payload);

      // [KEEP] 쿠키의 표시용 값 갱신 (닉네임/지역/전화번호)
      const prevCookie = getCookie("user") || {};
      const nextCookie = {
        ...prevCookie,
        nickname: encodeURIComponent(updated.nickname || form.nickname || ""),
        region: updated.region || form.region || "",
        phoneNumber: updated.phoneNumber || form.phoneNumber || "",
      };
      setCookie("user", nextCookie, 1);

      // [CHG] 비밀번호 입력값은 성공 시 즉시 초기화
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      }));

      alert("수정되었습니다.");
      nav("/user/profile", { replace: true });
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">불러오는 중...</div>;

  return (
    // [CHG] 수직 정렬 레이아웃: max-w-xl + 각 필드가 위아래로 쌓이는 형태
    <form className="max-w-xl w-full space-y-6" onSubmit={onSubmit}>
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">프로필 수정</h3>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 rounded">
            {error}
          </div>
        )}

        {/* ===== 기본 정보 (수직 정렬) ===== */}
        <Field label="이메일">
          <input
            type="email"
            name="email"
            value={form.email}
            readOnly
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </Field>

        <Field label="닉네임">
          <input
            type="text"
            name="nickname"
            value={form.nickname}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="닉네임"
            required
          />
        </Field>

        <Field label="지역">
          <input
            type="text"
            name="region"
            value={form.region}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="예) 서울"
            required
          />
        </Field>

        <Field label="전화번호">
          <input
            type="text"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="예) 010-1234-5678"
          />
        </Field>
      </div>

      {/* ===== [ADD] 비밀번호 수정 섹션 ===== */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">비밀번호 수정</h3>
        <p className="text-sm text-gray-600 mb-3">
          비밀번호를 변경하지 않으려면 아래 입력란을 비워두세요.
        </p>

        <Field label="현재 비밀번호">
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="현재 비밀번호"
            autoComplete="current-password"
          />
        </Field>

        <Field label="새 비밀번호 (4자 이상)">
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="새 비밀번호"
            autoComplete="new-password"
          />
        </Field>

        <Field label="새 비밀번호 확인">
          <input
            type="password"
            name="newPasswordConfirm"
            value={form.newPasswordConfirm}
            onChange={onChange}
            className="w-full border rounded px-3 py-2"
            placeholder="새 비밀번호 확인"
            autoComplete="new-password"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => nav("/user/profile")}
          className="px-4 py-2 rounded bg-gray-200"
          disabled={saving}
        >
          취소
        </button>
        <button
          type="submit"
          className={`px-4 py-2 rounded text-white ${
            saving ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
          }`}
          disabled={saving}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}

/* -------------------- 공용 필드 래퍼 (수직 정렬) -------------------- */
function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block font-medium">{label}</label>
      {children}
    </div>
  );
}
