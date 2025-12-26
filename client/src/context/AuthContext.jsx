// client/src/context/AuthContext.jsx
import { createContext, useState, useEffect, useRef } from "react";
import api from "../services/api.js";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // StrictMode/dev tekrarlarını tek isteğe düşürmek için
    const inFlightRef = useRef(null);
    const resolvedOnceRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        const checkAuth = async () => {
            // Dev'de ikinci mount'ta tekrar request atma
            if (resolvedOnceRef.current) {
                if (!cancelled) setLoading(false);
                return;
            }

            // Aynı anda tekrar tetiklenirse mevcut isteği paylaş
            if (!inFlightRef.current) {
                inFlightRef.current = api
                    .get("/users/me")
                    .then((res) => ({ ok: true, data: res.data }))
                    .catch((err) => ({ ok: false, err }));
            }

            const result = await inFlightRef.current;

            // Bu check tamamlandı, bundan sonra dev tekrarında çağırma
            inFlightRef.current = null;
            resolvedOnceRef.current = true;

            if (cancelled) return;

            if (result.ok) {
                setCurrentUser(result.data);
            } else {
                // Backend /users/me hatalarında genelde { error: "..."} dönüyor
                const msg =
                    result.err?.response?.data?.error ??
                    result.err?.response?.data?.msg ??
                    "Not logged in";
                console.log(msg);
                setCurrentUser(null);
            }

            setLoading(false);
        };

        checkAuth();

        return () => {
            cancelled = true;
        };
    }, []);

    const login = async (inputs) => {
        const res = await api.post("/auth/login", inputs);
        setCurrentUser(res.data.user);

        // Login sonrası tekrar /users/me kontrolü gerekecekse resetlenebilir
        resolvedOnceRef.current = false;

        return res.data.user;
    };

    const register = async (inputs) => {
        const res = await api.post("/auth/register", inputs);
        await login({ username: inputs.username, password: inputs.password });
        return res.data;
    };

    const logout = async () => {
        try {
            // Backend'e "çerezi sil" komutu gönderiyoruz
            // api instance'ında 'withCredentials: true' olduğundan emin ol
            await api.post("/auth/logout");

            // Frontend temizliği
            localStorage.removeItem("hasAutoRedirectedToApp");
            setCurrentUser(null);

            // Logout sonrası bir sonraki girişte /users/me tekrar çalışabilsin
            resolvedOnceRef.current = false;

        } catch (err) {
            // Logout sırasında hata olsa bile kullanıcıyı çıkış yapmış gibi göstermek
            // genellikle iyi bir deneyimdir, ama hatayı loglayabilirsin.
            console.error("Logout error:", err);
            setCurrentUser(null);
            resolvedOnceRef.current = false;
        }
    };

    const updateCurrentUser = (data) => {
        setCurrentUser((prev) => ({ ...prev, ...data }));
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, register, logout, loading, updateCurrentUser }}>
            {loading ? <div className="p-10">Loading app...</div> : children}
        </AuthContext.Provider>
    );
};
