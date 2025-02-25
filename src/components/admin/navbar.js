"use client";
import { Plus } from 'lucide-react';

const Navbar = ({ 
  title, 
  showAddButton = false, 
  addButtonText = "Yeni Ekle", 
  onAddButtonClick 
}) => {
  return (
    <header className="bg-white border-b shadow-sm p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800 font-Barlow">{title}</h1>
        <div className="flex items-center space-x-4">
          {showAddButton && (
            <button
              onClick={onAddButtonClick}
              className="flex items-center px-4 py-2 bg-red text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus size={18} className="mr-2" />
              <span>{addButtonText}</span>
            </button>
          )}
          <div className="text-sm text-gray-600 font-Barlow">
            <span className="font-medium">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;