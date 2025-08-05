
import React from "react";
import styles from "./SearchLayout.module.css";

const SearchLayout = ({ children, onSearch }) => {
  return (
    <div className={styles.layoutContainer}>
      <div className={styles.formArea}>
        {children}
      </div>
      <div className={styles.buttonArea}>
        <button className={styles.searchButton} onClick={onSearch}>검색</button>
      </div>
    </div>
  );
};

export default SearchLayout;
