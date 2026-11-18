import { useEffect } from 'react';
export function useDocumentTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} | Arun Meyyappan P L` : 'Arun Meyyappan P L — Full-Stack Developer & Founder of EVO Codes';
    }, [title]);
}
