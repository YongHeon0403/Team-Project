// client/src/api/orderApi.jsx
import jwtAxios from "../util/JWTUtil";
import { API_SERVER_HOST } from "./UserApi";

const ordersHost = `${API_SERVER_HOST}/api/orders`;

/**
 * 거래(주문) 등록
 * POST /api/orders
 */
export const registerTransaction = async ({ productId, finalPrice }) => {
  const payload = { productId, finalPrice };
  const { data } = await jwtAxios.post(ordersHost, payload);
  // 백엔드 응답 키가 프로젝트별로 다를 수 있어 안전하게 처리
  return data?.orderId ?? data?.transactionId ?? data?.id ?? data;
};

// [ADD] 이 상품에 대해 "나"의 활성 거래가 있는지
export const hasActiveTransaction = async (productId) => {
  const { data } = await jwtAxios.get(
    `${API_SERVER_HOST}/api/orders/transactions/active/me`,
    {
      params: { productId: Number(productId) },
    }
  );
  return !!data?.active;
};
