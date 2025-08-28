// 상태 배지 (리스트/상세 공용)
export default function StatusBadge({ status, className = "" }) {
  const meta = {
    SELLING: { label: "판매 중", cls: "bg-emerald-600" },
    RESERVED: { label: "예약 중", cls: "bg-amber-600" },
    SOLD: { label: "거래 완료", cls: "bg-gray-600" }, // 서버에서 SOLD_OUT/COMPLETED이면 여기 value만 맞추세요
  };
  const m = meta[status] || {
    label: status || "상태 없음",
    cls: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-white text-xs ${m.cls} ${className}`}
    >
      {m.label}
    </span>
  );
}
