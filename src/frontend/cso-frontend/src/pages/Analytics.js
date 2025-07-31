import { useState, useEffect } from "react";
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

export default function Analytics() {
    const [data, setData] = useState([]);
    const [range, setRange] = useState({ since: null, to: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const weekdayMap = {
        Monday: "Segunda",
        Tuesday: "Terça",
        Wednesday: "Quarta",
        Thursday: "Quinta",
        Friday: "Sexta",
    };

    const order = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

    const formatDate = (iso) => {
        if (!iso) return "";
        const [year, month, day] = iso.split("-");
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    };

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            try {
                const res = await api.get("/analytics/weekday-averages", {
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                    params: { t: Date.now() },
                });
                const d = res.data;
                if (typeof d === "string" && d.trim().startsWith("<")) {
                    throw new Error("Resposta inesperada do servidor: HTML recebido");
                }
                if (!d || !Array.isArray(d.weekdayAverages)) {
                    throw new Error("Formato de dados inválido");
                }
                setRange({ since: d.since, to: d.to });
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

    return (
        <div className="app">
            <Header />
            <div aria-hidden="true" style={{ height: "60px", width: "100%" }} />
            <main style={{ flex: 1 }} className="analytics-container">
                <section className="analytics-panel">
                    {loading && <div>Carregando...</div>}
                    {!loading && error && <div>{error}</div>}
                    {!loading && !error && (
                        <>
                            <div style={{ marginLeft: "2rem" }}>
                                <h1 style={{marginBottom: "0.25rem"}}>Média de presenças no escritório por dia</h1>
                                <div style={{marginBottom: "1.5rem", color: "#1E2F48"}}>
                                    {range.since && range.to && (
                                        <div>
                                            Dados de {formatDate(range.since)} até {formatDate(range.to)}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {data.length === 0 && <div>Sem dados disponíveis</div>}
                            {data.length > 0 && (
                                <div className="chart-wrapper" style={{width: "100%", height: 350}}>
                                    <ResponsiveContainer>
                                    <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="weekday" />
                                            <YAxis tickFormatter={(v) => v.toFixed(1)} />
                                            <Tooltip formatter={(v) => (v || v === 0 ? v.toFixed(1) : v)} />
                                            <Bar dataKey="average" name="Média" fill="#1E2F48" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}
