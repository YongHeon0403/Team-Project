// client/src/components/user/PetTabEmbed.jsx
import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";

// 프로젝트 경로에 맞춰 주세요
const PetList = React.lazy(() => import("../pet/PetListComponent"));

export default function PetTabEmbed() {
  const navigate = useNavigate();

  const onRead = (petId) => navigate(`/pet/read/${petId}`);
  const onModify = (petId) => navigate(`/pet/modify/${petId}`);
  const onRegister = () => navigate(`/pet/register`);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">반려동물 정보</h2>

      {/* ✅ 한 개만 유지: 펫 등록 */}
      <div>
        <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={onRegister}>
          펫 등록
        </button>
      </div>

      <Suspense fallback={<div>펫 목록 불러오는 중…</div>}>
        {/* ✅ 리스트 내부의 '등록' 버튼 숨김 */}
        <PetList embedded hideRegister onRead={onRead} onModify={onModify} />
      </Suspense>
    </div>
  );
}
