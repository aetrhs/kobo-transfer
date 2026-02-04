import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [file, setFile] = useState(null);
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      try {
        const userRes = await axios.get('/api/auth/profile', { headers: getHeaders() });
        setUser(userRes.data);

        const booksRes = await axios.get('/api/books/my-books', { headers: getHeaders() });
        setBooks(Array.isArray(booksRes.data) ? booksRes.data : []);
      } catch (err) {
        console.error("Fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first");

    const formData = new FormData();
    formData.append('ebook', file);

    try {
      const res = await axios.post('/api/books/upload', formData, {
        headers: {
          ...getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Success!");
      if (res.data.book) {
        setBooks([res.data.book, ...books]);
      }
      setFile(null);
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.error || "Server error"));
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  if (loading) return <div className="p-10 font-bold">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-5">
      <header className="border-b-4 border-black pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">My Library</h1>
        </div>
        <button onClick={logout} className="text-sm font-bold underline">EXIT</button>
      </header>

      <section className="mb-12 p-4 border-2 border-black">
        <h3 className="font-bold uppercase mb-2">Add Ebook</h3>
        <form onSubmit={handleUpload} className="flex flex-col gap-3">
          <input type="file" accept=".epub,.pdf" onChange={(e) => setFile(e.target.files[0])} className="text-sm"/>
          <button type="submit" className="bg-gray-600 text-white p-2 font-bold">Upload Book</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Available Books</h2>
        {books.length === 0 ? (
          <p className="italic text-gray-600">No books found in your account.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {books.map((book) => (
              <div key={book._id} className="flex flex-row border-t-2 border-b-0 border-r-0 border-l-0 border-black p-4 justify-between items-center group">
                <div className="flex-1 pr-4">
                  <div className="font-bold text-lg">{book.title}</div>
                  <div className="text-xs font-medium opacity-70">{book.author}</div>
                </div>
                
                <div className='mr-0 flex'>
                  <a href={`/api/books/download/${book._id}?token=${localStorage.getItem('token')}`}
                    className="bg-black text-white px-6 py-2 font-black text-sm rounded" download>Download</a>
                  <a href={`/api/books/delete/${book._id}?token=${localStorage.getItem('token')}`}
                  className="underline px-6 py-2 font-black text-sm">Remove</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;