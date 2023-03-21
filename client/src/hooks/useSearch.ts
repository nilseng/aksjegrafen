import { debounce } from "lodash";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { buildQuery } from "../utils/buildQuery";

const debouncedFetch = <T>(url: string, abortController: AbortController, setState: Dispatch<SetStateAction<T>>) =>
  debounce(() => {
    fetch(url, { signal: abortController.signal }).then(
      async (res) => {
        if (abortController.signal.aborted) return;
        const data: T = await res.json();
        setState(data);
      },
      (_) => _
    );
  }, 200);

export const useSearch = <T>(apiPath: string, searchTerm?: string, query?: { [key: string]: string | number }) => {
  const [state, setState] = useState<T>();

  useEffect(() => {
    const abortController = new AbortController();
    if (!searchTerm || searchTerm.length < 3) setState(undefined);
    else {
      let url = `${apiPath}/${searchTerm}`;
      if (query) url += buildQuery(query);
      debouncedFetch(url, abortController, setState)();
    }

    return () => {
      setState(undefined);
      abortController.abort();
    };
  }, [apiPath, query, searchTerm]);

  return state;
};
