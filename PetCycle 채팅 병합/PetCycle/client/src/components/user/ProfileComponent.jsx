// client/src/components/user/ProfileComponent.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile, deactivateMe } from "../../api/UserProfileApi";
import { getCookie, setCookie, removeCookie } from "../../util/CookieUtil";
import SellingNowList from "./SellingNowList";
import PetTabEmbed from "./PetTabEmbed"; // ✅ 추가

const TABS = { INFO: "INFO", ACTIVITY: "ACTIVITY", PET: "PET", LIKES: "LIKES" };

const ProfileComponent = () => {
  const [tab, setTab] = useState(TABS.INFO);
  const [form, setForm] = useState({
    email: "", nickname: "", region: "", phoneNumber: "",
    currentPassword: "", newPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myUserId, setMyUserId] = useState(null);
  const navigate = useNavigate();

  const userCookie = getCookie("user") || {};
  // const userNickname = decodeURIComponent(userCookie?.nickname || "") || form.nickname || "";
  // [REMOVED] userNickname은 더 이상 "내 글 보러가기" 링크에 사용하지 않음 (userId 기반으로 전환)
  // [WHY] 닉네임은 변경/중복 가능 → 식별자로 부적합. userId가 안전함.

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProfile();
        setForm(prev => ({
          ...prev,
          email: data.email || "",
          nickname: data.nickname || "",
          region: data.region || "",
          phoneNumber: data.phoneNumber || "",
        }));
        setMyUserId(data.userId ?? null);
      } catch (e) {
        console.error(e);
        setError("내 정보를 불러오지 못했습니다.");
      } finally { setLoading(false); }
    })();
  }, []);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        nickname: form.nickname,
        region: form.region,
        phoneNumber: form.phoneNumber,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      };
      const updated = await updateMyProfile(payload);

      const nextCookie = {
        ...(getCookie("user") || {}),
        nickname: encodeURIComponent(updated.nickname || ""),
        region: updated.region || "",
        phoneNumber: updated.phoneNumber || "",
      };
      setCookie("user", nextCookie, 1);

      setForm(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      alert("수정되었습니다.");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "수정 중 오류가 발생했습니다.");
    }
  };

  const onDeactivate = async () => {
    if (!confirm("정말 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
      await deactivateMe();
      removeCookie("user"); removeCookie("accessToken"); removeCookie("refreshToken");
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/");
    } catch (e) {
      console.error(e);
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <div className="w-full max-w-6xl grid grid-cols-12 gap-6">
      {/* 좌측 탭 */}
      <aside className="col-span-12 md:col-span-3">
        <div className="flex flex-col gap-2">
          <TabBtn active={tab===TABS.INFO} onClick={()=>setTab(TABS.INFO)}>내 정보 관리</TabBtn>
          <TabBtn active={tab===TABS.ACTIVITY} onClick={()=>setTab(TABS.ACTIVITY)}>활동 내역</TabBtn>
          <TabBtn active={tab===TABS.PET} onClick={()=>setTab(TABS.PET)}>반려동물 정보</TabBtn>
          <TabBtn active={tab===TABS.LIKES} onClick={()=>setTab(TABS.LIKES)}>찜한 목록</TabBtn>
        </div>
      </aside>

      {/* 우측 컨텐츠 */}
      <main className="col-span-12 md:col-span-9">
        {tab === TABS.INFO && (
          <InfoTab form={form} error={error} onChange={onChange} onSubmit={onSubmit} onDeactivate={onDeactivate}/>
        )}

        {tab === TABS.ACTIVITY && (
          <ActivityTab userId={myUserId} />
        )}

        {/* ✅ PetTabEmbed 사용 */}
        {tab === TABS.PET && <PetTabEmbed />}

        {tab === TABS.LIKES && <LikesTabStub />}
      </main>
    </div>
  );
};

export default ProfileComponent;

/* -------------------- 하위 컴포넌트 -------------------- */

const TabBtn = ({ active, onClick, children }) => (
  <button
    className={`text-left px-4 py-3 rounded border ${active ? "bg-blue-50 border-blue-400" : "bg-white"}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const InfoTab = ({ form, error, onChange, onSubmit, onDeactivate }) => (
  <div className="w-full max-w-xl">
    <h2 className="text-2xl font-semibold mb-6">내 정보 관리</h2>
    {error && <div className="mb-4 p-3 border rounded bg-red-50 text-red-700">{error}</div>}
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="이메일"><input type="text" name="email" value={form.email} readOnly className="w-full px-3 py-2 border rounded bg-gray-100"/></Field>
      <Field label="닉네임"><input type="text" name="nickname" value={form.nickname} onChange={onChange} className="w-full px-3 py-2 border rounded"/></Field>
      <Field label="지역"><input type="text" name="region" value={form.region} onChange={onChange} className="w-full px-3 py-2 border rounded"/></Field>
      <Field label="핸드폰"><input type="text" name="phoneNumber" value={form.phoneNumber} onChange={onChange} className="w-full px-3 py-2 border rounded"/></Field>
      <hr className="my-4" />
      <Field label="현재 비밀번호"><input type="password" name="currentPassword" value={form.currentPassword} onChange={onChange} className="w-full px-3 py-2 border rounded" placeholder="비밀번호 변경 시 입력"/></Field>
      <Field label="새 비밀번호"><input type="password" name="newPassword" value={form.newPassword} onChange={onChange} className="w-full px-3 py-2 border rounded" placeholder="비밀번호 변경 시 입력"/></Field>
      <div className="pt-2 flex gap-2">
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">수정하기</button>
        <button onClick={onDeactivate} type="button" className="ml-auto px-4 py-2 rounded bg-red-600 text-white">회원 탈퇴하기</button>
      </div>
    </form>
  </div>
);

// [CHG] ActivityTab에서 userNickname prop 제거
// [WHY] 내 글 링크가 닉네임(w) → userId(u)로 변경되어 더 이상 필요 없음
const ActivityTab = ({ userId /* , userNickname */ }) => {
  // [CHG] 내 글 보러가기: 닉네임 기반(type=w) → userId 기반(type=u)
  // [WHY] 닉네임 변경/중복 이슈 방지, 서버 분기(type="u")와 연동
  const boardMyListLink =
    userId != null
      ? `/board/list?type=u&keyword=${encodeURIComponent(userId)}`
      : null; // [ADD] userId가 없으면 링크 비활성 처리

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">활동 내역</h2>

      <SectionCard title="판매 중">
        <div className="flex gap-2 mb-3">
          <Link className="px-3 py-2 rounded bg-gray-200" to="/product/list">목록 보기</Link>
          <Link className="px-3 py-2 rounded bg-blue-600 text-white" to="/product/add">상품 등록</Link>
        </div>
        <SellingNowList userId={userId}/>
      </SectionCard>

      <SectionCard title="거래 중">
        <p className="text-sm text-gray-600 mb-3">진행 중인 거래/채팅 목록입니다. (채팅/거래 모듈 연동 예정)</p>
        <button className="px-3 py-2 rounded bg-gray-300 cursor-not-allowed" disabled>상세보기 (준비중)</button>
      </SectionCard>

      <SectionCard title="판매 내역">
        <p className="text-sm text-gray-600 mb-3">완료된 판매 기록입니다. (연동 예정)</p>
        <button className="px-3 py-2 rounded bg-gray-300 cursor-not-allowed" disabled>후기 보기 (준비중)</button>
      </SectionCard>

      <SectionCard title="구매 내역">
        <p className="text-sm text-gray-600 mb-3">완료된 구매 기록입니다. (연동 예정)</p>
        <button className="px-3 py-2 rounded bg-gray-300 cursor-not-allowed" disabled>후기 작성 (준비중)</button>
      </SectionCard>

      <SectionCard title="내 게시글">
        <p className="text-sm text-gray-600 mb-3">내가 작성한 게시글만 모아봅니다.</p>
        {boardMyListLink ? (
          <Link className="px-3 py-2 rounded bg-gray-200" to={boardMyListLink}>내 글 보러가기</Link>
        ) : (
          // [ADD] userId가 아직 없을 때 가드
          <button className="px-3 py-2 rounded bg-gray-300 cursor-not-allowed" disabled>
            내 글 보러가기 (로그인/프로필 로딩 필요)
          </button>
        )}
      </SectionCard>
    </div>
  );
};

const LikesTabStub = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold">찜한 목록</h2>
    <p className="text-sm text-gray-600">찜한 상품 목록을 이곳에서 보여줄 예정입니다.</p>
    <Link className="px-3 py-2 rounded bg-blue-600 text-white" to="/product/list">상품 목록 보러가기</Link>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="border rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    {children}
  </div>
);
