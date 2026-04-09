import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Upload() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first");
    
    setLoading(true);
    setUploadError('');
    const formData = new FormData();
    formData.append('ebook', file);

    try {
      await axios.post('/api/books/upload', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert("Book uploaded successfully!");
      navigate('/dashboard');
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="px-6 pb-6 md:p-10 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-silver-950">Add New Book</h2>
      
      <form onSubmit={handleUpload} className="flex flex-col gap-6">
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`
            relative cursor-pointer py-16 px-4 border-2 border-dashed rounded-xl 
            flex flex-col items-center justify-center transition-all duration-200
            ${dragging 
              ? 'border-[#8D5B4C] bg-[#F5E9E2]' 
              : 'border-[#A5978B] bg-[#5C4742] hover:bg-[#A5978B]/20'}
          `}
        >
          <input type="file" ref={fileInputRef} accept=".epub,.pdf,.mobi" 
            onChange={(e) => setFile(e.target.files[0])} className="hidden"
          />

          <div className="text-center">
            {/* Icon */}
            <svg className={`mx-auto h-12 w-12 mb-4 ${dragging ? 'text-[#8D5B4C]' : 'text-[#A5978B]'}`} 
                 stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            
            <p className="text-lg font-medium text-[#C4BBAF]">
              {file ? file.name : "Drag a book here, or tap to select"}
            </p>
            <p className="text-sm text-silver-500 mt-2">EPUB, PDF, or MOBI up to 500MB</p>
          </div>
        </div>

        {uploadError && (
          <p className="text-red-500 font-bold bg-white p-3 border border-[#C4BBAF] rounded">
            {uploadError}
          </p>
        )}

        <button type="submit" disabled={loading || !file}
          className={`w-full font-bold py-4 rounded-xl transition-all shadow-md
            ${!file || loading 
              ? 'bg-[#5A2A27] hover:border-[#5A2A27] text-white cursor-not-allowed' 
              : 'bg-[#8D5B4C] text-white hover:bg-[#5A2A27] hover:border-[#5A2A27] cursor-pointer active:scale-95'}
          `}
        >
          {loading ? "Uploading..." : "Confirm Upload"}
        </button>
      </form>
    </div>
  );
}

export default Upload;