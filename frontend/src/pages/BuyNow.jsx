import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BuyNow() {
  const [showModal, setShowModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setShowModal(true); // Show login/signup modal for unauthenticated users
    } else {
      setIsAuthenticated(true);
      setShowModal(true); // Show buy modal for authenticated users
    }
  }, [navigate]);

  const handleNewPhone = () => {
    navigate("/new-phones");
  };

  const handleUsedPhone = () => {
    navigate("/used-phones");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleClose = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <div className="buy-container">
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            {isAuthenticated ? (
              <>
                <h3>What type of phone do you want to buy?</h3>
                <button
                  onClick={handleNewPhone}
                  className="modal-btn new-phone"
                >
                  New Phone
                </button>
                <button
                  onClick={handleUsedPhone}
                  className="modal-btn used-phone"
                >
                  Used Phone
                </button>
                <button onClick={handleClose} className="modal-btn cancel">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3>You need to log in or sign up to proceed</h3>
                <button onClick={handleLogin} className="modal-btn login">
                  Login
                </button>
                <button onClick={handleSignup} className="modal-btn signup">
                  Sign Up
                </button>
                <button onClick={handleClose} className="modal-btn cancel">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyNow;
