import React from "react";

export default function LoadingCommon({ size = "200px" }) {
  const dotSize = "10px";
  const dotColor = "bg-blue-500";
  return (
    <div
      className="flex justify-center items-center space-x-2"
      style={{ minWidth: size }}
    >
      <div
        className={`animate-bounce ${dotColor} rounded-full`}
        style={{ width: dotSize, height: dotSize }}
      ></div>
      <div
        className={`animate-bounce ${dotColor} rounded-full  animation-delay-200`}
        style={{ width: dotSize, height: dotSize }}
      ></div>
      <div
        className={`animate-bounce ${dotColor} rounded-full  animation-delay-400`}
        style={{ width: dotSize, height: dotSize }}
      ></div>
    </div>
  );
}
