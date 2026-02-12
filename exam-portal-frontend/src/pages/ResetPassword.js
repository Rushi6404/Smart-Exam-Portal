import React, { useState } from "react";
import { Form, Button, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaLock, FaKey, FaArrowLeft } from "react-icons/fa";
import { resetPassword } from "../services/authServices";

const ResetPassword = () => {
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const validateForm = () => {
        if (!token.trim()) return false;
        if (!newPassword || newPassword.length < 6) return false;
        if (newPassword !== confirmPassword) return false;
        return true;
    };

    const submitHandler = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        setError(null);
        setMessage(null);

        if (!validateForm()) {
            if (newPassword !== confirmPassword) setError("Passwords do not match");
            return;
        }

        setLoading(true);
        resetPassword(token, newPassword).then((data) => {
            setLoading(false);
            if (data.includes("successfully")) {
                setMessage("Password reset successfully! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setError("Failed to reset password.");
            }
        }).catch((err) => {
            setLoading(false);
            console.error(err);
            if (err.response && err.response.data) {
                setError(err.response.data); // Expecting "Invalid key/token"
            } else {
                setError("Failed to reset password.");
            }
        });
    };

    return (
        <div className="full-screen-center">
            <div className="glass-card">
                <div className="text-center mb-4">
                    <h2 className="fw-bold">Reset Password</h2>
                    <p className="text-muted">Enter the token sent to your email and your new password.</p>
                </div>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <Form onSubmit={submitHandler} noValidate>
                    <Form.Group className="mb-3" controlId="token">
                        <Form.Label>Reset Token</Form.Label>
                        <InputGroup className="has-validation">
                            <InputGroup.Text><FaKey /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Enter 6-digit token"
                                value={token}
                                isInvalid={isSubmitted && !token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">Token is required</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="newPassword">
                        <Form.Label>New Password</Form.Label>
                        <InputGroup className="has-validation">
                            <InputGroup.Text><FaLock /></InputGroup.Text>
                            <Form.Control
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                isInvalid={isSubmitted && (newPassword.length < 6)}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">Min 6 chars required</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="confirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <InputGroup className="has-validation">
                            <InputGroup.Text><FaLock /></InputGroup.Text>
                            <Form.Control
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                isInvalid={isSubmitted && (newPassword !== confirmPassword)}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">Passwords must match</Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Button type="submit" className="w-100 btn-primary mb-3" disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : "Reset Password"}
                    </Button>
                </Form>

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

export default ResetPassword;
