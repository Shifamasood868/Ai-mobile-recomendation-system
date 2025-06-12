import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NewPhones.css";

// Sample phone data
const phones = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    image: "https://imageio.forbes.com/specials-images/imageserve/641397e79f04500b85460b8f/Apple--iPhone-15--iPhone-15-Pro-Max--iPhone-15-Pro--iPhone-15-Pro-design--iPhone-15/0x0.jpg?format=jpg&crop=923,692,x364,y0,safe&width=960",
    specs: "6.7-inch, A17 Bionic chip, 48MP camera",
    price: "$1,099",
  },
  {
    id: 2,
    name: "Samsung Galaxy S23 Ultra",
    image: "https://bgr.com/wp-content/uploads/2023/01/galaxy-s23-ultra-specs-leak-1.jpg?quality=82&strip=all",
    specs: "6.8-inch, Snapdragon 8 Gen 2, 200MP camera",
    price: "$1,299",
  },
  {
    id: 3,
    name: "Google Pixel 8 Pro",
    image: "https://media.wired.com/photos/651c68d69132e1b7f804211c/1:1/w_1324,h_1324,c_limit/Google-Pixel-8-Event-Gear.jpg",
    specs: "6.7-inch, Tensor G3 chip, 50MP camera",
    price: "$999",
  },
  {
    id: 4,
    name: "OnePlus 11",
    image: "https://www.cnet.com/a/img/resize/c79498e40bd93d1f5bade84fc93fb91fa7da7f5a/hub/2023/02/05/9bd12b8d-db91-426d-9f44-22381f35232b/oneplus-11-review-cnet-lanxon-promo-33.jpg?auto=webp&fit=crop&height=1200&width=1200",
    specs: "6.7-inch, Snapdragon 8 Gen 2, 50MP camera",
    price: "$799",
  },
  {
    id: 5,
    name: "Xiaomi 13 Pro",
    image: "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-13-pro-colors-1.jpg",
    specs: "6.73-inch, Snapdragon 8 Gen 2, 50MP camera",
    price: "$899",
  },
  {
    id: 6,
    name: "Oppo Find X6 Pro",
    image: "https://i.ytimg.com/vi/5uwgO5j47mc/maxresdefault.jpg",
    specs: "6.82-inch, Snapdragon 8 Gen 2, 50MP camera",
    price: "$1,100",
  },
  {
    id: 7,
    name: "Sony Xperia 1 V",
    image: "https://i.ytimg.com/vi/6seOBFtpjug/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB-nU_NThpvosCCyI7MMtHt1D3sfw",
    specs: "6.5-inch, Snapdragon 8 Gen 1, 12MP camera",
    price: "$1,199",
  },
  {
    id: 8,
    name: "Samsung Galaxy Z Fold 5",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHEgt0-en7K12exc7M7By0fHZqmFzi5xNAFQ&s",
    specs: "7.6-inch foldable, Snapdragon 8 Gen 2, 50MP camera",
    price: "$1,800",
  },
  {
    id: 9,
    name: "Redmi 13c",
    image: "https://www.techadvisor.com/wp-content/uploads/2024/10/P_20240901_141008-3.jpg?quality=50&strip=all",
    specs: "6.78-inch, Snapdragon 8 Gen 2, 50MP camera",
    price: "$1,049",
  },
  {
    id: 10,
    name: "Realme GT 2",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV62oZcORIcst_YTQfAOgbwG4hCzbVajFcLA&s",
    specs: "6.7-inch, Snapdragon 8 Gen 1, 50MP camera",
    price: "$799",
  },
  {
    id: 11,
    name: "Motorola Edge+ (2023)",
    image: "https://m.media-amazon.com/images/I/71m+dNHzoGL.jpg",
    specs: "6.7-inch, Snapdragon 8 Gen 2, 50MP camera",
    price: "$899",
  },
  {
    id: 12,
    name: "Redmi 14c",
    image: "https://i.ytimg.com/vi/TCHGuo44HtY/maxresdefault.jpg",
    specs: "6.81-inch, Snapdragon 8 Gen 2, 50MP camera",
    price: "$1,099",
  },
  {
    id: 13,
    name: "Vivo X90 Pro",
    image: "https://i.ytimg.com/vi/XGh3TYkrHmg/maxresdefault.jpg",
    specs: "6.78-inch, Snapdragon 8 Gen 2, 50MP camera",
    price: "$999",
  },
  {
    id: 14,
    name: "Nokia X30 5G",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRThzYRekUTJH7yHzO116NzRWovTRoDeBXY1g&s",
    specs: "6.43-inch, Snapdragon 695, 50MP camera",
    price: "$599",
  },
  {
    id: 15,
    name: "LG Velvet",
    image: "https://www.zdnet.com/a/img/resize/8b430c298681d07e45863477efe2a33fe8fcbfc4/2020/06/19/6209af92-19ad-459c-97c8-92e77207572b/lg-velvet-main-1.jpg?auto=webp&fit=crop&height=675&width=1200",
    specs: "6.8-inch, Snapdragon 765G, 48MP camera",
    price: "$549",
  },
  {
    id: 16,
    name: "Sharp Aquos R6",
    image: "https://static1.xdaimages.com/wordpress/wp-content/uploads/2021/06/Sharp-Aquos-R6-hands-on-XDA112.jpg",
    specs: "6.6-inch, Snapdragon 888, 20MP camera",
    price: "$999",
  },
  {
    id: 17,
    name: "Huawei P60 Pro",
    image: "https://i.ytimg.com/vi/Ft2Bf1OnXnI/maxresdefault.jpg",
    specs: "6.67-inch, Snapdragon 8 Gen 2, 50MP camera",
    price: "$1,299",
  },
  {
    id: 18,
    name: "ZTE Axon 40 Ultra",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB2TauwefwGYBG3luahU7pvJ1i02v7gBpGoA&s",
    specs: "6.8-inch, Snapdragon 8 Gen 1, 64MP camera",
    price: "$799",
  },
  {
    id: 19,
    name: "Poco F4",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXMyZSatiJyo2pQW19O4ZczufM5XQB927tiw&s",
    specs: "6.67-inch, Snapdragon 870, 64MP camera",
    price: "$399",
  },
  {
    id: 20,
    name: "Infinix Zero Ultra",
    image: "https://i.ytimg.com/vi/cuJFu6-MotM/maxresdefault.jpg",
    specs: "6.8-inch, Dimensity 920, 200MP camera",
    price: "$499",
  },
];

const NewPhones = () => {
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(savedCartItems);
  }, []);

  const handleBuyNowClick = (phone) => {
    const updatedCartItems = [...cartItems, { ...phone, quantity: 1 }];
    setCartItems(updatedCartItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedCartItems));
    alert(`Your item ${phone.name} has been added to the cart.`);
  };

  const handleViewCart = () => {
    navigate("/cart");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  // Filter phones based on search term
  const filteredPhones = phones.filter(phone => 
    phone.name.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="buy-now">
      {/* Show message and View Cart button only if cart has items */}
      {cartItems.length > 0 && (
        <div className="cart-message">
          <p>To continue with your cart, click here:</p>
          <button onClick={handleViewCart} className="small-view-cart-btn">
            View Cart ({cartItems.length})
          </button>
        </div>
      )}

      <h2>Buy Latest Phones Now</h2>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search phones by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <div className="phones-list">
        {filteredPhones.length > 0 ? (
          filteredPhones.map((phone) => (
            <div key={phone.id} className="phone-card">
              <img src={phone.image} alt={phone.name} className="phone-image" />
              <div className="phone-info">
                <h3>{phone.name}</h3>
                <p>{phone.specs}</p>
                <p>
                  <strong>{phone.price}</strong>
                </p>
                <button
                  onClick={() => handleBuyNowClick(phone)}
                  className="buy-now-btn"
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No phones found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewPhones;