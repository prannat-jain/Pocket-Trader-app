import React, { useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function App() {
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Replace with your deployed backend URL if needed
  const BACKEND_URL = "https://pocket-trader-app.onrender.com";

  const handleFetchData = async () => {
    if (!symbol) return;

    setError("");
    setStockData(null);
    setRiskData(null);
    setLoading(true);
    setSummaryData(false);

    try {
      // 1) Get stock data
      const stockResponse = await axios.get(
        `${process.env.BACKEND_URL}/stock/${symbol}`
      );
      if (stockResponse.data.error) {
        setError(stockResponse.data.error);
        setLoading(false);
        return;
      }
      setStockData(stockResponse.data);

      // 2) Get risk data
      const riskResponse = await axios.get(
        `${process.env.BACKEND_URL}/risk/${symbol}`
      );
      if (riskResponse.data.error) {
        setError(riskResponse.data.error);
        setLoading(false);
        return;
      }
      setRiskData(riskResponse.data);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFetchTranscriptSummary = async () => {
    if (!symbol) return;
    setError("");
    setLoading(true);
    setSummaryData(null);

    try {
      const resp = await axios.get(
        `${process.env.BACKEND_URL}/transcripts/${symbol}/summary`
      );
      if (resp.data.error) {
        setError(resp.data.error);
        setLoading(false);
        return;
      }
      setSummaryData(resp.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <h1>Fintech AI Stock Assistant</h1>
      <div style={{ marginBottom: "1em" }}>
        <input
          type="text"
          placeholder="Enter stock symbol, e.g. AAPL"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          style={{ marginRight: "20px" }}
        />
        <button onClick={handleFetchData}>Get Stock Info</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {stockData && (
        <div style={{ marginBottom: "2em" }}>
          <h2>
            {stockData.companyName} ({stockData.symbol})
          </h2>
          <p>
            <strong>Sector:</strong> {stockData.sector || "N/A"} <br />
            <strong>Market Cap:</strong>{" "}
            {stockData.marketCap
              ? "$" + stockData.marketCap.toLocaleString()
              : "N/A"}{" "}
            <br />
            <strong>Last Close Price:</strong>{" "}
            {"$" + stockData.lastClosePrice || "N/A"} <br />
          </p>
          <p>
            <strong>Business Summary:</strong>
            <br />
            {stockData.businessSummary}
          </p>
          <div style={{ marginTop: "1em" }}>
            <h3>Price History (1 year)</h3>
            <LineChart
              width={600}
              height={300}
              data={stockData.historicalData}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Close" stroke="#8884d8" />
            </LineChart>
          </div>
        </div>
      )}

      {riskData && (
        <div>
          <h2>Risk & Outlook</h2>
          <p>
            <strong>Short-Term Volatility:</strong>{" "}
            {riskData.shortTermVolatility?.toFixed(4) || "N/A"} <br />
            <strong>Short-Term Risk Level:</strong> {riskData.shortTermRisk}{" "}
            <br />
            <strong>Long-Term Trend (Slope):</strong>{" "}
            {riskData.longTermTrendSlope?.toFixed(4) || "N/A"} <br />
            <strong>Long-Term Outlook:</strong> {riskData.longTermOutlook}
          </p>
        </div>
      )}

      {stockData && (
        <button onClick={handleFetchTranscriptSummary}>
          Get financials from the latest earnings call
        </button>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {summaryData && (
        <div>
          <h2>Transcript Summary for {summaryData.symbol}</h2>
          <p>
            <strong>Year/Quarter:</strong> {summaryData.year}/Q
            {summaryData.quarter}
          </p>
          <p>
            <strong>Summary:</strong>
            <br />
            {summaryData.summary}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
