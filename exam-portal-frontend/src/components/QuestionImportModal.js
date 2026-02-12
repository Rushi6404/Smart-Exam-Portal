import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Card, Badge } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { fetchQuizzes } from '../actions/quizzesActions';
import questionsServices from '../services/questionsServices'; // Import directly from services, not actions yet
import Loader from './Loader';
import swal from 'sweetalert';

const QuestionImportModal = ({ show, handleClose, targetQuizId, onImportSuccess }) => {
    const dispatch = useDispatch();
    const token = JSON.parse(localStorage.getItem('jwtToken'));

    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [sourceQuestions, setSourceQuestions] = useState([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            setLoading(true);
            fetchQuizzes(dispatch, token).then((data) => {
                // Filter out the current quiz to avoid copying from self
                const otherQuizzes = data.payload.filter(q => q.quizId != targetQuizId);
                setQuizzes(otherQuizzes);
                setLoading(false);
            });
            // Reset states
            setSelectedQuizId('');
            setSourceQuestions([]);
            setSelectedQuestionIds([]);
        }
    }, [show, targetQuizId]);

    const handleQuizChange = async (e) => {
        const qId = e.target.value;
        setSelectedQuizId(qId);
        if (qId) {
            setLoading(true);
            const data = await questionsServices.fetchQuestionsByQuiz(qId, token);
            if (data) {
                setSourceQuestions(data);
            }
            setLoading(false);
        } else {
            setSourceQuestions([]);
        }
        setSelectedQuestionIds([]);
    };

    const toggleQuestionSelect = (qId) => {
        if (selectedQuestionIds.includes(qId)) {
            setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== qId));
        } else {
            setSelectedQuestionIds([...selectedQuestionIds, qId]);
        }
    };

    const handleImport = async () => {
        if (selectedQuestionIds.length === 0) return;

        setLoading(true);
        const result = await questionsServices.copyQuestions(selectedQuestionIds, targetQuizId, token);
        setLoading(false);

        if (result.isCopied) {
            swal("Success", "Questions imported successfully", "success");
            handleClose();
            if (onImportSuccess) onImportSuccess();
        } else {
            swal("Error", "Failed to import questions", "error");
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Import Questions from Quiz Bank</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading && <Loader />}

                <Form.Group className="mb-3">
                    <Form.Label>Select Source Quiz</Form.Label>
                    <Form.Select value={selectedQuizId} onChange={handleQuizChange}>
                        <option value="">-- Select a Quiz --</option>
                        {quizzes.map(q => (
                            <option key={q.quizId} value={q.quizId}>{q.title}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {sourceQuestions.length > 0 && (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <p>Select questions to import: ({selectedQuestionIds.length} selected)</p>
                        {sourceQuestions.map((q, idx) => (
                            <Card key={q.quesId} className="mb-2"
                                onClick={() => toggleQuestionSelect(q.quesId)}
                                style={{
                                    cursor: 'pointer',
                                    backgroundColor: selectedQuestionIds.includes(q.quesId) ? '#e6f7ff' : 'white',
                                    border: selectedQuestionIds.includes(q.quesId) ? '1px solid #1890ff' : '1px solid #eee'
                                }}>
                                <Card.Body className="p-3 d-flex gap-3">
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectedQuestionIds.includes(q.quesId)}
                                        onChange={() => { }} // Handled by Card onClick
                                        style={{ pointerEvents: 'none' }}
                                    />
                                    <div>
                                        <h6 dangerouslySetInnerHTML={{ __html: q.content }}></h6>
                                        <Badge bg="secondary">{q.answer}</Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}

                {selectedQuizId && sourceQuestions.length === 0 && !loading && (
                    <p className="text-muted">No questions found in this quiz.</p>
                )}

            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleImport} disabled={selectedQuestionIds.length === 0 || loading}>
                    Import {selectedQuestionIds.length} Questions
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default QuestionImportModal;
