import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { debounce } from "lodash";
import ListGroup from "react-bootstrap/esm/ListGroup";
import Button from "react-bootstrap/esm/Button";

interface OwnerShip {
  _id: string;
  Orgnr: string;
  Selskap: string;
  Aksjeklasse: string;
  "Navn aksjonær"?: string | undefined;
  "Fødselsår/orgnr"?: string | undefined;
  "Postnr/sted"?: string | undefined;
  Landkode: string;
  "Antall aksjer": string | number;
  "Antall aksjer selskap": string | number;
}

const App = () => {
  const [companySearchList, setCompanySearchList] = useState<string[]>([]);

  const handleSearch = (e: any) => {
    const searchTerm = e.target.value;
    if (searchTerm.length >= 3) searchOwnership(searchTerm);
  };

  const searchOwnership = debounce(
    (searchTerm: string) => {
      fetch(`/api/company/${searchTerm}`).then(async (res: any) => {
        const companies = await res.json();
        setCompanySearchList(companies);
      });
    },
    250,
    {
      leading: false,
      trailing: true,
    }
  );

  return (
    <Container>
      <div className="h1">Eierskapsstruktur</div>
      <Form.Group>
        <Form.Label>Søk etter selskap</Form.Label>
        <Form.Control
          name="peakSearchTerm"
          type="text"
          placeholder="Selskapsnavn eller orgnr..."
          size="sm"
          onChange={(e) => handleSearch(e)}
        ></Form.Control>
      </Form.Group>
      <ListGroup>
        {companySearchList?.map((company) => (
          <ListGroup.Item key={company}>
            <Button variant="link" onClick={() => console.log(company)}>
              {company}
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default App;
