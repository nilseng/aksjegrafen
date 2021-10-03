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
      className="mt-4 mx-4"
      style={{ zIndex: 10000, ...theme.elevation }}
    >
      <Link to="/">
        <Navbar.Brand className="text-light">
          <AnimatedLogo color={theme.primary} height="2rem" width="2rem" />
          <span
            className="font-weight-light mx-4"
            style={{ color: theme.text }}
          >
            Aksjegrafen
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
