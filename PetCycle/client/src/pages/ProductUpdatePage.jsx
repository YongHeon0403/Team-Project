// src/pages/ProductUpdatePage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductUpdateForm from "../components/ProductUpdateForm";

function ProductUpdatePage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 상품 정보 조회
  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("상품 조회 실패");
        return res.json();
      })
      .then((data) => {
        setInitialData(data);
        setLoading(false);
      })
      .catch(() => {
        alert("상품 정보를 불러오지 못했습니다.");
        setLoading(false);
      });
  }, [productId]);

  // 수정 요청
  const handleUpdate = (form) => {
    fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (!res.ok) throw new Error("수정 실패");
        return res.json();
      })
      .then(() => {
        alert("수정 완료!");
        navigate(`/products/${productId}`); // 수정 후 상세 페이지 등으로 이동
      })
      .catch(() => {
        alert("수정에 실패했습니다.");
      });
  };

  if (loading) return <div>Loading...</div>;
  if (!initialData) return <div>상품 정보를 불러오지 못했습니다.</div>;

  return (
    <div>
      <h2>상품 수정</h2>
      <ProductUpdateForm initialData={initialData} onSubmit={handleUpdate} />
    </div>
  );
}

export default ProductUpdatePage;
