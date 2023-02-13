import { faUserTie } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { AppContext } from "../App";
import { useCompanyCount, useShareholderCount } from "../services/apiService";
import { StatCard } from "./StatCard";

import { faBuilding } from "@fortawesome/free-regular-svg-icons";
import { SearchComponent } from "./SearchComponent";

const searchQueryParams = { limit: 10 };
const companySearchPath = "/api/company";
const shareholderSearchPath = "/api/shareholder";

export const SearchView = () => {
  const { theme } = useContext(AppContext);

  const companyCount = useCompanyCount();
  const shareholderCount = useShareholderCount();

  return (
    <div className="d-flex w-100 justify-content-center align-items-middle">
      <Container className="d-flex flex-column justify-content-between flex-fill" style={{ color: theme.text }}>
        <div className="d-flex justify-content-center align-items-center flex-fill">
          <Row className="w-100">
            <Col
              lg
              className="d-flex flex-column align-items-center pt-5 m-sm-4 m-2"
              style={{
                backgroundColor: theme.background,
                ...theme.elevation,
                maxHeight: "15.5rem",
                height: "15.5rem",
              }}
            >
              <StatCard label="aksjeselskaper" labelIcon={faBuilding} stat={companyCount} />
              <SearchComponent
                type="company"
                placeholder="Søk etter selskap..."
                apiPath={companySearchPath}
                query={searchQueryParams}
              />
            </Col>
            <Col
              lg
              className="d-flex flex-column align-items-center pt-5 m-sm-4 m-2"
              style={{
                backgroundColor: theme.background,
                ...theme.elevation,
                maxHeight: "15.5rem",
                height: "15.5rem",
              }}
            >
              <StatCard label="aksjonærer" labelIcon={faUserTie} stat={shareholderCount} />
              <SearchComponent
                type="shareholder"
                placeholder="...eller aksjonær..."
                apiPath={shareholderSearchPath}
                query={searchQueryParams}
              />
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};
