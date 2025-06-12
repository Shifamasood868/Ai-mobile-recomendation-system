import React from "react";

// Import images directly
import image1 from "/src/assets/images/image1.jpg";
import image2 from "/src/assets/images/image2.png";
import image3 from "/src/assets/images/image3.png";

const ProductGrid = () => {
  // Product details with imported images
  const products = [
    {
      id: 1,
      name: "Buy By Just One Click",
      price: "At Your DoorStep",
      image: image1,
    },
    {
      id: 2,
      name: "Get Recommendations",
      price: "And Buy Your Desired Phone",
      image: image2,
    },
    {
      id: 3,
      name: "Sell Your Used Phone",
      price: "At the Price You Want",
      image: image3,
    },
    
  ];

  return (
    <section className="product-grid">
      <h2>Services We Provided</h2>
      <div className="grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            {/* Display Product Image */}
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>
              <b>{product.price}</b>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
