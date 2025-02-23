import React from "react";

const LoadingSpinner = ({ loading = false, message = "Loading..." }) => {
  if (!loading) return null;

  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="spinner-message">{message}</p>
      </div>
    </div>
  );
};

const styles = `
.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner-container {
  background-color: white;
  padding: 32px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner,
.spinner-inner {
  border: 4px solid transparent;
  border-radius: 50%;
}

.spinner {
  border-color: #e0e0e0;
}

.spinner-inner {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-color:rgb(79, 79, 79) transparent transparent transparent;
  animation: spin 1s linear infinite;
}

.spinner-message {
  color: #333;
  font-weight: 500;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Add styles to document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default LoadingSpinner;
