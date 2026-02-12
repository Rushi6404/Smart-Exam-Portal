import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaEye, FaEyeSlash, FaPhone } from "react-icons/fa";
import { register } from "../actions/authActions";
import * as authConstants from "../constants/authConstants";
import swal from "sweetalert";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (isSubmitted) validateForm({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (data = formData) => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Strong Password: Min 8, 1 Upper, 1 Lower, 1 Number, 1 Special
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // Phone: EXACTLY 10 digits, starts with 6, 7, 8, or 9
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!data.username.trim()) newErrors.username = "Username is required";
    const nameRegex = /^[a-zA-Z]+$/;

    if (!data.firstName.trim()) {
      newErrors.firstName = "First Name is required";
    } else if (!nameRegex.test(data.firstName.trim())) {
      newErrors.firstName = "First Name must contain only characters";
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    } else if (!nameRegex.test(data.lastName.trim())) {
      newErrors.lastName = "Last Name must contain only characters";
    }

    if (!data.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(data.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!data.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(data.phone)) {
      newErrors.phone = "Invalid phone number (Must be 10 digits, starting with 6-9)";
    }

    if (!data.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(data.password)) {
      newErrors.password = "Password must be 8+ chars, with 1 uppercase, 1 number, & 1 special char";
    }

    if (data.confirmPassword !== data.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateForm()) return;

    setLoading(true);

    // Construct user object expected by backend
    const user = {
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phone, // Mapping to phoneNumber as expected by ProfilePage
      password: formData.password
    };

    try {
      const response = await register(dispatch, user);

      // Check if response indicates success (based on typical Redux action returns)
      // Note: The register action usually dispatches types, and might not return the full response in a simple way 
      // depending on how it's implemented in authActions. 
      // Assuming register returns the axios promise or result.

      // If the register function just dispatches, we might need to rely on component state updated by redux
      // But looking at the original code: 
      // if (response && response.type === authConstants.USER_REGISTER_SUCCESS) 

      // We will assume the error handling needs to be robust. 
      // If the backend returns 400/500, the axios interceptor or action normally catches it.
      // Let's ensure we catch it here if re-thrown.

      if (response && response.type === authConstants.USER_REGISTER_SUCCESS) {
        swal("Success", "Registration Successful! Please Login.", "success");
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration Error", error);
      // Backend typically returns error message in error.response.data
      console.log("Error details:", error.response); // Debugging

      let backendError = "Something went wrong!";
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          backendError = error.response.data;
        } else if (error.response.data.message) {
          backendError = error.response.data.message;
        } else {
          // Fallback: try to stringify or just use default
          backendError = JSON.stringify(error.response.data);
        }
      }

      // Check for Username Error
      if (backendError.toLowerCase().includes("user already present with this username")) {
        setErrors(prev => ({ ...prev, username: `Username '${formData.username}' already exists. Please choose another.` }));
      }
      // Check for Email Error
      else if (backendError.toLowerCase().includes("user already present with this email")) {
        setErrors(prev => ({ ...prev, email: `Email '${formData.email}' already exists. Please use a different email.` }));
      }
      // Fallback
      else {
        swal("Error", "Registration Failed: " + backendError, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-screen-center">
      <div className="glass-card" style={{ width: "100%", maxWidth: "750px", padding: "3rem" }}>
        <div className="text-center mb-5">
          <FaUserPlus size={48} className="text-primary mb-3" />
          <h2 className="fw-bold display-6">Create Account</h2>
          <p className="text-muted fs-5">Join Exam Portal to start your journey</p>
        </div>

        <Form onSubmit={submitHandler} noValidate autoComplete="off">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <InputGroup className="has-validation">
                  <InputGroup.Text><FaUser /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Username"
                    name="username"
                    value={formData.username}
                    onChange={changeHandler}
                    isInvalid={isSubmitted && !!errors.username}
                    autoComplete="off"
                  />
                  <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="phone">
                <Form.Label>Phone Number</Form.Label>
                <InputGroup className="has-validation">
                  <InputGroup.Text><FaPhone /></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={changeHandler}
                    isInvalid={isSubmitted && !!errors.phone}
                  />
                  <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={changeHandler}
                  isInvalid={isSubmitted && !!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={changeHandler}
                  isInvalid={isSubmitted && !!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <InputGroup className="has-validation">
              <InputGroup.Text><FaEnvelope /></InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={changeHandler}
                isInvalid={isSubmitted && !!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <InputGroup className="has-validation">
                  <InputGroup.Text><FaLock /></InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={changeHandler}
                    isInvalid={isSubmitted && !!errors.password}
                    autoComplete="new-password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                  <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup className="has-validation">
                  <InputGroup.Text><FaLock /></InputGroup.Text>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={changeHandler}
                    isInvalid={isSubmitted && !!errors.confirmPassword}
                    autoComplete="new-password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </Button>
                  <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" className="w-100 btn-primary btn-lg mt-4 mb-3" disabled={loading}>
            {loading ? <Spinner as="span" animation="border" size="sm" /> : "Register"}
          </Button>
        </Form>

        <div className="text-center">
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" className="fw-bold text-primary">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
