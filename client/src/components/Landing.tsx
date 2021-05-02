import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { debounce } from "lodash";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Company, Shareholder } from "../models/models";

export const Landing = () => {
  const [companySearchList, setCompanySearchList] = useState<Company[]>([]);
  const [shareholderSearchList, setShareholderSearchList] = useState<
    Shareholder[]
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
    <Container style={{ minHeight: "80vh" }}>
      <div className="h1 my-4">Eierskapsstruktur</div>
      <Row>
        <Col sm>
          <Form.Group>
            <Form.Label>Søk etter selskap</Form.Label>
            <Form.Control
              name="peakSearchTerm"
              type="text"
              placeholder="Selskapsnavn eller orgnr..."
              size="sm"
              onChange={(e) => handleCompanySearch(e)}
            ></Form.Control>
          </Form.Group>
          <ListGroup>
            {companySearchList?.map((company) => (
              <ListGroup.Item key={company._id}>
                <Button variant="link" onClick={() => console.log(company)}>
                  <span className="mr-2">{company.orgnr}</span>
                  <span>{company.name}</span>
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
              size="sm"
              onChange={(e) => handleShareholderSearch(e)}
            ></Form.Control>
          </Form.Group>
          <ListGroup>
            {shareholderSearchList?.map((shareholder) => (
              <ListGroup.Item key={shareholder._id}>
                <Button variant="link" onClick={() => console.log(shareholder)}>
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
      <div className="position-absolute" style={{ bottom: 0 }}>
        <p className="small text-muted">
          All data på denne siden er gjort offentlig tilgjengelig av
          Skatteetaten.
        </p>
        <p className="small text-muted">
          Send en mail til teodor.nilseng@gmail.com ved tilbakemeldinger eller
          spørsmål.
        </p>
      </div>
    </Container>
  );
};
