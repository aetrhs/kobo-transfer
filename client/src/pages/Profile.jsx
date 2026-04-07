import React, { useState } from 'react';
import axios from 'axios';

function Profile({ user }) {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
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

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/change-password',
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: "Password changed!", isError: false });
    } catch (err) {
      setMessage({ text: "Password change failed.", isError: true });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col justify-center gap-4 mx-auto w-full p-5">
      <h2 className="text-xl text-[#9D5C63] font-bold text-center">User Settings</h2>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col">
          <div className="flex flex-row gap-3 items-center mb-2">
            <p className="text-s uppercase font-bold text-gray-500">Account :</p>
            <p className="text-lg">{user?.email}</p>
          </div>
          <div className="flex flex-row gap-3 items-center">
            <p className="text-s uppercase font-bold text-gray-500">Kobo Login PIN :</p>
            <p className="text-lg font-bold tracking-tighter text-black">{user?.loginPin || "000000"}</p>
          </div>
          <p className="text-xs mt-2 text-gray-600">Enter this 6-digit code on your Kobo's browser login page.</p>
        </div>

        <div>
          <h3 className="text-s uppercase font-bold text-gray-500 mb-2">Change Password :</h3>
          <form onSubmit={changePassword} className="flex flex-col gap-3">
            <div className='flex flex-row justify-between align-middle border border-gray-500 rounded bg-white focus-within:ring-2'>
              <input type={showPassword ? 'text' : 'password'} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="rounded p-2 text-sm focus:outline-none" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} 
              className="bg-transparent border-none hover:border-none hover:bg-transparent">
                {showPassword ? EyeOffIcon : EyeIcon}
              </button>
            </div>
            <button type="submit" className="bg-[#9D5C63] text-white p-3 font-bold uppercase text-xs max-w-lg hover:border-[#9D5C63] hover:text-[#9D5C63] hover:bg-white hover:transition-colors">Confirm Change</button>
            {message.text && (
              <p className={`text-xs font-bold p-2 ${message.isError ? 'bg-red-100' : 'bg-green-100'}`}>
                {message.text}
              </p>
            )}
          </form>
        </div>

        <button onClick={logout} className="text-[#9D5C63] p-3 font-bold uppercase text-xs max-w-lg bg-transparent hover:border-[#9D5C63] hover:transition-colors">Log Out</button>
      </div>
    </div>
  );
}

export default Profile;