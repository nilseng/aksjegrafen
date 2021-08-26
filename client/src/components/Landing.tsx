import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { debounce } from "lodash";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ICompany, IShareholder } from "../models/models";
import { useHistory } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../App";
import { StatCard } from "./StatCard";
import { useCompanyCount, useShareholderCount } from "../services/apiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSitemap } from "@fortawesome/free-solid-svg-icons";

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
        fetch(`/api/company/${searchTerm}`).then(async (res: any) => {
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
      className="d-flex flex-column justify-content-between"
      style={{ minHeight: "calc(100vh - 58.78px)", color: theme.text }}
    >
      <div className="pt-5">
        <Row>
          <Col
            sm
            className="d-flex flex-column align-items-center pt-5 m-1"
            style={{ backgroundColor: theme.background, ...theme.elevation }}
          >
            <StatCard label="aksjeselskaper" stat={companyCount} />
            <Form.Group className="w-100 mt-sm-5 mt-2">
              <Form.Label>Søk etter selskap</Form.Label>
              <Form.Control
                name="peakSearchTerm"
                type="text"
                placeholder="Selskapsnavn eller orgnr..."
                size="lg"
                style={{
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.backgroundSecondary,
                  color: theme.text,
                }}
                onChange={(e) => handleCompanySearch(e)}
              ></Form.Control>
            </Form.Group>
            <ListGroup className="w-100">
              {companySearchList?.map((company) => (
                <ListGroup.Item
                  key={company._id}
                  className="w-100"
                  style={{ backgroundColor: theme.backgroundSecondary }}
                >
                  <Button
                    variant="link"
                    onClick={() => history.push(`/company?_id=${company._id}`)}
                  >
                    <span className="mr-2">{company.name}</span>
                    <span className="text-muted">({company.orgnr})</span>
                  </Button>
                  <FontAwesomeIcon
                    icon={faSitemap}
                    color={theme.primary}
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      history.push(`/ownership-chart?_id=${company._id}`)
                    }
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col
            sm
            className="d-flex flex-column align-items-center pt-5 m-1"
            style={{ backgroundColor: theme.background, ...theme.elevation }}
          >
            <StatCard label="aksjonærer" stat={shareholderCount} />
            <Form.Group className="w-100 mt-sm-5 mt-2">
              <Form.Label>Søk etter aksjonær</Form.Label>
              <Form.Control
                name="peakSearchTerm"
                type="text"
                placeholder="Orgnr eller navn på person eller selskap..."
                size="lg"
                style={{
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.backgroundSecondary,
                  color: theme.text,
                }}
                onChange={(e) => handleShareholderSearch(e)}
              ></Form.Control>
            </Form.Group>
            <ListGroup className="w-100">
              {shareholderSearchList?.map((shareholder) => (
                <ListGroup.Item
                  key={shareholder._id}
                  style={{ backgroundColor: theme.backgroundSecondary }}
                  onClick={() =>
                    history.push(`/shareholder?_id=${shareholder._id}`)
                  }
                >
                  <Button variant="link">
                    <span className="mr-2">{shareholder.name}</span>
                    {shareholder.yearOfBirth && (
                      <span className="text-muted mr-2">
                        {shareholder.yearOfBirth}
                      </span>
                    )}
                    {shareholder.orgnr && (
                      <span className="text-muted mr-2">
                        {shareholder.orgnr}
                      </span>
                    )}
                    {shareholder.countryCode && (
                      <span className="text-muted">
                        {shareholder.countryCode}
                      </span>
                    )}
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
      </div>
      <div className="my-4">
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
