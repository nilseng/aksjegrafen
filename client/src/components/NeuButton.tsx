import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSProperties, ReactElement, useState } from "react";
import "./NeuButton.scss";

interface IProps {
  type: "light" | "colored";
  className?: string;
  textClassName?: string;
  text?: string;
  icon?: IconDefinition;
  componentIcon?: ReactElement;
  style?: CSSProperties;
  action?: () => void;
  asyncAction?: () => Promise<unknown>;
  disabled?: boolean;
  ariaLabel?: string;
}

const defaultButtonClasses = "flex justify-center items-center text-gray-500 select-none ";

export const NeuButton = ({
  type,
  className,
  textClassName,
  text,
  icon,
  componentIcon,
  style,
  action,
  asyncAction,
  disabled = false,
  ariaLabel,
}: IProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [buttonClasses, setButtonClasses] = useState<string>(
    defaultButtonClasses + className + ` ${type}-button-shadow`
  );

  const handleButtonDown = () => {
    if (disabled) return;
    setButtonClasses(defaultButtonClasses + className + ` ${type}-pressed-button-shadow`);
  };

  const handleButtonUp = () => {
    setButtonClasses(defaultButtonClasses + className + ` ${type}-button-shadow`);
  };

  const handleClick = async () => {
    if (asyncAction) {
      setIsLoading(true);
      await asyncAction();
      setIsLoading(false);
    }
    if (action) {
      action();
    }
  };

  return (
    <button
      className={buttonClasses}
      style={style}
      aria-label={ariaLabel ?? text}
      disabled={disabled}
      onMouseDown={handleButtonDown}
      onMouseUp={handleButtonUp}
      onMouseLeave={handleButtonUp}
      onMouseOut={handleButtonUp}
      onTouchStart={handleButtonDown}
      onTouchEnd={handleButtonUp}
      onTouchCancel={handleButtonUp}
      onClick={handleClick}
    >
      {isLoading ? (
        <FontAwesomeIcon className={`animate-spin ${textClassName}`} icon={faSpinner} />
      ) : (
        <>
          {icon && <FontAwesomeIcon className={`w-full h-full ${textClassName}`} icon={icon} />}
          {componentIcon}
          <span className={textClassName}>{text}</span>
        </>
      )}
    </button>
  );
};
