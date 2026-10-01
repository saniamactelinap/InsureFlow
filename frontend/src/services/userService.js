import api from "./api";

export const getUsers = async () => {
  const res = await api.get("/users");
  const list = res.data?.users || [];
  list.users = list;
  return list;
};

export const getUserById = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data?.user || res.data;
};

export const userService = {
  getUsers,
  getUserById,
};

export default userService;
