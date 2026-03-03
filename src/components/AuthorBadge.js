import React from 'react';

const AuthorBadge = ({ author, currentUser, isOwner = false }) => {
  if (!author) return null;

  const isCurrentUser = currentUser && author._id === currentUser._id;
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
          isCurrentUser 
            ? 'bg-green-100 text-green-700' 
            : isAdmin 
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {author.name?.charAt(0) || 'A'}
        </div>
        <span className={`text-xs font-medium ${
          isCurrentUser 
            ? 'text-green-700' 
            : isAdmin 
            ? 'text-blue-700'
            : 'text-gray-600'
        }`}>
          {author.name || 'Anonymous'}
        </span>
      </div>
      
      {isCurrentUser && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          You
        </span>
      )}
      
      {isAdmin && !isCurrentUser && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Admin
        </span>
      )}
      
      {isOwner && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Owner
        </span>
      )}
    </div>
  );
};

export default AuthorBadge;
