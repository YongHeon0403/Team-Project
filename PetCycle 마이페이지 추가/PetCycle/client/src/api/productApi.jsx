// client/src/api/productApi.jsx
import axios from "axios";
import jwtAxios from "../util/JWTUtil";
import { API_SERVER_HOST } from "./UserApi";

const host = `${API_SERVER_HOST}/api/products`;
const catHost = `${API_SERVER_HOST}/api/product-categories`;
const DEFAULT_IMG = "/no_image.png"; // ✅ 로컬 플레이스홀더 경로

/** 유틸: 파일명 -> 뷰 URL */
export const getImageUrl = (fileName) =>
  `${host}/view/${encodeURIComponent(fileName)}`;

/** 유틸: URL/파일명 정규화 (플레이스홀더는 서버로 보내지 않음) */
const toViewUrl = (maybeName) => {
  if (!maybeName) return DEFAULT_IMG; // null/undefined → 로컬 이미지
  const v = String(maybeName).trim();

  // 이미 절대경로나 data URL이면 그대로
  if (/^(https?:)?\/\//i.test(v) || /^data:/.test(v)) return v;

  // 'no_image.png', 'no-image.png' 등은 로컬 플레이스홀더로
  if (/no[-_]?image\.png$/i.test(v)) return DEFAULT_IMG;

  // 이미 루트 경로로 주어진 정적 파일이면 그대로
  if (v.startsWith("/")) return v;

  // 그 외엔 서버 뷰 엔드포인트로 변환
  return getImageUrl(v);
};

/** 카테고리 전체 조회 (공개) */
export const listCategories = async () => {
  const { data } = await axios.get(catHost);
  return data;
};

/** 상품 목록 조회 (공개) - Spring Page → {items, pageInfo} 정규화 */
export const listProducts = async (params = {}) => {
  const page = Number(params.page || 1);
  const size = Number(params.size || 12);
  const qs = new URLSearchParams();
  qs.set("page", String(page - 1)); // Pageable 0-base
  qs.set("size", String(size));
  if (params.categoryId != null)
    qs.set("categoryId", String(params.categoryId));
  if (params.keyword) qs.set("keyword", params.keyword);
  if (params.status) qs.set("status", params.status);
  if (params.sellerId != null) qs.set("sellerId", String(params.sellerId));

  const { data } = await axios.get(`${host}?${qs.toString()}`);

  const content = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const number = (data?.number ?? 0) + 1; // 1-base 변환
  const last = data?.last ?? number >= totalPages;
  const first = data?.first ?? number <= 1;

  // 썸네일 URL 정규화
  const items = content.map((it) => ({
    ...it,
    thumbnailUrl: toViewUrl(it.thumbnailUrl),
  }));

  const pageInfo = {
    page: number,
    prev: !first,
    next: !last,
    prevPage: Math.max(1, number - 1),
    nextPage: Math.min(totalPages, number + 1),
    pageNumList: Array.from({ length: totalPages }, (_, i) => i + 1),
  };

  return {
    items,
    pageInfo,
    content: items,
    list: items,
    serverData: pageInfo,
    totalPages,
    number,
    first,
    last,
  };
};

/** 상품 단건 조회 (공개) - 이미지 URL 정규화 */
export const getProduct = async (productId) => {
  const { data } = await axios.get(`${host}/${productId}`);
  const images = Array.isArray(data.images)
    ? data.images.map((img) => ({
        ...img,
        imageUrl: toViewUrl(img.imageUrl),
      }))
    : [];
  return { ...data, images };
};

/** 폼 객체 -> FormData (ModelAttribute 매핑) */
const buildFormData = (form, images = [], keepFileNames = []) => {
  const fd = new FormData();

  // 1) 기본 필드 (문자열/숫자)
  Object.entries(form || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((vv) => fd.append(k, vv));
    else fd.append(k, v);
  });

  // 2) 기존 유지 파일명 → uploadFileNames
  (keepFileNames || []).forEach((name) => fd.append("uploadFileNames", name));

  // 3) 새 이미지
  (images || []).forEach((file) => fd.append("images", file));

  return fd;
};

/** 뷰 URL → 원래 파일명 추출 */
const extractFileName = (urlOrName) => {
  if (!urlOrName) return urlOrName;
  try {
    const u = String(urlOrName);
    if (!u.includes("/")) return u; // 이미 파일명
    return decodeURIComponent(u.split("/").pop());
  } catch {
    return urlOrName;
  }
};

/** 상품 등록 (jwt 필요) */
export const addProduct = async (form, images = []) => {
  const fd = buildFormData(form, images);
  const headers = { headers: { "Content-Type": "multipart/form-data" } };
  const { data } = await jwtAxios.post("/products", fd, headers);
  return data; // 생성된 productId(Long)
};

/**
 * 상품 수정 (jwt 필요)
 * - keepFileNames(= 유지할 기존 파일명) 없으면 자동으로 현재 파일명 조회/보존
 */
export const updateProduct = async (
  productId,
  form = {},
  images = [],
  keepFileNames
) => {
  let keep = keepFileNames;
  if (!keep || keep.length === 0) {
    try {
      const detail = await getProduct(productId);
      keep = (detail.images || []).map((img) => extractFileName(img.imageUrl));
    } catch {
      keep = [];
    }
  }
  const fd = buildFormData(form, images, keep);
  const headers = { headers: { "Content-Type": "multipart/form-data" } };
  const { data } = await jwtAxios.put(`/products/${productId}`, fd, headers);
  return data;
};

/** 상품 삭제 (jwt 필요) */
export const deleteProduct = async (productId) => {
  const { data } = await jwtAxios.delete(`/products/${productId}`);
  return data;
};

/** 상품 좋아요 토글 (jwt 필요) */
export const toggleLike = async (productId) => {
  const { data } = await jwtAxios.post(`/products/${productId}/like`);
  return data; // { productId, liked, likeCount }
};

/** (옵션) 개별 이미지 삭제 (jwt 필요) */
export const deleteImage = async (imageId) => {
  const { data } = await jwtAxios.delete(`/products/images/${imageId}`);
  return data;
};
