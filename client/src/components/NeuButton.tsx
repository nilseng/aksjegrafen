import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSProperties, ReactElement, useContext, useEffect, useState } from "react";
import { AppContext } from "../AppContext";

interface IProps {
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

const defaultButtonClasses = "flex justify-center items-center select-none ";

export const NeuButton = ({
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
  const { theme } = useContext(AppContext);

  const [isLoading, setIsLoading] = useState(false);
  const [buttonStyle, setButtonStyle] = useState<CSSProperties>({ ...theme.button, ...style });

  useEffect(() => {
    setButtonStyle({ ...theme.button, ...style });
  }, [style, theme]);

  const handleButtonDown = () => {
    if (disabled) return;
    setButtonStyle({ ...theme.lowering, ...style });
  };

  const handleButtonUp = () => {
    setButtonStyle({ ...theme.button, ...style });
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
      className={`${defaultButtonClasses} ${className}`}
      style={buttonStyle}
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
