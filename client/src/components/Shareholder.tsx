import React, { useEffect, useState } from "react";
import Col from "react-bootstrap/esm/Col";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import { useQuery } from "../hooks";
import { IShareholder, IOwnership } from "../models/models";

export const Shareholder = () => {
  const query = useQuery();

  const [shareholderId, setShareholderId] = useState<string>();
  const [shareholder, setShareholder] = useState<IShareholder>();
  const [ownerships, setOwnerships] = useState<IOwnership[]>([]);

  useEffect(() => {
    const _id = query.get("_id");
    if (_id) setShareholderId(_id);
  }, [query]);

  useEffect(() => {
    if (shareholderId) {
      fetch(`/api/shareholder?_id=${shareholderId}`).then(async (res) => {
        const s = await res.json();
        setShareholder(s);
      });
    }
  }, [shareholderId]);

  useEffect(() => {
    if (shareholder) {
      fetch(`/api/ownerships?shareholderId=${shareholder.id}`).then(
        async (res) => {
          const o = await res.json();
          setOwnerships(o);
        }
      );
    }
  }, [shareholder]);

  return (
    <>
      <Container>
        <p className="h4 my-4">Aksjer eid av {shareholder?.name}</p>
        {ownerships && (
          <Row>
            <Col>
              <p className="h4">Selskap</p>
              {ownerships.map((o) => (
                <div key={o._id}>{o.company?.name}</div>
              ))}
            </Col>
            <Col>
              <p className="h4">Antall aksjer</p>
              {ownerships &&
                ownerships.map((o) => (
                  <div key={o._id}>{o.stocks.toLocaleString()}</div>
                ))}
            </Col>
            <Col>
              <p className="h4">Eierandel</p>
              {ownerships &&
                ownerships.map(
                  (o) =>
                    o.company?.stocks && (
                      <div key={o._id}>
                        {((o.stocks / o.company?.stocks) * 100).toFixed(2)}%
                      </div>
                    )
                )}
            </Col>
          </Row>
        )}
        {(!ownerships || ownerships.length === 0) && shareholderId && (
          <p>Laster inn aksjonærdata...</p>
        )}
      </Container>
    </>
  );
};
