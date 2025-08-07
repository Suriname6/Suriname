import React, { useState, useEffect, useRef } from "react";
import styles from "./AutoComplete.module.css";
import axios from "axios";

const AutoComplete = ({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  fetchUrl,
  className,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && inputValue.trim() !== "" && isOpen) {
        axios
          .get(fetchUrl, { params: { keyword: inputValue } })
          .then((res) => setSuggestions(res.data))
          .catch((err) => console.error("자동완성 실패:", err));
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, fetchUrl, isOpen]);

  const handleSelect = (item) => {
    setInputValue(item.productName);
    onChange(item.productName);
    onSelect(item);
    setIsOpen(false);
    console.log("항목 선택됨:", item);
  };

  return (
    <div className={styles.autocompleteContainer} ref={containerRef}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      <input
        type="text"
        className={`${styles.inputControl} ${className}`}
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value;
          setInputValue(val);
          onChange(val);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />

      {isOpen && suggestions.length > 0 && (
        <ul className={styles.suggestionList}>
          {suggestions.map((item) => (
            <li
              key={item.productId}
              className={styles.suggestionItem}
              onClick={() => handleSelect(item)}
            >
              {item.productName} ({item.modelCode})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoComplete;
