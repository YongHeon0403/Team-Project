import BasicMenu from "../../components/menus/BasicMenu";
import ProductListComponent from "../../components/product/ProductListComponent";

export default function ListPage() {
  return (
    <div className="fixed inset-0 flex flex-col">
      <BasicMenu />
      <div className="flex-grow overflow-auto flex justify-center items-start bg-white">
        <div className="w-full max-w-[1000px] p-4">
          <div className="text-2xl font-bold mb-3">상품 목록</div>
          <ProductListComponent />
        </div>
      </div>
    </div>
  );
}
