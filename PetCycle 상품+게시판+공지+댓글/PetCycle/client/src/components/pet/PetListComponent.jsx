// src/components/pet/PetListComponent.jsx
import React, { useEffect, useState } from "react";
import { getPetList, removePet } from "../../api/petApi";
import PetCard from "./PetCard";
import { useNavigate } from "react-router-dom";

export default function PetListComponent() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(false);

  const load = async () => {
    try {
      setFetching(true);
      const data = await getPetList({ page: 1, size: 10 });

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
  }, []);

  const handleRead = (id) => nav(`/pet/read/${id}`);
  const handleModify = (id) => nav(`/pet/modify/${id}`);

  const handleRemove = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await removePet(id);
    await load(); // 삭제 후 재조회
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">펫 프로필 목록</h2>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={() => nav("/pet/register")}
        >
          등록
        </button>
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
              onRead={handleRead}
              onModify={handleModify}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
