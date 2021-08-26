import React, { useEffect, useState } from "react";
import { useContext } from "react";
import Container from "react-bootstrap/esm/Container";
import Table from "react-bootstrap/esm/Table";
import { useHistory } from "react-router-dom";
import { AppContext } from "../App";
import { useQuery } from "../hooks/useQuery";
import { IShareholder, IOwnership } from "../models/models";

export const Shareholder = () => {
  const { theme } = useContext(AppContext);

  const query = useQuery();
  const history = useHistory();

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
      <Container style={{ color: theme.text }}>
        <p className="h4 my-4">Aksjer eid av {shareholder?.name}</p>
        {ownerships && ownerships.filter((o) => o.year === 2020) && (
          <>
            <p>2020</p>
            <Table variant={theme.id} striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Selskap</th>
                  <th>Antall aksjer </th>
                  <th>Eierandel</th>
                </tr>
              </thead>
              <tbody>
                {ownerships &&
                  ownerships
                    .filter((o) => o.year === 2020)
                    .map((o) => (
                      <tr
                        key={o._id}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          history.push(`/company?_id=${o.company?._id}`)
                        }
                      >
                        <td>{o.company?.name}</td>
                        <td>{o.stocks.toLocaleString()}</td>
                        <td>
                          {o.company?.stocks &&
                            ((o.stocks / o.company.stocks) * 100).toFixed(2)}
                          %
                        </td>
                      </tr>
                    ))}
              </tbody>
            </Table>
          </>
        )}
        {ownerships && ownerships.filter((o) => o.year === 2019).length > 0 && (
          <>
            <p>2019</p>
            <Table variant={theme.id} striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Selskap</th>
                  <th>Antall aksjer </th>
                  <th>Eierandel</th>
                </tr>
              </thead>
              <tbody>
                {ownerships &&
                  ownerships
                    .filter((o) => o.year === 2019)
                    .map((o) => (
                      <tr
                        key={o._id}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          history.push(`/company?_id=${o.company?._id}`)
                        }
                      >
                        <td>{o.company?.name}</td>
                        <td>{o.stocks.toLocaleString()}</td>
                        <td>
                          {o.company?.stocks &&
                            ((o.stocks / o.company.stocks) * 100).toFixed(2)}
                          %
                        </td>
                      </tr>
                    ))}
              </tbody>
            </Table>
          </>
        )}
        {(!ownerships || ownerships.length === 0) && shareholderId && (
          <p>Laster inn aksjonærdata...</p>
        )}
      </Container>
    </>
  );
};
