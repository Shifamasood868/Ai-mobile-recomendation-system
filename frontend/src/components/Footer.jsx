import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-columns">
        <div>
          <h3>ShopApp</h3>
          <p>Your go-to fashion destination.</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
        <div>
          <h3>Follow Us</h3>
          <div className="social-icons">
            <i className="fab fa-facebook"></i>
            <i className="fab fa-instagram"></i>
            <i className="fab fa-twitter"></i>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
