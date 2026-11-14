import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#1a1d21] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-400 text-lg mb-6">Page not found</p>
        <Link
          to="/"
          className="text-[#4a9eed] hover:text-[#6ab0f5] font-medium hover:underline"
        >
          Go back to Mini Slack
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
