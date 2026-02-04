import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <nav className="w-full py-4 border-b-2 border-black flex gap-4 justify-center">
      {!token ? (
        <>
          <Link to="/">Login</Link>
          <Link to="/signup">Signup</Link>
        </>
      ) : (
        <>
          <Link to="/dashboard" className="font-bold">My Library</Link>
        </>
      )}
    </nav>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  console.log('page loaded');
  return (
    <Router>
      <div className="flex flex-col min-h-screen items-center">
        <Navbar />
        <main className="w-full max-w-3xl p-5">
          <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/dashboard" element={
              localStorage.getItem('token') ? <Dashboard /> : <Navigate to="/login" />
            } />
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
      console.log('HELLO');
      const res = await axios.post('/api/auth/login', payload);
      console.log('login details entered', {
        email: res.data.user?.email,
        pin: res.data.user?.pin,
        success: res.data.success
      });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.log('login error = ' + JSON.stringify(payload, null, 2));
      alert(err.response?.data?.error || 'Login unsuccessful. Please check your details.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-10 text-center">
      <h2 className="text-lg mb-6 font-bold">Account Login </h2>

      <form onSubmit={loginFunc} className="flex flex-col gap-4">
        {isKobo ? (
          <div className='flex flex-row gap-2'>
            <label className="mb-2 font-medium text-left">PIN:</label>
            <input type="text" autoCapitalize="characters" autoCorrect="off" value={pin} maxLength="6" onChange={(e) => setPin(e.target.value)} 
              className="text-3xl w-full text-center p-1 border border-gray-500 rounded font-mono uppercase"
            />
          </div>
        ) : (
          <>
            <input type="email" placeholder="Email Address" className="p-2 border border-gray-500 rounded" onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="p-2 border border-gray-500 rounded" onChange={(e) => setPassword(e.target.value)} required />
          </>
        )}

        <button type="submit" className="bg-black text-white p-3 font-bold uppercase border-2 border-black" >Log In </button>
      </form>

      <div className="mt-8 pt-4 text-left">
        <p className="text-[10px] text-gray-600 break-all leading-tight">System Info: {userAgent}</p>
        <div className="text-[10px] text-gray-600 mt-2 flex justify-between items-center">
          <button onClick={() => setIsKobo(!isKobo)} className="underline cursor-pointer font-bold" > change {isKobo ? 'Web' : 'PIN'} mode </button>
        </div>
      </div>

      {!isKobo && (
        <p className="mt-6 text-sm">
          No account? <Link to="/signup" className="underline font-bold">Register here</Link>
        </p>
      )}
    </div>
  );
}

export default App;