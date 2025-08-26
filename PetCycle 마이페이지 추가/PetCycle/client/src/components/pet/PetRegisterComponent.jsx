// src/components/pet/PetRegisterComponent.jsx
import React, { useState } from "react";
import { registerPet } from "../../api/petApi";
import { useNavigate } from "react-router-dom";

export default function PetRegisterComponent() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    petTypeId: "1",       // 1:강아지 2:고양이 3:기타
    bodyType: "MEDIUM",
    age: 0,
    gender: "MALE",
    neutered: false,
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

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
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // 🔑 FormData로 직접 구성해서 전달하면
    // petApi가 description -> content 매핑만 해주고
    // 나머지 필드(gender, neutered 등)는 그대로 보존됩니다.
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("petTypeId", String(form.petTypeId));
    fd.append("bodyType", form.bodyType);
    fd.append("age", String(form.age ?? 0));
    fd.append("gender", form.gender);
    fd.append("neutered", String(!!form.neutered));
    fd.append("description", form.description); // petApi에서 content로 변환됨
    if (imageFile) fd.append("image", imageFile);

    await registerPet(fd);
    alert("등록되었습니다.");
    nav("/pet/list"); // 필요 시 "/user/profile?tab=PET"로 변경 가능
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

      {/* 이미지 파일 업로드 + 미리보기 */}
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

        {previewUrl && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">미리보기</span>
            <img
              src={previewUrl}
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
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="반려동물 소개를 적어주세요."
          rows={5}
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
