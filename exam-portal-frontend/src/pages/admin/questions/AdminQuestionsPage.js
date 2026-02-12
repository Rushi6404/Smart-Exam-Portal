import React, { useEffect, useState } from "react";
import "./AdminQuestionsPage.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Card, Row, Col, Badge } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import Message from "../../../components/Message";
import Loader from "../../../components/Loader";
import {
  deleteQuestion,
  fetchQuestionsByQuiz,
} from "../../../actions/questionsActions";
import * as questionsConstants from "../../../constants/questionsConstants";
import swal from "sweetalert";
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaFileUpload, FaDownload } from "react-icons/fa";
import QuestionImportModal from "../../../components/QuestionImportModal";


const AdminQuestionsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = JSON.parse(localStorage.getItem("jwtToken"));
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get("quizId");
  const quizTitle = urlParams.get("quizTitle");

  const questionsReducer = useSelector((state) => state.questionsReducer);
  const [questions, setQuestions] = useState(questionsReducer.questions);
  const [showImportModal, setShowImportModal] = useState(false);

  const fetchQuestions = () => {
    fetchQuestionsByQuiz(dispatch, quizId, token).then((data) => {
      if (data.payload && Array.isArray(data.payload)) {
        setQuestions(data.payload);
      } else {
        setQuestions([]);
      }
    });
  };


  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) navigate("/");
  }, []);

  useEffect(() => {
    if (questions.length === 0) {
      fetchQuestions();
    }
  }, []);

  const addNewQuestionHandler = () => {
    navigate(`/adminAddQuestion/?quizId=${quizId}&quizTitle=${quizTitle}`);
  };

  const deleteQuestionHandler = (event, question) => {
    event.stopPropagation();
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this question!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        deleteQuestion(dispatch, question.quesId, token).then((data) => {
          if (data.type === questionsConstants.DELETE_QUESTION_SUCCESS) {
            swal("Question Deleted!", "Question successfully deleted", "success");
          } else {
            swal("Question Not Deleted!", "Question not deleted", "error");
          }
        });
      } else {
        swal("Question is safe");
      }
    });
  };

  const updateQuestionHandler = (event, quesId) => {
    event.stopPropagation();
    navigate(`/adminUpdateQuestion/${quesId}/?quizId=${quizId}&quizTitle=${quizTitle}`);
  };

  return (
    <div className="adminQuestionsPage__container">
      <div className="adminQuestionsPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminQuestionsPage__content p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button variant="link" className="text-decoration-none text-dark p-0 mb-1" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-1" /> Back to Quizzes
            </Button>
            <h2 className="fw-bold mb-0">Questions: <span className="text-primary">{quizTitle}</span></h2>
          </div>

        </div>

        <div className="d-flex gap-2">
          <Button
            className="btn-success text-white d-flex align-items-center shadow-sm"
            onClick={() => setShowImportModal(true)}
          >
            <FaDownload className="me-1" /> Import Questions
          </Button>
          <Button
            className="btn-info text-white d-flex align-items-center shadow-sm"
            onClick={() => navigate(`/adminAutoGenerateQuestions/?quizId=${quizId}&quizTitle=${quizTitle}`)}
          >
            <FaFileUpload className="me-1" /> Auto-Generate
          </Button>
          <Button
            className="btn-primary d-flex align-items-center shadow-sm"
            onClick={addNewQuestionHandler}
          >
            <FaPlus className="me-1" /> Add Question
          </Button>
        </div>


        {questions ? (
          questions.length === 0 ? (
            <Message>No questions are present. Try adding some questions.</Message>
          ) : (
            <Row xs={1} className="g-3">
              {questions.map((q, index) => (
                <Col key={index}>
                  <Card className="question-card shadow-sm border-0">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="fw-bold text-dark w-75" dangerouslySetInnerHTML={{ __html: `${index + 1}. ${q.content}` }}></h5>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={(e) => updateQuestionHandler(e, q.quesId)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => deleteQuestionHandler(e, q)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>

                      <Row className="mt-3 g-2">
                        <Col md={6}>
                          <div className={`p-2 rounded border ${q.answer === q.option1 ? "bg-success text-white border-success" : "bg-light text-muted"}`}>
                            <strong>A:</strong> {q.option1}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className={`p-2 rounded border ${q.answer === q.option2 ? "bg-success text-white border-success" : "bg-light text-muted"}`}>
                            <strong>B:</strong> {q.option2}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className={`p-2 rounded border ${q.answer === q.option3 ? "bg-success text-white border-success" : "bg-light text-muted"}`}>
                            <strong>C:</strong> {q.option3}
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className={`p-2 rounded border ${q.answer === q.option4 ? "bg-success text-white border-success" : "bg-light text-muted"}`}>
                            <strong>D:</strong> {q.option4}
                          </div>
                        </Col>
                      </Row>

                      <div className="mt-3">
                        <Badge bg="success">Correct Answer: {q.answer}</Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )
        ) : (
          <Loader />
        )}
      </div>

      <QuestionImportModal
        show={showImportModal}
        handleClose={() => setShowImportModal(false)}
        targetQuizId={quizId}
        onImportSuccess={() => {
          fetchQuestions(); // Refresh list
        }}
      />
    </div >
  );
};

export default AdminQuestionsPage;
