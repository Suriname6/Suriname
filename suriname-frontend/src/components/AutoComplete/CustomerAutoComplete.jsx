import React, { useState, useEffect, useRef } from "react";
import styles from "./AutoComplete.module.css";
import axios from "../../api/axiosInstance";

const CustomerAutoCompleteProduct = ({
  value,
  onChange,
  onSelect,
  placeholder = "고객명을 입력하세요",
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
        setLoading(true);
        axios
          .get("/api/customers/autocomplete", {
            params: { keyword: inputValue },
          })
          .then((res) => {
            const payload = res?.data?.data ?? res?.data;
            const list = Array.isArray(payload)
              ? payload
              : Array.isArray(payload?.content)
              ? payload.content
              : [];
            setSuggestions(list);
          })
          .catch((err) => console.error("고객 자동완성 실패:", err))
          .finally(() => setLoading(false));
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isOpen]);

  const handleSelect = (customer) => {
    setInputValue(customer.name);
    onChange(customer.name);
    onSelect(customer);
    setIsOpen(false);
  };

  return (
    <div className={styles.autocompleteContainer} ref={containerRef}>
      <input
        type="text"
        className={styles.inputControl}
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

      {isOpen && (loading || suggestions.length > 0) && (
        <ul className={styles.suggestionList}>
          {loading && <li className={styles.suggestionItem}>불러오는 중...</li>}
          {!loading &&
            suggestions.map((customer) => (
              <li
                key={customer.customerId ?? customer.id}
                className={styles.suggestionItem}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(customer);
                }}
              >
                {customer.name} {customer.phone ? `(${customer.phone})` : ""}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerAutoCompleteProduct;
