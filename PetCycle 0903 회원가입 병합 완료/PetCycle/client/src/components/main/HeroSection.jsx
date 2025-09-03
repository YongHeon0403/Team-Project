import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const [q, setQ] = useState("");
  const nav = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const keyword = q.trim();
    nav(
      keyword
        ? `/product/list?page=1&keyword=${encodeURIComponent(keyword)}`
        : `/product/list?page=1`
    );
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              지금 가장 핫한 중고 반려용품
            </h1>
            <p className="text-slate-500 mt-1">
              최근 등록된 상품을 메인에서 바로 확인하세요.
            </p>
          </div>
          <form onSubmit={onSubmit} className="w-full sm:w-auto">
            <div className="flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
                placeholder="제목·태그로 검색"
                className="w-full sm:w-80 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                검색
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
