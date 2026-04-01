import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [file, setFile] = useState(null);
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState('');
  const navigate = useNavigate();
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
    setUploadError('');
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

      alert("Book uploaded!");
      if (res.data.book) {
        setBooks([res.data.book, ...books]);
      }
      setFile(null);
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error || "Server error";
      setUploadError(serverMessage);
    }
  };

  const handleDelete = async (e, bookId) => {
    e.preventDefault();

    if (!window.confirm("Are you sure you want to remove this book?")) return;

    try {
      const res = await axios.delete(`/api/books/delete/${bookId}`, {
        headers: getHeaders()
      });

      if (res.data.success) {
        setBooks(books.filter(book => book._id !== bookId));
      } else {
        alert("Error deleting book: " + res.data.error);
      }
    } catch (err) {
      console.error("Delete book failed:", err);
    }
  };

  if (loading) return <div className="p-10 font-bold">Loading...</div>;

  return (
    <div className="flex flex-col gap-8 w-full p-5">
      <div className="p-4 border-2 border-[#E4BB97] rounded">
        <h3 className="font-bold mb-2">Add E-Book</h3>
        <form onSubmit={handleUpload} className="flex flex-col gap-3">
          <input type="file" accept=".epub,.pdf" onChange={(e) => setFile(e.target.files[0])} className="text-sm" />
          {uploadError && (
            <p className="text-red-600 font-bold text-sm bg-red-50 p-2 border border-red-200">{uploadError}</p>
          )}
          <button type="submit" className="text-sm p-2 font-bold w-full mx-auto max-w-sm">Upload Book</button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Available Books</h2>
        {books.length === 0 ? (
          <p className="italic text-gray-600">No books found in your account.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {books.map((book) => (
              <div key={book._id}
                className="flex flex-row gap-1 border-t-2 border-b-0 border-r-0 border-l-0 border-black justify-between items-center group">
                <div className="flex-1 py-4">
                  <div className="text-md text-wrap">{book.title}</div>
                  <div className="text-xs font-medium opacity-70">{book.author}</div>
                </div>

                <div className='mr-0 flex'>
                  <button onClick={(e) => handleDelete(e, book._id)}
                    className="px-6 py-2 font-bold uppercase text-sm cursor-pointer bg-transparent">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;