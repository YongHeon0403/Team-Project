// src/components/pet/PetRegisterComponent.jsx
import React, { useState } from "react";
import { registerPet } from "../../api/petApi";
import { useNavigate } from "react-router-dom";

export default function PetRegisterComponent() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    petTypeId: "1", // 1:강아지 2:고양이 3:기타
    bodyType: "MEDIUM",
    age: 0,
    gender: "MALE",
    neutered: false,
    description: "",
    imageUrl: "",
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await registerPet({
      name: form.name,
      petTypeId: Number(form.petTypeId),
      bodyType: form.bodyType,
      age: Number(form.age || 0),
      gender: form.gender,
      neutered: !!form.neutered,
      description: form.description,
      imageUrl: form.imageUrl,
    });
    alert("등록되었습니다.");
    nav("/pet/list");
  };

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

      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600">이미지 URL</span>
        <input
          className="border rounded px-3 py-2"
          name="imageUrl"
          value={form.imageUrl}
          onChange={onChange}
          placeholder="https://..."
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-gray-600">설명</span>
        <textarea
          className="border rounded px-3 py-2"
          name="description"
          value={form.description}
          onChange={onChange}
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          className="px-4 py-2 border rounded"
          onClick={() => nav("/pet/list")}
        >
          목록
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          등록
        </button>
      </div>
    </form>
  );
}
