import React from "react";

const Button = ({ children, onClick, disabled, ...props }) => {
  const disabledStyle = "bg-gray-300 text-gray-500 cursor-not-allowed";
  return (
    <button
      className={`bg-lime-800 text-white text-base py-1 px-2.5 border-none cursor-pointer text-sm rounded-md mr-2.5 hover:bg-lime-600 focus:outline-none ${
        disabled ? disabledStyle : ""
      }`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
