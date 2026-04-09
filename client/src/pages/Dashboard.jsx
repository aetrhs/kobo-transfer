import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallback from '../assets/cover-placeholder.jpg';
import bookIcon from '../assets/books.png';

function Dashboard({searchQuery}) {
  const [file, setFile] = useState(null);
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState('');
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
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

  const handleDelete = async (bookId) => {
    if (!window.confirm("Are you sure you want to remove this book?")) return;

    try {
      const res = await axios.delete(`/api/books/delete/${bookId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBooks(books.filter(b => b._id !== bookId));
      setActiveMenu(null);
    } catch (err) {
      console.error("Delete book failed:", err);
    }
  };
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="p-10 font-bold">Loading...</div>;

  return (
    <div className="flex flex-col gap-8 w-full p-5">
      <div>
        <div className='flex flex-row items-center gap-2 mb-4'>
          <img src={bookIcon} alt="Library Icon" className="w-10 h-auto" />
          <h2 className="text-xl md:text-2xl font-bold">
            {searchQuery ? `Search Results for "${searchQuery}"` : "My Library"}
          </h2>
        </div>
        <div className='px-5 border-t-4 border-[#8D5B4C] w-[140px]'></div>
      </div>
        {filteredBooks.length === 0 ? (
          <p className="italic text-gray-600">No books found.</p>
        ) : (
          <div className="flex flex-row flex-wrap gap-6 justify-start">
            {filteredBooks.map((book) => (
              <div key={book._id} className="relative flex flex-col group w-full max-w-[160px] lg:max-w-[200px]">
              <div className="absolute top-2 right-2 z-10 transition-opacity">
                <button onClick={() => setActiveMenu(activeMenu === book._id ? null : book._id)}
                  className="bg-white p-1.5 rounded-full shadow-md hover:bg-white text-silver-800">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>
                
                {activeMenu === book._id && (
                  <div className="absolute right-0 mt-2 w-32 shadow-xl rounded-md overflow-hidden z-20">
                    <button onClick={() => handleDelete(book._id)}
                      className="w-full text-left px-4 bg-[#5A2A27] py-2 text-xs
                      text-white hover:bg-[#8D5B4C] hover:border-[#8D5B4C] font-bold">
                      Delete Book</button>
                  </div>
                )}
              </div>
              <div className="relative aspect-[2/3] w-full rounded-md shadow-[0_8px_15px_-3px_rgba(0,0,0,0.3)] 
              border border-[#5A2A27] overflow-hidden transition-transform duration-200 group-hover:-translate-y-2 group-hover:shadow-[0_12px_20px_-5px_rgba(0,0,0,0.4)]">
                <img src={book.cover || fallback} alt={book.title} 
                  className="h-full w-full object-cover" onError={(e) => { e.target.src = fallback; }}
                />
              </div>

              <div className="mt-4 px-1">
                <h4 className="text-lg font-bold text-white">{book.title}</h4>
                <p className="text-sm text-silver-500 uppercase tracking-wider font-medium mt-1">{book.author}</p>
              </div>
            </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default Dashboard;