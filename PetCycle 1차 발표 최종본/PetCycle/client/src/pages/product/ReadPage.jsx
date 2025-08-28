import BasicMenu from "../../components/menus/BasicMenu";
import ProductReadComponent from "../../components/product/ProductReadComponent";
import { useParams } from "react-router-dom";

export default function ReadPage() {
  const { productId } = useParams(); // ✅ 페이지에서만 params 사용
  return (
    <div className="fixed inset-0 flex flex-col">
      <BasicMenu />
      <div className="flex-grow overflow-auto flex justify-center items-start bg-white">
        <div className="w-full max-w-3xl p-4">
          {/* ✅ 자식엔 props로 전달 */}
          <ProductReadComponent productId={Number(productId)} />
        </div>
      </div>
    </div>
  );
}
