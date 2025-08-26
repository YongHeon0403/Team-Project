import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProducts, deleteProduct } from "../../api/productApi";
import { API_SERVER_HOST } from "../../api/UserApi";

function pickThumb(item) {
  const f = (item?.uploadFileNames && item.uploadFileNames[0]) || item?.thumbnail || null;
  return f ? `${API_SERVER_HOST}/api/products/view/${f}` : "/no_image.png";
}

export default function SellingNowList({ userId, pageSize = 5 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const resp = await listProducts({ page: 1, size: pageSize, sellerId: userId, status: "SELLING" });
        const list = resp?.items || resp?.dtoList || resp?.list || resp?.content || [];
        if (!ignore) setItems(list);
      } catch (e) {
        console.error(e);
        if (!ignore) setErr("판매중 상품을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [userId, pageSize]);

  const onDelete = async (id) => {
    if (!confirm("이 상품을 삭제할까요?")) return;
    try {
      await deleteProduct(id);
      setItems((prev) => prev.filter((it) => (it.productId ?? it.id) !== id));
      alert("삭제되었습니다.");
    } catch (e) {
      console.error(e);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (!userId) return <div className="text-sm text-gray-500">사용자 정보를 불러오는 중…</div>;
  if (loading)  return <div className="text-sm text-gray-500">로딩중…</div>;
  if (err)      return <div className="text-sm text-red-600">{err}</div>;
  if (!items.length) return <div className="text-sm text-gray-500">판매 중인 상품이 없습니다.</div>;

  return (
    <ul className="space-y-3">
      {items.map((it) => {
        const id = it.productId ?? it.id;
        const title = it.title ?? it.productName ?? `상품 #${id}`;
        return (
          <li key={id} className="border rounded p-3">
            <div className="flex items-center justify-between gap-3">
              {/* 왼쪽: 썸네일 + 제목 */}
              <Link to={`/product/read/${id}`} className="flex items-center gap-3">
                <img src={pickThumb(it)} alt={title} className="w-16 h-16 object-cover rounded" />
                <span className="font-medium hover:underline line-clamp-1">{title}</span>
              </Link>
              {/* 오른쪽: 수정/삭제 */}
              <div className="flex gap-2 shrink-0">
                <Link to={`/product/modify/${id}`} className="px-3 py-1 rounded border">수정</Link>
                <button onClick={() => onDelete(id)} className="px-3 py-1 rounded border">삭제</button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
