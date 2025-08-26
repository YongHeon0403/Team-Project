import BasicMenu from "../../components/menus/BasicMenu";
import ProductReadComponent from "../../components/product/ProductReadComponent";

export default function ReadPage() {
  return (
    <div className="fixed inset-0 flex flex-col">
      <BasicMenu />
      <div className="flex-grow overflow-auto flex justify-center items-start bg-white">
        <div className="w-full max-w-3xl p-4">
          <ProductReadComponent />
        </div>
      </div>
    </div>
  );
}
