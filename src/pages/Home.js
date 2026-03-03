import React, { useState, useEffect } from 'react';
import NewsTabs from '../components/NewsTabs';

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user from storage
  useEffect(() => {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) setCurrentUser(JSON.parse(userStr));
    } catch {}
  }, []);

  // Handle news deletion (for any parent components that need to know)
  const handleNewsDeleted = (deletedId) => {
    // This can be used by parent components if needed
    console.log('News deleted:', deletedId);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Latest News</h1>
        <p className="text-lg text-gray-600 mb-8">
          Stay updated with the most recent news and developments
        </p>
      </div>

      {/* News Tabs Component */}
      <NewsTabs 
        currentUser={currentUser} 
        onNewsDeleted={handleNewsDeleted}
      />
    </div>
  );
};

export default Home;
