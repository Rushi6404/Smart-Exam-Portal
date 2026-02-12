import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SidebarUser from "../../components/SidebarUser";
import "./UserQuizzesPage.css";
import { fetchQuizzes } from "../../actions/quizzesActions";
import { Card, Col, Row, Badge, Button } from "react-bootstrap";
import { FaClock, FaQuestionCircle, FaTrophy, FaPlay } from "react-icons/fa";
import quizResultServices from "../../services/quizResultServices";

const UserQuizzesPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const catId = urlParams.get("catId");
  const token = JSON.parse(localStorage.getItem("jwtToken"));
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.userId : null;

  const quizzesReducer = useSelector((state) => state.quizzesReducer);
  const [quizzes, setQuizzes] = useState(quizzesReducer.quizzes);
  const [attemptedQuizIds, setAttemptedQuizIds] = useState([]);

  useEffect(() => {
    if (quizzes.length === 0) {
      fetchQuizzes(dispatch, token).then((data) => {
        if (data.payload && Array.isArray(data.payload)) {
          setQuizzes(data.payload);
        } else {
          setQuizzes([]);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (userId) {
      quizResultServices.fetchQuizResult(userId, token).then((results) => {
        if (results && Array.isArray(results)) {
          const ids = results.map(r => r.quiz.quizId);
          setAttemptedQuizIds(ids);
        }
      });
    }
  }, [userId]);

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) navigate("/");
  }, []);

  return (
    <div className="userQuizzesPage__container">
      <div className="userQuizzesPage__sidebar">
        <SidebarUser />
      </div>

      <div className="userQuizzesPage__content">
        {quizzes ? (
          <Row>
            {quizzes.map((q, index) => {
              const isAttempted = attemptedQuizIds.includes(q.quizId);
              if ((catId && catId == q.category.catId) || catId == null)
                return (
                  <Col key={index} xl={4} lg={4} md={6} sm={12} className="mb-4">
                    <Card className="h-100 shadow-sm border-0 hover-lift">
                      <Card.Body className="d-flex flex-column p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title fw-bold text-primary mb-0 text-truncate" style={{ maxWidth: "70%" }} title={q.title}>
                            {q.title}
                          </h5>
                          <Badge bg="light" text="dark" className="border">
                            {q.category.title}
                          </Badge>
                        </div>

                        <Card.Text className="text-muted small flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {q.description}
                        </Card.Text>

                        <div className="d-flex justify-content-between text-secondary mb-4 small bg-light p-3 rounded">
                          <div className="d-flex align-items-center" title="Questions">
                            <FaQuestionCircle className="me-2 text-primary" />
                            <span className="fw-bold">{q.numOfQuestions}</span>
                          </div>
                          <div className="d-flex align-items-center" title="Time">
                            <FaClock className="me-2 text-warning" />
                            <span className="fw-bold">{q.numOfQuestions * 2}m</span>
                          </div>
                          <div className="d-flex align-items-center" title="Marks">
                            <FaTrophy className="me-2 text-success" />
                            <span className="fw-bold">{q.maxMarks}</span>
                          </div>
                        </div>

                        <Button
                          variant={isAttempted ? "secondary" : "primary"}
                          className="w-100 fw-bold mt-auto py-2"
                          disabled={isAttempted}
                          style={{
                            opacity: isAttempted ? 0.7 : 1,
                            cursor: isAttempted ? "not-allowed" : "pointer"
                          }}
                          onClick={() => !isAttempted && navigate(`/quizManual?quizId=${q.quizId}`)}
                        >
                          {isAttempted ? "Attempted" : <><FaPlay className="me-2" />Start Quiz</>}
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                );
            })}
          </Row>
        ) : (
          <p>No Quizzes Available</p>
        )}
      </div>
    </div>
  );
};

export default UserQuizzesPage;
