// src/components/ProductRegisterForm.jsx
// [라우트 경로 예시] /products/register

import React, { useState } from "react";
import axios from "axios";

// (실전에서는 API로 불러오는 데이터, 여기서는 하드코딩)
const CATEGORY_LIST = [
  { id: 1, name: "강아지 용품" },
  { id: 2, name: "고양이 용품" },
  { id: 3, name: "기타" },
];

const CONDITION_STATUS_LIST = ["새상품", "사용감 있음", "사용감 많음"];

const TRADE_METHOD_LIST = ["직거래", "택배거래", "기타"];

const ProductRegisterForm = () => {
  const [form, setForm] = useState({
    sellerId: "",
    categoryId: "",
    title: "",
    description: "",
    price: "",
    conditionStatus: "",
    tradeMethod: "",
    tradeLocation: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        sellerId: Number(form.sellerId),
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };
      await axios.post("/api/products", payload, {
        headers: { "Content-Type": "application/json" },
      });
      setMessage("✅ 상품이 성공적으로 등록되었습니다!");
      setForm({
        sellerId: "",
        categoryId: "",
        title: "",
        description: "",
        price: "",
        conditionStatus: "",
        tradeMethod: "",
        tradeLocation: "",
        latitude: "",
        longitude: "",
      });
    } catch (err) {
      setMessage(
        "❌ 등록 실패: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 480,
        margin: "40px auto",
        background: "#fff",
        padding: 28,
        borderRadius: 12,
        boxShadow: "0 4px 16px #eee",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <h2 style={{ margin: 0, fontWeight: "bold" }}>상품 등록</h2>

      <input
        name="sellerId"
        value={form.sellerId}
        onChange={handleChange}
        placeholder="판매자 ID (임시입력)"
        required
        autoComplete="off"
      />
      <select
        name="categoryId"
        value={form.categoryId}
        onChange={handleChange}
        required
      >
        <option value="">카테고리 선택</option>
        {CATEGORY_LIST.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="상품명"
        maxLength={100}
        required
        autoComplete="off"
      />
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="상품 설명"
        rows={4}
        maxLength={2000}
        required
        style={{ resize: "vertical" }}
      />
      <input
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        placeholder="가격 (숫자만)"
        min={0}
        required
      />
      <select
        name="conditionStatus"
        value={form.conditionStatus}
        onChange={handleChange}
        required
      >
        <option value="">상품 상태 선택</option>
        {CONDITION_STATUS_LIST.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        name="tradeMethod"
        value={form.tradeMethod}
        onChange={handleChange}
        required
      >
        <option value="">거래 방식 선택</option>
        {TRADE_METHOD_LIST.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <input
        name="tradeLocation"
        value={form.tradeLocation}
        onChange={handleChange}
        placeholder="거래 지역(예: 서울 강남구)"
        maxLength={100}
        required
        autoComplete="off"
      />
      <div style={{ display: "flex", gap: 12 }}>
        <input
          name="latitude"
          type="number"
          value={form.latitude}
          onChange={handleChange}
          placeholder="위도(선택)"
          step="any"
        />
        <input
          name="longitude"
          type="number"
          value={form.longitude}
          onChange={handleChange}
          placeholder="경도(선택)"
          step="any"
        />
      </div>
      <button
        type="submit"
        style={{
          background: "#366ef1",
          color: "#fff",
          fontWeight: "bold",
          padding: "12px 0",
          border: "none",
          borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: 17,
        }}
        disabled={loading}
      >
        {loading ? "등록 중..." : "상품 등록"}
      </button>
      {message && (
        <div
          style={{
            color: message.startsWith("✅") ? "#1AAB13" : "#e44242",
            fontWeight: "bold",
            minHeight: 24,
          }}
        >
          {message}
        </div>
      )}
    </form>
  );
};

export default ProductRegisterForm;
