import React, { useState, useEffect } from "react";

const Slider = () => {
  const slides = [
    {
      id: 1,
      title: "Discover the best one",
      description: "Your dream comes true.",
      image:
        "https://images.pexels.com/photos/210990/pexels-photo-210990.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 2,
      title: "On Trending",
      description: "Get ready for that.",
      image:
        "https://images.pexels.com/photos/3183177/pexels-photo-3183177.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 3,
      title: "Best Deals for You",
      description: "Shop now and save big on your favorite items!",
      image:
        "https://images.pexels.com/photos/6567274/pexels-photo-6567274.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Function to go to the next slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

 
  // Auto-slide functionality (changes the slide every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 2000); // Change slide every 2 seconds

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slider">
      <div
        className="slides"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div className="slide" key={slide.id}>
            <img src={slide.image} alt={slide.title} />
            <div className="slide-content">
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
            </div>
          </div>
        ))}
      </div>
     
    </div>
  );
};

export default Slider;
