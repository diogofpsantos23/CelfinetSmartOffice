import api from "./api";

export const fetchNotes = () => api.get("/notes/").then(r => r.data.notes);
export const addNote    = (payload) => api.post("/notes/", payload).then(r => r.data.note);
export const deleteNote = (id) => api.delete(`/notes/${id}`).then(r => r.data.ok);
