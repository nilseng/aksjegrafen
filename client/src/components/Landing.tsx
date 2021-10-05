import { useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { debounce } from "lodash";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ICompany, IShareholder } from "../models/models";
import { useHistory } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../App";
import { StatCard } from "./StatCard";
import { useCompanyCount, useShareholderCount } from "../services/apiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faProjectDiagram,
  faSitemap,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";

import { faBuilding } from "@fortawesome/free-regular-svg-icons";

export const Landing = () => {
  const { theme } = useContext(AppContext);

  const history = useHistory();

  const companyCount = useCompanyCount();
  const shareholderCount = useShareholderCount();

  const [companySearchList, setCompanySearchList] = useState<ICompany[]>([]);
  const [shareholderSearchList, setShareholderSearchList] = useState<
    IShareholder[]
  >([]);

  const handleCompanySearch = (e: any) => {
    const searchTerm = e.target.value;
    searchCompany(searchTerm);
  };

  const handleShareholderSearch = (e: any) => {
    const searchTerm = e.target.value;
    searchShareholder(searchTerm);
  };

  const searchCompany = debounce(
    (searchTerm: string) => {
      if (!searchTerm || searchTerm?.length < 3) setCompanySearchList([]);
      else {
        fetch(`/api/company/${searchTerm}?limit=10`).then(async (res: any) => {
          const companies = await res.json();
          setCompanySearchList(companies);
        });
      }
    },
    250,
    {
      leading: false,
      trailing: true,
    }
  );

  const searchShareholder = debounce(
    (searchTerm: string) => {
      if (!searchTerm || searchTerm?.length < 3) setShareholderSearchList([]);
      else {
        fetch(`/api/shareholder/${searchTerm}`).then(async (res: any) => {
          const shareholders = await res.json();
          setShareholderSearchList(shareholders);
        });
      }
    },
    250,
    {
      leading: false,
      trailing: true,
    }
  );

  return (
    <Container
      className="d-flex flex-column justify-content-between flex-fill"
      style={{ color: theme.text }}
    >
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
            <StatCard
              label="aksjeselskaper"
              labelIcon={faBuilding}
              stat={companyCount}
            />
            <Form.Group className="w-100 mt-5 px-3">
              <Form.Control
                name="peakSearchTerm"
                type="text"
                placeholder="Søk etter selskap..."
                style={{
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                  color: theme.text,
                  ...theme.lowering,
                  borderRadius: "4rem",
                }}
                onChange={(e) => handleCompanySearch(e)}
              ></Form.Control>
            </Form.Group>
            <ListGroup className="w-100 mw-100" style={{ zIndex: 100 }}>
              {companySearchList?.map((company) => (
                <ListGroup.Item
                  key={company._id}
                  className="w-100 mw-100 d-flex align-items-center justify-content-between border-0 my-1"
                  style={{
                    backgroundColor: theme.background,
                    ...theme.elevation,
                  }}
                >
                  <div>
                    <div className="mr-2">{company.name}</div>
                    <span className="small text-muted mr-3">
                      {company.orgnr}
                    </span>
                  </div>
                  <div className="text-nowrap">
                    <FontAwesomeIcon
                      icon={faSitemap}
                      color={theme.primary}
                      style={{ cursor: "pointer" }}
                      className="mr-3"
                      onClick={() =>
                        history.push(`/ownership-chart?_id=${company._id}`)
                      }
                    />
                    <FontAwesomeIcon
                      icon={faProjectDiagram}
                      color={theme.primary}
                      style={{ cursor: "pointer" }}
                      className="mr-3"
                      onClick={() => history.push(`/graph?_id=${company._id}`)}
                    />
                    <FontAwesomeIcon
                      icon={faList}
                      color={theme.secondary}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        history.push(`/company?_id=${company._id}`)
                      }
                    />
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
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
            <StatCard
              label="aksjonærer"
              labelIcon={faUserTie}
              stat={shareholderCount}
            />
            <Form.Group className="w-100 mt-5 px-3">
              <Form.Control
                name="peakSearchTerm"
                type="text"
                placeholder="...eller aksjonær..."
                style={{
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                  color: theme.text,
                  ...theme.lowering,
                  borderRadius: "4rem",
                }}
                onChange={(e) => handleShareholderSearch(e)}
              ></Form.Control>
            </Form.Group>
            <ListGroup className="w-100 mw-100" style={{ zIndex: 100 }}>
              {shareholderSearchList?.map((shareholder) => (
                <ListGroup.Item
                  key={shareholder._id}
                  className="w-100 mw-100 d-flex align-items-center justify-content-between border-0 my-1"
                  style={{
                    backgroundColor: theme.background,
                    ...theme.elevation,
                  }}
                >
                  <div>
                    <span className="mr-2">{shareholder.name}</span>
                    <div>
                      {shareholder.yearOfBirth && (
                        <span className="small text-muted mr-2">
                          {shareholder.yearOfBirth}
                        </span>
                      )}
                      {shareholder.orgnr && (
                        <span className="small text-muted mr-2">
                          {shareholder.orgnr}
                        </span>
                      )}
                      {shareholder.countryCode && (
                        <span className="small text-muted">
                          {shareholder.countryCode}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-nowrap">
                    <FontAwesomeIcon
                      icon={faSitemap}
                      color={theme.primary}
                      style={{ cursor: "pointer" }}
                      className="mr-3"
                      onClick={() =>
                        history.push(
                          `/ownership-chart?shareholder_id=${shareholder._id}`
                        )
                      }
                    />
                    <FontAwesomeIcon
                      icon={faProjectDiagram}
                      color={theme.primary}
                      style={{ cursor: "pointer" }}
                      className="mr-3"
                      onClick={() =>
                        history.push(`/graph?shareholder_id=${shareholder._id}`)
                      }
                    />
                    <FontAwesomeIcon
                      icon={faList}
                      color={theme.secondary}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        history.push(`/shareholder?_id=${shareholder._id}`)
                      }
                    />
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
      </div>
      <div className="pt-4 px-4 my-4" style={theme.lowering}>
        <p className="small text-muted">
          All data er gjort offentlig tilgjengelig av Skatteetaten. Duplikater
          av aksjonærer forekommer i Skatteetatens datasett, og de samme
          duplikatene vil være på denne siden. Siden eies og er utviklet av
          Pureokrs AS (contact@pureokrs.com).
        </p>
      </div>
    </Container>
  );
};
