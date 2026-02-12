import React, { useEffect, useState } from "react";
import "./AdminQuizzesPage.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Row, Col, Card, Badge } from "react-bootstrap";
import Message from "../../../components/Message";
import Sidebar from "../../../components/Sidebar";
import Loader from "../../../components/Loader";
import { deleteQuiz, fetchQuizzes } from "../../../actions/quizzesActions";
import * as quizzesConstants from "../../../constants/quizzesConstants";
import swal from "sweetalert";
import { FaEdit, FaTrash, FaQuestionCircle, FaClipboardList, FaPlus } from "react-icons/fa";

const AdminQuizzesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const catId = urlParams.get("catId");
  const token = JSON.parse(localStorage.getItem("jwtToken"));

  const quizzesReducer = useSelector((state) => state.quizzesReducer);
  const quizzes = quizzesReducer.quizzes;

  const addNewQuizHandler = () => {
    navigate("/adminAddQuiz");
  };
  const deleteQuizHandler = (event, quiz) => {
    event.stopPropagation();
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this quiz!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        deleteQuiz(dispatch, quiz.quizId, token).then((data) => {
          if (data.type === quizzesConstants.DELETE_QUIZ_SUCCESS) {
            swal(
              "Quiz Deleted!",
              `${quiz.title} succesfully deleted`,
              "success"
            );
            fetchQuizzes(dispatch, token);
          } else {
            swal("Quiz Not Deleted!", `${quiz.title} not deleted`, "error");
          }
        });
      } else {
        swal(`${quiz.title} is safe`);
      }
    });
  };
  const updateQuizHandler = (event, quizId) => {
    event.stopPropagation();
    navigate(`/adminUpdateQuiz/${quizId}`);
  };

  const questionsHandler = (event, quizTitle, quizId) => {
    event.stopPropagation();
    navigate(`/adminQuestions/?quizId=${quizId}&quizTitle=${quizTitle}`);
  };

  useEffect(() => {
    fetchQuizzes(dispatch, token);
  }, [dispatch]);

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) navigate("/");
  }, []);

  return (
    <div className="adminQuizzesPage__container">
      <div className="adminQuizzesPage__sidebar">
        <Sidebar />
      </div>
      <div className="adminQuizzesPage__content p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold"><FaClipboardList className="me-2" />Quizzes</h2>
          <Button
            className="btn-primary d-flex align-items-center shadow-sm"
            onClick={addNewQuizHandler}
          >
            <FaPlus className="me-1" /> Add Quiz
          </Button>
        </div>

        {quizzes ? (
          quizzes.length === 0 ? (
            <Message>No quizzes are present. Try adding some quizzes.</Message>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {quizzes.map((quiz, index) => {
                if ((catId && quiz.category.catId == catId) || (catId == null))
                  return (
                    <Col key={index}>
                      <Card className="quiz-card h-100 shadow-sm border-0">
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title className="fw-bold text-primary mb-0">{quiz.title}</Card.Title>
                            <Badge bg="info" className="text-white">{quiz.category.title}</Badge>
                          </div>

                          <Card.Text className="text-muted flex-grow-1 text-truncate-3">
                            {quiz.description}
                          </Card.Text>

                          <div className="d-flex justify-content-between align-items-center my-3 bg-light p-2 rounded">
                            <small className="fw-bold text-dark">{quiz.numOfQuestions} Questions</small>
                            <small className="fw-bold text-primary">Max Marks: {quiz.maxMarks}</small>
                          </div>

                          <div className="d-flex gap-2 mt-auto">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="flex-grow-1 d-flex align-items-center justify-content-center"
                              onClick={(e) => questionsHandler(e, quiz.title, quiz.quizId)}
                            >
                              <FaQuestionCircle className="me-1" /> Questions
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="d-flex align-items-center"
                              onClick={(e) => updateQuizHandler(e, quiz.quizId)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="d-flex align-items-center"
                              onClick={(e) => deleteQuizHandler(e, quiz)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
              })}
            </Row>
          )
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};

export default AdminQuizzesPage;
