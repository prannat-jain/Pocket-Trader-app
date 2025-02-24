import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const StockSearch = ({ onSelect }) => {
  // const BACKEND_URL = "http://localhost:8000";
  const BACKEND_URL = "https://pocket-trader-app.onrender.com";

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const [suggestionSelected, setSuggestionSelected] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 1) {
        searchStocks();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setError("");
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchStocks = async () => {
    if (suggestionSelected) {
      setSuggestionSelected(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${BACKEND_URL}/search`, {
        params: { q: query },
      });

      if (response.data && response.data.error) {
        setError(response.data.error);
        setSuggestions([]);
      } else if (Array.isArray(response.data)) {
        setSuggestions(response.data);
        setShowSuggestions(true);
      } else {
        setError("Invalid response format");
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setError("Failed to fetch suggestions");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.symbol);
    setSuggestions([]);
    setShowSuggestions(false);
    setError("");
    onSelect(suggestion.symbol);
    setSuggestionSelected(true);
  };

  return (
    <div className="relative w-64" ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type and click from suggestions..."
        className="w-full p-2 border rounded"
        style={{ paddingRight: "20px" }}
      />

      {loading && (
        <div className="absolute right-2 top-2 text-sm text-gray-500">
          Loading...
        </div>
      )}

      {error && (
        <div className="absolute top-full left-0 w-full mt-1 text-sm text-red-500 bg-white p-2 border rounded">
          {error}
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul
          className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto"
          style={{ listStyleType: "none", cursor: "pointer" }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
            >
              <span className="font-bold">
                <i>{suggestion.symbol}</i>
              </span>
              {suggestion.name && (
                <span className="ml-2 text-gray-600">
                  <i> - {suggestion.name}</i>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StockSearch;
