import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
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
import { faSitemap, faUserTie } from "@fortawesome/free-solid-svg-icons";

import { faBuilding } from "@fortawesome/free-regular-svg-icons";

export const SearchView = () => {
  const { theme } = useContext(AppContext);

  const history = useHistory();

  const companyCount = useCompanyCount();
  const shareholderCount = useShareholderCount();

  const [companySearchList, setCompanySearchList] = useState<ICompany[]>([]);
  const [shareholderSearchList, setShareholderSearchList] = useState<IShareholder[]>([]);

  const [companySearchTerm, setCompanySearchTerm] = useState<string>();
  const [shareholderSearchTerm, setShareholderSearchTerm] = useState<string>();

  const handleCompanySearch = (e: any) => {
    setCompanySearchTerm(e.target.value);
  };

  const handleShareholderSearch = (e: any) => {
    setShareholderSearchTerm(e.target.value);
  };

  useEffect(() => {
    setCompanySearchList([]);
    const abortController = new AbortController();
    if (!companySearchTerm || companySearchTerm?.length < 3) setCompanySearchList([]);
    else {
      fetch(`/api/company/${companySearchTerm}?limit=10`, { signal: abortController.signal }).then(
        async (res) => {
          if (abortController.signal.aborted) return;
          const companies: ICompany[] = await res.json();
          setCompanySearchList(companies);
        },
        (_) => _
      );
    }

    return () => {
      abortController.abort();
    };
  }, [companySearchTerm]);

  useEffect(() => {
    setShareholderSearchList([]);
    const abortController = new AbortController();
    if (!shareholderSearchTerm || shareholderSearchTerm?.length < 3) setShareholderSearchList([]);
    else {
      fetch(`/api/shareholder/${shareholderSearchTerm}`, { signal: abortController.signal }).then(
        async (res) => {
          if (abortController.signal.aborted) return;
          const shareholders: IShareholder[] = await res.json();
          setShareholderSearchList(shareholders);
        },
        (_) => _
      );
    }

    return () => {
      abortController.abort();
    };
  }, [shareholderSearchTerm]);

  return (
    <div className="d-flex w-100 justify-content-center align-items-middle" style={{ minHeight: "100%" }}>
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
              <Form.Group className="w-100 mt-5 px-3">
                <Form.Control
                  name="selskapsSøk"
                  autoComplete="off"
                  type="text"
                  placeholder="Søk etter selskap..."
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    color: theme.text,
                    ...theme.lowering,
                    borderRadius: "4rem",
                  }}
                  onChange={handleCompanySearch}
                ></Form.Control>
              </Form.Group>
              <ListGroup className="w-100 mw-100" style={{ zIndex: 100 }}>
                {companySearchList?.map((company) => (
                  <ListGroup.Item
                    key={company._id}
                    className="w-100 mw-100 d-flex align-items-center justify-content-between border-0 my-1"
                    style={{
                      backgroundColor: theme.background,
                      cursor: "pointer",
                      ...theme.elevation,
                    }}
                    onClick={() => history.push(`/graph?_id=${company._id}`)}
                  >
                    <div>
                      <div className="mr-2">{company.name}</div>
                      <span className="small text-muted mr-3">{company.orgnr}</span>
                    </div>
                    <FontAwesomeIcon
                      icon={faSitemap}
                      color={theme.primary}
                      style={{ cursor: "pointer" }}
                      className="mr-3"
                    />
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
              <StatCard label="aksjonærer" labelIcon={faUserTie} stat={shareholderCount} />
              <Form.Group className="w-100 mt-5 px-3">
                <Form.Control
                  name="aksjonærsøk"
                  autoComplete="off"
                  type="text"
                  placeholder="...eller aksjonær..."
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    color: theme.text,
                    ...theme.lowering,
                    borderRadius: "4rem",
                  }}
                  onChange={handleShareholderSearch}
                ></Form.Control>
              </Form.Group>
              <ListGroup className="w-100 mw-100" style={{ zIndex: 100 }}>
                {shareholderSearchList?.map((shareholder) => (
                  <ListGroup.Item
                    key={shareholder._id}
                    className="w-100 mw-100 d-flex align-items-center justify-content-between border-0 my-1"
                    style={{
                      backgroundColor: theme.background,
                      cursor: "pointer",
                      ...theme.elevation,
                    }}
                    onClick={() => history.push(`/graph?shareholder_id=${shareholder._id}`)}
                  >
                    <div>
                      <span className="mr-2">{shareholder.name}</span>
                      <div>
                        {shareholder.yearOfBirth && (
                          <span className="small text-muted mr-2">{shareholder.yearOfBirth}</span>
                        )}
                        {shareholder.orgnr && <span className="small text-muted mr-2">{shareholder.orgnr}</span>}
                        {shareholder.countryCode && <span className="small text-muted">{shareholder.countryCode}</span>}
                      </div>
                    </div>
                    <FontAwesomeIcon icon={faSitemap} color={theme.primary} className="mr-3" />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          </Row>
        </div>
        <div className="pt-4 px-4 my-4" style={theme.lowering}>
          <p className="small text-muted">
            All data er gjort offentlig tilgjengelig av Skatteetaten eller Brønnøysundregistrene og bearbeidet av
            Aksjegrafen. Feil kan forekomme. Siden eies og er utviklet av Pureokrs AS (contact@pureokrs.com).
          </p>
        </div>
      </Container>
    </div>
  );
};
