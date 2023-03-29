import { faList, faUserTie } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { AppContext } from "../App";
import { useCompanyCount, useShareholderCount } from "../services/apiService";
import { StatCard } from "./StatCard";

import { faBuilding } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";
import { ICompany, IShareholder } from "../models/models";
import { GraphLogo } from "./GraphLogo";
import { SearchComponent } from "./SearchComponent";

const searchQueryParams = { limit: 10 };
const companySearchPath = "/api/company";
const shareholderSearchPath = "/api/shareholder";

export const SearchView = () => {
  const { theme, tableModalInput } = useContext(AppContext);
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
                  mapResultToListItem={(company: ICompany) => ({
                    key: company._id,
                    name: company.name,
                    tags: company.orgnr ? [company.orgnr] : [],
                    buttons: [
                      {
                        name: "table-button",
                        buttonContent: <FontAwesomeIcon icon={faList} style={{ color: theme.primary }} size="lg" />,
                        handleClick: (company: ICompany) => {
                          tableModalInput.setInvestment(company);
                        },
                      },
                      {
                        name: "graph-button",
                        buttonContent: (
                          <span
                            style={{
                              ...theme.button,
                              borderRadius: "100%",
                              display: "inline-block",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "3.2rem",
                              height: "3.2rem",
                              paddingTop: "0.6rem",
                              paddingBottom: "0.6rem",
                            }}
                          >
                            <GraphLogo inputColor={theme.secondary} width={"2rem"} height={"2rem"} />
                          </span>
                        ),
                        handleClick: (company: ICompany) => history.push(`/graph?_id=${company._id}`),
                      },
                    ],
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
                  mapResultToListItem={(shareholder: IShareholder) => ({
                    key: shareholder._id,
                    name: shareholder.name,
                    tags: [shareholder.orgnr, shareholder.yearOfBirth, shareholder.countryCode].filter(
                      (tag) => !!tag
                    ) as (number | string)[],
                    buttons: [
                      {
                        name: "table-button",
                        buttonContent: <FontAwesomeIcon icon={faList} style={{ color: theme.primary }} size="lg" />,
                        handleClick: (shareholder: IShareholder) => {
                          tableModalInput.setInvestor(shareholder);
                        },
                      },
                      {
                        name: "graph-button",
                        buttonContent: (
                          <span
                            style={{
                              ...theme.button,
                              borderRadius: "100%",
                              display: "inline-block",
                              textAlign: "center",
                              verticalAlign: "middle",
                              width: "3.2rem",
                              height: "3.2rem",
                              paddingTop: "0.6rem",
                              paddingBottom: "0.6rem",
                            }}
                          >
                            <GraphLogo inputColor={theme.secondary} width={"2rem"} height={"2rem"} />
                          </span>
                        ),
                        handleClick: (shareholder: IShareholder) =>
                          history.push(`/graph?shareholder_id=${shareholder._id}`),
                      },
                    ],
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
