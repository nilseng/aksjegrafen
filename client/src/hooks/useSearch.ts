import { debounce } from "lodash";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { buildQuery } from "../utils/buildQuery";

const debouncedFetch = <T>(
  url: string,
  abortController: AbortController,
  setState: Dispatch<SetStateAction<{ result: T | null; isLoading: boolean }>>
) =>
  debounce(() => {
    setState({ result: null, isLoading: true });
    fetch(url, { signal: abortController.signal })
      .then(
        async (res) => {
          if (abortController.signal.aborted) return;
          const data: T = await res.json();
          setState({ result: data, isLoading: false });
        },
        () => {
          setState({ result: null, isLoading: false });
        }
      )
      .catch(() => setState({ result: null, isLoading: false }));
  }, 200);

export const useSearch = <T>(
  apiPath: string,
  searchTerm?: string,
  query?: { [key: string]: string | number },
  minSearchTermLength = 3
) => {
  const [state, setState] = useState<{ result: T | null; isLoading: boolean }>({ result: null, isLoading: false });

  useEffect(() => {
    const abortController = new AbortController();
    if (!searchTerm || searchTerm.length < minSearchTermLength) setState({ result: null, isLoading: false });
    else {
      let url = `${apiPath}/${searchTerm}`;
      if (query) url += buildQuery(query);
      debouncedFetch(url, abortController, setState)();
    }

    return () => {
      setState({ result: null, isLoading: false });
      abortController.abort();
    };
  }, [apiPath, query, searchTerm, minSearchTermLength]);

  return state;
};
