"use client";
import { ReactNode } from 'react';

// Dashboard için istatistik kartı bileşeni
const StatCard = ({
  title,
  value,
  unit,
  icon,
  bgColor = "bg-blue-50",
  textColor = "text-blue-500"
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <span className={`p-2 ${bgColor} ${textColor} rounded-lg`}>
          {icon}
        </span>
      </div>
      <div className="flex flex-row items-center space-x-2">
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <span className={`text-base ${textColor} font-medium`}>{unit}</span>
      </div>
    </div>
  );
};

export default StatCard;