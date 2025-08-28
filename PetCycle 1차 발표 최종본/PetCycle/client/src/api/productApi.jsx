// client/src/api/productApi.jsx
// -----------------------------------------------------------------------------
// 상품 API 유틸 (이미지 URL 정규화 + 목록/상세 + 등록/수정/삭제 + 상태변경)
//  - 서버 엔드포인트 가정
//    GET    /api/products?...
//    GET    /api/products/{id}
//    GET    /api/products/view/{fileName}
//    POST   /api/products                          (multipart)  images[]=File
//    PUT    /api/products/{id}                      (multipart)
//            - 텍스트: title, description(content), price, status, ...
//            - 새 이미지: images[] (여러개)
//            - 유지 목록: uploadFileNames[] (여러개) ← ★이 목록 기준으로 서버가 삭제 계산
//    DELETE /api/products/{id}
//    POST   /api/products/{id}/like
//    DELETE /api/products/images/{imageId}
// -----------------------------------------------------------------------------

import axios from "axios";
import jwtAxios from "../util/JWTUtil";
import { API_SERVER_HOST } from "./UserApi";

const host = `${API_SERVER_HOST}/api/products`;
const catHost = `${API_SERVER_HOST}/api/product-categories`;

// 로컬 플레이스홀더
const DEFAULT_IMG = "/no_image.png";

/** 파일명 -> 서버 이미지 뷰 URL */
export const getImageUrl = (fileName) =>
  fileName ? `${host}/view/${encodeURIComponent(fileName)}` : DEFAULT_IMG;

/** URL/파일명 정규화 (UI 표시용) */
const toViewUrl = (maybeName) => {
  if (!maybeName) return DEFAULT_IMG;
  const v = String(maybeName).trim();

  // 절대/데이터 URL이면 그대로
  if (/^(https?:)?\/\//i.test(v) || /^data:/.test(v)) return v;

  // 플레이스홀더 파일명
  if (/no[-_]?image\.png$/i.test(v)) return DEFAULT_IMG;

  // 루트 경로 정적 파일
  if (v.startsWith("/")) return v;

  // 파일명 → 서버 뷰 엔드포인트
  return getImageUrl(v);
};

/** 카테고리 전체 조회 */
export const listCategories = async () => {
  const { data } = await axios.get(catHost);
  return data;
};

/** 목록 조회 (Spring Page → {items, pageInfo}) */
export const listProducts = async (params = {}) => {
  const page = Number(params.page || 1);
  const size = Number(params.size || 12);

  const qs = new URLSearchParams();
  qs.set("page", String(page - 1)); // Spring Pageable 0-base
  qs.set("size", String(size));
  if (params.categoryId != null)
    qs.set("categoryId", String(params.categoryId));
  if (params.keyword) qs.set("keyword", params.keyword);
  if (params.status) qs.set("status", params.status);
  if (params.sellerId != null) qs.set("sellerId", String(params.sellerId));
  // 기본 정렬: 최신(id 내림차순) → 좌상단에 최신 상품
  if (params.sort) qs.set("sort", params.sort);
  else qs.set("sort", "productId,desc");

  const { data } = await axios.get(`${host}?${qs.toString()}`);

  const content = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const number = (data?.number ?? 0) + 1;
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

  // 다양한 호출부 호환을 위한 alias 포함
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

/** 단건 조회 (images/thumbnailUrl 정규화) */
export const getProduct = async (productId) => {
  const { data } = await axios.get(`${host}/${productId}`);

  // 서버가 images 또는 uploadFileNames 로 줄 수 있음 → 통합 처리
  let raw = [];
  if (Array.isArray(data.images)) raw = data.images;
  else if (Array.isArray(data.uploadFileNames))
    raw = data.uploadFileNames.map((fn) => ({ imageUrl: fn }));

  const images = raw.map((img) => {
    // 문자열이면 파일명으로 간주
    if (typeof img === "string") {
      return { imageUrl: toViewUrl(img) };
    }
    // 객체면 imageUrl(파일명)을 표시가능 URL로 치환
    return { ...img, imageUrl: toViewUrl(img.imageUrl || img.fileName || "") };
  });

  return {
    ...data,
    images,
    thumbnailUrl: toViewUrl(data.thumbnailUrl),
  };
};

/** Form 객체 → FormData (ModelAttribute 매핑) */
const buildFormData = (form = {}, images = [], keepFileNames = []) => {
  const fd = new FormData();

  // content → description 자동 매핑(중복 방지)
  const normalized = { ...form };
  if (normalized.content != null && normalized.description == null) {
    normalized.description = normalized.content;
    delete normalized.content;
  }

  // 1) 기본 필드
  Object.entries(normalized).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((vv) => fd.append(k, vv));
    else fd.append(k, v);
  });

  // 2) 기존 유지 파일명 → uploadFileNames[]
  (keepFileNames || []).forEach((name) => {
    const n = String(name || "").trim();
    if (!n || /no[-_]?image\.png$/i.test(n)) return; // 플레이스홀더는 제외
    fd.append("uploadFileNames", n);
  });

  // 3) 새 이미지 → images[]
  (images || []).forEach((file) => file && fd.append("images", file));

  return fd;
};

/** 뷰 URL/파일명 → 파일명만 추출 */
const extractFileName = (urlOrName) => {
  if (!urlOrName) return urlOrName;
  try {
    const u = String(urlOrName);
    if (!u.includes("/")) return u;
    return decodeURIComponent(u.split("/").pop());
  } catch {
    return String(urlOrName).split("/").pop();
  }
};

/** 등록 (jwt 필요) */
export const addProduct = async (form, images = []) => {
  const fd = buildFormData(form, images);
  const headers = { headers: { "Content-Type": "multipart/form-data" } };
  const { data } = await jwtAxios.post(`/products`, fd, headers);
  return data; // 생성된 productId
};

/**
 * 수정 (jwt 필요)
 * 4번째 인자는 다음 둘 중 하나:
 *  - string[] : keepFileNames (명시적 유지 목록)
 *  - { keepFileNames?, removeFileNames?, keepAllExisting? = true } : 옵션 객체
 *
 * 기본 동작: 기존 이미지 전부 유지 + 새 이미지 추가 (삭제 없음)
 * removeFileNames가 주어지면 → 기존 - 제거 = 유지 목록으로 계산
 */
export const updateProduct = async (
  productId,
  form = {},
  images = [],
  optsOrKeep
) => {
  // 호환 처리: 배열이면 keepFileNames로 간주
  let options = Array.isArray(optsOrKeep)
    ? { keepFileNames: optsOrKeep }
    : optsOrKeep || {};

  const { keepFileNames, removeFileNames, keepAllExisting = true } = options;

  let keep = keepFileNames;

  if (!keep) {
    // 현재 상세조회로 기존 파일명 목록 확보
    let existing = [];
    try {
      const detail = await getProduct(productId);
      existing = (detail.images || []).map((img) =>
        extractFileName(img.imageUrl)
      );
    } catch {
      existing = [];
    }

    if (Array.isArray(removeFileNames) && removeFileNames.length > 0) {
      // 제거 목록이 있으면 제외하여 유지 목록 산출
      const rm = new Set(removeFileNames.map(String));
      keep = existing.filter((fn) => !rm.has(String(fn)));
    } else if (keepAllExisting) {
      // 기본값: 전부 유지
      keep = existing;
    } else {
      // 전체 교체 시
      keep = [];
    }
  }

  const fd = buildFormData(form, images, keep);
  const headers = { headers: { "Content-Type": "multipart/form-data" } };
  const { data } = await jwtAxios.put(`/products/${productId}`, fd, headers);
  return data;
};

/** 상태만 빠르게 변경 (기존 이미지는 자동 유지) */
export const updateProductStatus = async (productId, status) => {
  return updateProduct(productId, { status }, [], { keepAllExisting: true });
};

/** 삭제 (jwt 필요) */
export const deleteProduct = async (productId) => {
  const { data } = await jwtAxios.delete(`/products/${productId}`);
  return data;
};

/** 좋아요 토글 (jwt 필요) */
export const toggleLike = async (productId) => {
  const { data } = await jwtAxios.post(`/products/${productId}/like`);
  return data; // { productId, liked, likeCount }
};

/** 개별 이미지 삭제 (jwt 필요) */
export const deleteImage = async (imageId) => {
  const { data } = await jwtAxios.delete(`/products/images/${imageId}`);
  return data;
};
