import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/images/logo.png";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = Boolean(localStorage.getItem("userToken"));

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <img src={Logo} alt="CellPhone Advisor Logo" className="logo-image" />
        <span>CellPhone Advisor</span>
      </div>

      {/* Hamburger Icon for Mobile */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li>
          <Link
            to="/"
            className={location.pathname === "/" ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/buy"
            className={location.pathname === "/buy" ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            Buy Now
          </Link>
        </li>
        <li>
          <Link
            to="/get-by-your-choice"
            className={
              location.pathname === "/get-by-your-choice" ? "active" : ""
            }
            onClick={() => setMenuOpen(false)}
          >
            Get By Your Choice
          </Link>
        </li>
        <li>
          <Link
            to="/sell"
            className={location.pathname === "/sell" ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            Sell
          </Link>
        </li>
        <li>
          <Link
            to="/contact"
            className={location.pathname === "/contact" ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
        </li>
        {isAuthenticated ? (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        ) : (
          <li>
            <Link
              to="/login"
              className={location.pathname === "/login" ? "active" : ""}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
