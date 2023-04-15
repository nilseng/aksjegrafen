import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, KeyboardEvent, ReactElement, useContext, useState } from "react";
import { Form, ListGroup } from "react-bootstrap";
import { AppContext } from "../App";
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
    <>
      <Form.Group className="w-100 m-0">
        <Form.Control
          name="selskapsSøk"
          autoComplete="off"
          type="text"
          placeholder={placeholder}
          style={{
            backgroundColor: "transparent",
            borderColor: "transparent",
            color: theme.text,
            ...theme.lowering,
          }}
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
        ></Form.Control>
      </Form.Group>
      {searchList && (
        <div className="w-100 mw-100 px-0">
          <div
            className="h-100 w-100 position-relative p-3"
            style={{ ...theme.elevation, backgroundColor: theme.background, zIndex: 100 }}
          >
            <ListGroup
              className="h-100 w-100 mw-100 overflow-auto position-relative px-3 py-2"
              style={{ ...theme.lowering, zIndex: 102, maxHeight: "16rem" }}
            >
              {searchList.length ? (
                searchList
                  .map((result) => ({ result, item: mapResultToListItem(result) }))
                  .map(({ result, item }) => (
                    <ListGroup.Item
                      key={item.key}
                      className="w-100 mw-100 d-flex align-items-center justify-content-between border-0 p-2 my-2"
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
                        <div className="text-break mr-2">{item.name}</div>
                        {item.tags.map((tag) => (
                          <span key={tag} className="small text-muted mx-2">
                            {tag}
                          </span>
                        ))}
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
                        <div className="d-flex align-items-center">
                          {item.buttons.map((b) => (
                            <button
                              key={b.name}
                              className="btn px-0 ml-2 ml-sm-4"
                              onClick={() => {
                                b.handleClick(result);
                              }}
                            >
                              {b.buttonContent}
                            </button>
                          ))}
                        </div>
                      )}
                    </ListGroup.Item>
                  ))
              ) : (
                <p className="m-0" style={{ color: theme.primary }}>
                  Ingen resultater 🔍
                </p>
              )}
            </ListGroup>
          </div>
        </div>
      )}
    </>
  );
};
