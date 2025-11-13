import { useEffect, useState } from "react";

export default function useMediaQuery(query: string) {
    const get = () => typeof window !== "undefined" && window.matchMedia(query).matches;
    const [matches, setMatches] = useState(get);

    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = () => setMatches(mql.matches);
        handler();
        mql.addEventListener?.("change", handler);
        return () => mql.removeEventListener?.("change", handler);
    }, [query]);

    return matches;
}
