import axios from "axios";

const fetchQuestionsByQuiz = async (quizId, token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const { data } = await axios.get(
      `/api/question/?quizId=${quizId}`,
      config
    );
    console.log("questionsServices:fetchQuestionsByQuiz() Success: ", data);
    return data;
  } catch (error) {
    console.error(
      "questionsServices:fetchQuestionsByQuiz() Error: ",
      error.response?.data || error.message
    );
    return null;
  }
};

const addQuestion = async (question, token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const { data } = await axios.post("/api/question/", question, config);
    console.log("questionsServices:addQuestion()  Success: ", data);
    return { data: data, isAdded: true, error: null };
  } catch (error) {
    console.error(
      "questionsServices:addQuestion()  Error: ",
      error.response?.data || error.message
    );
    return { data: null, isAdded: false, error: error.response?.data || error.message };
  }
};

const deleteQuestion = async (quesId, token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const { data } = await axios.delete(`/api/question/${quesId}`, config);
    console.log("questionsServices:deleteQuestion() Success: ", data);
    return {
      isDeleted: true,
      error: null,
    };
  } catch (error) {
    console.error(
      "questionsServices:deleteQuestion() Error: ",
      error.response?.data || error.message
    );
    return {
      isDeleted: false,
      error: error.response?.data || error.message,
    };
  }
};

const updateQuestion = async (question, token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const { data } = await axios.put(
      `/api/question/${question.quesId}`,
      question,
      config
    );
    console.log("questionsServices:updateQuestion() Success: ", data);
    return {
      data: data,
      isUpdated: true,
      error: null,
    };
  } catch (error) {
    console.error(
      "questionsServices:updateQuestion() Error: ",
      error.response?.data || error.message
    );
    return {
      data: null,
      isUpdated: false,
      error: error.response?.data || error.message,
    };
  }
};

const autoGenerateQuestions = async (file, quizId, token) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("quizId", quizId);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const { data } = await axios.post(
      "/api/question/auto-generate",
      formData,
      config
    );
    console.log("questionsServices:autoGenerateQuestions() Success: ", data);
    return { data: data, isGenerated: true, error: null };
  } catch (error) {
    console.error(
      "questionsServices:autoGenerateQuestions() Error: ",
      error.response?.data || error.message
    );
    return {
      data: null,
      isGenerated: false,
      error: error.response?.data || error.message,
    };
  }
};

const questionsServices = {
  fetchQuestionsByQuiz,
  addQuestion,
  deleteQuestion,
  updateQuestion,
  autoGenerateQuestions,
  copyQuestions: async (questionIds, targetQuizId, token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const body = { questionIds, targetQuizId: parseInt(targetQuizId) };
      const { data } = await axios.post("/api/question/copy", body, config);
      return { data, isCopied: true };
    } catch (error) {
      console.error("copyQuestions error:", error);
      return { isCopied: false };
    }
  },

  generateQuestions: async (topic, count, difficulty, quizId, token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const body = { topic, count: parseInt(count), difficulty, quizId: parseInt(quizId) };
      const { data } = await axios.post("/api/question/generate", body, config);
      return { data, isGenerated: true };
    } catch (error) {
      console.error("generateQuestions error:", error);
      return { isGenerated: false, error: error.response?.data?.message || "Generation failed" };
    }
  }
};
export default questionsServices;
