import React, { useState } from "react";

const Button = ({
  children,
  onClick,
  disabled,
  className,
  loadingText,
  ...props
}) => {
  const disabledStyle = "bg-gray-300 text-gray-500 cursor-not-allowed";
  const normalStyle = "bg-teal-700 hover:bg-teal-600 cursor-pointer";

  const [loading, setLoading] = useState(false);

  async function onButtonClick(event) {
    event.preventDefault();
    if (loading) {
      return;
    }
    setLoading(true);
    await onClick(event);
    setLoading(false);
  }

  return (
    <button
      className={`text-white text-base py-2 px-2.5 border-none text-sm rounded-md focus:outline-none ${
        disabled || loading ? disabledStyle : normalStyle
      } ${className}`}
      onClick={onButtonClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
};

export default Button;
