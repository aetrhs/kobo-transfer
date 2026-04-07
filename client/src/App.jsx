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
  const [showPassword, setShowPassword] = useState(false);

  // svgs for eye icon (show/hide password)
  const EyeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeOffIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

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
      <h2 className="text-xl text-[#9D5C63] mb-6 font-bold">Account Login </h2>

      <form onSubmit={loginFunc} className="flex flex-col gap-4">
        <>
          <input type="email" placeholder="Email Address" className="p-2 border border-gray-500 rounded" onChange={(e) => setEmail(e.target.value)} required />
          <div className='flex flex-row justify-between align-middle border border-gray-500 rounded bg-white focus-within:ring-2'>
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" 
              className="h-auto p-2 rounded focus:outline-none" 
              onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} 
            className="bg-transparent border-none hover:border-none hover:bg-transparent">
              {showPassword ? EyeOffIcon : EyeIcon}
            </button>
          </div>
        </>

        <button type="submit" className="p-3 font-bold uppercase hover:transition-colors" >Log In </button>
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