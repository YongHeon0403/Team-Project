import React from "react";

export default function PetCard({ pet, onRead, onModify, onRemove }) {
  const img = pet.photoUrl || pet.imageUrl || "";

  return (
    <div className="border rounded-xl p-4 shadow-sm flex gap-4 items-center">
      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
        {img ? (
          <img src={img} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{pet.name}</div>
        <div className="text-sm text-gray-500">
          유형: {pet.typeName ?? pet.petTypeText ?? "-"} · 체형: {pet.bodyType ?? "-"} · 나이: {pet.age ?? 0}
        </div>
      </div>

      <div className="flex gap-2">
        {onRead && (
          <button className="px-3 py-1 border rounded" onClick={() => onRead(pet.id)}>
            보기
          </button>
        )}
        {onModify && (
          <button className="px-3 py-1 border rounded" onClick={() => onModify(pet.id)}>
            수정
          </button>
        )}
        {onRemove && (
          <button className="px-3 py-1 border rounded text-red-600" onClick={() => onRemove(pet.id)}>
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
