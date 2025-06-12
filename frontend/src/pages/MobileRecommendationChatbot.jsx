import React, { useState } from "react";
import styles from "./PhoneRecommendation.module.css";

const MobileRecommendationChatbot = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedFeatures, setSelectedFeatures] = useState({
        budget: false,
        battery: false,
        screen: false,
        performance: false
    });

    const [selectedBudgetRange, setSelectedBudgetRange] = useState(null);
    const [selectedBatteryRange, setSelectedBatteryRange] = useState(null);
    const [selectedScreenSize, setSelectedScreenSize] = useState(null);
    const [selectedRAM, setSelectedRAM] = useState(null);
    const [selectedProcessor, setSelectedProcessor] = useState("");
    const [customBudgetMin, setCustomBudgetMin] = useState("");
    const [customBudgetMax, setCustomBudgetMax] = useState("");
    const [showCustomBudget, setShowCustomBudget] = useState(false);

    const budgetRanges = [
        { label: "Under 20,000", min: 0, max: 20000 },
        { label: "20,000 - 50,000", min: 20000, max: 50000 },
        { label: "50,000 - 80,000", min: 50000, max: 80000 },
        { label: "80,000 - 120,000", min: 80000, max: 120000 },
        { label: "120,000 - 200,000", min: 120000, max: 200000 },
        { label: "200,000 - 250,000", min: 200000, max: 250000 },
    ];

    const batteryRanges = [
        { label: "3000-4000 mAh", min: 3000, max: 4000 },
        { label: "4000-5000 mAh", min: 4000, max: 5000 },
        { label: "5000-6000 mAh", min: 5000, max: 6000 },
        { label: "6000+ mAh", min: 6000, max: 10000 },
    ];

    const screenSizes = [
        { label: "Under 5.5 inches", value: 5.0 },
        { label: "5.5 - 6.5 inches", value: 6.0 },
        { label: "6.5+ inches", value: 6.7 },
    ];

    const ramOptions = [
        { label: "4GB", value: 4 },
        { label: "6GB", value: 6 },
        { label: "8GB", value: 8 },
        { label: "12GB+", value: 12 },
    ];

    const handleFeatureChange = (e) => {
        const { name, checked } = e.target;
        setSelectedFeatures(prev => ({
            ...prev,
            [name]: checked
        }));

        // Reset specific options when feature is unchecked
        if (name === 'budget' && !checked) {
            setSelectedBudgetRange(null);
            setCustomBudgetMin("");
            setCustomBudgetMax("");
            setShowCustomBudget(false);
        } else if (name === 'battery' && !checked) {
            setSelectedBatteryRange(null);
        } else if (name === 'screen' && !checked) {
            setSelectedScreenSize(null);
        } else if (name === 'performance' && !checked) {
            setSelectedRAM(null);
            setSelectedProcessor("");
        }
    };

    const handleBudgetRangeChange = (range) => {
        setSelectedBudgetRange(range);
        setShowCustomBudget(false);
        setCustomBudgetMin("");
        setCustomBudgetMax("");
    };

    const handleCustomBudgetToggle = () => {
        setShowCustomBudget(!showCustomBudget);
        if (!showCustomBudget) {
            setSelectedBudgetRange(null);
        }
    };

    const handleBatteryRangeChange = (range) => {
        setSelectedBatteryRange(range);
    };

    const handleScreenSizeChange = (size) => {
        setSelectedScreenSize(size);
    };

    const handleRAMChange = (option) => {
        setSelectedRAM(option);
    };

    const handleProcessorChange = (e) => {
        setSelectedProcessor(e.target.value);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setRecommendations([]);

        try {
            // Determine budget range
            let budgetMin, budgetMax;
            if (showCustomBudget && customBudgetMin && customBudgetMax) {
                budgetMin = parseInt(customBudgetMin);
                budgetMax = parseInt(customBudgetMax);
            } else if (selectedBudgetRange) {
                budgetMin = selectedBudgetRange.min;
                budgetMax = selectedBudgetRange.max;
            } else {
                budgetMin = 50000; // Default
                budgetMax = 80000; // Default
            }

            // Prepare payload for your Flask API
            const payload = {
                'RAM': selectedRAM?.value || 6, // Default to 6GB if not selected
                'Battery Capacity': selectedBatteryRange?.min || 4000, // Default to 4000mAh
                'Launched Price (Pakistan)': budgetMin, // Use the min value of the range
                'Processor': selectedProcessor || "Snapdragon 680", // Default processor
                'Screen Size': selectedScreenSize?.value || 6.0 // Default to 6.0 inches
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
                            <h3 className={styles.featureOptionsTitle}>Select your budget range (PKR):</h3>
                            <div className={styles.optionsGrid}>
                                {budgetRanges.map((range) => (
                                    <label 
                                        key={range.label} 
                                        className={`${styles.optionButton} ${
                                            selectedBudgetRange?.label === range.label ? styles.optionButtonActive : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="budgetRange"
                                            checked={selectedBudgetRange?.label === range.label && !showCustomBudget}
                                            onChange={() => handleBudgetRangeChange(range)}
                                            className={styles.hiddenRadio}
                                        />
                                        {range.label}
                                    </label>
                                ))}
                                <label 
                                    className={`${styles.optionButton} ${
                                        showCustomBudget ? styles.optionButtonActive : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="budgetRange"
                                        checked={showCustomBudget}
                                        onChange={handleCustomBudgetToggle}
                                        className={styles.hiddenRadio}
                                    />
                                    Custom Range
                                </label>
                            </div>

                            {showCustomBudget && (
                                <div className={styles.customRangeContainer}>
                                    <div className={styles.customRangeInputs}>
                                        <input
                                            type="number"
                                            placeholder="Min (PKR)"
                                            value={customBudgetMin}
                                            onChange={(e) => setCustomBudgetMin(e.target.value)}
                                            className={styles.rangeInput}
                                        />
                                        <span>to</span>
                                        <input
                                            type="number"
                                            placeholder="Max (PKR)"
                                            value={customBudgetMax}
                                            onChange={(e) => setCustomBudgetMax(e.target.value)}
                                            className={styles.rangeInput}
                                        />
                                    </div>
                                    {customBudgetMin && customBudgetMax && (
                                        <p className={styles.rangePreview}>
                                            Selected range: PKR {parseInt(customBudgetMin).toLocaleString()} - PKR {parseInt(customBudgetMax).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Rest of the form remains the same */}
                    {selectedFeatures.battery && (
                        <div className={styles.featureOptionsContainer}>
                            <h3 className={styles.featureOptionsTitle}>Select battery capacity:</h3>
                            <div className={styles.optionsGrid}>
                                {batteryRanges.map((range) => (
                                    <label 
                                        key={range.label} 
                                        className={`${styles.optionButton} ${
                                            selectedBatteryRange?.label === range.label ? styles.optionButtonActive : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="batteryRange"
                                            checked={selectedBatteryRange?.label === range.label}
                                            onChange={() => handleBatteryRangeChange(range)}
                                            className={styles.hiddenRadio}
                                        />
                                        {range.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {selectedFeatures.screen && (
                        <div className={styles.featureOptionsContainer}>
                            <h3 className={styles.featureOptionsTitle}>Select screen size:</h3>
                            <div className={styles.optionsGrid}>
                                {screenSizes.map((size) => (
                                    <label 
                                        key={size.label} 
                                        className={`${styles.optionButton} ${
                                            selectedScreenSize?.label === size.label ? styles.optionButtonActive : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="screenSize"
                                            checked={selectedScreenSize?.label === size.label}
                                            onChange={() => handleScreenSizeChange(size)}
                                            className={styles.hiddenRadio}
                                        />
                                        {size.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {selectedFeatures.performance && (
                        <div className={styles.featureOptionsContainer}>
                            <h3 className={styles.featureOptionsTitle}>Select performance options:</h3>
                            <div className={styles.optionsGrid}>
                                <div className={styles.performanceSection}>
                                    <h4>RAM:</h4>
                                    <div className={styles.optionsRow}>
                                        {ramOptions.map((option) => (
                                            <label 
                                                key={option.label} 
                                                className={`${styles.optionButton} ${
                                                    selectedRAM?.label === option.label ? styles.optionButtonActive : ""
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="ram"
                                                    checked={selectedRAM?.label === option.label}
                                                    onChange={() => handleRAMChange(option)}
                                                    className={styles.hiddenRadio}
                                                />
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className={styles.performanceSection}>
                                    <h4>Processor:</h4>
                                    <input
                                        type="text"
                                        placeholder="Enter processor (e.g. Snapdragon 8 Gen 2)"
                                        value={selectedProcessor}
                                        onChange={handleProcessorChange}
                                        className={styles.processorInput}
                                    />
                                </div>
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

export default MobileRecommendationChatbot;