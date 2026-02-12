import React, { useState } from "react";
import { Form, Button, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaArrowLeft, FaUser, FaCheckCircle } from "react-icons/fa";
import { forgotPassword, validateUser } from "../services/authServices";

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // Step 1: Username, Step 2: Email & Send
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Reset error when user types
    const handleInputChange = (setter) => (e) => {
        setter(e.target.value);
        setError(null);
    };

    const validateUsernameForm = () => {
        return username.trim() !== "";
    };

    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        setError(null);

        if (!validateUsernameForm()) return;

        setLoading(true);
        validateUser(username).then((data) => {
            setLoading(false);
            if (data && data.email) {
                setEmail(data.email);
                setStep(2);
                setIsSubmitted(false); // Reset for next step
            } else {
                setError("User not found.");
            }
        }).catch((err) => {
            setLoading(false);
            console.error(err);
            if (err.response && err.response.data) {
                setError(err.response.data);
            } else {
                setError("Failed to validate user.");
            }
        });
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        forgotPassword(email).then((data) => {
            setLoading(false);
            if (data.includes("sent to email")) {
                setMessage("Reset token sent! Check your email.");
                setTimeout(() => navigate("/reset-password"), 2000);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }).catch((err) => {
            setLoading(false);
            setError("Failed to send reset email.");
        });
    };

    return (
        <div className="full-screen-center">
            <div className="glass-card">
                <div className="text-center mb-4">
                    <h2 className="fw-bold">Forgot Password?</h2>
                    <p className="text-muted">
                        {step === 1 ? "Enter your username to find your account." : "Confirm your email to receive a reset token."}
                    </p>
                </div>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                {step === 1 && (
                    <Form onSubmit={handleUsernameSubmit} noValidate>
                        <Form.Group className="mb-4" controlId="username">
                            <Form.Label>Username</Form.Label>
                            <InputGroup className="has-validation">
                                <InputGroup.Text><FaUser /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    isInvalid={isSubmitted && !username}
                                    onChange={handleInputChange(setUsername)}
                                    autoFocus
                                />
                                <Form.Control.Feedback type="invalid">
                                    Username is required
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Form.Group>
                        <Button type="submit" className="w-100 btn-primary mb-3" disabled={loading}>
                            {loading ? <Spinner as="span" animation="border" size="sm" /> : "Next"}
                        </Button>
                    </Form>
                )}

                {step === 2 && (
                    <Form onSubmit={handleEmailSubmit}>
                        <div className="mb-4 p-3 bg-light rounded text-center border">
                            <p className="mb-1 text-muted small">Registered Email</p>
                            <h5 className="fw-bold text-dark mb-0">{email}</h5>
                            <div className="text-success small mt-1"><FaCheckCircle /> Account Found</div>
                        </div>

                        <Button type="submit" className="w-100 btn-primary mb-3" disabled={loading}>
                            {loading ? <Spinner as="span" animation="border" size="sm" /> : "Send Reset Token"}
                        </Button>
                        <Button variant="outline-secondary" className="w-100 mb-3" onClick={() => setStep(1)} disabled={loading}>
                            Back
                        </Button>
                    </Form>
                )}

                <Row>
                    <Col className="text-center">
                        <Link to="/login" className="text-decoration-none text-muted">
                            <FaArrowLeft className="me-1" /> Back to Login
                        </Link>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ForgotPassword;
