import React from "react";

const Button = ({ children, onClick, disabled, className, ...props }) => {
  const disabledStyle = "bg-gray-300 text-gray-500 cursor-not-allowed";
  const normalStyle = "bg-lime-800 hover:bg-lime-600 cursor-pointer";
  return (
    <button
      className={`text-white text-base py-2 px-2.5 border-none text-sm rounded-md mr-2.5 focus:outline-none ${
        disabled ? disabledStyle : normalStyle
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
