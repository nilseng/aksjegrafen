import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CSSProperties,
  ChangeEvent,
  KeyboardEvent,
  ReactElement,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../AppContext";
import { useSearch } from "../hooks/useSearch";
import Loading from "./Loading";

interface ListItem<Result> {
  key: string;
  name: string;
  tags: (string | number)[];
  handleTitleClick?: (res: Result) => void;
  icon?: IconProp;
  iconComponent?: ReactElement;
  buttons?: { name: string; condition: boolean; buttonContent: ReactElement; handleClick: (res: Result) => void }[];
}

interface IProps<Result extends unknown> {
  handleClick?: (res: Result) => void;
  mapResultToListItem: (res: Result) => ListItem<Result>;
  placeholder: string;
  apiPath: string;
  searchTerm?: string;
  query?: { [key: string]: string | number };
  minSearchTermLength?: number;
  inputContainerClassName?: string;
  inputClassName?: string;
  inputStyle?: CSSProperties;
  searchListClassName?: string;
  focus?: boolean;
  initialResult?: Result[];
  maxHeight?: string;
}

export const SearchComponent = <Result extends unknown>({
  handleClick,
  mapResultToListItem,
  placeholder,
  apiPath,
  query,
  minSearchTermLength,
  inputContainerClassName,
  inputClassName,
  inputStyle,
  searchListClassName,
  focus,
  initialResult,
  maxHeight,
}: IProps<Result>) => {
  const { theme } = useContext(AppContext);

  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (focus) inputRef.current?.focus();
  }, [focus]);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const { result: searchList, isLoading } = useSearch<Result[]>(
    apiPath,
    searchTerm,
    query,
    minSearchTermLength,
    initialResult
  );

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") setSearchTerm("");
  };

  return (
    <>
      <div className={`flex ${inputContainerClassName}`}>
        <input
          ref={inputRef}
          className={`w-full ${inputClassName}`}
          name="selskapsSøk"
          autoComplete="off"
          type="text"
          placeholder={placeholder}
          style={inputStyle}
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
        />
        {isLoading && (
          <div className="w-12 h-full flex items-center p-2 -ml-12">
            {<Loading backgroundColor="transparent" height={"2rem"} color={theme.primary} />}
          </div>
        )}
      </div>
      <div className={searchListClassName ?? `w-full max-w-full px-0`}>
        {searchList && (
          <div className="flex flex-col w-full max-w-full h-full max-h-full">
            {searchList.length ? (
              searchList
                .map((result) => ({ result, item: mapResultToListItem(result) }))
                .map(({ result, item }) => (
                  <div
                    key={item.key}
                    className="w-full max-w-full flex flex-col items-center justify-between border border-primary/20 rounded-lg p-2 my-1"
                    style={{
                      zIndex: 101,
                      backgroundColor: "transparent",
                      ...(handleClick ? { cursor: "pointer" } : {}),
                    }}
                    onClick={() => {
                      if (handleClick) {
                        setSearchTerm("");
                        handleClick(result);
                      }
                    }}
                  >
                    <section
                      className="flex flex-col items-center"
                      style={item.handleTitleClick ? { cursor: "pointer" } : {}}
                      onClick={() => item.handleTitleClick?.(result)}
                    >
                      <p className="break-words font-bold text-gray-700 dark:text-gray-100">{item.name}</p>
                      <div className="w-full flex justify-center pb-1">
                        {item.tags.map((tag) => (
                          <p key={tag} className="text-xs text-muted mx-2">
                            {tag}
                          </p>
                        ))}
                      </div>
                    </section>
                    {item.icon && (
                      <FontAwesomeIcon
                        icon={item.icon}
                        color={theme.primary}
                        style={{ cursor: "pointer" }}
                        className="mr-3"
                      />
                    )}
                    {item.buttons?.length && item.buttons?.length && (
                      <div className="w-full flex justify-around items-end px-2">
                        {item.buttons
                          .filter((b) => b.condition)
                          .map((b) => (
                            <button
                              key={b.name}
                              className="px-0"
                              aria-label={`Gå til ${b.name}`}
                              aria-describedby={`Klikk for å se ${b.name}`}
                              onClick={() => {
                                b.handleClick(result);
                              }}
                            >
                              {b.buttonContent}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <p className="m-0" style={{ color: theme.primary }}>
                Ingen resultater 🔍
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};
