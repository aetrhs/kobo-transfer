import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import userIcon from './assets/user.png';
import Sidebar from './pages/Sidebar.jsx';
import Upload from './pages/Upload.jsx';

function Navbar({ user, toggleSidebar, searchQuery, setSearchQuery}) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  //hide navbar if no token (not logged in)
  if (!token) {
    return null;
  }

  return (
    <nav className="w-full py-4 bg-[#5C4742] flex flex-row gap-10 justify-between items-center px-5">
      <button onClick={toggleSidebar} className="p-2 bg-transparent hover:text-white hover:border-none rounded-md md:hidden cursor-pointer">
        <svg className="w-6 h-6 text-silver-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
        <>
        <div className="flex items-center gap-10 flex-1 max-w-md mx-4">
            <div className="relative w-full max-w-md">
              <input type="text"placeholder="Search Book" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-10 rounded-full boder-none bg-[#C4BBAF] placeholder:text-white placeholder:font-bold focus:outline-none focus:ring-2 focus:ring-[#C4BBAF] text-s text-[#5A2A27]"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <Link to="/profile" className="flex-shrink-0">
            <img src={userIcon} alt="User" className="w-10 h-auto" />
          </Link>
        </>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem('token');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
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
      <div className="flex flex-row min-h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex flex-col h-auto w-full mx-auto top-0">
          <Navbar user={user} toggleSidebar={toggleSidebar} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard user={user} searchQuery={searchQuery} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/upload" element={<Upload />} />
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