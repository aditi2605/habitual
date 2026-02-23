import { useNavigate } from 'react-router-dom';
import { removeToken } from '../../utils/auth';

const NavBar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate('/', { replace: true }); // ← Add replace: true
    window.location.reload(); // ← Force reload to clear state
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
      {/* ... rest of navbar ... */}
      <button
        onClick={handleLogout}
        className="text-sm px-4 py-2 rounded-lg bg-surface border border-border hover:border-green transition"
      >
        Logout
      </button>
    </nav>
  );
};

export default NavBar;