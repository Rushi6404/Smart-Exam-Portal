import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Row, Col, InputGroup, Spinner } from "react-bootstrap";
// import FormContainer from "../components/FormContainer"; // Removing Custom Container to use Global Full Screen Center
import { FaEye, FaEyeSlash, FaSignInAlt, FaUser, FaLock } from "react-icons/fa";
import { login } from "../actions/authActions";
// import Loader from "../components/Loader"; // Using Bootstrap Spinner for better integration
import * as authConstants from "../constants/authConstants";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Persistence check
  const token = JSON.parse(localStorage.getItem("jwtToken"));
  const user = JSON.parse(localStorage.getItem("user"));

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginReducer = useSelector((state) => state.loginReducer);

  const showPasswordHandler = () => {
    setShowPassword(!showPassword);
    setPasswordType(showPassword ? "password" : "text");
  };

  // 🔹 Robust Validation Logic
  const validateForm = () => {
    let newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) { // Keeping basic length check for Login to avoid blocking old users
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) return;

    login(dispatch, username, password).then((data) => {
      if (data && data.type === authConstants.USER_LOGIN_SUCCESS) {
        data.payload.roles.map((r) => {
          if (r.roleName === "ADMIN") {
            return navigate("/adminProfile");
          } else {
            return navigate("/profile");
          }
        });
      }
    });
  };

  useEffect(() => {
    if (token && user) {
      user.roles.map((r) => {
        if (r.roleName === "ADMIN") return navigate("/adminProfile");
        else return navigate("/profile");
      });
    }
  }, [token, user, navigate]);

  return (
    <div className="full-screen-center">
      <div className="glass-card" style={{ width: "100%", maxWidth: "550px", padding: "2.5rem" }}>
        <div className="text-center mb-4">
          <FaSignInAlt size={40} className="text-primary mb-2" />
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-muted">Sign in to continue to Exam Portal</p>
        </div>

        {loginReducer.error && (
          <div className="alert alert-danger" role="alert">
            {loginReducer.error?.message || "Invalid Credentials. Please try again."}
          </div>
        )}

        <Form onSubmit={submitHandler} noValidate autoComplete="off">

          {/* Username */}
          <Form.Group className="mb-4" controlId="username">
            <Form.Label>Username</Form.Label>
            <InputGroup className="has-validation">
              <InputGroup.Text><FaUser /></InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Enter your username"
                value={username}
                isInvalid={isSubmitted && !!errors.username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (isSubmitted) validateForm();
                }}
                autoFocus
                autoComplete="off"
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-4" controlId="password">
            <Form.Label>Password</Form.Label>
            <InputGroup className="has-validation">
              <InputGroup.Text><FaLock /></InputGroup.Text>
              <Form.Control
                type={passwordType}
                placeholder="Enter password"
                value={password}
                isInvalid={isSubmitted && !!errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (isSubmitted) validateForm();
                }}
                autoComplete="new-password"
              />
              <Button
                onClick={showPasswordHandler}
                variant="outline-secondary"
                id="button-addon2"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <div className="d-flex justify-content-end mb-3">
            <Link to="/forgot-password" className="text-decoration-none text-muted small">
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-100 btn-primary mb-3"
            disabled={loginReducer.loading}
          >
            {loginReducer.loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Sign In"}
          </Button>
        </Form>

        <Row className="py-2">
          <Col className="text-center">
            <span className="text-muted">New Here? </span>
            <Link to="/register" className="fw-bold text-primary">
              Create an Account
            </Link>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default LoginPage;
