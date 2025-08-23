import BasicMenu from "../../components/menus/BasicMenu";
import ProductAddComponent from "../../components/product/ProductAddComponent";

export default function AddPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <BasicMenu />
      <main className="flex-grow flex justify-center items-start py-8 px-4">
        <div className="w-full max-w-3xl">
          <ProductAddComponent />
        </div>
      </main>
    </div>
  );
}
