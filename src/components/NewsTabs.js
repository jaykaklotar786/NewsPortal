import React, { useState, useEffect } from 'react';
import { newsAPI } from '../services/api';
import { toAbsoluteUploadUrl } from '../services/api';
import NewsItem from './NewsItem';
import AuthorBadge from './AuthorBadge';

const NewsTabs = ({ currentUser, onNewsDeleted }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNews: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Available categories for filtering
  const categories = [
    'All',
    'Technology',
    'Business',
    'Health',
    'Sports',
    'Entertainment',
    'Politics',
    'Environment',
    'Science',
    'World',
    'Local',
  ];

  // Fetch news based on active tab
  const fetchNews = async (page = 1, category = '', search = '') => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const params = {
        page,
        limit: 12,
        ...(category && category !== 'All' && { category }),
      };

      if (search.trim()) {
        // Use search API if search query is provided
        if (activeTab === 'my') {
          response = await newsAPI.searchMy(search, params);
        } else {
          response = await newsAPI.search(search, params);
        }
      } else {
        // Use regular news API
        if (activeTab === 'my') {
          response = await newsAPI.getMy(params);
        } else {
          response = await newsAPI.getPublic(params);
        }
      }

      if (response.data.success) {
        const dataWithAbsoluteImages = (response.data.data || []).map(item => ({
          ...item,
          image: item.image ? toAbsoluteUploadUrl(item.image) : item.image,
        }));
        setNews(dataWithAbsoluteImages);
        setPagination(
          response.data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalNews: dataWithAbsoluteImages.length,
            hasNext: false,
            hasPrev: false,
          }
        );
      } else {
        setError('Failed to fetch news');
      }
    } catch (err) {
      console.error('Fetch news error:', err);
      setError('Failed to fetch news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch news when tab changes or component mounts
  useEffect(() => {
    fetchNews(1, selectedCategory, searchQuery);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    setSelectedCategory('');
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalNews: 0,
      hasNext: false,
      hasPrev: false,
    });
  };

  // Handle news deletion
  const handleDeleted = (deletedId) => {
    setNews(prev => prev.filter(item => (item._id || item.id) !== deletedId));
    setPagination(p => ({
      ...p,
      totalNews: Math.max(0, (p.totalNews || 1) - 1),
    }));
    if (onNewsDeleted) {
      onNewsDeleted(deletedId);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // If search is empty, fetch all news
      fetchNews(1, selectedCategory, '');
      return;
    }

    setSearchLoading(true);
    try {
      await fetchNews(1, selectedCategory, searchQuery);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchNews(1, category, searchQuery);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    fetchNews(page, selectedCategory, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    fetchNews(1, selectedCategory, '');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const NewsModal = ({ article, onClose }) => {
    if (!article) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}></div>
        <div className="relative bg-white w-full max-w-3xl mx-4 rounded-lg shadow-xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-xl font-semibold text-gray-900">
              {article.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-4 space-y-4 max-h-[80vh] overflow-auto">
            {article.image && (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-64 object-cover rounded"
              />
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <AuthorBadge 
                author={article.author} 
                currentUser={currentUser}
                isOwner={currentUser && article.author?._id === currentUser._id}
              />
              <div>{formatDate(article.createdAt)}</div>
            </div>
            <div className="prose max-w-none whitespace-pre-wrap">
              {article.content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary mt-4">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span>All News</span>
            </div>
          </button>
          
          {currentUser && (
            <button
              onClick={() => handleTabChange('my')}
              className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'my'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>My News</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${activeTab === 'my' ? 'your' : ''} news by title or content...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pr-12 pl-4 py-3 text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || searchLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50">
              {searchLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category ||
                (category === 'All' && !selectedCategory)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={loading}>
              {category}
            </button>
          ))}
        </div>

        {/* Results Summary */}
        {!loading && (
          <div className="text-center text-gray-600 mb-4">
            {searchQuery ? (
              <p>
                Found {pagination.totalNews} result
                {pagination.totalNews !== 1 ? 's' : ''} for "{searchQuery}"
                {selectedCategory &&
                  selectedCategory !== 'All' &&
                  ` in ${selectedCategory}`}
                {activeTab === 'my' && ' in your news'}
              </p>
            ) : (
              <p>
                Showing {pagination.totalNews} news article
                {pagination.totalNews !== 1 ? 's' : ''}
                {selectedCategory &&
                  selectedCategory !== 'All' &&
                  ` in ${selectedCategory}`}
                {activeTab === 'my' && ' from your collection'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {news.map(article => (
          <NewsItem
            key={article._id || article.id}
            article={article}
            currentUser={currentUser}
            onClick={() => setSelectedArticle(article)}
            onDeleted={handleDeleted}
          />
        ))}
      </div>

      {/* No Results */}
      {!loading && news.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'my' ? 'No news found in your collection' : 'No news found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? `No articles match your search for "${searchQuery}"`
              : activeTab === 'my' 
                ? 'You haven\'t created any news articles yet'
                : 'No articles available at the moment'}
          </p>
          {searchQuery && (
            <button onClick={clearSearch} className="btn btn-outline">
              Clear Search
            </button>
          )}
          {activeTab === 'my' && !searchQuery && (
            <button 
              onClick={() => window.location.href = '/add-news'} 
              className="btn btn-primary">
              Create Your First News
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center mt-12 space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Previous
          </button>

          <div className="flex space-x-1">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      page === pagination.currentPage
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}>
                    {page}
                  </button>
                );
              }
            )}
          </div>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      <NewsModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
};

export default NewsTabs;
