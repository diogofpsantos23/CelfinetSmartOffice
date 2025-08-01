import {useState, useEffect} from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../App.css";
import api from "../lib/api";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

const weekdayMap = {
    Monday: "Segunda",
    Tuesday: "Terça",
    Wednesday: "Quarta",
    Thursday: "Quinta",
    Friday: "Sexta",
};

const order = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

function isoToDMY(iso) {
    if (!iso) return "";
    const [year, month, day] = iso.split("-");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day + 6) % 7;
    date.setDate(date.getDate() - diff);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(iso) {
    if (!iso) return "";
    const [year, month, day] = iso.split("-");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

export default function Analytics() {
    const [data, setData] = useState([]);
    const [range, setRange] = useState({since: null, to: null});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
    const [earliestWeekStart, setEarliestWeekStart] = useState(null);
    const [latestWeekStart, setLatestWeekStart] = useState(null);
    const [weekDays, setWeekDays] = useState([]);
    const [weekLoading, setWeekLoading] = useState(false);
    const [weekError, setWeekError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            try {
                const res = await api.get("/analytics/weekday-averages", {
                    signal: controller.signal,
                    headers: {Accept: "application/json"},
                    params: {t: Date.now()},
                });
                const d = res.data;
                if (typeof d === "string" && d.trim().startsWith("<")) {
                    throw new Error("Resposta inesperada do servidor: HTML recebido");
                }
                if (!d || !Array.isArray(d.weekdayAverages)) {
                    throw new Error("Formato de dados inválido");
                }
                setRange({since: d.since, to: d.to});
                const transformed = d.weekdayAverages
                    .map((w) => ({
                        weekday: weekdayMap[w.weekday] || w.weekday,
                        average: w.average,
                        samples: w.samples,
                    }))
                    .filter((w) => w.samples > 0)
                    .sort((a, b) => order.indexOf(a.weekday) - order.indexOf(b.weekday));
                setData(transformed);
            } catch (e) {
                if (e.name === "CanceledError" || e.message === "canceled") return;
                setError(
                    e.response?.data
                        ? typeof e.response.data === "string"
                            ? e.response.data
                            : JSON.stringify(e.response.data)
                        : e.message || "Erro ao carregar dados"
                );
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!range.since || !range.to) return;
        const earliest = getMonday(new Date(range.since));
        const latest = getMonday(new Date(range.to));
        setEarliestWeekStart(earliest);
        setLatestWeekStart(latest);
        setWeekStart(latest);
    }, [range]);

    useEffect(() => {
        if (!weekStart) return;
        const controller = new AbortController();
        const fetchWeek = async () => {
            setWeekLoading(true);
            setWeekError(null);
            try {
                const iso = weekStart.toISOString().slice(0, 10);
                const res = await api.get("/office/week", {
                    signal: controller.signal,
                    params: {start: iso},
                });
                const d = res.data;
                if (!d || !Array.isArray(d.days)) {
                    throw new Error("Formato inválido da semana");
                }
                setWeekDays(d.days);
            } catch (e) {
                if (e.name === "CanceledError" || e.message === "canceled") return;
                setWeekError(
                    e.response?.data
                        ? typeof e.response.data === "string"
                            ? e.response.data
                            : JSON.stringify(e.response.data)
                        : e.message || "Erro ao carregar semana"
                );
            } finally {
                setWeekLoading(false);
            }
        };
        fetchWeek();
        return () => controller.abort();
    }, [weekStart]);

    const prevWeek = () => {
        if (!weekStart) return;
        const prev = new Date(weekStart);
        prev.setDate(prev.getDate() - 7);
        const normalized = getMonday(prev);
        if (earliestWeekStart && normalized.getTime() < earliestWeekStart.getTime()) return;
        setWeekStart(normalized);
    };

    const nextWeek = () => {
        if (!weekStart) return;
        const nxt = new Date(weekStart);
        nxt.setDate(nxt.getDate() + 7);
        const normalized = getMonday(nxt);
        if (latestWeekStart && normalized.getTime() > latestWeekStart.getTime()) return;
        setWeekStart(normalized);
    };

    const formatDDMM = (d) => {
        if (!d) return "";
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    };
    const weekEnd = weekStart ? (() => {
        const e = new Date(weekStart);
        e.setDate(e.getDate() + 4);
        return e;
    })() : null;
    const weekLabel = weekStart && weekEnd ? `${formatDDMM(weekStart)} – ${formatDDMM(weekEnd)}` : "";


    return (
        <div className="app">
            <Header/>
            <div aria-hidden="true" style={{height: "60px", width: "100%"}}/>
            <main style={{flex: 1}} className="analytics-container">
                <div style={{display: "flex", justifyContent: "space-between", gap: "2rem"}}>
                    <section className="analytics-panel" style={{flex: 1, minWidth: 0}}>
                        <div className="week-header">
                            <button className="nav-btn" onClick={prevWeek}
                                    disabled={!weekStart || (earliestWeekStart && weekStart.getTime() <= earliestWeekStart.getTime())}
                                    aria-label="Semana anterior">◀
                            </button>
                            <div className="week-info">
                                <div className="week-title">Idas ao escritório</div>
                                <div className="week-range">{weekLabel}</div>
                            </div>
                            <button className="nav-btn" onClick={nextWeek}
                                    disabled={!weekStart || (latestWeekStart && weekStart.getTime() >= latestWeekStart.getTime())}
                                    aria-label="Próxima semana">▶
                            </button>
                        </div>

                        {weekLoading && <div style={{marginLeft: "2rem"}}>Carregando semana...</div>}
                        {weekError && <div style={{marginLeft: "2rem"}}>{weekError}</div>}
                        {!weekLoading && !weekError && (
                            <>
                            {weekDays.length === 0 && (
                                    <div style={{marginLeft: "1.5rem"}}>Sem dados para esta semana</div>
                                )}
                                {weekDays.length > 0 && (
                                    <div className="week-horizontal-table">
                                        {weekDays.map((day) => {
                                            const users = Array.isArray(day.bookings)
                                                ? day.bookings.map((b) => b.username)
                                                : [];
                                            const capacity = day.capacity ?? 8;
                                            return (
                                                <div key={day.date} className="day-column">
                                                    <div className="day-header">
                                                        <div>
                                                            {weekdayMap[
                                                                new Date(day.date).toLocaleDateString("en-US", {
                                                                    weekday: "long",
                                                                })
                                                                ] || ""}{" "}
                                                            {isoToDMY(day.date)}
                                                        </div>
                                                        <div className="capacity-icons" style={{marginLeft: "auto"}}>
                                                            {Array.from({length: capacity}).map((_, i) => {
                                                                const filled = i < users.length;
                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        className="capacity-icon"
                                                                        style={{
                                                                            background: filled ? "#e74c3c" : "#e3e8ef",
                                                                        }}
                                                                        aria-label={filled ? "Reservado" : "Livre"}
                                                                    ></div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="user-list">
                                                        {users.length === 0 && (
                                                            <div style={{color: "#666"}}>Nenhum registo</div>
                                                        )}
                                                        {users.map((u) => (
                                                            <div key={u} className="user-chip" title={u}>
                                                                {u}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                    <section className="analytics-panel" style={{flex: 1, minWidth: 0}}>
                        <div style={{marginLeft: "2rem"}}>
                            <h1 style={{marginBottom: "0.25rem"}}>Média de presenças no escritório por dia</h1>
                            <div style={{marginBottom: "1.5rem", color: "#1E2F48"}}>
                                {range.since && range.to && (
                                    <div>
                                        Dados de {formatDate(range.since)} até {formatDate(range.to)}
                                    </div>
                                )}
                            </div>
                        </div>

                        {loading && <div style={{marginLeft: "2rem"}}>Carregando...</div>}
                        {!loading && error && <div style={{marginLeft: "2rem"}}>{error}</div>}
                        {!loading && !error && (
                            <>
                                {data.length === 0 && <div style={{marginLeft: "2rem"}}>Sem dados disponíveis</div>}
                                {data.length > 0 && (
                                    <div className="chart-wrapper" style={{width: "100%", height: 350}}>
                                        <ResponsiveContainer>
                                            <BarChart data={data} margin={{top: 20, right: 30, left: 0, bottom: 5}}>
                                                <CartesianGrid strokeDasharray="3 3"/>
                                                <XAxis dataKey="weekday"/>
                                                <YAxis
                                                    tickFormatter={(v) => (typeof v === "number" ? v.toFixed(1) : v)}/>
                                                <Tooltip formatter={(v) => (v || v === 0 ? v.toFixed(1) : v)}/>
                                                <Bar dataKey="average" name="Média" fill="#1E2F48"/>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
