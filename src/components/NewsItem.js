import React from 'react';
import EditButton from './EditButton';
import DeleteButton from './DeleteButton';
import AuthorBadge from './AuthorBadge';

const NewsItem = ({ article, currentUser, onClick, onDeleted }) => {
  return (
    <article
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group cursor-pointer"
      onClick={onClick}
    >
      {article.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute top-3 left-3">
            {article.category && (
              <span className="bg-primary-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {article.category}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        {!article.image && article.category && (
          <div className="mb-3">
            <span className="inline-block bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {article.category}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
            {article.title}
          </h2>
          <div className="shrink-0 flex gap-2" onClick={e => e.stopPropagation()}>
            <EditButton news={article} currentUser={currentUser} />
            <DeleteButton news={article} currentUser={currentUser} onDeleted={onDeleted} />
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.content && article.content.length > 150
            ? `${article.content.substring(0, 150)}...`
            : article.content}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <AuthorBadge 
            author={article.author} 
            currentUser={currentUser}
            isOwner={currentUser && article.author?._id === currentUser._id}
          />
          <span className="text-gray-400">
            {new Date(article.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </article>
  );
};

export default NewsItem;


