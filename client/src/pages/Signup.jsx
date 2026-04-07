import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [registeredPin, setRegisteredPin] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="w-full max-w-md m-auto px-10 mt-10 text-center">
      <h2 className="text-xl mb-6 font-bold text-[#9D5C63]">Register with Us</h2>

      {!registeredPin ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Email Address" className="p-2 border border-gray-500 rounded"
            required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />

          <div className='flex flex-row justify-between align-middle border border-gray-500 rounded bg-white focus-within:ring-2'>
            <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="h-auto p-2 rounded focus:outline-none"
              required onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} 
            className="bg-transparent border-none hover:border-none hover:bg-transparent">
              {showPassword ? EyeOffIcon : EyeIcon}
            </button>
          </div>

          <button  type="submit"  disabled={loading}  className="bg-[#9D5C63] text-white p-3 font-bold uppercase hover:border-[#9D5C63] hover:text-[#9D5C63] hover:bg-white hover:transition-colors" >
            {loading ? 'Processing...' : 'Register'}
          </button>

          <p className="mt-6 text-sm"> Already have an account? <Link to="/" className="underline font-bold">Back to Login</Link></p>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border border-gray-500 rounded bg-gray-50">
            <h3 className="text-lg font-bold uppercase">Success!</h3>
            <p className="mt-2 text-sm text-gray-600">Your login PIN for Kobo is:</p>
            <div className="text-4xl font-mono font-bold mt-4 p-4 tracking-widest border-t border-gray-200">
              {registeredPin}
            </div>
          </div>

          <button onClick={() => window.location.href = '/'}
            className="w-full p-3 font-bold uppercase">Go to Login</button>
        </div>
      )}
    </div>
  );
}

export default Signup;