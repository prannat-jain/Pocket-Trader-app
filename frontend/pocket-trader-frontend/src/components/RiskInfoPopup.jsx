import { motion } from "framer-motion";
import React from "react";

// Risk Info Popup Component
const RiskInfoPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      style={{ textAlign: "justify" }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full border border-gray-600"
      >
        <h2 className="text-xl font-semibold mb-4">
          Understanding Risk & Outlook
        </h2>

        <div className="space-y-3 text-gray-700">
          <p>
            <strong>📉 Short-Term Volatility:</strong> A higher value means the
            stock's daily prices vary more dramatically—often considered riskier
            in the short run. A lower value suggests the stock's price changes
            are relatively smaller day-to-day, implying more stability (but not
            necessarily better performance). <br />
            <strong>How it's calculated:</strong>
            <ul style={{}}>
              <li>
                We fetch the stock's closing prices from the last 30 days
                (roughly 1 month).
              </li>
              <li>
                We compute the daily returns: how much the price changes from
                one day to the next, in percentage terms.
                <li>
                  <code>
                    daily_return = (Close(i) - Close(i-1)) / Close(i-1)
                  </code>
                </li>
              </li>
              <li>
                We calculate the standard deviation (σ) of those daily returns.
                This metric is commonly called volatility in finance.
              </li>
            </ul>
          </p>
          <p>
            <strong>⚠️ Short-Term Risk Level:</strong> Categorizes stock risk as
            Low, Medium, or High based on volatility.
          </p>
          <p>
            <strong>📈 Long-Term Trend (Slope):</strong> A positive slope means
            the stock’s price has generally increased over the past year (an
            uptrend). A negative slope means the price has generally decreased
            (a downtrend).
            <br />
            <strong>How it's calculated:</strong>
            <ul>
              <li>
                We fetch the stock's closing prices from the last 365 days
                (roughly 1 year).
              </li>
              <li>We fit a linear regression line to the closing prices.</li>
              <li>
                The slope of this line tells us the stock's long-term trend.
              </li>
            </ul>
          </p>
          <p>
            <strong>🔮 Long-Term Outlook:</strong> A qualitative estimate of the
            stock’s future based on trends and market factors.
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RiskInfoPopup;
