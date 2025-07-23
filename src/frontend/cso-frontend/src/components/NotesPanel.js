import {useEffect, useState} from "react";
import {fetchNotes, addNote, deleteNote} from "../lib/notes";
import ConfirmModal from "./ConfirmModal";

export default function NotesPanel() {
    const [notes, setNotes] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [text, setText] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const [modal, setModal] = useState({open: false, id: null, name: ""});

    useEffect(() => {
        load();
    }, []);

    async function load() {
        const list = await fetchNotes();
        setNotes(list);
    }

    async function onSubmit(e) {
        e.preventDefault();
        if (!text.trim()) return;

        const payload = { text };
        if (date) payload.date = date;
        if (time) payload.time = time;

        await addNote(payload);
        setText(""); setDate(""); setTime("");
        setOpenForm(false);
        load();
    }

    const askDelete = (id, name) =>
        setModal({open: true, id, name});

    const confirmDelete = async () => {
        await deleteNote(modal.id);
        setModal({open: false, id: null, name: ""});
        load();
    };

    return (
        <section className="notes-panel">
            <div className="notes-header">
                <h3>Lembretes / Notas</h3>
                <button className="add-note-btn" onClick={() => setOpenForm(v => !v)}>
                    Adicionar lembrete/nota
                </button>
            </div>

            {openForm && (
                <form className="note-form" onSubmit={onSubmit}>
          <textarea
              placeholder="Descrição..."
              value={text}
              onChange={e => setText(e.target.value)}
              required
              maxLength={500}
          />
                    <div className="note-form-footer">
                        <div style={{gap: "1em", display: "flex", justifyContent: "space-between"}}>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="auth-btn note-save-btn">Guardar</button>
                    </div>
                </form>
            )}

            <div className="notes-list">
                {!openForm && notes.length === 0 && (
                    <p className="notes-empty">Sem notas.</p>
                )}

                {notes.map(n => (
                    <div key={n.id} className="note-card">
                        <p className="note-text">{n.text}</p>
                        {n.date && <span className="note-date">{n.date}{n.time ? ` ${n.time}` : ""}</span>}
                        <button
                            className="note-del"
                            onClick={() => askDelete(n.id, n.text.slice(0, 20) + "...")}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <ConfirmModal
                open={modal.open}
                title="Confirmar remoção"
                message={`Remover esta nota?\n"${modal.name}"`}
                onConfirm={confirmDelete}
                onCancel={() => setModal({open: false, id: null, name: ""})}
            />
        </section>
    );
}
