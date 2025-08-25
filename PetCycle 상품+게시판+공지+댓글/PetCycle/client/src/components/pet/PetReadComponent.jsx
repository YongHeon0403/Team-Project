// src/components/pet/PetReadComponent.jsx
import React, { useEffect, useState } from "react";
import { getPet, removePet } from "../../api/petApi";
import { useNavigate, useParams } from "react-router-dom";

export default function PetReadComponent() {
  const nav = useNavigate();
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const data = await getPet(petId);
        // 서버/DTO 케이스 혼재 대응 (snake_case / camelCase 모두 수용)
        const normalized = {
          id: data.petId ?? data.id ?? data.pet_id,
          name: data.name ?? "",
          petTypeId: data.petTypeId ?? data.pet_type_id ?? 3,
          bodyType: data.bodyType ?? data.body_type ?? "MEDIUM",
          age: data.age ?? 0,
          gender: data.gender ?? "MALE",
          neutered: Boolean(data.neutered),
          description: data.description ?? "",
          imageUrl: data.imageUrl ?? data.image_url ?? "",
          createdAt: data.createdAt ?? data.created_at,
          updatedAt: data.updatedAt ?? data.updated_at,
        };
        setPet(normalized);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [petId]);

  const onRemove = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await removePet(petId);
    alert("삭제되었습니다.");
    nav("/pet/list");
  };

  if (fetching)
    return <div className="py-12 text-center text-gray-500">Loading...</div>;
  if (!pet)
    return (
      <div className="py-12 text-center text-gray-400">데이터가 없습니다.</div>
    );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex gap-6">
        <div className="w-48 h-48 bg-gray-100 rounded overflow-hidden">
          {pet.imageUrl ? (
            <img
              src={pet.imageUrl}
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <h2 className="text-2xl font-semibold">{pet.name}</h2>
          <div className="text-gray-600">
            유형:{" "}
            {Number(pet.petTypeId) === 1
              ? "강아지"
              : Number(pet.petTypeId) === 2
              ? "고양이"
              : "기타"}
            {" · "}체형: {pet.bodyType}
            {" · "}나이: {pet.age}
          </div>
          <div className="text-gray-600">
            성별: {pet.gender === "FEMALE" ? "암" : "수"}
            {" · "}중성화: {pet.neutered ? "예" : "아니오"}
          </div>
          {pet.description && (
            <p className="text-gray-800 whitespace-pre-wrap">
              {pet.description}
            </p>
          )}
          <div className="text-xs text-gray-400">
            생성: {pet.createdAt || "-"} / 수정: {pet.updatedAt || "-"}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 border rounded"
          onClick={() => nav("/pet/list")}
        >
          목록
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={() => nav(`/pet/modify/${pet.id}`)}
        >
          수정
        </button>
        <button
          className="px-4 py-2 border rounded text-red-600"
          onClick={onRemove}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
