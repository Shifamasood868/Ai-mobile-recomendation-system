import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./cart.css"

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(savedCartItems);
  }, []);

  const handleQuantityChange = (id, quantity) => {
    const updatedCartItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: parseInt(quantity) } : item
    );
    setCartItems(updatedCartItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
  };

  const handleRemoveItem = (id) => {
    const updatedCartItems = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCartItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
  };

  const totalBill = cartItems.reduce((total, phone) => {
    const price = parseFloat(phone.price.replace("$", "").replace(",", ""));
    return total + price * phone.quantity;
  }, 0);

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p>Your cart is empty. Start adding items to your cart.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.image}
                alt={item.name}
                className="cart-item-image"
              />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p>{item.specs}</p>
                <p>
                  <strong>{item.price}</strong>
                </p>
                <div className="quantity-selector">
                  <label>Quantity: </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || 1}
                    onChange={(e) =>
                      handleQuantityChange(item.id, e.target.value)
                    }
                    className="quantity-input"
                  />
                </div>
              </div>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="remove-item-btn"
              >
                &#10005;
              </button>
            </div>
          ))
        )}
      </div>

      <div className="total">
        <h3>Total: ${totalBill.toFixed(2)}</h3>
      </div>

      <div className="cart-actions">
        <button
          className="continue-shopping-btn"
          onClick={() => navigate("/new-phones")}
        >
          Continue Shopping
        </button>
        <button
          className="checkout-btn"
          disabled={cartItems.length === 0}
          onClick={() => navigate("/checkoutpage")}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;