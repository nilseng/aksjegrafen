import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, KeyboardEvent, ReactElement, useContext, useState } from "react";
import { AppContext } from "../AppContext";
import { useSearch } from "../hooks/useSearch";

interface ListItem<Result> {
  key: string;
  name: string;
  tags: (string | number)[];
  icon?: IconProp;
  iconComponent?: ReactElement;
  buttons?: { name: string; buttonContent: ReactElement; handleClick: (res: Result) => void }[];
}

interface IProps<Result extends unknown> {
  handleClick?: (res: Result) => void;
  mapResultToListItem: (res: Result) => ListItem<Result>;
  placeholder: string;
  apiPath: string;
  searchTerm?: string;
  query?: { [key: string]: string | number };
  minSearchTermLength?: number;
}

export const SearchComponent = <Result extends unknown>({
  handleClick,
  mapResultToListItem,
  placeholder,
  apiPath,
  query,
  minSearchTermLength,
}: IProps<Result>) => {
  const { theme } = useContext(AppContext);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const searchList = useSearch<Result[]>(apiPath, searchTerm, query, minSearchTermLength);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") setSearchTerm("");
  };

  return (
    <div className="w-full">
      <input
        className="block w-full focus:outline-none p-2"
        name="selskapsSøk"
        autoComplete="off"
        type="text"
        placeholder={placeholder}
        style={{
          backgroundColor: "transparent",
          backgroundClip: "padding-box",
          borderColor: "transparent",
          color: theme.text,
          ...theme.lowering,
        }}
        value={searchTerm}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
      />
      {searchList && (
        <div className="w-full max-w-full px-0">
          <div
            className="w-full relative p-3"
            style={{ ...theme.elevation, backgroundColor: theme.background, zIndex: 100 }}
          >
            <div
              className="flex flex-col h-full max-h-64 w-full max-w-full overflow-auto relative px-4 py-2"
              style={{ ...theme.lowering, zIndex: 102 }}
            >
              {searchList.length ? (
                searchList
                  .map((result) => ({ result, item: mapResultToListItem(result) }))
                  .map(({ result, item }) => (
                    <div
                      key={item.key}
                      className="w-full max-w-full flex flex-col items-center justify-between border-0 p-2 my-2"
                      style={{
                        zIndex: 101,
                        backgroundColor: "transparent",
                        ...(handleClick ? { cursor: "pointer" } : {}),
                        ...theme.elevation,
                      }}
                      onClick={() => {
                        if (handleClick) {
                          setSearchTerm("");
                          handleClick(result);
                        }
                      }}
                    >
                      <div>
                        <div className="break-words mr-2">{item.name}</div>
                        <div className="w-full flex justify-center pb-2">
                          {item.tags.map((tag) => (
                            <span key={tag} className="text-xs text-muted mx-2">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {item.icon && (
                        <FontAwesomeIcon
                          icon={item.icon}
                          color={theme.primary}
                          style={{ cursor: "pointer" }}
                          className="mr-3"
                        />
                      )}
                      {item.buttons?.length && item.buttons?.length && (
                        <div className="w-full flex justify-around px-2">
                          {item.buttons.map((b) => (
                            <button
                              key={b.name}
                              className="px-0"
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
          </div>
        </div>
      )}
    </div>
  );
};
