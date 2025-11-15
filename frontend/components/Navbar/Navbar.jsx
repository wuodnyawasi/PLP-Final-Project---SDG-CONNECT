import React, { useState, useEffect } from 'react'
import './Navbar.css'
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useLocation } from "react-router-dom";
import LoginModal from '../modal/LoginModal';


const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in on component mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    // Listen for login events
    const handleLogin = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    window.addEventListener('userLoggedIn', handleLogin);

    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className='navbar'>
        <div className='logo-text'>
    SDG<span className='logo-accent'>Connect</span>
</div>

    <div className="menu-toggle" onClick={handleToggle}>
        {isOpen ? <FaTimes size={28} color="white" /> : <FaBars size={28} color="white" />}
      </div>
   
     <ul className={`navbar-menu ${isOpen ? "active" : ""}`}>
        <li className={location.pathname === "/" ? "active" : ""}>
          <Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
        </li>
        <li className={location.pathname === "/about" ? "active" : ""}>
          <Link to="/about" onClick={() => setIsOpen(false)}>About</Link>
        </li>
        {!user?.isAdmin && (
          <>
            <li className={location.pathname === "/contact" ? "active" : ""}>
              <Link to="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link>
            </li>
            <li className={location.pathname === "/donate" ? "active" : ""}>
              <Link to="/donate" onClick={() => setIsOpen(false)}>Donate</Link>
            </li>
          </>
        )}
        {user && (
          <>
            <li className={location.pathname === "/profile" ? "active" : ""}>
              <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
            </li>

          </>
        )}
        <li className={location.pathname === "/projects" ? "active" : ""}>
          <Link to="/projects" onClick={() => setIsOpen(false)}>Projects</Link>
        </li>
      </ul>
     <div className="navbar-right">
        {user ? (
          <div className="user-info">
            <span className="user-name">{user.name} logged in</span>
            {user.isAdmin && (
              <Link to="/admin" className="admin-link" onClick={() => setIsOpen(false)}>Admin Panel</Link>
            )}
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>Login</button>
        )}
        <div className="search-icon">
            <FaSearch size={25} style={{ cursor: 'pointer', color: 'white' }} />
        </div>
        </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

    </div>
  )
}

export default Navbar

