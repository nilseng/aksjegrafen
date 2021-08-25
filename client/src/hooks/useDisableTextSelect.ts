import { useEffect } from "react";

export const useDisableTextSelect = () => {
    useEffect(() => {
        document.body.style.userSelect = "none";
        return () => {
            document.body.style.userSelect = "text";
        };
    }, []);
}