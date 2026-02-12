import axios from "axios";

const register = async (user) => {
  try {
    const { data } = await axios.post("/api/register", user);
    if (data && data.userId) {
      console.log(
        "authService:register() Success: ",
        user.username,
        " successfully registerd."
      );
      return { isRegistered: true, error: null };
    } else {
      console.error("authService:register() Error: ", data);
      return { isRegistered: false, error: data };
    }
  } catch (error) {
    console.error("authService:register() Error: ", error.response?.data || error.message);
    return { 
      isRegistered: false, 
      error: error.response?.data || error.message 
    };
  }
};

const login = async (username, password) => {
  try {
    const { data } = await axios.post("/api/login", {
      username: username,
      password: password,
    });

    if (data && data.jwtToken.length) {
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("jwtToken", JSON.stringify(data.jwtToken));
      console.log("authService:login() Success: ", data.user);
      return data;
    } else {
      console.error("authService:login() Error: ", data);
      return data;
    }
  } catch (error) {
    console.error("authService:login() Error: ", error.response.statusText);
    return error.response.statusText;
  }
};

const forgotPassword = async (email) => {
  const { data } = await axios.post("/api/forgot-password", { email });
  return data;
};

const resetPassword = async (token, newPassword) => {
  const { data } = await axios.post("/api/reset-password", { token, newPassword });
  return data;
};

const validateUser = async (username) => {
  const { data } = await axios.post("/api/forgot-password/validate-user", { username });
  return data;
};

const authServices = { register, login, forgotPassword, resetPassword, validateUser };
export { register, login, forgotPassword, resetPassword, validateUser };
export default authServices;
