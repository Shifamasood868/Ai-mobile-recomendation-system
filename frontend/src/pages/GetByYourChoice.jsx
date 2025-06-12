import React, { useState } from "react";
import styles from "./PhoneRecommendation.module.css";

const GetByYourChoice = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedFeatures, setSelectedFeatures] = useState({
        budget: false,
        battery: false,
        screen: false,
        performance: false
    });

    const [budget, setBudget] = useState("");
    const [battery, setBattery] = useState("");
    const [screenSize, setScreenSize] = useState("");
    const [ram, setRAM] = useState("");
    const [processor, setProcessor] = useState("");

    const handleFeatureChange = (e) => {
        const { name, checked } = e.target;
        setSelectedFeatures(prev => ({
            ...prev,
            [name]: checked
        }));

        // Reset specific options when feature is unchecked
        if (name === 'budget' && !checked) {
            setBudget("");
        } else if (name === 'battery' && !checked) {
            setBattery("");
        } else if (name === 'screen' && !checked) {
            setScreenSize("");
        } else if (name === 'performance' && !checked) {
            setRAM("");
            setProcessor("");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setRecommendations([]);

        try {
            // Prepare payload for your Flask API
            const payload = {
                'RAM': ram ? parseInt(ram) : 6, // Default to 6GB if not selected
                'Battery Capacity': battery ? parseInt(battery) : 4000, // Default to 4000mAh
                'Launched Price (Pakistan)': budget ? parseInt(budget) : 50000, // Default to 50,000 PKR
                'Processor': processor || "Snapdragon 680", // Default processor
                'Screen Size': screenSize ? parseFloat(screenSize) : 6.0 // Default to 6.0 inches
            };

            console.log("Submitting payload:", payload);
            
            const response = await fetch('http://localhost:4000/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            console.log("API response:", result);
            
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to get recommendations');
            }

            setRecommendations(result.recommendations || []);
        } catch (err) {
            console.error("Error:", err);
            setError(err.message || 'An error occurred while fetching recommendations');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.glassCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Discover Your Ideal Smartphone</h1>
                    <p className={styles.subtitle}>Select what matters most to you</p>
                </div>

                <form onSubmit={handleFormSubmit} className={styles.form}>
                    <div className={styles.featureGrid}>
                        {[
                            { name: "budget", label: "Budget", icon: "💲", desc: "Affordable options" },
                            { name: "battery", label: "Battery", icon: "🔋", desc: "Long-lasting power" },
                            { name: "screen", label: "Display", icon: "🖥️", desc: "Large, vibrant screen" },
                            { name: "performance", label: "Performance", icon: "⚡", desc: "Top-tier performance" }
                        ].map((feature) => (
                            <label key={feature.name} className={`${styles.featureCard} ${
                                selectedFeatures[feature.name] ? styles.featureCardActive : ""
                            }`}>
                                <input
                                    type="checkbox"
                                    name={feature.name}
                                    checked={selectedFeatures[feature.name]}
                                    onChange={handleFeatureChange}
                                    className={styles.hiddenCheckbox}
                                />
                                <div className={styles.featureIcon}>{feature.icon}</div>
                                <div className={styles.featureContent}>
                                    <h3>{feature.label}</h3>
                                    <p>{feature.desc}</p>
                                </div>
                                <div className={styles.checkmark}></div>
                            </label>
                        ))}
                    </div>
                    
                    {selectedFeatures.budget && (
                        <div className={styles.featureOptionsContainer}>
                            <h3 className={styles.featureOptionsTitle}>Enter your budget (PKR):</h3>
                            <input
                                type="number"
                                placeholder="e.g. 50000"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className={styles.textInput}
                            />
                            <p className={styles.inputHint}>Enter the maximum amount you want to spend</p>
                        </div>
                    )}
                    
                    {selectedFeatures.battery && (
                        <div className={styles.featureOptionsContainer}>
                            <h3 className={styles.featureOptionsTitle}>Enter desired battery capacity (mAh):</h3>
                            <input
                                type="number"
                                placeholder="e.g. 5000"
                                value={battery}
                                onChange={(e) => setBattery(e.target.value)}
                                className={styles.textInput}
                            />
                            <p className={styles.inputHint}>Typical range: 3000-7000 mAh</p>
                        </div>
                    )}
                    
                    {selectedFeatures.screen && (
                        <div className={styles.featureOptionsContainer}>
                            <h3 className={styles.featureOptionsTitle}>Enter desired screen size (inches):</h3>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="e.g. 6.5"
                                value={screenSize}
                                onChange={(e) => setScreenSize(e.target.value)}
                                className={styles.textInput}
                            />
                            <p className={styles.inputHint}>Typical range: 5.0-7.0 inches</p>
                        </div>
                    )}
                    
                    {selectedFeatures.performance && (
                        <div className={styles.featureOptionsContainer}>
                            <h3 className={styles.featureOptionsTitle}>Performance Options:</h3>
                            <div className={styles.performanceSection}>
                                <h4>RAM (GB):</h4>
                                <input
                                    type="number"
                                    placeholder="e.g. 8"
                                    value={ram}
                                    onChange={(e) => setRAM(e.target.value)}
                                    className={styles.textInput}
                                />
                                <p className={styles.inputHint}>Typical options: 4, 6, 8, 12 GB</p>
                            </div>
                            
                            <div className={styles.performanceSection}>
                                <h4>Processor:</h4>
                                <input
                                    type="text"
                                    placeholder="e.g. Snapdragon 8 Gen 2"
                                    value={processor}
                                    onChange={(e) => setProcessor(e.target.value)}
                                    className={styles.textInput}
                                />
                                <p className={styles.inputHint}>Examples: Snapdragon 888, Exynos 2200, Dimensity 9000</p>
                            </div>
                        </div>
                    )}
                    
                    <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className={styles.spinner}></span>
                        ) : (
                            <>
                                Find My Perfect Phone
                                <span className={styles.arrowIcon}>→</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
            
            {error && (
                <div className={styles.errorCard}>
                    <p>⚠️ {error}</p>
                </div>
            )}
            
            {recommendations.length > 0 && (
                <div className={`${styles.resultCard} ${styles.resultCardVisible}`}>
                    <div className={styles.resultHeader}>
                        <h2>Recommended Phones</h2>
                        <p className={styles.resultSubtitle}>Based on your preferences</p>
                    </div>
                    
                    <div className={styles.recommendationsList}>
                        {recommendations.map((phone, index) => (
                            <div key={`${phone['Model Name']}-${index}`} className={styles.phoneCard}>
                                <div className={styles.phoneRank}>{index + 1}</div>
                                <div className={styles.phoneInfo}>
                                    <h3>{phone['Model Name']}</h3>
                                    <div className={styles.phoneDetails}>
                                        {phone['RAM'] && <span>RAM: {phone['RAM']}GB</span>}
                                        {phone['Battery Capacity'] && <span>Battery: {phone['Battery Capacity']}mAh</span>}
                                        {phone['Launched Price (Pakistan)'] && (
                                            <span>Price: PKR {phone['Launched Price (Pakistan)'].toLocaleString()}</span>
                                        )}
                                        {phone['Screen Size'] && <span>Screen: {phone['Screen Size']}"</span>}
                                        {phone['Processor'] && <span>Processor: {phone['Processor']}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {!error && !isLoading && recommendations.length === 0 && (
                <div className={styles.placeholderCard}>
                    <p>Select your preferences to see recommendations</p>
                </div>
            )}
        </div>
    );
};

export default GetByYourChoice;