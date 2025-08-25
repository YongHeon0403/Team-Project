import { useParams } from "react-router-dom";
import BasicMenu from "../../components/menus/BasicMenu";
import ProductModifyComponent from "../../components/product/ProductModifyComponent";

export default function ModifyPage() {
  const { productId } = useParams();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BasicMenu />
      <main className="flex-grow flex justify-center items-start py-8 px-4">
        <div className="w-full max-w-3xl">
          <ProductModifyComponent productId={productId} />
        </div>
      </main>
    </div>
  );
}
