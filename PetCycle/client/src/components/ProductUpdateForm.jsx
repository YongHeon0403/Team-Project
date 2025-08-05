// src/components/ProductUpdateForm.jsx
import React, { useState } from "react";

function ProductUpdateForm({ initialData, onSubmit }) {
  // initialData는 수정할 상품의 기존 값
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    conditionStatus: initialData?.conditionStatus || "",
    tradeMethod: initialData?.tradeMethod || "",
    tradeLocation: initialData?.tradeLocation || "",
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",
    categoryId: initialData?.categoryId || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form); // 부모로 폼 데이터 전달
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="상품명"
        required
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="상품 설명"
        required
      />
      <input
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        placeholder="가격"
        required
      />
      <input
        name="conditionStatus"
        value={form.conditionStatus}
        onChange={handleChange}
        placeholder="상태(예: 새상품/중고)"
        required
      />
      <input
        name="tradeMethod"
        value={form.tradeMethod}
        onChange={handleChange}
        placeholder="거래 방식(예: 직거래/택배)"
        required
      />
      <input
        name="tradeLocation"
        value={form.tradeLocation}
        onChange={handleChange}
        placeholder="거래 위치"
      />
      <input
        name="latitude"
        value={form.latitude}
        onChange={handleChange}
        placeholder="위도"
      />
      <input
        name="longitude"
        value={form.longitude}
        onChange={handleChange}
        placeholder="경도"
      />
      <input
        name="categoryId"
        value={form.categoryId}
        onChange={handleChange}
        placeholder="카테고리ID"
        required
      />
      <button type="submit">수정하기</button>
    </form>
  );
}

export default ProductUpdateForm;
