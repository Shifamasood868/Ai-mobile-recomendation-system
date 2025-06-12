import React, { useState } from "react";
import { motion } from "framer-motion";

const CheckoutForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    postalCode: "",
    contact: "",
    paymentMethod: "Cash on Delivery",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};

    // Name validation (at least 3 characters, only letters and spaces)
    if (!/^[A-Za-z\s]{3,}$/.test(formData.name)) {
      newErrors.name = "Name must be at least 3 letters.";
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    // Address validation (cannot be empty)
    if (formData.address.trim() === "") {
      newErrors.address = "Address cannot be empty.";
    }

    // Postal Code validation (5 digits)
    if (!/^\d{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = "Postal code must be exactly 5 digits.";
    }

    // Contact Number validation (11 digits)
    if (!/^\d{11}$/.test(formData.contact)) {
      newErrors.contact = "Contact number must be 11 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error when typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Order Details:", formData);
      alert("✅ Order placed successfully!");
    }
  };

  return (
    <motion.div
      className="checkout-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="checkout-title">🛒 Checkout</h2>
      <motion.form
        onSubmit={handleSubmit}
        className="checkout-form"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {[
          { name: "name", type: "text", label: "Full Name" },
          { name: "email", type: "email", label: "Email Address" },
          { name: "address", type: "text", label: "Address" },
          { name: "postalCode", type: "text", label: "Postal Code" },
          { name: "contact", type: "tel", label: "Contact Number" },
        ].map(({ name, type, label }) => (
          <motion.div
            key={name}
            className="input-group"
            whileFocus={{ scale: 1.02 }}
          >
            <label>{label}:</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
            />
            {errors[name] && <p className="error">{errors[name]}</p>}
          </motion.div>
        ))}

        <div className="input-group">
          <label>Payment Method:</label>
          <input
            type="text"
            value="Cash on Delivery"
            disabled
            className="disabled-input"
          />
        </div>

        <motion.button
          type="submit"
          className="submit-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🚀 Place Order
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default CheckoutForm;
