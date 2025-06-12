import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [country, setCountry] = useState("Pakistan"); // Default country
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format.";
    }

    // Validate recovery email format
    if (!emailRegex.test(recoveryEmail)) {
      newErrors.recoveryEmail = "Invalid recovery email format.";
    }

    // Validate phone number (10-15 digits)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      newErrors.phone = "Phone number must be 10-15 digits.";
    }

    // Validate password length
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    // Validate password match
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          recoveryEmail,
          country,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("userToken", data.token);
        setMessage("✅ Signup successful! Redirecting to BuyNow...");
        setTimeout(() => navigate("/buy"), 2000);
      } else {
        if (data.message === "User already exists") {
          setErrors({
            email:
              "⚠️ This email is already registered. Please log in or use a different email.",
          });
        } else {
          setMessage(data.message);
        }
      }
    } catch (error) {
      setMessage("❌ Something went wrong. Try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign Up</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {errors.confirmPassword && (
            <p className="error">{errors.confirmPassword}</p>
          )}

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          {errors.phone && <p className="error">{errors.phone}</p>}

          <input
            type="email"
            placeholder="Recovery Email"
            value={recoveryEmail}
            onChange={(e) => setRecoveryEmail(e.target.value)}
            required
          />
          {errors.recoveryEmail && (
            <p className="error">{errors.recoveryEmail}</p>
          )}

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          >
            <option value="Pakistan">Pakistan</option>
            <option value="India">India</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="Canada">Canada</option>
            <option value="Germany">Germany</option>
            <option value="Australia">Australia</option>
          </select>

          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
