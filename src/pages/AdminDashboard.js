import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('news'); // 'news' | 'users'

  // Fetch all news
  const fetchNews = async () => {
    try {
      const response = await api.get('/news');
      if (response.data.success && Array.isArray(response.data.data)) {
        setNews(response.data.data);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error('Fetch news error:', err);
      setError('Failed to fetch news');
    }
  };

  // Fetch all users (admin-only)
  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Fetch users error:', err);
      // Do not set global error to avoid hiding news; show inline later if needed
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchNews(), fetchUsers()]);
      setLoading(false);
    };
    init();
  }, []);

  // Delete single news
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this news?')) return;
    try {
      const response = await api.delete(`/news/${id}`);
      if (response.data.success) {
        setNews(prev => prev.filter(item => item._id !== id));
        setError('');
      } else {
        setError('Failed to delete news');
      }
    } catch (err) {
      console.error('Delete news error:', err);
      setError('Failed to delete news');
    }
  };

  // Bulk delete all news for a user (admin-only)
  const handleBulkDeleteByUser = async userId => {
    if (
      !window.confirm(
        'Delete ALL news for this user? This action cannot be undone.'
      )
    )
      return;
    try {
      const response = await api.delete(`/news/by-author/${userId}`);
      if (response.data.success) {
        setNews(prev =>
          prev.filter(item => (item.author?._id || item.author) !== userId)
        );
      } else {
        alert('Failed to delete news for this user');
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Failed to delete news for this user');
    }
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error)
    return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-4 flex space-x-2">
        <button
          className={`px-4 py-2 rounded ${
            tab === 'news' ? 'bg-primary-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setTab('news')}>
          News
        </button>
        <button
          className={`px-4 py-2 rounded ${
            tab === 'users' ? 'bg-primary-600 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setTab('users')}>
          Users
        </button>
      </div>

      {tab === 'news' ? (
        news.length === 0 ? (
          <p>No news found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b">Title</th>
                  <th className="py-2 px-4 border-b">Category</th>
                  <th className="py-2 px-4 border-b">Author</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(news) && news.length > 0 ? (
                  news.map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{item.title}</td>
                      <td className="py-2 px-4 border-b">{item.category}</td>
                      <td className="py-2 px-4 border-b">
                        {item.author?.name || 'Unknown'}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-4 px-4 text-center text-gray-500">
                      No news articles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-4 px-4 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{u.name}</td>
                    <td className="py-2 px-4 border-b">{u.email}</td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleBulkDeleteByUser(u._id)}
                          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">
                          Delete All News
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
