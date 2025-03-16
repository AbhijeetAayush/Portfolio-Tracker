import React, { useState, useEffect } from "react";
import { getCurrentStocks } from "../services/ApiServices";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./master.css";
import TopBar from "../components/sharedComponents/TopBar";
import SideBar from "../components/sharedComponents/SideBar";
import PortfolioContainer from "./PortfolioContainer";
import StockMarketContainer from "./StockMarketContainer";

const MasterContainer = () => {
    const [apiData, setApiData] = useState([]);
    const [historicalPrices, setHistoricalPrices] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: "", password: "" });

    useEffect(() => {
        if (isAuthenticated) {
            getCurrentStocks()
                .then((data) => setApiData(data))
                .catch((error) => console.error("Error fetching current stocks:", error));
        }
    }, [isAuthenticated]);

    const handleHistPrices = (histPricesObject) => {
        setHistoricalPrices(histPricesObject);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.username && formData.password) {
            setIsAuthenticated(true);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setFormData({ username: "", password: "" });
    };

    if (!isAuthenticated) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>{isLogin ? "Login" : "Sign Up"}</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <button type="submit" className="auth-btn">
                            {isLogin ? "Login" : "Sign Up"}
                        </button>
                    </form>
                    <p className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <TopBar />
            <div className="sidebar-content-container">
                <SideBar />
                <div className="logout-container">
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
                <Routes>
                    <Route exact path="/" element={<PortfolioContainer apiData={apiData} />} />
                    <Route path="/stockmarket" element={<StockMarketContainer stocks={apiData} handleHistPrices={handleHistPrices} />} />
                </Routes>
            </div>
        </Router>
    );
};

export default MasterContainer;
