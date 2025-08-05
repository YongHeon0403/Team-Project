// src/pages/ProductRegisterPage.jsx
// [라우트 경로 예시] /products/register

import React from "react";
import ProductRegisterForm from "../components/ProductRegisterForm";

const ProductRegisterPage = () => (
  <div style={{ background: "#f7f8fa", minHeight: "100vh" }}>
    <ProductRegisterForm />
  </div>
);

export default ProductRegisterPage;
