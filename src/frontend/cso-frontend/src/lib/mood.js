import api from "./api";

export const getMoods = () => api.get("/moodBoard/").then(r => r.data);
export const addMood = (payload) => api.put("/moodBoard/add", payload).then(r => r.data);
export const modifyMood = (payload) => api.post("/moodBoard/modify", payload).then(r => r.data);
export const deleteMood = (id) => api.delete(`/moodBoard/${id}`).then(r => r.data);
export const getMoodBoard= () => api.get("/moodBoard/allMoods").then(r => r.data);
