import { useEffect } from "react";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onCancel();
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onCancel]);

    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="btn cancel" onClick={onCancel}>Cancelar</button>
                    <button className="btn danger" onClick={onConfirm}>Confirmar</button>
                </div>
            </div>
        </div>
    );
}
