import React from "react";
import { useContext } from "react";
import { AppContext } from "../App";

interface IProps {
  label?: string;
  stat?: string | number;
}

export const StatCard = ({ label, stat }: IProps) => {
  const { theme } = useContext(AppContext);
  return (
    <div
      className="d-flex flex-column align-items-center p-2 mx-4"
      style={{
        backgroundColor: theme.background,
        ...theme.elevation,
        width: "10rem",
        minHeight: "5rem",
      }}
    >
      <p className="h4">{stat?.toLocaleString()}</p>
      <p className="font-weight-bold m-0" style={{ color: theme.primary }}>
        {label}
      </p>
    </div>
  );
};
