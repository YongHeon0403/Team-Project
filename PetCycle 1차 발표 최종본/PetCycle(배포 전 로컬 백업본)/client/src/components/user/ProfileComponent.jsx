// client/src/components/user/ProfileComponent.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// [REMOVED] updateMyProfile, deactivateMe 불필요 → import 제거
import { getMyProfile } from "../../api/UserProfileApi";
// [REMOVED] setCookie/removeCookie 불필요, userCookie도 미사용 → import/코드 제거
// import { getCookie, setCookie, removeCookie } from "../../util/CookieUtil";
import SellingNowList from "./SellingNowList";
import PetTabEmbed from "./PetTabEmbed";

const TABS = { INFO: "INFO", ACTIVITY: "ACTIVITY", PET: "PET", LIKES: "LIKES" };

const ProfileComponent = () => {
  const [tab, setTab] = useState(TABS.INFO);

  // [CHG] 읽기전용 표시만 하므로 비밀번호 필드 제거
  const [form, setForm] = useState({
    email: "",
    nickname: "",
    region: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myUserId, setMyUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProfile();
        setForm({
          email: data.email || "",
          nickname: data.nickname || "",
          region: data.region || "",
          phoneNumber: data.phoneNumber || "",
        });
        setMyUserId(data.userId ?? null);
      } catch (e) {
        console.error(e);
        setError("내 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>로딩중...</div>;

  return (
    <div className="w-full max-w-6xl grid grid-cols-12 gap-6">
      {/* 좌측 탭 */}
      <aside className="col-span-12 md:col-span-3">
        <div className="flex flex-col gap-2">
          <TabBtn active={tab === TABS.INFO} onClick={() => setTab(TABS.INFO)}>
            내 정보 관리
          </TabBtn>
          <TabBtn
            active={tab === TABS.ACTIVITY}
            onClick={() => setTab(TABS.ACTIVITY)}
          >
            활동 내역
          </TabBtn>
          <TabBtn active={tab === TABS.PET} onClick={() => setTab(TABS.PET)}>
            반려동물 정보
          </TabBtn>
          <TabBtn active={tab === TABS.LIKES} onClick={() => setTab(TABS.LIKES)}>
            찜한 목록
          </TabBtn>
        </div>
      </aside>

      {/* 우측 컨텐츠 */}
      <main className="col-span-12 md:col-span-9">
        {/* [CHG] 기존 InfoTab(수정 가능/비번/탈퇴) → InfoTabReadOnly(전부 읽기전용 + 수정페이지 이동) */}
        {tab === TABS.INFO && (
          <InfoTabReadOnly
            form={form}
            error={error}
            onEdit={() => navigate("/user/profile/edit")} // [ADD] 수정페이지로 이동
          />
        )}

        {tab === TABS.ACTIVITY && <ActivityTab userId={myUserId} />}

        {/* ✅ PetTabEmbed 유지 */}
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
    className={`text-left px-4 py-3 rounded border ${
      active ? "bg-blue-50 border-blue-400" : "bg-white"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

/* ===================== [NEW] 읽기 전용 Info 탭 ===================== */
/* - 모든 필드 readOnly/disabled
   - 비밀번호 변경/회원탈퇴 섹션 제거
   - [수정하기] 버튼 → /user/profile/edit 로 이동 */
const InfoTabReadOnly = ({ form, error, onEdit }) => (
  <div className="w-full max-w-xl">
    <h2 className="text-2xl font-semibold mb-6">내 정보 관리</h2>
    {error && (
      <div className="mb-4 p-3 border rounded bg-red-50 text-red-700">{error}</div>
    )}
    <div className="space-y-4">
      <Field label="이메일">
        <input
          type="text"
          name="email"
          value={form.email}
          readOnly
          disabled
          className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
        />
      </Field>
      <Field label="닉네임">
        <input
          type="text"
          name="nickname"
          value={form.nickname}
          readOnly
          disabled
          className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
        />
      </Field>
      <Field label="지역">
        <input
          type="text"
          name="region"
          value={form.region}
          readOnly
          disabled
          className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
        />
      </Field>
      <Field label="핸드폰">
        <input
          type="text"
          name="phoneNumber"
          value={form.phoneNumber}
          readOnly
          disabled
          className="w-full px-3 py-2 border rounded bg-gray-100 cursor-not-allowed"
        />
      </Field>

      {/* [REMOVED] 비밀번호 변경 필드/회원탈퇴 버튼 전부 삭제 */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
        >
          수정하기
        </button>
      </div>
    </div>
  </div>
);

// [KEEP] ActivityTab은 기존 그대로 (userId 기반 링크 유지)
const ActivityTab = ({ userId }) => {
  const boardMyListLink =
    userId != null
      ? `/board/list?type=u&keyword=${encodeURIComponent(userId)}`
      : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">활동 내역</h2>

      <SectionCard title="판매 중">
        <div className="flex gap-2 mb-3">
          <Link className="px-3 py-2 rounded bg-gray-200" to="/product/list">
            목록 보기
          </Link>
          <Link className="px-3 py-2 rounded bg-blue-600 text-white" to="/product/add">
            상품 등록
          </Link>
        </div>
        <SellingNowList userId={userId} />
      </SectionCard>

      <SectionCard title="거래 중">
        <p className="text-sm text-gray-600 mb-3">
          진행 중인 거래/채팅 목록입니다. (채팅/거래 모듈 연동 예정)
        </p>
        <button className="px-3 py-2 rounded bg-gray-300 cursor-not-allowed" disabled>
          상세보기 (준비중)
        </button>
      </SectionCard>

      <SectionCard title="판매 내역">
        <p className="text-sm text-gray-600 mb-3">완료된 판매 기록입니다. (연동 예정)</p>
        <button className="px-3 py-2 rounded bg-gray-300 cursor-not-allowed" disabled>
          후기 보기 (준비중)
        </button>
      </SectionCard>

      <SectionCard title="구매 내역">
        <p className="text-sm text-gray-600 mb-3">완료된 구매 기록입니다. (연동 예정)</p>
        <button className="px-3 py-2 rounded bg-gray-300 cursor-not-allowed" disabled>
          후기 작성 (준비중)
        </button>
      </SectionCard>

      <SectionCard title="내 게시글">
        <p className="text-sm text-gray-600 mb-3">내가 작성한 게시글만 모아봅니다.</p>
        {boardMyListLink ? (
          <Link className="px-3 py-2 rounded bg-gray-200" to={boardMyListLink}>
            내 글 보러가기
          </Link>
        ) : (
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
    <Link className="px-3 py-2 rounded bg-blue-600 text-white" to="/product/list">
      상품 목록 보러가기
    </Link>
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
