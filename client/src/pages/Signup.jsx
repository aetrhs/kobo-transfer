import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [registeredPin, setRegisteredPin] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const passwordsMatch = formData.password === confirmPassword || confirmPassword === '';
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setRegisteredPin(data.pin);
      } else {
        const errorMsg = data.error || data.message || "Unknown registration error";
        alert('Error: ' + errorMsg);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();
  const isLoginPath = location.pathname === '/'; //will be false

  return (
  <div className="w-full max-w-md m-auto px-10 text-center flex flex-col gap-6">
    <div className='flex flex-col'>
      <p className="font-medium">KoboSync</p>
      <p className='font-bold text-4xl'>Create Account</p>
      <p className="mt-1">Join the community library.</p>
    </div>

    <div className='flex flex-col gap-3 bg-white py-4 px-10 rounded-t-3xl rounded-b-3xl shadow-xl'>
      <div className='bg-gray-400 bg-opacity-10 p-1 flex flex-row gap-1 justify-center border border-gray-100 rounded-full items-center mb-4'>
        <Link to="/" className={`py-2 px-4 text-sm font-bold w-1/2 rounded-full transition-all duration-300 ${
            isLoginPath 
              ? 'bg-white shadow text-[#9D5C63] opacity-100' 
              : 'bg-transparent text-gray-400 opacity-50'
          }`} >
          Login
        </Link>
        <Link to="/signup" className={`py-2 px-4 text-sm font-bold w-1/2 rounded-full transition-all duration-300 ${
            !isLoginPath 
              ? 'bg-white shadow text-[#9D5C63] opacity-100' 
              : 'bg-transparent text-gray-400 opacity-50'
          }`}>
          Register
        </Link>
      </div>

      {!registeredPin ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-left text-xs uppercase tracking-widest font-bold text-[#9D5C63] ml-1">Email Address</label>
            <input type="email" placeholder="e.g. user@gmail.com" 
              className="p-3 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#9D5C63] focus:outline-none transition-all placeholder:text-gray-300" 
              required onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-left text-xs uppercase tracking-widest font-bold text-[#9D5C63] ml-1">Password</label>
            <div className='flex flex-row justify-between items-center border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-[#9D5C63] transition-all'>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                className="w-full text-black p-3 rounded-xl focus:outline-none placeholder:text-gray-300"
                required onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="bg-transparent border-none pr-4 text-gray-300 hover:text-[#9D5C63] hover:border-none transition-colors">
                {showPassword ? EyeOffIcon : EyeIcon}
              </button>
            </div>
          </div>

          {/* confirm pw */}
          <div className="flex flex-col gap-1">
            <label className="text-left text-xs uppercase tracking-widest font-bold text-[#9D5C63] ml-1">Confirm Password</label>
            <div className={`flex flex-row justify-between items-center border rounded-xl bg-white focus-within:ring-2 transition-all ${error ? 'border-red-400 focus-within:ring-red-400' : 'border-gray-200 focus-within:ring-[#9D5C63]'}`}>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                className="w-full text-black p-3 rounded-xl focus:outline-none placeholder:text-gray-300"
                required onChange={(e) => setConfirmPassword(e.target.value)} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="bg-transparent border-none pr-4 text-gray-300 hover:text-[#9D5C63] hover:border-none transition-colors">
                {showPassword ? EyeOffIcon : EyeIcon}
              </button>
            </div>
            {!passwordsMatch && (
              <span className="text-red-500 text-md mt-1 ml-1 text-left">
                Passwords do not match
              </span>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="mt-2 p-4 bg-[#9D5C63] text-white rounded-full font-bold uppercase hover:bg-[#8a4b52] transition-all shadow-md active:scale-95 disabled:opacity-50">
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>
      ) : (
        <div className="py-4 space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="p-6 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl shadow-inner">
            <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Registration Complete</h3>
            <p className="mt-2 text-sm text-gray-500">Use this PIN to log in on your Kobo device:</p>
            <div className="text-5xl font-mono font-bold mt-6 p-4 text-[#9D5C63] border-t border-gray-200">
              {registeredPin}
            </div>
          </div>

          <button onClick={() => window.location.href = '/'}
            className="w-full p-4 bg-gray-800 text-white rounded-full font-bold uppercase hover:bg-black transition-all shadow-md active:scale-95"
          >Continue to Login</button>
        </div>
      )}
    </div>
  </div>
);
}

export default Signup;