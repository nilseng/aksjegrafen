import { useContext } from "react";
import { AppContext } from "../../../AppContext";

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
        <p className="text-xs font-bold m-0" style={{ color: theme.muted }}>
          {title}
        </p>
        <div className="text-xs font-bold pb-2">
          <a href={"https://" + value} target="_blank" rel="noreferrer noopener">
            {value}
          </a>
        </div>
      </>
    );

  return (
    <>
      <p className="text-xs font-bold m-0" style={{ color: theme.muted }}>
        {title}
      </p>
      <p className="text-xs pb-2">{value}</p>
    </>
  );
};
