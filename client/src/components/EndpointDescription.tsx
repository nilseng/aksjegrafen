import { useContext, useState } from "react";
import { AppContext } from "../AppContext";
import { buildQuery } from "../utils/buildQuery";

interface IProps {
  title: string;
  baseUrl: string;
  path: string;
  params?: { name: string; description: string; example?: string | number }[];
  query?: {
    name: string;
    description: string;
    example?: string | number;
  }[];
  exampleResponse: string;
}
export const EndpointDescription = ({ title, baseUrl, path, params, query, exampleResponse }: IProps) => {
  const { theme } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<"description" | "example">("description");
  return (
    <div className="pb-4">
      <p className="small font-weight-bold m-0">{title}</p>
      <div className="py-2">
        <button
          className="btn btn-sm"
          style={
            activeTab === "description"
              ? { backgroundColor: theme.primary, color: theme.backgroundSecondary }
              : { backgroundColor: theme.backgroundSecondary, color: theme.primary }
          }
          onClick={() => setActiveTab("description")}
        >
          Beskrivelse
        </button>
        {exampleResponse && (
          <button
            className="btn btn-sm"
            style={
              activeTab === "example"
                ? { backgroundColor: theme.primary, color: theme.backgroundSecondary }
                : { backgroundColor: theme.backgroundSecondary, color: theme.primary }
            }
            onClick={() => setActiveTab("example")}
          >
            Eksempel
          </button>
        )}
      </div>
      {activeTab === "description" && (
        <>
          <code>
            {baseUrl}
            {path}
            {params ? `${params.map(({ name }) => `/{${name}}`)}` : ""}
            {buildQuery(
              (() => {
                const o: { [key: string]: string } = {};
                query?.forEach((q) => (o[q.name] = `{${q.name}}`));
                return o;
              })()
            )}
          </code>
          {params?.map(({ name, description }) => (
            <p className="m-0" key={name}>
              <code>{name}</code> - {description}
            </p>
          ))}
          {query?.map(({ name, description }) => (
            <p className="m-0" key={name}>
              <code>{name}</code> - {description}
            </p>
          ))}
        </>
      )}
      {exampleResponse && activeTab === "example" && (
        <>
          <p className="m-0">
            <code>
              {baseUrl}
              {path}
              {params ? `${params.map(({ example }) => `/${example}`)}` : ""}
              {buildQuery(
                (() => {
                  const o: { [key: string]: string } = {};
                  query?.forEach((q) => {
                    if (q.example) o[q.name] = `${q.example}`;
                  });
                  return o;
                })()
              )}
            </code>
          </p>
          <code>
            <pre>{exampleResponse}</pre>
          </code>
        </>
      )}
    </div>
  );
};
