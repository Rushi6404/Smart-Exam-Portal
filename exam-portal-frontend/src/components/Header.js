import React, { useEffect, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const loginReducer = useSelector((state) => state.loginReducer);
  const [isLoggedIn, setIsLoggedIn] = useState(loginReducer.loggedIn);
  let profilePageUrl = "";

  const logoutHandler = () => {
    setIsLoggedIn(false);
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (localStorage.getItem("jwtToken")) {
      setIsLoggedIn(true);
      loginReducer.user.roles.map((r) => {
        if (r["roleName"] === "ADMIN") {
          profilePageUrl = "/adminProfile";
        } else {
          profilePageUrl = "/";
        }
      });
    }
  }, [navigate]);

  return (
    <header>
      <Navbar variant="dark" expand="lg" collapseOnSelect className="shadow-sm" style={{ backgroundColor: "var(--primary-color)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Container>
          <Navbar.Brand className="fw-bold d-flex align-items-center" style={{ fontSize: "1.25rem", letterSpacing: "-0.5px" }}>
            <span style={{ marginRight: '8px' }}>🎓</span> Exam Portal
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="justify-content-end flex-grow-1 pe-3">
              {isLoggedIn ? (
                <Nav.Link className="fw-medium text-white d-flex align-items-center">
                  <span style={{ opacity: 0.8, marginRight: '6px', fontWeight: 400 }}>Welcome,</span> {loginReducer.user.firstName}
                </Nav.Link>
              ) : (
                <LinkContainer to="/">
                  <Nav.Link className="fw-medium text-white btn-link">Login</Nav.Link>
                </LinkContainer>
              )}

              {isLoggedIn ? (
                <LinkContainer to="/">
                  <Nav.Link onClick={logoutHandler} className="fw-medium text-white ms-3 btn btn-sm btn-outline-light" style={{ border: '1px solid rgba(255,255,255,0.4)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 1rem' }}>Logout</Nav.Link>
                </LinkContainer>
              ) : (
                <LinkContainer to="/register">
                  <Nav.Link className="fw-medium text-white ms-2">Register</Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
