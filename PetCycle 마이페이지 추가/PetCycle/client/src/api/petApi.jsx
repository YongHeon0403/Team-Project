// client/src/api/petApi.jsx
import axios from "axios";
import * as JWT from "../util/JWTUtil";

// jwtAxios(default or named) 우선 사용, 없으면 axios fallback
const jwtAxios =
  JWT && (JWT.jwtAxios || JWT.default) ? JWT.jwtAxios || JWT.default : axios;

export const API_SERVER_HOST =
  import.meta.env.VITE_API_SERVER || "http://localhost:8080";

// 서버는 복수형 경로 사용
const prefix = `${API_SERVER_HOST}/api/pets`;

// 서버가 제공한 파일명을 <img src>로 쓰기 위한 URL
const toImageUrl = (fileName) =>
  fileName ? `${API_SERVER_HOST}/api/pets/view/${fileName}` : null;

/** FormData에 description만 들어왔을 때 → content 로 매핑 */
function mapFDDescToContent(fd) {
  if (fd instanceof FormData) {
    if (fd.has("description") && !fd.has("content")) {
      fd.set("content", fd.get("description"));
      try {
        fd.delete("description"); // 선택: 서버가 모르는 키 제거
      } catch {}
    }
  }
  return fd;
}

// 외부에서 FormData를 주든, 일반 객체를 주든 모두 처리
function ensureFormData(input = {}) {
  if (input instanceof FormData) return mapFDDescToContent(input);

  const {
    name = "",
    age = 0,
    bodyType = "",
    breed = "",
    petTypeId = "1", // 1: 강아지, 2: 고양이 (예시)
    image, // File 객체 예상

    // ✅ 추가: 누락되던 필드들
    gender = "MALE",
    neutered = false,

    // 화면에서는 description을 쓰지만 서버는 content로 받음
    description = "",
    content, // content가 오면 우선
  } = input;

  const fd = new FormData();
  fd.append("name", name);
  fd.append("age", age);
  fd.append("bodyType", bodyType);
  fd.append("breed", breed);
  fd.append("petTypeId", petTypeId);

  // ✅ 추가된 필드 전송
  fd.append("gender", gender);
  fd.append("neutered", String(!!neutered));

  if (image instanceof File) fd.append("image", image);

  // ✅ 서버 호환 키로 전송
  fd.append("content", content ?? description ?? "");

  return fd;
}

// helper: 나이 표준화
const normalizeAge = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** 목록 조회 (page/size) — 서버 Pageable(0-based) 보정 */
export async function getPetList(params = { page: 1, size: 10 }) {
  const { page = 1, size = 10 } = params;
  const page0 = Math.max((Number(page) || 1) - 1, 0); // 0-based 보정

  const res = await jwtAxios.get(prefix, { params: { page: page0, size } });
  const data = res.data || {};

  const items = (data.content || []).map((p) => {
    // ✅ 여러 가능성 커버: age / petAge / pet_age / years / ageYears ...
    const ageRaw =
      p.age ?? p.petAge ?? p.pet_age ?? p.years ?? p.ageYears ?? null;

    return {
      ...p, // 원본 보존
      id: p.petId ?? p.id,
      imageUrl: toImageUrl(p.profileImageUrl),
      age: normalizeAge(ageRaw), // 🔑 항상 숫자로 보정
    };
  });

  return {
    ...data,
    content: items,
    dtoList: items, // 팀원 스타일 호환
    list: items,    // 일부 컴포넌트 호환
    page: (data.number ?? page0) + 1,   // 1-based로 보정
    current: (data.number ?? page0) + 1,
  };
}

/** 단건 조회 */
export async function getPet(petId) {
  const res = await jwtAxios.get(`${prefix}/${petId}`);
  const p = res.data || {};
  return {
    ...p, // 원본 유지
    id: p.petId ?? p.id,
    imageUrl: toImageUrl(p.profileImageUrl),
    // ✅ 서버의 content(또는 기타 키)를 프론트 표준인 description으로 정규화
    description:
      p.description ??
      p.content ??
      p.contents ??
      p.introduce ??
      p.intro ??
      p.desc ??
      "",
  };
}

/** 등록 (객체 or FormData 모두 허용) */
export async function registerPet(formOrFormData) {
  const fd = ensureFormData(formOrFormData);
  const res = await jwtAxios.post(prefix, fd);
  return res.data;
}

/** 수정 (객체 or FormData 모두 허용) */
export async function modifyPet(petId, formOrFormData) {
  const fd = ensureFormData(formOrFormData);
  const res = await jwtAxios.put(`${prefix}/${petId}`, fd);
  return res.data;
}

/** 삭제 */
export async function removePet(petId) {
  const res = await jwtAxios.delete(`${prefix}/${petId}`);
  return res.data;
}
