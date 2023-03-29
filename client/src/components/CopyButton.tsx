import { faClone } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const CopyButton = ({ text, className }: { text: string; className?: string }) => {
  return (
    <FontAwesomeIcon
      className={className}
      style={{ cursor: "pointer" }}
      icon={faClone}
      onClick={() => navigator.clipboard.writeText(text)}
    />
  );
};
