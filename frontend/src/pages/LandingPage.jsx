import React from "react";
import HeroSection from "../components/HeroSection";
import Slider from "../components/Slider";
import ProductGrid from "../components/ProductGrid";
import HowItWorks from "../components/HowItWorks";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <HeroSection />

      <ProductGrid />
      <Slider />
      <HowItWorks />
    </div>
  );
};

export default LandingPage;
