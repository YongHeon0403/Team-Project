// client/src/api/petApi.jsx
import axios from "axios";
import * as JWT from "../util/JWTUtil";

// jwtAxios(default or named) 우선 사용, 없으면 axios fallback
const jwtAxios =
  JWT && (JWT.jwtAxios || JWT.default) ? JWT.jwtAxios || JWT.default : axios;

export const API_SERVER_HOST =
  import.meta.env.VITE_API_SERVER || "http://localhost:8080";

// [중요] 서버는 복수형 경로 사용
const prefix = `${API_SERVER_HOST}/api/pets`;

// 서버가 제공하는 파일명을 바로 <img src>로 쓰기 위한 URL 변환
const toImageUrl = (fileName) =>
  fileName ? `${API_SERVER_HOST}/api/pets/view/${fileName}` : null;

// 외부에서 FormData를 주든, 일반 객체를 주든 모두 처리
function ensureFormData(input = {}) {
  if (input instanceof FormData) return input;

  const {
    name = "",
    age = 0,
    bodyType = "",
    breed = "",
    petTypeId = "1", // 1: 강아지, 2: 고양이 (예시)
    image, // File 객체 예상
  } = input;

  const fd = new FormData();
  fd.append("name", name);
  fd.append("age", age);
  fd.append("bodyType", bodyType);
  fd.append("breed", breed);
  fd.append("petTypeId", petTypeId);
  if (image instanceof File) fd.append("image", image);
  return fd;
}

/** 목록 조회 (page/size) */
export async function getPetList(params = { page: 1, size: 10 }) {
  const { page = 1, size = 10 } = params;
  const res = await jwtAxios.get(prefix, { params: { page, size } });
  const data = res.data;

  // Page 객체 형태를 유지하되 content만 프론트 친화적으로 매핑
  const mapped = {
    ...data,
    content: (data.content || []).map((p) => ({
      ...p, // 원본 보존 (petId, profileImageUrl 등)
      id: p.petId, // 컴포넌트에서 id로 바로 쓰기 편하게
      imageUrl: toImageUrl(p.profileImageUrl), // <img src> 바로 사용
    })),
  };
  return mapped;
}

/** 단건 조회 */
export async function getPet(petId) {
  const res = await jwtAxios.get(`${prefix}/${petId}`);
  const p = res.data;
  return {
    ...p, // 원본 유지
    id: p.petId,
    imageUrl: toImageUrl(p.profileImageUrl),
  };
}

/** 등록 (객체 or FormData 모두 허용) */
export async function registerPet(formOrFormData) {
  const fd = ensureFormData(formOrFormData);
  // 헤더는 생략(브라우저가 multipart/form-data + boundary 자동 설정)
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
