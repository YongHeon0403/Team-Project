import { useEffect, useState } from "react";
import { getProduct, updateProduct } from "../../api/productApi";

export default function ProductModifyComponent({ productId }) {
  const [initial, setInitial] = useState(null);
  const [form, setForm] = useState({});
  const [images, setImages] = useState([]);

  useEffect(() => {
    getProduct(productId).then((d) => {
      const init = {
        title: d.title,
        description: d.description,
        price: d.price,
        conditionStatus: d.conditionStatus,
        tradeMethod: d.tradeMethod,
        tradeLocation: d.tradeLocation,
        latitude: d.latitude,
        longitude: d.longitude,
        categoryId: d.categoryId ?? d.category?.categoryId,
        tagNames: d.tags ?? [],
      };
      setInitial(init);
      setForm(init);
    });
  }, [productId]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onImagesChange = (e) => setImages(Array.from(e.target.files || []));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProduct(Number(productId), form, images);
    window.location.href = `/product/read/${productId}`;
  };

  if (!initial) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">상품 수정</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          name="title"
          className="input input-bordered w-full"
          value={form.title}
          onChange={onChange}
          required
        />
        <textarea
          name="description"
          className="textarea textarea-bordered w-full h-32"
          value={form.description}
          onChange={onChange}
        />
        <input
          type="number"
          name="price"
          className="input input-bordered w-full"
          value={form.price ?? ""}
          onChange={onChange}
          min={0}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onImagesChange}
        />
        <div className="pt-2">
          <button className="btn btn-primary">수정</button>
        </div>
      </form>
    </div>
  );
}
