import axios from "axios";

export const API_SERVER_HOST = "http://localhost:8080";
// 나중에 서버포트로 변경해야됨

const prefix = `${API_SERVER_HOST}/api/board`;

export const getOne = async (postId) => {
  const res = await axios.get(`${prefix}` / { postId });
  return res.data;
};

export const getList = async (pageParam) => {
  const { page, size } = pageParam;
  const res = await axios.get(`${prefix}/list`, {
    params: { page: page, size: size },
  });
  return res.data;
};

export const postAdd = async (todoObj) => {
  const res = await axios.post(`${prefix}/`, todoObj);
  return res.data;
};

export const deleteOne = async (postId) => {
  const res = await axios.delete(`${prefix}/${postId}`);
  return res.data;
};

export const putOne = async (post) => {
  const res = await axios.put(`${prefix}/${post.postId}`, post);
  return res.data;
};
