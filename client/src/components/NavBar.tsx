import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import "./NavBar.scss";

import AnimatedLogo from "./AnimatedLogo";
import { ThemeButton } from "./ThemeButton";
import { Link } from "react-router-dom";

interface IProps {
  theme: any;
  setTheme: React.Dispatch<React.SetStateAction<any>>;
}

const NavBar = ({ theme, setTheme }: IProps) => {
  return (
    <Navbar
      variant="light"
      expand="md"
      collapseOnSelect
      style={{ zIndex: 10000 }}
    >
      <Link to="/">
        <Navbar.Brand className="text-light">
          <span
            className="ml-4"
            style={{
              ...theme.button,
              borderRadius: "100px",
              display: "inline-block",
              textAlign: "center",
              verticalAlign: "middle",
              width: "3.2rem",
              height: "3.2rem",
              paddingTop: "0.4rem",
            }}
          >
            <AnimatedLogo color={theme.primary} height="2rem" width="2rem" />
          </span>
        </Navbar.Brand>
      </Link>
      <div className="d-flex justify-content-end" style={{ flexGrow: 1 }}>
        <Nav className="pr-4 " defaultActiveKey="/home">
          <ThemeButton theme={theme} setTheme={setTheme} />
        </Nav>
      </div>
    </Navbar>
  );
};

export default NavBar;
