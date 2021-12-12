import { useEffect } from "react";

export const useDocumentTitle = (defaultTitle: string, title?: string) => {
  useEffect(() => {
    document.title = title ?? defaultTitle;
    return () => {
      document.title = defaultTitle;
    };
  }, [defaultTitle, title]);
};
