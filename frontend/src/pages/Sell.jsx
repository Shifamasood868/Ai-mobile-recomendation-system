import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: "http://localhost:5000",
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const Sell = () => {
  const [formData, setFormData] = useState({
    category: "mobile",
    images: [],
    brand: "",
    adTitle: "",
    description: "",
    price: "",
    location: "",
    name: "",
    phoneNumber: "",
    showPhoneNumber: false,
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!token) {
      setErrorMessage("Please login to post an ad");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      // Pre-fill user details if available
      setFormData(prev => ({
        ...prev,
        name: user?.name || "",
        phoneNumber: user?.phoneNumber || ""
      }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const handleTogglePhoneNumber = () => {
    setFormData({ ...formData, showPhoneNumber: !formData.showPhoneNumber });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    if (!formData.adTitle || !formData.brand || !formData.price || 
        !formData.location || !formData.phoneNumber) {
      setErrorMessage("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("Authentication required");

      const data = new FormData();
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'images') data.append(key, value);
      });
      
      // Append images
      formData.images.forEach(image => {
        data.append('images', image);
      });

      const response = await api.post("/", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccessMessage("Ad submitted successfully!");
      
      // Reset form
      setFormData({
        category: "mobile",
        images: [],
        brand: "",
        adTitle: "",
        description: "",
        price: "",
        location: "",
        name: formData.name, // Keep user's name
        phoneNumber: formData.phoneNumber, // Keep phone number
        showPhoneNumber: false,
      });

      setTimeout(() => navigate("/"), 2000);

    } catch (error) {
      console.error("Submission error:", error);
      
      if (error.response?.status === 401) {
        setErrorMessage("Session expired. Please login again");
        localStorage.removeItem("userToken");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErrorMessage(error.response?.data?.message || "Submission failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="container">
      <div className="form-container">
        <h2>Sell Your Used Phone</h2>
   {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="mobile">Mobile Phones</option>
            </select>
          </div>
          <div className="form-group">
            <label>Upload Images (Max 5)</label>
            <input 
              type="file" 
              multiple 
              onChange={handleFileChange} 
              accept="image/*"
              max="5"
              required
            />
          </div>
          <div className="form-group">
            <label>Brand</label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
            >
              <option value="">Select Brand</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Tecno">Tecno</option>
              <option value="Redmi">Redmi</option>
              <option value="POCO">POCO</option>
            </select>
          </div>
          <div className="form-group">
            <label>Ad Title</label>
            <input
              type="text"
              name="adTitle"
              value={formData.adTitle}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.showPhoneNumber}
                onChange={handleTogglePhoneNumber}
              />
              Show Phone Number in Ad
            </label>
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Ad"}
          </button>
        </form>
        {successMessage && <p className="success-message">{successMessage}</p>}
      </div>

      {/* Video Section */}
      <div className="media-container">
        <h3>Explore Our Latest Products</h3>
        <div className="media-gallery">
          <div className="media-item">
            <video autoPlay loop muted className="media-video">
              <source
                src="https://videos.pexels.com/video-files/4232959/4232959-hd_1920_1080_24fps.mp4"
                type="video/mp4"
              />
            </video>
          </div>
          <div className="media-item">
            <video autoPlay loop muted className="media-video">
              <source
                src="https://videos.pexels.com/video-files/2928382/2928382-hd_1920_1080_30fps.mp4"
                type="video/mp4"
              />
            </video>
            <video autoPlay loop muted className="media-video">
              <source
                src="https://videos.pexels.com/video-files/3760909/3760909-hd_1920_1080_30fps.mp4"
                type="video/mp4"
              />
            </video>
            <video autoPlay loop muted className="media-video">
              <source
                src="https://videos.pexels.com/video-files/3252974/3252974-uhd_2560_1440_25fps.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sell;