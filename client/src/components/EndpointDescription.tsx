import { buildQuery } from "../utils/buildQuery";

interface IProps {
  title: string;
  baseUrl: string;
  path: string;
  params?: { name: string; description: string }[];
  query?: {
    name: string;
    description: string;
  }[];
}
export const EndpointDescription = ({ title, baseUrl, path, params, query }: IProps) => {
  return (
    <div className="pb-4">
      <p className="small font-weight-bold m-0">{title}</p>
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
    </div>
  );
};
