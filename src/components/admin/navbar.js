"use client";
import { Plus } from 'lucide-react';
import { useSelector } from "react-redux";

const Navbar = ({ 
  title, 
  showAddButton = true, 
  addButtonText = "Yeni Ekle", 
  onAddButtonClick 
}) => {
  // Redux store'dan email bilgisini al
  const email = useSelector((state) => state.user.email);
  
  // Ensure we have a valid function to call
  const handleAddButtonClick = (e) => {
    e.preventDefault();
    if (typeof onAddButtonClick === 'function') {
      onAddButtonClick();
    } else {
      console.error('No valid onAddButtonClick function provided to Navbar');
    }
  };

  return (
    <header className="bg-white border-b shadow-sm p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray font-Barlow">Admin Panel</h1>
        <div className="flex items-center space-x-4">
          {showAddButton && (
            <button
              id='addButton'
              onClick={handleAddButtonClick}
              className="flex items-center px-4 py-2 bg-red text-white rounded-lg transition-colors hover:bg-yellow hover:text-red"
            >
              <Plus size={18} className="mr-2" />
              <span>{addButtonText}</span>
            </button>
          )}
          <div className="text-sm text-gray-600 font-Barlow">
            <span className="font-medium">{email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;