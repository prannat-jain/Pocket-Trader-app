import React from "react";

const BuyMeCoffeeButton = () => {
  return (
    <a
      href="https://www.buymeacoffee.com/prannatj8"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed", // Fix position on screen
        bottom: "20px", // Distance from bottom
        right: "20px", // Distance from right
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "#6b6b6b", // Button color
        color: "#ffffff", // Font color
        fontFamily: "Cookie, cursive",
        fontSize: "12px", // Small size
        padding: "6px 10px",
        borderRadius: "5px",
        textDecoration: "none",
        border: "1px solid #ffffff",
        transition: "0.3s",
        zIndex: 1000, // Ensure it stays on top
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = "#555555")}
      onMouseOut={(e) => (e.target.style.backgroundColor = "#6b6b6b")}
    >
      ☕ Buy me a coffee
    </a>
  );
};

export default BuyMeCoffeeButton;
