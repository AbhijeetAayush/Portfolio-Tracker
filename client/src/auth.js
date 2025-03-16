export const loginUser = async (email, password) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      return data;
    }
    throw new Error(data.message);
  };
  
  export const logoutUser = () => {
    localStorage.removeItem("token");
  };
  