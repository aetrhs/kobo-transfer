import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [registeredPin, setRegisteredPin] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
      alert("server error maybe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 mt-10 text-center">
      <h2 className="text-lg mb-6 font-bold">Register with Us</h2>

      {!registeredPin ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Email Address" className="p-2 border border-gray-500 rounded"
            required onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <input type="password" placeholder="Password" className="p-2 border border-gray-500 rounded"
            required onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

          <button  type="submit"  disabled={loading}  className="bg-black text-white p-3 font-bold uppercase border-2 border-black disabled:bg-gray-800" >
            {loading ? 'Processing...' : 'Register'}
          </button>

          <p className="mt-6 text-sm">
            Already have an account? <Link to="/" className="underline font-bold">Back to Login</Link>
          </p>
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

          <button onClick={() => navigate('/')}
            className="w-full bg-black text-white p-3 font-bold uppercase border-2 border-black">Go to Login</button>
        </div>
      )}
    </div>
  );
}

export default Signup;