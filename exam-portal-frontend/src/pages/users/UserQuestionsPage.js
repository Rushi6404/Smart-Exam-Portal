import React, { useEffect, useState } from "react";
import "./UserQuestionsPage.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col, Card, Badge } from "react-bootstrap";
import { fetchQuestionsByQuiz } from "../../actions/questionsActions";
import Question from "../../components/Question";
import Loader from "../../components/Loader";
import swal from "sweetalert";
import * as quizResultConstants from "../../constants/quizResultConstants";
import { submitQuiz } from "../../actions/quizResultActions";
import { fetchQuizzes } from "../../actions/quizzesActions";
import ReactSpinnerTimer from "react-spinner-timer";

import ProctoringMonitor from "../../components/ProctoringMonitor";
import examProgressService from "../../services/examProgressService";

const UserQuestionsPage = () => {
  Number.prototype.zeroPad = function () {
    return ("0" + this).slice(-2);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const urlParams = new URLSearchParams(window.location.search);
  const quizId = urlParams.get("quizId");
  const quizTitle = urlParams.get("quizTitle");
  const quizzesReducer = useSelector((state) => state.quizzesReducer);
  const [quizzes, setQuizzes] = useState(quizzesReducer.quizzes);
  const [quiz, setQuiz] = useState(
    quizzes.filter((q) => q.quizId == quizId)[0]
  );
  const questionsReducer = useSelector((state) => state.questionsReducer);
  const [questions, setQuestions] = useState(questionsReducer.questions);
  const token = JSON.parse(localStorage.getItem("jwtToken"));
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user ? user.userId : null;
  const [timeRemaining, setTimeRemaining] = useState(-1);
  const [answersMap, setAnswersMap] = useState({});
  const [reviewList, setReviewList] = useState([]);

  let intervalId = null;


  // Strict Security & Auto-Fullscreen
  useEffect(() => {
    const preventDefaultAction = (e) => {
      e.preventDefault();
      // Optional: swal("Security", "Action disabled!", "warning");
      return false;
    };

    // Attach global listeners
    window.addEventListener("contextmenu", preventDefaultAction);
    window.addEventListener("copy", preventDefaultAction);
    window.addEventListener("paste", preventDefaultAction);
    window.addEventListener("cut", preventDefaultAction);

    // Enter Fullscreen
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
        else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();
      } catch (err) {
        console.warn("Fullscreen blocked:", err);
        // Fallback: Notify user to enable fullscreen if needed
      }
    };

    enterFullscreen();

    return () => {
      window.removeEventListener("contextmenu", preventDefaultAction);
      window.removeEventListener("copy", preventDefaultAction);
      window.removeEventListener("paste", preventDefaultAction);
      window.removeEventListener("cut", preventDefaultAction);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.error(e));
      }
    };
  }, []);

  useEffect(() => {
    // Load initial answers
    const saved = JSON.parse(localStorage.getItem("answers"));
    if (saved) setAnswersMap(saved);
  }, []);

  const handleAnswerCallback = (quesId) => {
    const saved = JSON.parse(localStorage.getItem("answers"));
    if (saved) setAnswersMap(saved);
  };

  const handleReviewCallback = (quesId) => {
    if (reviewList.includes(quesId)) {
      setReviewList(reviewList.filter(id => id !== quesId));
    } else {
      setReviewList([...reviewList, quesId]);
    }
  };

  useEffect(() => {
    if (timeRemaining > 0) {
      intervalId = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          // Save progress every 5 seconds
          if (newTime % 5 === 0) {
            const answers = JSON.parse(localStorage.getItem("answers")) || {};
            const progress = {
              userId: userId,
              quizId: quizId,
              remainingSeconds: newTime,
              selectedOptions: answers,
            };
            examProgressService.saveProgress(progress, token);
          }
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      submitQuizHandler(true);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timeRemaining === 0, timeRemaining > 0]);

  const submitQuizHandler = (isTimesUp = false) => {
    let answers = JSON.parse(localStorage.getItem("answers"));
    if (!answers) answers = {};

    const calculateFeedback = (obtained, total) => {
      const percentage = total > 0 ? ((obtained / total) * 100) : 0;
      if (percentage >= 75) return "Awesome! 🏆";
      if (percentage >= 60) return "Good Job! 👍";
      if (percentage >= 50) return "Average 😐";
      if (percentage >= 35) return "Below Average 📉";
      return "Poor (Fail) ❌";
    };

    const processSubmission = (data) => {
      examProgressService.deleteProgress(userId, quizId, token); // Clear saved progress
      const totalMarks = questions.length * 5;
      const obtained = data.payload.totalObtainedMarks;
      const feedback = calculateFeedback(obtained, totalMarks);

      swal(
        "Quiz Submitted!",
        `You scored ${obtained} / ${totalMarks} marks.\nFeedback: ${feedback}`,
        "success"
      );
      return navigate("/quizResults");
    };

    if (isTimesUp) {
      submitQuiz(dispatch, userId, quizId, answers, token).then((data) => {
        if (data.type === quizResultConstants.ADD_QUIZ_RESULT_SUCCESS) {
          processSubmission(data);
        } else {
          swal(
            "Quiz not Submitted!",
            `${quizTitle} is still active. Please check your connection and try again.`,
            "info"
          );
          return navigate("/quizResults");
        }
      });
    } else {
      swal({
        title: "Are you sure?",
        text: "Once submitted, you will not be able to modify your answers!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willSubmit) => {
        if (willSubmit) {
          submitQuiz(dispatch, userId, quizId, answers, token).then((data) => {
            if (data.type === quizResultConstants.ADD_QUIZ_RESULT_SUCCESS) {
              processSubmission(data);
            } else {
              swal(
                "Quiz not Submitted!",
                `Error: ${data.payload || "Could not submit quiz"}`,
                "error"
              );
              return navigate("/quizResults");
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) navigate("/");
  }, []);

  useEffect(() => {
    fetchQuizzes(dispatch, token).then((data) => {
      const temp = data.payload;
      if (Array.isArray(temp)) {
        setQuizzes(temp);
        const currentQuiz = temp.filter((q) => q.quizId == quizId)[0];
        if (currentQuiz) {
          setQuiz(currentQuiz);
        }
      }
    });

    fetchQuestionsByQuiz(dispatch, quizId, token).then(async (data) => {
      if (data.payload && Array.isArray(data.payload)) {
        setQuestions(data.payload);

        // Check for existing progress
        const progress = await examProgressService.getProgress(
          userId,
          quizId,
          token
        );
        if (progress && progress.remainingSeconds > 0) {
          console.log("Resuming exam...", progress);
          setTimeRemaining(progress.remainingSeconds);
          if (progress.selectedOptions) {
            localStorage.setItem(
              "answers",
              JSON.stringify(progress.selectedOptions)
            );
            setAnswersMap(progress.selectedOptions);
          }
        } else {
          // No progress, start fresh
          console.log("Starting new exam...");
          localStorage.removeItem("answers");
          setTimeRemaining(data.payload.length * 2 * 60);
        }
      }
    });
  }, [quizId]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set([0])); // Start with 0 visited

  // Update visited questions when index changes
  useEffect(() => {
    setVisitedQuestions(prev => new Set(prev).add(currentQuestionIndex));
  }, [currentQuestionIndex]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const [tabSwitches, setTabSwitches] = useState(0);

  const handleTabViolation = () => {
    if (tabSwitches >= 1) {
      swal("Security Violation", "Maximum tab switches exceeded. Exam will be submitted immediately.", "error")
        .then(() => {
          submitQuizHandler(true);
        });
    } else {
      swal("Security Warning", "Tab switching is forbidden! \n\n⚠️ WARNING: One more attempt will result in immediate disqualification.", "warning");
      setTabSwitches(prev => prev + 1);
    }
  };

  // Calculate Stats
  const totalQuestions = questions ? questions.length : 0;
  const answeredCount = Object.keys(answersMap).length;
  const reviewCount = reviewList.length;
  // const visitedCount = visitedQuestions.size;
  // Not Visited = Total - Visited (Simplified logic for palette rendering)

  // Helper for Reference Image Layout Match
  const handleSaveAndNext = () => {
    handleNext();
  };

  const handleMarkAndNext = () => {
    if (!reviewList.includes(questions[currentQuestionIndex].quesId)) {
      handleReviewCallback(questions[currentQuestionIndex].quesId);
    }
    handleNext();
  };

  const handleClearResponse = () => {
    const currentQuesId = questions[currentQuestionIndex].quesId;
    // Update UI state
    const newAnswers = { ...answersMap };
    delete newAnswers[currentQuesId];
    setAnswersMap(newAnswers);
    // Update LocalStorage
    localStorage.setItem("answers", JSON.stringify(newAnswers));
    // Remove from server if needed? For now just local.
  };

  return (
    <div
      className="userQuestionsPage__container container-fluid d-flex flex-column"
      style={{ height: "100vh", backgroundColor: "#f5f5f5", padding: 0 }}
      onContextMenu={(e) => { e.preventDefault(); }}
    >
      {/* 1. TOP HEADER: Title & Timer */}
      <div className="bg-white border-bottom d-flex justify-content-between align-items-center px-4 py-2 shadow-sm" style={{ height: "60px", zIndex: 10 }}>
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary text-white px-3 py-1 rounded fw-bold shadow-sm">
            {quizTitle} <Badge bg="light" text="dark" className="ms-2 rounded-circle">i</Badge>
          </div>
        </div>

        {/* Timer Display */}
        <div className="d-flex align-items-center px-3 fw-bold text-dark fs-5">
          Time Left:
          <span className="ms-2 bg-dark text-white px-3 py-1 rounded shadow-sm font-monospace">
            {`${parseInt(timeRemaining / 60).zeroPad()}:${(timeRemaining % 60).zeroPad()}`}
          </span>
        </div>
      </div>

      {/* 2. MAIN CONTENT (Grid) */}
      <Row className="flex-grow-1 g-0 overflow-hidden">

        {/* LEFT COLUMN: QUESTION AREA */}
        <Col md={9} className="d-flex flex-column h-100 bg-white border-end">

          {/* Scrollable Question Body */}
          <div className="flex-grow-1 overflow-auto p-4">
            <h5 className="fw-bold mb-3 border-bottom pb-2 text-primary">Question No. {currentQuestionIndex + 1}</h5>
            <div className="question-wrapper" style={{ fontSize: "0.95rem" }}>
              {questions && questions.length > 0 ? (
                <Question
                  key={questions[currentQuestionIndex].quesId}
                  number={currentQuestionIndex + 1}
                  question={questions[currentQuestionIndex]}
                  onAnswer={handleAnswerCallback}
                  onReview={handleReviewCallback}
                  isReview={reviewList.includes(questions[currentQuestionIndex].quesId)}
                />
              ) : <Loader />}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="border-top p-3 bg-light d-flex justify-content-between align-items-center shadow-sm">
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={handleMarkAndNext}>Mark for Review & Next</Button>
              <Button variant="outline-danger" onClick={handleClearResponse}>Clear Response</Button>
            </div>
            <Button variant="success" className="px-5 fw-bold" onClick={handleSaveAndNext}>Save & Next</Button>
          </div>
        </Col>

        {/* RIGHT COLUMN: SIDEBAR */}
        <Col md={3} className="d-flex flex-column h-100 bg-light p-3 gap-3" style={{ borderLeft: "1px solid #dee2e6" }}>

          {/* 1. Large Camera Card */}
          <div className="bg-white shadow-sm rounded-3 overflow-hidden flex-shrink-0 border">
            <div className="bg-black d-flex justify-content-center align-items-center position-relative" style={{ height: "200px" }}>
              <div className="text-white position-absolute top-0 start-0 m-2 px-2 py-0 bg-danger rounded small" style={{ zIndex: 5, fontSize: "0.7rem", opacity: 0.9 }}>REC</div>
              <div style={{ width: "100%", height: "100%" }}>
                <ProctoringMonitor quizId={quizId} userId={userId} token={token} onTabSwitch={handleTabViolation} />
              </div>
            </div>
          </div>

          {/* 2. User Info Card */}
          <div className="bg-white shadow-sm rounded-3 p-3 d-flex align-items-center gap-3 flex-shrink-0 border">
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 45, height: 45, fontSize: "1.2rem" }}>
              {user?.firstName ? user.firstName.charAt(0) : "U"}
            </div>
            <div className="d-flex flex-column overflow-hidden">
              <span className="fw-bold text-dark text-truncate">{user?.firstName || "Candidate"} {user?.lastName || ""}</span>
              <small className="text-muted text-uppercase" style={{ fontSize: "0.75rem" }}>ID: {userId}</small>
            </div>
          </div>

          {/* 3. Palette Card */}
          <div className="bg-white shadow-sm rounded-3 flex-grow-1 d-flex flex-column overflow-hidden border">
            {/* Legend Header */}
            <div className="p-2 border-bottom bg-light small">
              <div className="d-flex flex-wrap gap-2 justify-content-center text-center">
                <div className="d-flex align-items-center gap-1"><span className="badge rounded-circle bg-success" style={{ width: 10, height: 10, padding: 0 }}> </span> Ans</div>
                <div className="d-flex align-items-center gap-1"><span className="badge rounded-circle bg-danger" style={{ width: 10, height: 10, padding: 0 }}> </span> Skip</div>
                <div className="d-flex align-items-center gap-1"><span className="badge rounded-circle bg-secondary" style={{ width: 10, height: 10, padding: 0 }}> </span> N/V</div>
                <div className="d-flex align-items-center gap-1"><span className="badge rounded-circle bg-purple" style={{ backgroundColor: '#6f42c1', width: 10, height: 10, padding: 0 }}> </span> Rev</div>
              </div>
            </div>

            <div className="bg-white p-2 text-center text-muted fw-bold small border-bottom">
              Question Palette
            </div>

            {/* Grid */}
            <div className="flex-grow-1 overflow-auto p-3 custom-scrollbar">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                {questions && questions.map((q, index) => {
                  const isAnswered = answersMap[q.quesId];
                  const isReview = reviewList.includes(q.quesId);
                  const isVisited = visitedQuestions.has(index);

                  let bgColor = "#fff";
                  let textColor = "#495057";
                  let border = "1px solid #dee2e6";

                  if (isAnswered) {
                    bgColor = "#198754";
                    textColor = "#fff";
                    border = "none";
                    if (isReview) bgColor = "#6f42c1";
                  } else if (isReview) {
                    bgColor = "#6f42c1";
                    textColor = "#fff";
                    border = "none";
                  } else if (isVisited) {
                    bgColor = "#dc3545";
                    textColor = "#fff";
                    border = "none";
                  }

                  return (
                    <div
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className="d-flex align-items-center justify-content-center shadow-sm rounded-circle"
                      style={{
                        width: "35px",
                        height: "35px",
                        backgroundColor: bgColor,
                        color: textColor,
                        border: currentQuestionIndex === index ? "2px solid #0d6efd" : border,
                        cursor: "pointer",
                        fontWeight: "600",
                        margin: "0 auto",
                        fontSize: "0.85rem",
                        position: "relative",
                        transition: "all 0.1s"
                      }}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Submit Button */}
          <Button variant="primary" className="w-100 py-2 fw-bold shadow-sm rounded-3 flex-shrink-0" onClick={() => submitQuizHandler()}>
            Submit Test
          </Button>

        </Col>
      </Row>
    </div>
  );
};

export default UserQuestionsPage;
