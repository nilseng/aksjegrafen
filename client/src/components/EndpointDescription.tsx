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
    <div className="w-full pb-4">
      <p className="text-sm font-bold m-0">{title}</p>
      <div className="py-2">
        <button
          className="text-sm rounded p-2"
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
            className="text-sm rounded p-2"
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
          <code className="text-sm">
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
            <p className="text-sm m-0" key={name}>
              <code>{name}</code> - {description}
            </p>
          ))}
          {query?.map(({ name, description }) => (
            <p className="text-sm m-0" key={name}>
              <code>{name}</code> - {description}
            </p>
          ))}
        </>
      )}
      {exampleResponse && activeTab === "example" && (
        <>
          <p className="w-full text-sm m-0">
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
          <code className="inline-block w-full text-xs overflow-auto">
            <pre className="w-full">{exampleResponse}</pre>
          </code>
        </>
      )}
    </div>
  );
};
