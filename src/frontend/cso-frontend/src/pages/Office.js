import { useEffect, useState, useContext } from "react";
import api from "../lib/api";
import SeatIcon from "../components/SeatIcon";
import ConfirmModal from "../components/ConfirmModal";
import { AuthContext } from "../context/AuthContext";
import {
    mondayOf, addWeeks, weeksDiff,
    toISO, ptWeekday, formatDatePT
} from "../utils/date";

const CAP_OPTIONS = [4, 5, 6, 7, 8, 9, 10];

export default function Office() {
    const { user } = useContext(AuthContext);

    const baseMonday = mondayOf();
    const [weekStart, setWeekStart] = useState(baseMonday);
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);

    const [confirm, setConfirm] = useState({ open: false, day: null, uid: null, name: "" });

    const maxAhead = 2;

    useEffect(() => {
        loadWeek();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [weekStart]);

    async function loadWeek() {
        setLoading(true);
        const { data } = await api.get("/office/week", { params: { start: toISO(weekStart) } });
        setDays(data.days);
        setLoading(false);
    }

    const ahead = weeksDiff(baseMonday, weekStart);
    const disablePrev = ahead <= 0;
    const disableNext = ahead >= maxAhead;

    // --- BLOQUEIOS POR DATA/HORA ---
    const now = new Date();
    const todayISO = now.toISOString().slice(0, 10);
    const currentMinutes = now.getHours() * 60 + now.getMinutes(); // minutos do dia
    const LOCK_MINUTES = 9 * 60; // 09:00
    const isCurrentWeek = ahead === 0;

    async function toggle(day) {
        try {
            if (day.bookedByMe) {
                await api.delete(`/office/book/${day.date}`);
            } else {
                await api.post("/office/book", { date: day.date });
            }
            await loadWeek();
        } catch (e) {
            console.error(e);
        }
    }

    async function changeCapacity(dayIso, newCap) {
        try {
            await api.patch(`/office/day/${dayIso}/capacity`, { capacity: newCap });
            await loadWeek();
        } catch (err) {
            console.error(err);
            alert("Não foi possível alterar a capacidade.");
        }
    }

    async function confirmRemove() {
        try {
            await api.delete(`/office/day/${confirm.day}/user/${confirm.uid}`);
            setConfirm({ open: false, day: null, uid: null, name: "" });
            await loadWeek();
        } catch (err) {
            console.error(err);
            alert("Falha ao remover utilizador.");
        }
    }

    const startISO = days[0]?.date || toISO(weekStart);
    const endISO =
        days[4]?.date ||
        toISO(new Date(new Date(weekStart).getTime() + 4 * 24 * 60 * 60 * 1000));

    return (
        <div className="office-panel">
            <div className="office-header">
                <button disabled={disablePrev} onClick={() => setWeekStart(addWeeks(weekStart, -1))}>◀</button>

                <div className="office-panel-title">
                    <h3>Vagas no Escritório</h3>
                    <h2>{formatDatePT(startISO)} – {formatDatePT(endISO)}</h2>
                </div>

                <button disabled={disableNext} onClick={() => setWeekStart(addWeeks(weekStart, 1))}>▶</button>
            </div>

            {loading ? (
                <p>A carregar…</p>
            ) : (
                <div className="office-table">
                    {days.map((d) => {
                        const isPastDay     = isCurrentWeek && d.date < todayISO;
                        const isTodayLocked = d.date === todayISO && currentMinutes >= LOCK_MINUTES;
                        const lockedDay     = isPastDay || isTodayLocked;

                        return (
                            <div key={d.date} className="office-row">
                <span className="day-label">
                  {ptWeekday(d.date)} {formatDatePT(d.date)}
                </span>

                                <div className="seats">
                                    {Array.from({ length: d.capacity }, (_, i) => {
                                        const isReserved = i < d.bookings.length;
                                        const booking    = isReserved ? d.bookings[i] : null;
                                        const isMine     = booking && booking.user_id === user._id;

                                        let seatClass = isMine ? "mine" : isReserved ? "taken" : "free";
                                        if (lockedDay && !isReserved) seatClass = "locked";

                                        const seatTitle = lockedDay
                                            ? (isPastDay ? "Data passada" : "Bloqueado após 09:00")
                                            : booking
                                                ? `@${booking.username}`
                                                : "Livre";

                                        const clickable = !lockedDay && (!isReserved || isMine);

                                        return (
                                            <div className="seat-wrapper" key={i}>
                                                <SeatIcon
                                                    className={seatClass}
                                                    title={seatTitle}
                                                    onClick={() => clickable && toggle(d)}
                                                />
                                                {user?.type === "admin" && booking && !lockedDay && (
                                                    <button
                                                        className="kick-btn"
                                                        onClick={() =>
                                                            setConfirm({ open: true, day: d.date, uid: booking.user_id, name: booking.username })
                                                        }
                                                        title={`Remover @${booking.username}`}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {user?.type === "admin" && !lockedDay && (
                                    <select
                                        className="cap-select"
                                        value={d.capacity}
                                        onChange={(e) => changeCapacity(d.date, Number(e.target.value))}
                                    >
                                        {CAP_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmModal
                open={confirm.open}
                title="Confirmar remoção"
                message={`Remover @${confirm.name} deste dia?`}
                onConfirm={confirmRemove}
                onCancel={() => setConfirm({ open: false, day: null, uid: null, name: "" })}
            />
        </div>
    );
}
