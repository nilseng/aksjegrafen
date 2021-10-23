import { useContext } from "react";
import { AppContext } from "../../../App";

interface IProps {
  title: string;
  value: string | number;
  link?: boolean;
}

export const ModalInfo = ({ title, value, link }: IProps) => {
  const { theme } = useContext(AppContext);

  if (link)
    return (
      <>
        <p
          className="small font-weight-bold m-0"
          style={{ color: theme.muted }}
        >
          {title}
        </p>
        <div style={{ marginBottom: "1rem" }}>
          <a
            href={"https://" + value}
            target="_blank"
            rel="noreferrer noopener"
          >
            {value}
          </a>
        </div>
      </>
    );

  return (
    <>
      <p className="small font-weight-bold m-0" style={{ color: theme.muted }}>
        {title}
      </p>
      <p>{value}</p>
    </>
  );
};
