import React from 'react';

const LangueSwitch = ({ label, isChecked, onToggle }) => {
  return (
    <div className="form-check form-switch fs-5 my-3">
      <input
        className="form-check-input"
        type="checkbox"
        role="switch"
        id="glpiStatusSwitch"
        checked={isChecked}
        onChange={onToggle}
        style={{ cursor: 'pointer' }}
      />
      <label 
        className="form-check-label" 
        htmlFor="glpiStatusSwitch" 
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {label}
      </label>
    </div>
  );
};

export default LangueSwitch;