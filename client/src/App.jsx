import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import userIcon from './assets/user.png';

function Navbar({ user }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <nav className="w-full py-4 bg-[#D6E3F8] flex flex-row gap-10 justify-between items-center px-5 md:px-10 xl:px-60 border-b-2 border-[#bcd1f3]">
      {!token ? (
        <>
          <Link to="/">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      ) : (
        <>
          <Link to="/dashboard" className="font-bold">My Library</Link>
          <Link to="/profile" className="">
            <img src={userIcon} alt="User" className="w-6 h-6" />
          </Link>
        </>
      )}
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');

  // get user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const res = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error("get user data failed", err);
      }
    };
    fetchUser();
  }, [token]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen items-center">
        <Navbar user={user} />
        <main className="flex w-full max-w-4xl">
          <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


function Login() {
  const [isKobo, setIsKobo] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const ua = navigator.userAgent;
    setUserAgent(ua);
    if (ua.includes('Kobo') || ua.includes('Nickel')) {
      setIsKobo(true);
    }
  }, []);

  const loginFunc = async (e) => {
    e.preventDefault();
    const payload = isKobo ? { pin: pin.trim().toUpperCase() } : { email: email.trim().toLowerCase(), password: password };
    try {
      const res = await axios.post('/api/auth/login', payload);
      // todo: remove this log
      console.log('login details entered', {
        email: res.data.user?.email,
        pin: res.data.user?.pin,
        success: res.data.success
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        if (typeof setToken === 'function') {
          setToken(res.data.token);
        }
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.log('login error = ' + JSON.stringify(payload, null, 2));
      alert(err.response?.data?.error || 'Login unsuccessful. Please check your details.');
    }
  };

  return (
    <div className="w-full max-w-md m-auto mt-10 px-10 text-center">
      <h2 className="text-lg mb-6 font-bold">Account Login </h2>

      <form onSubmit={loginFunc} className="flex flex-col gap-4">
        <>
          <input type="email" placeholder="Email Address" className="p-2 border border-gray-500 rounded" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="p-2 border border-gray-500 rounded" onChange={(e) => setPassword(e.target.value)} required />
        </>

        <button type="submit" className="bg-blackp-3 font-bold uppercase" >Log In </button>
      </form>

      {!isKobo && (
        <p className="mt-6 text-sm">
          No account? <Link to="/signup" className="underline font-bold">Register here</Link>
        </p>
      )}
    </div>
  );
}

export default App;