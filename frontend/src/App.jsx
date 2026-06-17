import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboardpage from './pages/Dashboardpage';
import Login from './components/Login';
import Signup from './components/Signup';
import axios from 'axios';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Profile from './pages/Profile';

const API_URL = import.meta.env.VITE_BASE_URL;
// to get transaction coming from local storage
const getTransactionFromLocalStorage = () => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
};


// tp protect the routes
const ProtectedRoute = ({user, children}) => {
  const localToken = localStorage.getItem("token");
  const sessionToken = sessionStorage.getItem("token");
  const hasToken = localToken || sessionToken;

  if(!user || !hasToken){
    return <Navigate to="/login" />;
  }
  return children;
};

// to scroll to top when page gets relaoad or new page visited
const ScrollToTop = () => {
    const location = useLocation();     
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);            
    return null;
};
  
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
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);


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

  const handleSignup= (userData, remember = false, tokenfromAPI=null) => {
    persistAuth(userData, tokenfromAPI, remember);
    navigate("/");
  };

  // to update user data for both in state and storage
  const updateuserData = (updatedUser) => {
    setUser(updatedUser);

    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");

    if(localToken){
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }else if (sessionToken){
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // try to load user with token when mounted
  useEffect(() => {
    (async () => {
      try {
        const localUserRaw = localStorage.getItem("user");
        const sessionUserRaw = sessionStorage.getItem("user");
        const localToken = localStorage.getItem("token");
        const sessionToken = sessionStorage.getItem("token");

        const storedUser= localUserRaw 
          ? JSON.parse(localUserRaw) : sessionUserRaw 
          ? JSON.parse(sessionUserRaw) : null;
        
          const storedToken = localToken || sessionToken ||  null;
          const tokenFromLocal = !!localToken;

          if(storedUser){
            setUser(storedUser);
            setToken(storedToken);
            setIsLoading(false);
            return;
          }

          if(storedToken){
            try {
              const res = await axios.get(`${API_URL}/user/me`, {
                headers: {
                  Authorization: `Bearer ${storedToken}`,
                }
              });
              const profile = res.data;
              persistAuth(profile, storedToken, tokenFromLocal);
            } catch (error) {
              console.warn("Could not fetch profile with stored token", error);
              clearAuth();
            }
          }

      } catch (error) {
        console.log("error bootstraping auth: ", error)
      }finally{
        setIsLoading(false);

        try {
          setTransactions(getTransactionFromLocalStorage());
        } catch (error) {
          console.error("error loading transactions: ", error)
        }
      }
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("transactions", JSON.stringify(transactions));
    } catch (error) {
      console.error("erro saving the transaction: ", error);
    }
  }, [transactions]);


  // transaction helpers
  const addTransaction = (newTransaction) =>
    setTransactions((p) => [newTransaction, ...p]);
  const editTransaction = (id, updatedTransaction) =>
    setTransactions((p) =>
      p.map((t) => (t.id === id ? { ...updatedTransaction, id } : t)),
    );
  const deleteTransaction = (id) =>
    setTransactions((p) => p.filter((t) => t.id !== id));
  const refreshTransactions = () =>
    setTransactions(getTransactionsFromStorage());


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <ScrollToTop/>
      <Routes>
        <Route path='/login' element={<Login onLogin={handleLogin}/>}/>
        <Route path='/signup' element={<Signup onSignup = {handleSignup}/>} />
        <Route 
          element={ 
          <ProtectedRoute user={user}>
            <Layout user={user} token={token} onLogout={handleLogout}
              transactions={transactions}
              addTransaction={addTransaction}
              editTransaction={editTransaction}
              deleteTransaction={deleteTransaction}
              refreshTransactions={refreshTransactions}
            />
          </ProtectedRoute>
          }
          >
          <Route path='/' element={<Dashboardpage/>} 
            transactions={transactions}
            addTransaction={addTransaction}
            editTransaction={editTransaction}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions}
          />

          <Route path='/income' element={
            <Income transactions={transactions}
            addTransaction={addTransaction}
            editTransaction={editTransaction}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions}/>
          } />

          <Route path='/expense' element={
            <Expense transactions={transactions}
            addTransaction={addTransaction}
            editTransaction={editTransaction}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions}/>
          } />

          <Route path="/profile" element={<Profile user={user} onUpdateProfile={updateuserData}
            onLogout={handleLogout}
            />
          } 
        />
        </Route>
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </>
  )
};


export default App;


