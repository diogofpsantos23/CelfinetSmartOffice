import { useEffect, useState } from "react";

export default function Clock() {
    const [time, setTime] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const pad = (n) => String(n).padStart(2, "0");
    const hh = pad(time.getHours());
    const mm = pad(time.getMinutes());
    const ss = pad(time.getSeconds());

    return (
        <span className="clock" aria-label="horas atuais">
      {hh}:{mm}:{ss}
    </span>
    );
}
