import { motion } from "framer-motion";
import React from "react";

// Risk Info Popup Component
const EarningsCallInfoPopup = ({ isOpen, onClose }) => {
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
        <h3 className="text-xl font-semibold mb-4">
          What's an earning's call?
        </h3>

        <div className="space-y-3 text-gray-700">
          <p>
            An earnings call is a conference call between a company's management
            and investors to discuss the company's financial performance.
            Earnings calls are usually held quarterly.{" "}
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

export default EarningsCallInfoPopup;
