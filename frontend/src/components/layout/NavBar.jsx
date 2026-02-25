import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking a link
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg/95 backdrop-blur-xl border-b border-border shadow-lg' : 'bg-transparent'
      } px-6 md:px-12 py-4`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl md:text-3xl font-serif text-green-light flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green to-green-light rounded-lg flex items-center justify-center text-lg">
              🌿
            </div>
            habitual
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-gray-400 hover:text-white transition">Features</a>
            <a href="#demo" className="text-gray-400 hover:text-white transition">Demo</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</a>
            <a href="#reviews" className="text-gray-400 hover:text-white transition">Reviews</a>
          </div>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/login"
              className="text-sm px-4 py-2 rounded-lg border border-border hover:border-green transition"
            >
              Log in
            </Link>
            <Link 
              to="/signup"
              className="text-sm px-5 py-2 rounded-lg bg-gradient-to-r from-green to-green-light text-white font-semibold hover:shadow-lg hover:shadow-green/20 transition"
            >
              Get started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-border hover:border-green transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'max-h-96 opacity-100 mt-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            {/* Mobile Navigation Links */}
            <a 
              href="#features" 
              onClick={closeMobileMenu}
              className="block text-gray-400 hover:text-green transition py-2 border-b border-border/50"
            >
              Features
            </a>
            <a 
              href="#demo" 
              onClick={closeMobileMenu}
              className="block text-gray-400 hover:text-green transition py-2 border-b border-border/50"
            >
              Demo
            </a>
            <a 
              href="#pricing" 
              onClick={closeMobileMenu}
              className="block text-gray-400 hover:text-green transition py-2 border-b border-border/50"
            >
              Pricing
            </a>
            <a 
              href="#reviews" 
              onClick={closeMobileMenu}
              className="block text-gray-400 hover:text-green transition py-2"
            >
              Reviews
            </a>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-border space-y-3">
              <Link 
                to="/login"
                onClick={closeMobileMenu}
                className="block text-center px-4 py-3 rounded-lg border border-border hover:border-green transition"
              >
                Log in
              </Link>
              <Link 
                to="/signup"
                onClick={closeMobileMenu}
                className="block text-center px-5 py-3 rounded-lg bg-gradient-to-r from-green to-green-light text-white font-semibold hover:shadow-lg hover:shadow-green/20 transition"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default NavBar;