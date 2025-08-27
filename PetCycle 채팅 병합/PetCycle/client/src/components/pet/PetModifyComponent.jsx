import React, { useEffect, useState } from "react";
import { getPet, updatePet } from "../../api/petApi"; // ← modifyPet → updatePet
import { useNavigate, useParams } from "react-router-dom";

export default function PetModifyComponent() {
  const nav = useNavigate();
  const params = useParams();
  const petId = params.petId ?? params.id;

  const [form, setForm] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const data = await getPet(petId);
        setForm({
          name: data.name ?? "",
          petTypeId: String(data.petTypeId ?? data.typeId ?? 3),
          bodyType: data.bodyType ?? "MEDIUM",
          age: Number(data.age ?? 0),
          gender: data.gender ?? "MALE",
          neutered: Boolean(data.neutered),
          content: data.description ?? data.content ?? "", // ← content로 보관/전송
          imageUrl: data.photoUrl ?? "",                  // 미리보기
        });
      } finally {
        setFetching(false);
      }
    };
    if (petId) load();
  }, [petId]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onChangeFile = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, imageUrl: preview }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await updatePet(petId, {
      name: form.name,
      petTypeId: Number(form.petTypeId),
      bodyType: form.bodyType,
      age: Number(form.age || 0),
      // gender, neutered는 서버 DTO에 없으면 보내지 않아도 OK
      content: form.content,         // ← description 대신 content 전송
      image: imageFile || undefined, // 선택 시에만 업로드
    });
    alert("수정되었습니다.");
    nav(`/pet/read/${petId}`);
  };

  if (fetching || !form)
    return <div className="py-12 text-center text-gray-500">Loading...</div>;

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">이름</span>
          <input
            className="border rounded px-3 py-2"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">유형</span>
          <select
            className="border rounded px-3 py-2"
            name="petTypeId"
            value={form.petTypeId}
            onChange={onChange}
          >
            <option value="1">강아지</option>
            <option value="2">고양이</option>
            <option value="3">기타</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">체형</span>
          <select
            className="border rounded px-3 py-2"
            name="bodyType"
            value={form.bodyType}
            onChange={onChange}
          >
            <option value="SMALL">소형</option>
            <option value="MEDIUM">중형</option>
            <option value="LARGE">대형</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">나이</span>
          <input
            className="border rounded px-3 py-2"
            type="number"
            min="0"
            name="age"
            value={form.age}
            onChange={onChange}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">성별</span>
          <select
            className="border rounded px-3 py-2"
            name="gender"
            value={form.gender}
            onChange={onChange}
          >
            <option value="MALE">수</option>
            <option value="FEMALE">암</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="neutered"
            checked={form.neutered}
            onChange={onChange}
          />
          <span>중성화 여부</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">이미지 업로드</span>
          <input
            type="file"
            accept="image/*"
            onChange={onChangeFile}
            className="border rounded px-3 py-2"
          />
        </label>

        {form.imageUrl && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">미리보기</span>
            <img
              src={form.imageUrl}
              alt="preview"
              className="w-32 h-32 object-cover rounded border"
            />
          </div>
        )}
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600">설명</span>
        <textarea
          className="border rounded px-3 py-2"
          name="content"                 // ← name을 content로
          value={form.content}
          onChange={onChange}
          placeholder="반려동물 소개를 적어주세요."
          rows={5}
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          className="px-4 py-2 border rounded"
          onClick={() => nav(`/pet/read/${petId}`)}
        >
          취소
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          저장
        </button>
      </div>
    </form>
  );
}
