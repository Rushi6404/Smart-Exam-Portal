import axios from "axios";

const saveProgress = async (progress, token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.post("/api/progress/", progress, config);
        return data;
    } catch (error) {
        console.error("saveProgress error:", error);
        return null;
    }
};

const getProgress = async (userId, quizId, token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`/api/progress/${userId}/${quizId}`, config);
        return data;
    } catch (error) {
        // If 404 or other error, return null implies no progress
        return null;
    }
};

const deleteProgress = async (userId, quizId, token) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`/api/progress/${userId}/${quizId}`, config);
        return true;
    } catch (error) {
        console.error("deleteProgress error:", error);
        return false;
    }
};

const examProgressService = { saveProgress, getProgress, deleteProgress };
export default examProgressService;
