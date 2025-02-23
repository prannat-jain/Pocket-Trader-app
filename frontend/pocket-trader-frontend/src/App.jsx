import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import StockSearch from "./components/StockSearch";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import { format, parseISO } from "date-fns";
import { Info } from "lucide-react"; // Info icon
import RiskInfoPopup from "./components/RiskInfoPopup";

// Loading Overlay Component
const LoadingOverlay = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center"
      >
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Fetching data...</p>
      </motion.div>
    </div>
  );
};

function App() {
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const summaryRef = useRef(null);
  const [showRiskInfo, setShowRiskInfo] = useState(false); // Controls the risk popup

  useEffect(() => {
    if (summaryData && summaryRef.current) {
      summaryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [summaryData]);

  // const BACKEND_URL = "http://localhost:8000";
  const BACKEND_URL = "https://pocket-trader-app.onrender.com";

  const handleFetchData = async () => {
    if (!symbol) return;

    setError("");
    setStockData(null);
    setRiskData(null);
    setLoading(true);
    setSummaryData(false);

    try {
      const stockResponse = await axios.get(`${BACKEND_URL}/stock/${symbol}`);
      if (stockResponse.data.error) {
        setError(stockResponse.data.error);
        setLoading(false);
        return;
      }
      setStockData(stockResponse.data);

      const riskResponse = await axios.get(`${BACKEND_URL}/risk/${symbol}`);
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
        `${BACKEND_URL}/transcripts/${symbol}/summary`
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-6xl mx-auto"
    >
      {/* Loading Overlay */}
      <LoadingOverlay loading={loading} />

      {/* Header section with flex layout */}
      <div className="flex justify-between items-start mb-8">
        <motion.h1
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Pocket Trader - Stock Market Assistant
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-1/2 bg-gray-50 p-4 rounded-lg shadow-sm"
        >
          <p className="text-gray-600">
            Welcome to Pocket Trader! This tool provides you with the
            information you <strong>actually need</strong> to analyze stocks and
            make informed decisions. Search a stock below to get started!.
            <br /> You can also view the{" "}
            <strong>risk level, trend, and outlook</strong> for a stock, as well
            as a summary of the <strong>latest earnings call!</strong>
          </p>
          <p className="text-gray-600 mt-2">
            Disclaimer: This tool is for educational purposes only and does not
            constitute financial advice.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <StockSearch
          onSelect={(symbol) => {
            setSymbol(symbol);
          }}
        />
        <motion.button
          onClick={handleFetchData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          style={{}}
        >
          Get Stock Info
        </motion.button>
      </motion.div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-red-500"
          >
            Error: {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Data Section */}
      <AnimatePresence>
        {stockData && (
          <motion.div
            key="stockData"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-8 bg-white p-6 rounded-xl shadow-sm"
          >
            <motion.h2
              className="text-2xl font-semibold mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {stockData.companyName} ({stockData.symbol})
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="mb-4">
                <strong>Sector:</strong> {stockData.sector || "N/A"} <br />
                <strong>Market Cap:</strong>{" "}
                {stockData.marketCap
                  ? "$" + stockData.marketCap.toLocaleString()
                  : "N/A"}{" "}
                <br />
                <strong>Last Close Price:</strong>{" "}
                {"$" + stockData.lastClosePrice.toFixed(2) || "N/A"}
              </p>

              <p className="mb-6" style={{ textAlign: "justify" }}>
                <strong>Business Summary:</strong>
                <br />
                {stockData.businessSummary}
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Price History (1 year)
                </h3>
                <div className="block mx-auto w-fit">
                  <LineChart
                    width={600}
                    height={300}
                    data={stockData.historicalData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="Date"
                      tickFormatter={(date) =>
                        format(parseISO(date), "MMM yyyy")
                      }
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="Close"
                      stroke="#8884d8"
                      dot={{
                        fill: "#fff",
                        stroke: "#8884d8",
                        strokeWidth: 2,
                        r: 3,
                      }}
                    />
                  </LineChart>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Risk Data Section */}
      <AnimatePresence>
        {riskData && (
          <motion.div
            key="riskData"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-8 bg-white p-6 rounded-xl shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-4">
              Risk & Outlook{" "}
              <button
                onClick={() => setShowRiskInfo(true)}
                className="ml-1 text-blue-300 hover:text-blue-300 transition"
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  verticalAlign: "super", // Superscript effect
                  fontSize: "1rem", // Make icon smaller
                }}
              >
                <Info size={20} />
              </button>
            </h2>
            {/* Risk Info Popup */}
            <AnimatePresence>
              {showRiskInfo && (
                <RiskInfoPopup
                  isOpen={showRiskInfo}
                  onClose={() => setShowRiskInfo(false)}
                />
              )}
            </AnimatePresence>
            <p>
              <strong>Short-Term Volatility:</strong>{" "}
              {riskData.shortTermVolatility?.toFixed(4) || "N/A"}
              <br />
              <strong>Short-Term Risk Level:</strong> {riskData.shortTermRisk}{" "}
              <br />
              <strong>Long-Term Trend (Slope):</strong>{" "}
              {riskData.longTermTrendSlope?.toFixed(4) || "N/A"} <br />
              <strong>Long-Term Outlook:</strong> {riskData.longTermOutlook}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript Button */}
      <AnimatePresence>
        {stockData && (
          <motion.button
            key="transcriptButton"
            onClick={handleFetchTranscriptSummary}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            disabled={loading}
          >
            Get financials from the latest earnings call
          </motion.button>
        )}
      </AnimatePresence>

      {/* Summary Data Section */}
      <AnimatePresence>
        {summaryData && (
          <motion.div
            key="summaryData"
            ref={summaryRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 bg-white p-6 rounded-xl shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-4">
              Transcript Summary for {summaryData.symbol}
            </h2>
            <p className="mb-4">
              <strong>Year/Quarter:</strong> {summaryData.year}/Q
              {summaryData.quarter}
            </p>
            <p style={{ textAlign: "justify" }}>
              <strong>Summary:</strong>
              <br />
              {summaryData.summary
                // split on newlines
                .split("\n")
                // remove empty lines
                .filter((line) => line.trim() !== "")
                // map each line to a list item
                .map((line, idx) => (
                  <li key={idx} style={{ listStyleType: "none" }}>
                    {line}
                  </li>
                ))}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default App;
