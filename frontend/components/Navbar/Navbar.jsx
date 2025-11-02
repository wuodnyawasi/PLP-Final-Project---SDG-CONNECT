import React, { useState } from 'react'
import './Navbar.css'
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useLocation } from "react-router-dom";


const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleToggle = () => {
    setIsOpen(!isOpen);
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
        <li className={location.pathname === "/contact" ? "active" : ""}>
          <Link to="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link>
        </li>
        <li className={location.pathname === "/profile" ? "active" : ""}>
          <Link to="/profile" onClick={() => setIsOpen(false)}>Profile</Link>
        </li>
        <li className={location.pathname === "/projects" ? "active" : ""}>
          <Link to="/projects" onClick={() => setIsOpen(false)}>Projects</Link>
        </li>
      </ul>
     <div className="navbar-right">
        <button className="login-btn">Login</button>
        <div className="search-icon">
            <FaSearch size={25} style={{ cursor: 'pointer', color: 'white' }} />
        </div>
        </div>

    </div>
  )
}

export default Navbar

