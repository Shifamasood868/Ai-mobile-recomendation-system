import React from "react";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Answer a Few Questions",
      description:
        "Tell us your preferences, such as budget, performance needs, and favorite brands.",
      icon: "fas fa-question-circle",
    },
    {
      id: 2,
      title: "Get Personalized Results",
      description:
        "Our system recommends phones tailored to your specific needs.",
      icon: "fas fa-magic",
    },
    {
      id: 3,
      title: "Choose Your Perfect Phone",
      description:
        "Browse through the recommendations and pick the one that suits you best.",
      icon: "fas fa-mobile-alt",
    },
  ];

  return (
    <section className="how-it-works">
      <h2>How It Works</h2>
      <div className="steps">
        {steps.map((step) => (
          <div className="step" data-aos="fade-up" key={step.id}>
            <i className={step.icon}></i>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
