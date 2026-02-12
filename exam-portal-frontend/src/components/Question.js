import React from "react";
import { InputGroup } from "react-bootstrap";
import "./Question.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteQuestion } from "../actions/questionsActions";
import swal from "sweetalert";
import * as questionsConstants from "../constants/questionsConstants";

const Question = ({ number, answers, question, isAdmin = false, onAnswer, onReview, isReview }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const answer = question.answer;
  const token = JSON.parse(localStorage.getItem("jwtToken"));

  // Read saved answer for resume functionality
  const storedAnswers = JSON.parse(localStorage.getItem("answers"));
  const savedAnswer = storedAnswers ? storedAnswers[question.quesId] : null;

  const saveAnswer = (quesId, ans) => {
    const newAns = {};
    newAns[quesId] = ans;
    let answers = JSON.parse(localStorage.getItem("answers"));
    if (answers) {
      answers[quesId] = ans;
      localStorage.setItem("answers", JSON.stringify(answers));
    } else {
      localStorage.setItem("answers", JSON.stringify(newAns));
    }
  };
  const updateQuestionHandler = (ques) => {
    navigate(`/adminUpdateQuestion/${ques.quesId}/?quizId=${ques.quiz.quizId}`);
  };

  const deleteQuestionHandler = (ques) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this question!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        deleteQuestion(dispatch, ques.quesId, token).then((data) => {
          if (data.type === questionsConstants.DELETE_QUESTION_SUCCESS) {
            swal(
              "Question Deleted!",
              `Question with id ${ques.quesId}, succesfully deleted`,
              "success"
            );
          } else {
            swal(
              "Question Not Deleted!",
              `Question with id ${ques.quesId} not deleted`,
              "error"
            );
          }
        });
      } else {
        swal(`Question with id ${ques.quesId} is safe`);
      }
    });
  };

  return (
    <div className="question__container">
      <div className="question__content mb-3">
        <h5 className="lh-base" style={{ fontWeight: "600", color: "#2c3e50", letterSpacing: "-0.2px", fontSize: "1.1rem" }}>
          <span className="text-muted me-2" style={{ fontFamily: "monospace" }}>{number < 10 ? `0${number}` : number}.</span>
          {question.content}
        </h5>
      </div>
      <div className="question__options d-flex flex-column gap-2">
        {['option1', 'option2', 'option3', 'option4'].map((optKey) => (
          <label
            key={optKey}
            className="d-flex align-items-center p-2 rounded-2 border transition-all position-relative overflow-hidden"
            style={{
              cursor: "pointer",
              border: savedAnswer === optKey ? "2px solid #2563eb" : "1px solid #e5e7eb",
              backgroundColor: savedAnswer === optKey ? "#eff6ff" : "#fff",
              transition: "all 0.1s ease"
            }}
            onMouseEnter={(e) => {
              if (savedAnswer !== optKey) e.currentTarget.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              if (savedAnswer !== optKey) e.currentTarget.style.backgroundColor = "#fff";
            }}
          >
            <div className="form-check">
              <input
                type="radio"
                name={number}
                value={optKey}
                checked={savedAnswer === optKey}
                onChange={(e) => {
                  saveAnswer(question.quesId, e.target.value);
                  if (onAnswer) onAnswer(question.quesId);
                }}
                className="form-check-input"
                style={{
                  width: "1.1em",
                  height: "1.1em",
                  marginRight: "12px",
                  cursor: "pointer",
                  boxShadow: "none"
                }}
              />
            </div>
            <span style={{ color: "#374151", fontWeight: "500", fontSize: "0.95rem" }}>
              {question[optKey]}
            </span>
          </label>
        ))}
      </div>

      {!isAdmin && (
        <div style={{ marginTop: "10px", textAlign: "right" }}>
          <button
            onClick={() => {
              if (onReview) onReview(question.quesId);
            }}
            style={{
              backgroundColor: isReview ? "orange" : "white",
              color: isReview ? "white" : "orange",
              border: "2px solid orange",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {isReview ? "Marked for Review" : "Mark for Review"}
          </button>
        </div>
      )}

      {isAdmin && (
        <div>
          <p
            style={{ margin: "5px" }}
          >{`Correct Answer: ${question[answer]}`}</p>
          <hr />
          <div className="question__content--editButtons">
            <div
              onClick={() => updateQuestionHandler(question)}
              style={{
                margin: "2px 8px",
                textAlign: "center",
                color: "rgb(68 177 49)",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >{`Update`}</div>

            <div
              onClick={() => deleteQuestionHandler(question)}
              style={{
                margin: "2px 8px",
                textAlign: "center",
                color: "red",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >{`Delete`}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;
