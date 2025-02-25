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
import { format, parseISO, set } from "date-fns";
import { Info } from "lucide-react"; // Info icon
import RiskInfoPopup from "./components/RiskInfoPopup";
import LoadingSpinner from "./components/LoadingSpinner";
import BuyMeCoffeeButton from "./components/BuyMeCoffeeButton";
import EarningsCallInfoPopup from "./components/EarningsCallInfoPopup";

function App() {
  const [symbol, setSymbol] = useState("");
  const [stockData, setStockData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const summaryRef = useRef(null);
  const dataRef = useRef(null);
  const [showRiskInfo, setShowRiskInfo] = useState(false); // Controls the risk popup
  const [showEarningsCallInfo, setShowEarningsCallInfo] = useState(false); // Controls the risk popup

  useEffect(() => {
    if (summaryData && summaryRef.current) {
      summaryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [summaryData]);

  useEffect(() => {
    if (stockData && dataRef.current) {
      dataRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [stockData]);

  // const BACKEND_URL = "http://localhost:8000";
  const BACKEND_URL = "https://pocket-trader-app.onrender.com";

  const handleStockFetchData = async () => {
    if (!symbol) {
      console.log("No symbol provided");
      setError("Please select a stock symbol from the suggestions.");
      return;
    }

    setError("");
    setStockData(null);
    setLoading(true);

    try {
      const stockResponse = await axios.get(`${BACKEND_URL}/stock/${symbol}`);
      if (stockResponse.data.error) {
        setError(stockResponse.data.error);
        setLoading(false);
        return;
      }
      setStockData(stockResponse.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRiskFetchData = async () => {
    if (!symbol) {
      console.log("No symbol provided");
      setError("Please select a stock symbol from the suggestions.");
      return;
    }
    setRiskData(null);
    setLoading(true);
    setError("");

    try {
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

  // Helper function examples
  function interpretPE(pe) {
    if (pe == null || isNaN(pe)) return "N/A";
    if (pe < 10) return "Low (under 10)";
    if (pe <= 25) return "Moderate (10-25)";
    return "High (over 25)";
  }

  function interpretPriceToBook(p2b) {
    if (p2b == null || isNaN(p2b)) return "N/A";
    if (p2b < 1) return "Low (< 1)";
    if (p2b <= 3) return "Moderate (1-3)";
    return "High (> 3)";
  }

  function interpretProfitMargins(margin) {
    if (margin == null || isNaN(margin)) return "N/A";
    // margin is often given as a decimal, e.g. 0.25 for 25%
    if (margin < 0) return "Negative";
    if (margin < 0.1) return "Low (< 10%)";
    if (margin < 0.2) return "Moderate (10-20%)";
    return "High (> 20%)";
  }

  function interpretRevenueGrowth(growth) {
    if (growth == null || isNaN(growth)) return "N/A";
    // growth is often a decimal (e.g., 0.05 = 5% yoy)
    if (growth < 0) return "Negative";
    if (growth < 0.1) return "Low (< 10%)";
    if (growth < 0.2) return "Moderate (10-20%)";
    return "High (> 20%)";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-6xl mx-auto"
    >
      {/* Loading Overlay */}
      <LoadingSpinner loading={loading} message="Please wait..." />

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
          onClick={handleStockFetchData}
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
            ref={dataRef}
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

            {/* ---------------- VALUATION MEASURES ---------------- */}
            {stockData.valuation && (
              <div style={{ marginTop: "2em" }}>
                <h3>Valuation Measures</h3>

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
                <p>
                  <strong>Trailing P/E: </strong>
                  {stockData.valuation.trailingPE ?? "N/A"} <br />
                  <em>
                    Reflects the price/earnings ratio based on historical
                    earnings. A higher ratio can mean the stock is more
                    “expensive” relative to its past earnings. If a stock has a
                    trailing P/E of 20, it means you're paying $20 for every $1
                    of earnings the company made over the past year This value
                    is <u>{interpretPE(stockData.valuation.trailingPE)}</u>
                  </em>
                </p>
                <p>
                  <strong>Forward P/E: </strong>
                  {stockData.valuation.forwardPE ?? "N/A"} <br />
                  <em>
                    Uses estimated future earnings instead of past data,
                    providing a forward-looking measure of valuation. If a stock
                    has a forward P/E of 15, it means you're paying $15 for
                    every $1 of earnings the company is expected to make next
                    year. This value is{" "}
                    <u>{interpretPE(stockData.valuation.forwardPE)}</u>
                  </em>
                </p>
                <p>
                  <strong>Price to Book (P/B): </strong>
                  {stockData.valuation.priceToBook ?? "N/A"} <br />
                  <em>
                    Compares the stock’s market value to its book value. Lower
                    ratios can indicate undervaluation or particular industry
                    norms. This value is{" "}
                    <u>
                      {interpretPriceToBook(stockData.valuation.priceToBook)}
                    </u>
                  </em>
                </p>
              </div>
            )}

            {/* ---------------- FINANCIAL HIGHLIGHTS ---------------- */}
            {stockData.financialHighlights && (
              <div style={{ marginTop: "2em" }}>
                <h3>Financial Highlights</h3>
                <p>
                  <strong>Profit Margins: </strong>
                  {stockData.financialHighlights.profitMargins ?? "N/A"} <br />
                  <em>
                    Shows how much of each dollar of revenue becomes profit
                    (after costs). Higher means more efficient profitability.
                    This value is{" "}
                    <u>
                      {interpretProfitMargins(
                        stockData.financialHighlights.profitMargins
                      )}
                    </u>
                  </em>
                </p>
                <p>
                  <strong>Revenue Growth (YoY): </strong>
                  {stockData.financialHighlights.revenueGrowth ?? "N/A"} <br />
                  <em>
                    The rate at which the company's revenue increases compared
                    to the previous year. Positive values suggest expansion.
                    This value is{" "}
                    <u>
                      {interpretRevenueGrowth(
                        stockData.financialHighlights.revenueGrowth
                      )}
                    </u>
                  </em>
                </p>
                <p>
                  <strong>Gross Profits: </strong>
                  {stockData.financialHighlights.grossProfits
                    ? "$" +
                      stockData.financialHighlights.grossProfits.toLocaleString()
                    : "N/A"}{" "}
                  <br />
                  <em>
                    Revenue minus the direct costs of producing goods/services,
                    showing basic profitability from core operations.
                  </em>
                </p>
                <p>
                  <strong>Net Income: </strong>
                  {stockData.financialHighlights.netIncome
                    ? "$" +
                      stockData.financialHighlights.netIncome.toLocaleString()
                    : "N/A"}{" "}
                  <br />
                  <em>
                    The company's bottom-line profit after all expenses, taxes,
                    and other costs. A key indicator of overall profitability.
                  </em>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {stockData && (
        <motion.button
          onClick={handleRiskFetchData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          style={{}}
        >
          Get Risk and Outlook
        </motion.button>
      )}
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
              {riskData.shortTermVolatility != null && (
                <>
                  {" "}
                  {riskData.shortTermVolatility > 0.02
                    ? "(Indicates higher day-to-day price swings)"
                    : "(Indicates relatively stable daily changes)"}
                </>
              )}
              <br />
              <strong>Short-Term Risk Level:</strong> {riskData.shortTermRisk}{" "}
              <br />
              <strong>Long-Term Trend (Slope):</strong>{" "}
              {riskData.longTermTrendSlope?.toFixed(4) || "N/A"}
              {riskData.longTermTrendSlope != null && (
                <>
                  {" "}
                  {riskData.longTermTrendSlope > 0
                    ? "(Stock price has generally trended upward over the past year)"
                    : riskData.longTermTrendSlope < 0
                    ? "(Stock price has generally trended downward over the past year)"
                    : "(No significant upward or downward trend detected)"}
                </>
              )}
              <br />
              <strong>Long-Term Outlook:</strong> {riskData.longTermOutlook}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript Button */}
      <AnimatePresence>
        {riskData && (
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
              Summary for {summaryData.symbol} most recent earnings call
              <button
                onClick={() => setShowEarningsCallInfo(true)}
                className="ml-1 text-blue-300 hover:text-blue-300 transition"
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  verticalAlign: "super", // Superscript effect
                  fontSize: "1rem", // Make icon smaller
                }}
              >
                {" "}
                <Info size={20} />
              </button>
            </h2>
            {/* Risk Info Popup */}
            <AnimatePresence>
              {showEarningsCallInfo && (
                <EarningsCallInfoPopup
                  isOpen={showEarningsCallInfo}
                  onClose={() => setShowEarningsCallInfo(false)}
                />
              )}
            </AnimatePresence>{" "}
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
      {stockData && riskData && <BuyMeCoffeeButton />}
    </motion.div>
  );
}

export default App;
