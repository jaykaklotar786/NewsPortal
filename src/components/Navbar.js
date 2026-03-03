import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getFromStorage = (key) => {
    return sessionStorage.getItem(key);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = getFromStorage("token");
      const userData = getFromStorage("user");

      if (token && userData) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;

          if (payload.exp && payload.exp < currentTime) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            setIsAuthenticated(false);
            setUser(null);
          } else {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
          }
        } catch (error) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    navigate("/");
  };

  const getNavLinks = () => {
    if (isAuthenticated) {
      const links = [
        { path: "/", label: "Home" },
        { path: "/add-news", label: "Add News" },
      ];
      if (user?.role === "admin") {
        links.push({ path: "/admin", label: "Admin Panel" });
      }
      return links;
    } else {
      return [
        { path: "/", label: "Home" },
        { path: "/login", label: "Login" },
        { path: "/register", label: "Register" },
      ];
    }
  };

  const navLinks = getNavLinks();

  const RoleBadge = ({ role }) => (
    <span
      className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
        role === "admin"
          ? "bg-purple-100 text-purple-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {role}
    </span>
  );

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900">News Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${
                  isActive(link.path) ? "nav-link-active" : "nav-link-inactive"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* User info and logout */}
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm flex items-center">
                  Welcome, {user?.name || user?.email || "User"}
                  {user?.role && <RoleBadge role={user.role} />}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.path)
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile user info and logout */}
              {isAuthenticated && (
                <div className="px-3 py-2 border-t border-gray-200 mt-2">
                  <div className="text-sm text-gray-700 mb-2 flex items-center">
                    Welcome, {user?.name || user?.email || "User"}
                    {user?.role && <RoleBadge role={user.role} />}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-red-500 text-white px-3 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
