import api from "./api";

export const getKanban = () => api.get("/kanban/").then(r => r.data.kanban);
// delete
// update