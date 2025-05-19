import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Clock } from 'lucide-react';

const ComingSoonPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <Clock size={64} className="text-primary mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-text-primary mb-4">Coming Soon</h1>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          We're working hard to bring you this feature. Please check back later.
        </p>
        <Link
          to="/dashboard"
          className="btn btn-primary inline-flex"
        >
          <Home size={20} className="mr-2" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ComingSoonPage;