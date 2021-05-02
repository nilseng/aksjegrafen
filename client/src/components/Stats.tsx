import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";

export const Stats = () => {
  const [companyCount, setCompanyCount] = useState<number>();
  const [shareholderCount, setShareholderCount] = useState<number>();

  useEffect(() => {
    fetch("/api/company?count=true").then(async (res) => {
      const count = await res.json();
      setCompanyCount(count);
    });
    fetch("/api/shareholder?count=true").then(async (res) => {
      const count = await res.json();
      setShareholderCount(count);
    });
  }, []);

  return (
    <Row className="bg-light mb-4 p-4">
      <Col sm className="d-flex flex-column align-items-center">
        <p className="display-4">{companyCount?.toLocaleString()}</p>
        aksjeselskaper
      </Col>
      <Col sm className="d-flex flex-column align-items-center">
        <p className="display-4">{shareholderCount?.toLocaleString()}</p>
        aksjonærer
      </Col>
    </Row>
  );
};
