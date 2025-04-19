"use client";
import { Plus } from 'lucide-react';
import { useSelector } from "react-redux";

const Navbar = ({ 
  title, 
  showAddButton = false, // Varsayılan olarak gösterme
  addButtonText = "Yeni Ekle", 
  onAddButtonClick 
}) => {
  // Redux store'dan email bilgisini al
  const name = useSelector((state) => state.user.profile?.name);
  
  // Şu anki sayfanın başlığına göre add button gösterilmeli mi?
  const shouldShowButton = showAddButton || 
    title === "Kategoriler" || 
    title === "Ürünler";
  
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
        <h1 className="text-xl font-semibold text-gray font-Barlow">{title || "Admin Panel"}</h1>
        <div className="flex items-center space-x-4">
          {shouldShowButton && (
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
            <span className="font-medium">{name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;