import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Form, Card, ProgressBar, Alert } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import FormContainer from "../../../components/FormContainer";
import questionsServices from "../../../services/questionsServices";
import swal from "sweetalert";
import { FaFileUpload, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const AdminAutoGenerateQuestions = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const quizId = queryParams.get("quizId");
    const quizTitle = queryParams.get("quizTitle");
    const token = JSON.parse(localStorage.getItem("jwtToken"));

    const [mode, setMode] = useState("topic"); // 'file' or 'topic'

    // File State
    const [file, setFile] = useState(null);

    // Topic State
    const [topic, setTopic] = useState("");
    const [count, setCount] = useState(5);
    const [difficulty, setDifficulty] = useState("Easy");

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);

    useEffect(() => {
        if (!localStorage.getItem("jwtToken")) navigate("/");
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setProgress(30);

        let result;

        if (mode === "file") {
            if (!file) {
                setError("Please select a file first.");
                setLoading(false);
                return;
            }
            result = await questionsServices.autoGenerateQuestions(file, quizId, token);
        } else {
            // Topic mode
            if (!topic || count <= 0) {
                setError("Please enter a valid topic and question count.");
                setLoading(false);
                return;
            }
            result = await questionsServices.generateQuestions(topic, count, difficulty, quizId, token);
        }

        setProgress(100);
        setLoading(false);

        if (result.isGenerated) {
            setGeneratedQuestions(result.data);
            swal("Success!", `${result.data.length} questions generated successfully.`, "success");
        } else {
            setError(result.error);
            swal("Error", result.error, "error");
        }
    };

    return (
        <div className="adminAutoGeneratePage__container" style={{ display: 'flex' }}>
            <div className="adminAutoGeneratePage__sidebar" style={{ width: '250px' }}>
                <Sidebar />
            </div>
            <div className="adminAutoGeneratePage__content p-4" style={{ flex: 1 }}>
                <Button
                    variant="link"
                    className="text-decoration-none text-dark p-0 mb-3"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft className="me-1" /> Back to Questions
                </Button>

                <FormContainer>
                    <Card className="shadow-sm border-0">
                        <Card.Body>
                            <h2 className="fw-bold mb-4">Auto-Generate Questions</h2>

                            <div className="d-flex mb-4">
                                <Button
                                    variant={mode === "topic" ? "primary" : "outline-primary"}
                                    className="me-2"
                                    onClick={() => setMode("topic")}
                                >
                                    Arguments Mode (AI)
                                </Button>
                                <Button
                                    variant={mode === "file" ? "primary" : "outline-primary"}
                                    onClick={() => setMode("file")}
                                >
                                    File Upload Mode
                                </Button>
                            </div>

                            <Alert variant="info">
                                {mode === "topic"
                                    ? <span>Generate questions based on a <strong>Topic</strong>, <strong>Count</strong>, and <strong>Difficulty</strong>. Easy difficulty will ensure 80% Easy and 20% Medium questions.</span>
                                    : <span>Upload a document to extract questions automatically using Azure AI.</span>
                                }
                            </Alert>

                            <Form onSubmit={handleGenerate}>
                                {mode === "file" ? (
                                    <Form.Group controlId="formFile" className="mb-4">
                                        <Form.Label>Select Document</Form.Label>
                                        <Form.Control
                                            type="file"
                                            onChange={handleFileChange}
                                            accept=".pdf,.png,.jpg,.jpeg"
                                        />
                                        <Form.Text className="text-muted">
                                            Supported formats: PDF, PNG, JPG, JPEG.
                                        </Form.Text>
                                    </Form.Group>
                                ) : (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Topic</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g. Java Collections, WWII, Chemistry"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Number of Questions</Form.Label>
                                            <Form.Control
                                                type="number"
                                                min="1"
                                                max="50"
                                                value={count}
                                                onChange={(e) => setCount(e.target.value)}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Difficulty</Form.Label>
                                            <Form.Select
                                                value={difficulty}
                                                onChange={(e) => setDifficulty(e.target.value)}
                                            >
                                                <option value="Easy">Easy (80% Easy, 20% Medium)</option>
                                                <option value="Medium">Medium (Balanced)</option>
                                                <option value="Hard">Hard (Mostly Hard)</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </>
                                )}

                                {loading && (
                                    <div className="mb-4">
                                        <p className="small mb-1 text-muted text-center">Processing...</p>
                                        <ProgressBar animated now={progress} label={`${progress}%`} />
                                    </div>
                                )}

                                {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-100 d-flex align-items-center justify-content-center py-2"
                                    disabled={loading || (mode === 'file' && !file)}
                                >
                                    <FaFileUpload className="me-2" />
                                    {loading ? "Generating..." : "Generate Questions"}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    {generatedQuestions.length > 0 && (
                        <Card className="mt-4 shadow-sm border-0 bg-light">
                            <Card.Body>
                                <h5 className="fw-bold mb-3 d-flex align-items-center text-success">
                                    <FaCheckCircle className="me-2" /> Generated Questions
                                </h5>
                                <ul className="list-group list-group-flush bg-transparent">
                                    {generatedQuestions.map((q, idx) => (
                                        <li key={idx} className="list-group-item bg-transparent border-0 px-0">
                                            <strong>Q{idx + 1}:</strong> {q.content}
                                        </li>
                                    ))}
                                </ul>
                            </Card.Body>
                        </Card>
                    )}
                </FormContainer>
            </div>
        </div>
    );
};

export default AdminAutoGenerateQuestions;
