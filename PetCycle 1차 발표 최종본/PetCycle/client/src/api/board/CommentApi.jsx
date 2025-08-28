// src/api/board/CommentApi.js
import axios from "axios";
import jwtAxios from "../../util/JWTUtil";
import { API_SERVER_HOST } from "../UserApi";

const host = `${API_SERVER_HOST}/api/comment`;

/**
 * 부모 댓글 페이징 조회
 * 응답 형태:
 * {
 *   parentComments: BoardCommentDTO[],
 *   page: number,
 *   size: number,
 *   totalElements: number,
 *   totalPages: number
 * }
 */
export const getCommentsPage = async (postId, page = 0, size = 10) => {
  const res = await axios.get(`${host}/board/${postId}`, {
    params: { page, size },
  });
  return res.data; // res.data.parentComments 로 리스트 접근
};

/**
 * 게시글의 전체 댓글 개수 조회
 * 응답: { totalComments: number }
 */
export const getCommentsCount = async (postId) => {
  const res = await axios.get(`${host}/board/${postId}/count`);
  return res.data?.totalComments ?? 0;
};

/**
 * 댓글/대댓글 등록 (인증 필요)
 * body: { postId, content, parentId? }
 * 응답: { commentId: number }
 */
export const addComment = async ({ postId, content, parentId = null }) => {
  const payload = { postId, content, parentId };
  const res = await jwtAxios.post(`${host}/`, payload);
  return res.data;
};

/**
 * 댓글 수정 (인증 필요)
 * body: { content }
 * 응답: { message: string } (성공 시)
 */
export const modifyComment = async (commentId, content) => {
  const res = await jwtAxios.put(`${host}/${commentId}`, { content });
  return res.data;
};

/**
 * 댓글 삭제 (인증 필요)
 * 응답: { message: string } (성공 시)
 */
export const removeComment = async (commentId) => {
  const res = await jwtAxios.delete(`${host}/${commentId}`);
  return res.data;
};
