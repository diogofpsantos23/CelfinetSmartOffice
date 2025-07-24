import {createContext, useState, useEffect} from "react";
import api from "../lib/api";

export const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = localStorage.getItem("access_token");
        if (!t) { setLoading(false); return; }

        api.get("/auth/me")
            .then(r => setUser(r.data))
            .catch(() => {
                localStorage.removeItem("access_token");
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (username, password) => {
        console.log(username, password)
        const { data } = await api.post("/auth/login", { username, password });
        localStorage.setItem("access_token", data.access_token);

        const me = await api.get("/auth/me");
        setUser(me.data);
    };

    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
}
