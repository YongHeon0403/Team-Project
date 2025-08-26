// src/components/pet/PetListComponent.jsx
import React, { useEffect, useState } from "react";
import { getPetList, removePet } from "../../api/petApi";
import PetCard from "./PetCard";
import { useNavigate } from "react-router-dom";

export default function PetListComponent({
  embedded = false,        // 프로필 탭 임베드 여부
  hideRegister = false,    // 상단 '등록' 버튼 숨김
  onRead,                  // 상세 이동 콜백(선택)
  onModify,                // 수정 이동 콜백(선택)
  onRegister,              // 등록 이동 콜백(선택)
  pageSize = 10,           // 페이지 사이즈 커스텀 가능
}) {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(false);

  // 기본 내비게이션 (콜백이 넘어오면 그걸 사용)
  const goRead = onRead || ((id) => nav(`/pet/read/${id}`));
  const goModify = onModify || ((id) => nav(`/pet/modify/${id}`));
  const goRegister = onRegister || (() => nav("/pet/register"));

  const load = async () => {
    try {
      setFetching(true);
      const data = await getPetList({ page: 1, size: pageSize });

      // 서버 응답 스펙(content/dtoList/list) 호환
      const list = data?.content || data?.dtoList || data?.list || [];

      // 표시 필드 정규화
      const mapped = list.map((p) => ({
        id: p.id ?? p.petId ?? p.pet_id,
        name: p.name,
        age: p.age,
        bodyType: p.bodyType ?? p.body_type,
        imageUrl: p.imageUrl ?? p.image_url,
        typeName: p.typeName ?? p.petTypeText,
      }));
      setItems(mapped);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    load();
  }, [pageSize]);

  const handleRemove = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await removePet(id);
    await load(); // 삭제 후 재조회
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">펫 프로필 목록</h2>

        {/* ✅ 프로필 탭 임베드일 때는 상단 '등록' 숨김 */}
        {!(embedded || hideRegister) && (
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={goRegister}
          >
            등록
          </button>
        )}
      </div>

      {fetching ? (
        <div className="py-12 text-center text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          등록된 프로필이 없습니다.
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onRead={goRead}
              onModify={goModify}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
