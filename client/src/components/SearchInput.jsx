import React, { useState, useCallback } from 'react';

const SearchInput = ({ onSearchChange, placeholder = "Search..." }) => {
  const [value, setValue] = useState('');

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearchChange(newValue);
  }, [onSearchChange]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
    />
  );
};

export default SearchInput;
