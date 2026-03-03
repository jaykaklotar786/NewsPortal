import React, { useState } from 'react';
import { newsAPI } from '../services/api';

const DeleteButton = ({ news, currentUser, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id;
  const authorId = news?.author?._id || news?.author?.id || news?.author;
  const canDelete =
    currentUser && (currentUser.role === 'admin' || currentUserId === authorId);

  if (!canDelete) return null;

  const handleDelete = async e => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this news?')) return;
    try {
      setLoading(true);
      await newsAPI.delete(news._id);
      if (onDeleted) onDeleted(news._id);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(
        err?.response?.data?.message ||
          'Failed to delete news. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ${
        loading ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      onClick={handleDelete}
      disabled={loading}
      title="Delete">
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
};

export default DeleteButton;
