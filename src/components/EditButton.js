import React from 'react';
import { useNavigate } from 'react-router-dom';
import { default as axios } from '../services/api';

const EditButton = ({ news, currentUser }) => {
  const navigate = useNavigate();
  const currentUserId = currentUser?._id || currentUser?.id;
  const authorId = news?.author?._id || news?.author?.id || news?.author;
  const canEdit =
    currentUser && (currentUser.role === 'admin' || currentUserId === authorId);

  if (!canEdit) return null;

  const handleEdit = () => {
    navigate(`/edit/${news._id}`, { state: { news } });
    // Example for update API usage:
    // await axios.put(`/news/${news._id}`, updatedData);
  };

  return (
    <button
      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
      onClick={handleEdit}>
      Edit
    </button>
  );
};

export default EditButton;
