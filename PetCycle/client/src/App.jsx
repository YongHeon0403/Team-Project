import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductRegisterPage from "./pages/ProductRegisterPage";
import ProductUpdatePage from "./pages/ProductUpdatePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 상품 등록 페이지 */}
        <Route path="/products/register" element={<ProductRegisterPage />} />
        {/* 상품 수정 페이지 */}
        <Route
          path="/products/update/:productId"
          element={<ProductUpdatePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
