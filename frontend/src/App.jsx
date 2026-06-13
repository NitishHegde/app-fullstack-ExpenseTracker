import React, { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboardpage from './pages/Dashboardpage';

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

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

  return (
    <>
      <Routes>
        <Route element={<Layout/>}>
          <Route path='/' element={<Dashboardpage/>}/>
        </Route>
      </Routes>
    </>
  )
};


export default App;


