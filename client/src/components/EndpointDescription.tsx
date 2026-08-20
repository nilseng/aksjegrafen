import { useContext, useState } from "react";
import { AppContext } from "../AppContext";
import { buildQuery } from "../utils/buildQuery";
import { docsStyles } from "./apiDocsStyles";

interface IProps {
  title: string;
  baseUrl: string;
  path: string;
  method?: string;
  params?: { name: string; description: string; example?: string | number }[];
  query?: {
    name: string;
    description: string;
    example?: string | number;
  }[];
  exampleResponse: string;
}

export const EndpointDescription = ({ title, baseUrl, path, method = "GET", params, query, exampleResponse }: IProps) => {
  const { theme } = useContext(AppContext);
  const s = docsStyles(theme);
  const [activeTab, setActiveTab] = useState<"description" | "example">("description");

  const pathWithParams = `${path}${params ? params.map(({ name }) => `/{${name}}`).join("") : ""}`;

  const templateQuery = () => {
    const o: { [key: string]: string } = {};
    query?.forEach((q) => (o[q.name] = `{${q.name}}`));
    return o;
  };
  const exampleQuery = () => {
    const o: { [key: string]: string } = {};
    query?.forEach((q) => {
      if (q.example) o[q.name] = `${q.example}`;
    });
    return o;
  };

  const requestUrl = `${baseUrl}${pathWithParams}${buildQuery(templateQuery())}`;
  const exampleUrl = `${baseUrl}${path}${params ? params.map(({ example }) => `/${example}`).join("") : ""}${buildQuery(
    exampleQuery()
  )}`;

  const hasParams = !!(params?.length || query?.length);
  const codeStyle = { ...s.code, overflowX: "auto" as const };
  const tabStyle = (active: boolean) => ({
    backgroundColor: "transparent",
    border: "none",
    borderBottom: `2px solid ${active ? theme.primary : "transparent"}`,
    color: active ? theme.primary : theme.muted,
    cursor: "pointer",
  });

  return (
    <div className="w-full mb-4 p-4" style={s.card}>
      <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ backgroundColor: theme.primary, color: "#ffffff" }}
        >
          {method}
        </span>
        <code className="text-sm font-bold break-all">{pathWithParams}</code>
      </div>
      <p className="text-sm mt-1 mb-3" style={{ color: theme.muted }}>
        {title}
      </p>

      <div className="flex gap-4 mb-3 text-sm">
        <button
          className="px-0 pb-1"
          style={tabStyle(activeTab === "description")}
          onClick={() => setActiveTab("description")}
        >
          Beskrivelse
        </button>
        {exampleResponse && (
          <button className="px-0 pb-1" style={tabStyle(activeTab === "example")} onClick={() => setActiveTab("example")}>
            Eksempel
          </button>
        )}
      </div>

      {activeTab === "description" && (
        <>
          <pre className="text-xs w-full overflow-x-auto p-3 m-0" style={codeStyle}>
            {requestUrl}
          </pre>
          {hasParams && (
            <div className="text-sm mt-3">
              {params?.map(({ name, description }) => (
                <p className="mb-1" key={name}>
                  <code className="font-bold" style={{ color: theme.primary }}>
                    {name}
                  </code>{" "}
                  — {description}
                </p>
              ))}
              {query?.map(({ name, description }) => (
                <p className="mb-1" key={name}>
                  <code className="font-bold" style={{ color: theme.primary }}>
                    {name}
                  </code>{" "}
                  — {description}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {exampleResponse && activeTab === "example" && (
        <>
          <pre className="text-xs w-full overflow-x-auto p-3 m-0 mb-3" style={codeStyle}>
            {exampleUrl}
          </pre>
          <pre className="text-xs w-full overflow-x-auto p-3 m-0" style={codeStyle}>
            {exampleResponse.trim()}
          </pre>
        </>
      )}
    </div>
  );
};
