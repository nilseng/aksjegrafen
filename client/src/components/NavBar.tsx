import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

import "./NavBar.scss";

import AnimatedLogo from "./AnimatedLogo";
import { ThemeButton } from "./ThemeButton";

interface IProps {
  theme: any;
  setTheme: React.Dispatch<React.SetStateAction<any>>;
}

const NavBar = ({ theme, setTheme }: IProps) => {
  return (
    <Navbar variant="light" expand="md" collapseOnSelect>
      <Navbar.Brand href="/" className="text-light">
        <AnimatedLogo color={theme.primary} height="2rem" width="2rem" />
        <span className="font-weight-light mx-4" style={{ color: theme.text }}>
          Norske aksjer
        </span>
      </Navbar.Brand>
      <Navbar.Toggle
        className="mb-2"
        aria-controls="basic-navbar-nav"
        style={{ outline: "none" }}
      />
      <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
        <Nav className="pr-4" defaultActiveKey="/home">
          <ThemeButton theme={theme} setTheme={setTheme} />
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
