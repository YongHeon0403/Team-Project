// client/src/components/user/ProfileComponent.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
// [REMOVED] updateMyProfile, deactivateMe 불필요 → import 제거
import { getMyProfile } from "../../api/UserProfileApi";
// [REMOVED] setCookie/removeCookie 불필요, userCookie도 미사용 → import/코드 제거
// import { getCookie, setCookie, removeCookie } from "../../util/CookieUtil";
import SellingNowList from "./SellingNowList";
import PetTabEmbed from "./PetTabEmbed";
// [ADD] 판매/구매 내역 API 임포트
import {
  listMyLikedProducts,
  listMySoldProducts,
  listMyPurchasedProducts,
} from "../../api/productApi";
import ProductCard from "../product/ProductCard";

const TABS = { INFO: "INFO", ACTIVITY: "ACTIVITY", PET: "PET", LIKES: "LIKES" };

const ProfileComponent = () => {
  const [tab, setTab] = useState(TABS.INFO);
  const [searchParams] = useSearchParams();
  const nav = useNavigate();

  // 탭 변경 시 URL도 동기화
  const goTab = (nextKey /* 'INFO' | 'PET' | 'ACTIVITY' | 'LIKES' */) => {
    // 1) 상태 변경
    if (TABS[nextKey]) setTab(TABS[nextKey]);
    // 2) URL 업데이트
    const sp = new URLSearchParams(searchParams);
    if (nextKey === "INFO") {
      sp.delete("tab"); // 기본 탭은 파라미터 제거
    } else {
      sp.set("tab", nextKey);
    }
    const qs = sp.toString();
    nav(`/user/profile${qs ? `?${qs}` : ""}`, { replace: true });
  };

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

  // URL의 ?tab=PET 등으로 진입 시 해당 탭으로 진입
  useEffect(() => {
    const t = (searchParams.get("tab") || "").toUpperCase();
    if (t && TABS[t] && tab !== TABS[t]) {
      setTab(TABS[t]);
    }
  }, [searchParams]);

  if (loading) return <div>로딩중...</div>;

  return (
    <div className="w-full max-w-6xl grid grid-cols-12 gap-6">
      {/* 좌측 탭 */}
      <aside className="col-span-12 md:col-span-3">
        <div className="flex flex-col gap-2">
          <TabBtn active={tab === TABS.INFO} onClick={() => goTab("INFO")}>
            내 정보 관리
          </TabBtn>
          <TabBtn
            active={tab === TABS.ACTIVITY}
            onClick={() => goTab("ACTIVITY")}
          >
            활동 내역
          </TabBtn>
          <TabBtn active={tab === TABS.PET} onClick={() => goTab("PET")}>
            반려동물 정보
          </TabBtn>
          <TabBtn active={tab === TABS.LIKES} onClick={() => goTab("LIKES")}>
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

        {/* [CHG] ActivityTab 내부를 '판매 중 / 판매 내역 / 구매 내역 / 내 게시글'로 구성
                - '거래 중' 섹션은 제거 */}
        {tab === TABS.ACTIVITY && <ActivityTab userId={myUserId} />}

        {/* ✅ PetTabEmbed 유지 */}
        {tab === TABS.PET && <PetTabEmbed />}

        {tab === TABS.LIKES && <LikesTab />}
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
      <div className="mb-4 p-3 border rounded bg-red-50 text-red-700">
        {error}
      </div>
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

// [CHG] ActivityTab: '거래 중' 섹션 제거 + '판매 내역/구매 내역' 실제 리스트 연동
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
          <Link
            className="px-3 py-2 rounded bg-blue-600 text-white"
            to="/product/add"
          >
            상품 등록
          </Link>
        </div>
        <SellingNowList userId={userId} />
      </SectionCard>

      {/* [REMOVED] 거래 중 섹션 전체 삭제 */}

      {/* [ADD] 판매 내역: status=SOLD & sellerId=me */}
      <SectionCard title="판매 내역">
        <SoldHistoryList userId={userId} pageSize={8} />
      </SectionCard>

      {/* [ADD] 구매 내역: buyerId=me */}
      <SectionCard title="구매 내역">
        <PurchasedHistoryList pageSize={8} />
      </SectionCard>

      <SectionCard title="내 게시글">
        <p className="text-sm text-gray-600 mb-3">
          내가 작성한 게시글만 모아봅니다.
        </p>
        {boardMyListLink ? (
          <Link className="px-3 py-2 rounded bg-gray-200" to={boardMyListLink}>
            내 글 보러가기
          </Link>
        ) : (
          <button
            className="px-3 py-2 rounded bg-gray-300 cursor-not-allowed"
            disabled
          >
            내 글 보러가기 (로그인/프로필 로딩 필요)
          </button>
        )}
      </SectionCard>
    </div>
  );
};

// [ADD] 판매 내역 리스트
const SoldHistoryList = ({ userId, pageSize = 8 }) => {
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    listMySoldProducts({ userId, page, size: pageSize })
      .then((res) => {
        const raw = res?.data ?? res;
        const items = raw.items ?? raw.dtoList ?? raw.content ?? raw.list ?? [];
        const pageInfo = raw.pageInfo ?? {
          page,
          totalPages: raw.totalPages ?? 1,
          first: !!raw.first,
          last: !!raw.last,
        };
        setData({ items, pageInfo });
      })
      .finally(() => setLoading(false));
  }, [userId, page, pageSize]);

  if (!userId) {
    return (
      <div className="text-sm text-gray-500">사용자 정보를 불러오는 중…</div>
    );
  }
  if (loading) return <div className="text-sm text-gray-500">로딩중…</div>;
  if (!data.items.length)
    return <div className="text-sm text-gray-500">판매 내역이 없습니다.</div>;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items.map((it) => (
          <ProductCard key={it.productId} item={it} />
        ))}
      </div>

      <Pager
        pageInfo={data.pageInfo}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </>
  );
};

// [ADD] 구매 내역 리스트
const PurchasedHistoryList = ({ pageSize = 8 }) => {
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    listMyPurchasedProducts({ page, size: pageSize })
      .then((res) => {
        const raw = res?.data ?? res;
        const items = raw.items ?? raw.dtoList ?? raw.content ?? raw.list ?? [];
        const pageInfo = raw.pageInfo ?? {
          page,
          totalPages: raw.totalPages ?? 1,
          first: !!raw.first,
          last: !!raw.last,
        };
        setData({ items, pageInfo });
      })
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  if (loading) return <div className="text-sm text-gray-500">로딩중…</div>;
  if (!data.items.length)
    return <div className="text-sm text-gray-500">구매 내역이 없습니다.</div>;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items.map((it) => (
          <ProductCard key={it.productId} item={it} />
        ))}
      </div>

      <Pager
        pageInfo={data.pageInfo}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </>
  );
};

// [ADD] 공통 페이저
const Pager = ({ pageInfo = {}, onPrev, onNext }) => (
  <div className="flex justify-center items-center gap-3 mt-4">
    {!pageInfo.first && (
      <button
        className="px-3 py-1 rounded border hover:bg-gray-50"
        onClick={onPrev}
      >
        이전
      </button>
    )}
    <span className="text-sm text-gray-600">
      {pageInfo.page ?? "-"} / {pageInfo.totalPages ?? "-"}
    </span>
    {!pageInfo.last && (
      <button
        className="px-3 py-1 rounded border hover:bg-gray-50"
        onClick={onNext}
      >
        다음
      </button>
    )}
  </div>
);

// [KEEP] 실제 찜 목록 탭
const LikesTab = () => {
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchPage = async (p = 1) => {
    setLoading(true);
    try {
      const res = await listMyLikedProducts({ page: p });
      const raw = res?.data ?? res;
      const items = raw.items ?? raw.dtoList ?? raw.content ?? raw.list ?? [];
      const pageInfo = raw.pageInfo ?? {
        page: (raw.number ?? 0) + 1,
        totalPages: raw.totalPages ?? 0,
        first: !!raw.first,
        last: !!raw.last,
      };
      setData({ items, pageInfo });
      setPage(pageInfo.page || p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  // 카드에서 찜 해제되면 화면에서 즉시 제거
  const handleUnlike = (pid) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.productId !== pid),
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">찜한 목록</h2>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : data.items.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          찜한 상품이 없습니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.items.map((item) => (
              <ProductCard
                key={item.productId}
                item={item}
                onUnlike={handleUnlike}
              />
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {!data.pageInfo.first && (
              <button
                className="px-3 py-1 rounded border hover:bg-gray-50"
                onClick={() => fetchPage(page - 1)}
              >
                이전
              </button>
            )}
            <span className="px-3 py-1 text-gray-600">
              {data.pageInfo.page} / {data.pageInfo.totalPages ?? "-"}
            </span>
            {!data.pageInfo.last && (
              <button
                className="px-3 py-1 rounded border hover:bg-gray-50"
                onClick={() => fetchPage(page + 1)}
              >
                다음
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

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
