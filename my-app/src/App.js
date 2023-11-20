import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './home';
import Login from './login';
import Schedule from './schedule';
import './App.css';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";

function App() {
  const auth = getAuth();
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user || !user.token) {
      setLoggedIn(false)
      return
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        setLoggedIn(true)
        setEmail(user.email || "")
      }
    });
  }, [])

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home email={email} loggedIn={loggedIn} setLoggedIn={setLoggedIn}/>} />
          <Route path="/login" element={<Login setLoggedIn={setLoggedIn} setEmail={setEmail} />} />
          <Route path="/schedule" element={<Schedule loggedIn={loggedIn} email={email}/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;