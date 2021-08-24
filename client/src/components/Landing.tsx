import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { debounce } from "lodash";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ICompany, IShareholder } from "../models/models";
import { Stats } from "./Stats";
import { useHistory } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../App";

export const Landing = () => {
  const { theme } = useContext(AppContext);

  const history = useHistory();

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
        <Stats />
        <Row className="pt-5">
          <Col sm>
            <Form.Group>
              <Form.Label>Søk etter selskap</Form.Label>
              <Form.Control
                name="peakSearchTerm"
                type="text"
                placeholder="Selskapsnavn eller orgnr..."
                size="lg"
                onChange={(e) => handleCompanySearch(e)}
              ></Form.Control>
            </Form.Group>
            <ListGroup>
              {companySearchList?.map((company) => (
                <ListGroup.Item
                  key={company._id}
                  style={{ backgroundColor: theme.backgroundSecondary }}
                  onClick={() => history.push(`/company?_id=${company._id}`)}
                >
                  <Button variant="link">
                    <span className="mr-2">{company.name}</span>
                    <span className="text-muted">({company.orgnr})</span>
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col sm>
            <Form.Group>
              <Form.Label>Søk etter aksjonær</Form.Label>
              <Form.Control
                name="peakSearchTerm"
                type="text"
                placeholder="Orgnr eller navn på person eller selskap..."
                size="lg"
                onChange={(e) => handleShareholderSearch(e)}
              ></Form.Control>
            </Form.Group>
            <ListGroup>
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
                      <span className="mr-2">{shareholder.yearOfBirth}</span>
                    )}
                    {shareholder.orgnr && (
                      <span className="mr-2">{shareholder.orgnr}</span>
                    )}
                    {shareholder.countryCode && (
                      <span>{shareholder.countryCode}</span>
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
          All data på denne siden er gjort offentlig tilgjengelig av
          Skatteetaten. Siden eies og er utviklet av Pureokrs AS
          (contact@pureokrs.com).
        </p>
      </div>
    </Container>
  );
};
