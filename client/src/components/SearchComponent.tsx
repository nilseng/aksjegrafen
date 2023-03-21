import { faSitemap } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { Form, ListGroup } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { AppContext } from "../App";
import { useSearch } from "../hooks/useSearch";
import { ICompany, IShareholder, isShareholder } from "../models/models";

interface IProps {
  type: "company" | "shareholder";
  placeholder: string;
  apiPath: string;
  searchTerm?: string;
  query?: { [key: string]: string | number };
}

export const SearchComponent = <Entity extends ICompany | IShareholder>({
  type,
  placeholder,
  apiPath,
  query,
}: IProps) => {
  const { theme } = useContext(AppContext);
  const history = useHistory();

  const [searchTerm, setSearchTerm] = useState<string>();

  const searchList = useSearch<Entity[]>(apiPath, searchTerm, query);

  const handleSearch = (e: any) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <Form.Group className="w-100 mt-5 mb-0 sm-px-3">
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
          onChange={handleSearch}
        ></Form.Control>
      </Form.Group>
      {searchList && (
        <div className="w-100 mw-100 px-0" style={{ maxHeight: "20rem" }}>
          <div
            className="h-100 w-100 position-relative p-3"
            style={{ ...theme.elevation, backgroundColor: theme.background, zIndex: 100 }}
          >
            <ListGroup
              className="h-100 w-100 mw-100 overflow-auto position-relative px-3 py-2"
              style={{ ...theme.lowering, zIndex: 102 }}
            >
              {searchList.length ? (
                searchList.map((entity) => (
                  <ListGroup.Item
                    key={entity._id}
                    className="w-100 mw-100 d-flex align-items-center justify-content-between border-0 my-2"
                    style={{
                      zIndex: 101,
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      ...theme.elevation,
                    }}
                    onClick={() =>
                      history.push(
                        type === "company" ? `/graph?_id=${entity._id}` : `/graph?shareholder_id=${entity._id}`
                      )
                    }
                  >
                    <div>
                      <div className="mr-2">{entity.name}</div>
                      {entity.orgnr && <span className="small text-muted mr-3">{entity.orgnr}</span>}
                      {isShareholder(entity) && entity.yearOfBirth && (
                        <span className="small text-muted mr-2">{entity.yearOfBirth}</span>
                      )}
                      {isShareholder(entity) && entity.countryCode && (
                        <span className="small text-muted">{entity.countryCode}</span>
                      )}
                    </div>
                    <FontAwesomeIcon
                      icon={faSitemap}
                      color={theme.primary}
                      style={{ cursor: "pointer" }}
                      className="mr-3"
                    />
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
