import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; // Navbar shared across all pages
import Footer from "./components/Footer"; // Footer shared across all pages
import LandingPage from "./pages/LandingPage"; // Landing page
import Sell from "./pages/Sell"; // Sell page
import GetByYourChoice from "./pages/GetByYourChoice"; // Get By Your Choice page
import BuyNow from "./pages/BuyNow"; // Buy Now page
import Contact from "./pages/Contact"; // Contact page
import Cart from "./pages/Cart"; // Cart page
import Login from "./pages/Login"; // Login page
import Signup from "./pages/Signup"; // Signup page
import CheckoutForm from "./pages/CheckoutForm"; // Checkout form
import UsedPhones from "./pages/UsedPhones"; // Used phones (separate page)

import NewPhones from "./pages/NewPhones";
import MobileRecommendationChatbot from "./pages/MobileRecommendationChatbot";
import CheckoutPage from "./pages/CheckoutPage";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  // Cart state managed in App component so it persists across routes
  const [cartItems, setCartItems] = useState([]);

  return (
    <Router>
      {/* Navbar is shown on all pages */}
      <Navbar />

      {/* Define Routes for the pages */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/buy" element={<BuyNow setCartItems={setCartItems} />} />
        <Route path="/checkout" element={<CheckoutForm />} />
        <Route path="/cart" element={<Cart cartItems={cartItems} setCartItems={setCartItems} />}
        />
        <Route path="/sell" element={<Sell />} /> {/* Sell Page */}
        <Route path="/used-phones" element={<UsedPhones />} />{" "}
        <Route path="/new-phones" element={< NewPhones/>} />
        
        <Route path="/contact" element={<Contact />} />
        <Route path="/get-by-your-choice" element={<GetByYourChoice />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mobilerec" element={<MobileRecommendationChatbot />} />
          <Route path="/checkoutpage" element={<CheckoutPage/>} />
      </Routes>

      {/* Footer is shown on all pages */}
      <Footer />
    </Router>
  );
}

export default App;
