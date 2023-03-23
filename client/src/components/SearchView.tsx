import { faSitemap, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { AppContext } from "../App";
import { useCompanyCount, useShareholderCount } from "../services/apiService";
import { StatCard } from "./StatCard";

import { faBuilding } from "@fortawesome/free-regular-svg-icons";
import { useHistory } from "react-router-dom";
import { ICompany, IShareholder } from "../models/models";
import { SearchComponent } from "./SearchComponent";

const searchQueryParams = { limit: 10 };
const companySearchPath = "/api/company";
const shareholderSearchPath = "/api/shareholder";

export const SearchView = () => {
  const { theme } = useContext(AppContext);
  const history = useHistory();

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
                maxHeight: "14.5rem",
                height: "14.5rem",
              }}
            >
              <StatCard label="aksjeselskaper" labelIcon={faBuilding} stat={companyCount} />
              <div className="w-100 mt-5 mb-0 sm-px-3">
                <SearchComponent
                  handleClick={(company: ICompany) => history.push(`/graph?_id=${company._id}`)}
                  mapResultToListItem={(company: ICompany) => ({
                    key: company._id,
                    name: company.name,
                    tags: company.orgnr ? [company.orgnr] : [],
                    icon: faSitemap,
                  })}
                  placeholder="Søk etter selskap..."
                  apiPath={companySearchPath}
                  query={searchQueryParams}
                />
              </div>
            </Col>
            <Col
              lg
              className="d-flex flex-column align-items-center pt-5 m-sm-4 m-2"
              style={{
                backgroundColor: theme.background,
                ...theme.elevation,
                maxHeight: "14.5rem",
                height: "14.5rem",
              }}
            >
              <StatCard label="aksjonærer" labelIcon={faUserTie} stat={shareholderCount} />
              <div className="w-100 mt-5 mb-0 sm-px-3">
                <SearchComponent
                  handleClick={(shareholder: IShareholder) => history.push(`/graph?shareholder_id=${shareholder._id}`)}
                  mapResultToListItem={(shareholder: IShareholder) => ({
                    key: shareholder._id,
                    name: shareholder.name,
                    tags: [shareholder.orgnr, shareholder.yearOfBirth, shareholder.countryCode].filter(
                      (tag) => !!tag
                    ) as (number | string)[],
                    icon: faSitemap,
                  })}
                  placeholder="...eller aksjonær..."
                  apiPath={shareholderSearchPath}
                  query={searchQueryParams}
                />
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};
