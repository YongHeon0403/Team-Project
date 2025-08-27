import React, { useEffect, useState } from "react";
import { getPetList, removePet } from "../../api/petApi";
import PetCard from "./PetCard";
import { useNavigate } from "react-router-dom";

export default function PetListComponent({
  embedded = false,
  hideRegister = false,
  onRead,
  onModify,
  onRegister,
  pageSize = 10,
}) {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(false);

  const goRead = onRead || ((id) => nav(`/pet/read/${id}`));
  const goModify = onModify || ((id) => nav(`/pet/modify/${id}`));
  const goRegister = onRegister || (() => nav("/pet/register"));

  const load = async () => {
    try {
      setFetching(true);
      const data = await getPetList({ page: 1, size: pageSize });
      const list = data?.content || data?.dtoList || data?.list || [];

      // getPetList가 이미 정규화(photoUrl) 되어옴
      const mapped = list.map((p) => ({
        id: p.petId ?? p.id ?? p.pet_id,
        name: p.name,
        age: p.age,
        bodyType: p.bodyType ?? p.body_type,
        typeName: p.typeName ?? p.petTypeText,
        photoUrl: p.photoUrl, // ← 사용 통일
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
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">펫 프로필 목록</h2>
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
