import React, { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboardpage from './pages/Dashboardpage';
import Login from './components/Login';

const App = () => {
  // const [user, setUser] = useState(null);
  // const [token, setToken] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || sessionStorage.getItem("token")
  );
  const [user, setUser] = useState(() => {
      try {
          const stored = localStorage.getItem("user") || sessionStorage.getItem("user");
          return stored ? JSON.parse(stored) : null;
      } catch {
          return null;
      }
  });
  const navigate = useNavigate();


  // to save the token
    const persistAuth = (userObj, tokenStr, remember = false) => {
    try {
      if (remember) {
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) localStorage.setItem("token", tokenStr);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      } else {
        if (userObj) sessionStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) sessionStorage.setItem("token", tokenStr);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setUser(userObj || null);
      setToken(tokenStr || null);
    } catch (err) {
      console.error("persistAuth error:", err);
    }
  };

  const clearAuth = () =>{
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  } catch (error) {
    console.log("clearAuth error: ",error);
  }
  setUser(null);
  setToken(null);
}
  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleLogin = (userData, remember = false, tokenfromAPI=null) => {
    persistAuth(userData, tokenfromAPI, remember);
    navigate("/");
  };

  return (
    <>
      <Routes>
        <Route path='/login' element={<Login onLogin={handleLogin}/>}/>
        <Route element={<Layout user={user} token={token} onLogout={handleLogout}/>}>
          <Route path='/' element={<Dashboardpage/>}/>
        </Route>
      </Routes>
    </>
  )
};


export default App;


