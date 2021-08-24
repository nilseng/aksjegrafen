import React, { useContext, useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import { AppContext } from "../App";

export const Stats = () => {
  const { theme } = useContext(AppContext);

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
    <Row style={{ color: theme.text }}>
      <Col
        sm
        className="d-flex flex-column align-items-center p-md-5 p-2 m-md-5 m-2"
        style={{
          backgroundColor: theme.background,
          ...theme.elevation,
        }}
      >
        <p className="display-4">{companyCount?.toLocaleString()}</p>
        <p className="font-weight-bold mt-2" style={{ color: theme.primary }}>
          aksjeselskaper
        </p>
      </Col>
      <Col
        sm
        className="d-flex flex-column align-items-center p-md-5 p-2 m-md-5 m-2"
        style={{
          backgroundColor: theme.background,
          ...theme.elevation,
        }}
      >
        <p className="display-4">{shareholderCount?.toLocaleString()}</p>
        <p className="font-weight-bold mt-2" style={{ color: theme.primary }}>
          aksjonærer
        </p>
      </Col>
    </Row>
  );
};
