import React, { useState } from 'react';
import axios from 'axios';

function Profile({ user }) {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });

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
      <h2 className="text-xl font-bold text-center">User Settings</h2>

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
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="border-2 border-zinc-400 rounded p-2 text-sm focus:outline-none focus:bg-blue-50" required />
            <button type="submit" className="p-3 font-bold uppercase text-xs max-w-lg">Confirm Change</button>
            {message.text && (
              <p className={`text-xs font-bold p-2 ${message.isError ? 'bg-red-100' : 'bg-green-100'}`}>
                {message.text}
              </p>
            )}
          </form>
        </div>

        <button onClick={logout} className="p-3 font-bold uppercase text-xs max-w-lg bg-transparent">Log Out</button>
      </div>
    </div>
  );
}

export default Profile;