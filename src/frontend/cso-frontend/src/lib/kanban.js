import api from "./api";

export const getKanban = () => api.get("/kanban/").then(r => r.data.kanban);
export const addKanban = (paylaod) => api.put("/kanban/add", paylaod).then(r => r.data);
export const modifyKanban = (paylaod) => api.post("kanban/modify", paylaod).then(r => r.data)
export const deleteKanbanCard = (id) => api.delete(`/kanban/${id}`).then(r => r.data)