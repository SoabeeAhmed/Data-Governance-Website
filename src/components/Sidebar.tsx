import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import * as Icons from "@fortawesome/free-solid-svg-icons";

interface SidebarProps {
  categories: {
    [category: string]: {
      icon: string;
      subcategories: string[];
    };
  };
  isLoading?: boolean;
  error?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, isLoading = false, error = null }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleClick = (category: string) => {
    setActiveCategory((prev) => (prev === category ? null : category));
  };

  const getIconByName = (iconName: string) => {
    // Convert fa-star to faStar
    const camelName = iconName
      .split('-')
      .map((word, idx) => (idx === 0 ? word : word[0].toUpperCase() + word.slice(1)))
      .join('');
    return (Icons as any)[camelName] || faPlus;
  };

  return (
    <aside className="sidebar">
      <div><h2>Hello User</h2></div>

      {isLoading && (
        <div className="loading">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading categories...</span>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {!isLoading && !error && Object.entries(categories).length === 0 && (
        <p className="no-categories">No categories available</p>
      )}

      {!isLoading && !error && (
        <ul className="space-y-2">
          {Object.entries(categories).map(([category, data]) => (
            <li key={category}>
              <button
                onClick={() => handleClick(category)}
                className="category-button flex items-center justify-between w-full"
              >
                <div className="category-label">
                  <FontAwesomeIcon icon={getIconByName(data.icon)} className="category-icon" />
                  <span>{category}</span>
                </div>
                <FontAwesomeIcon icon={activeCategory === category ? faMinus : faPlus} />
              </button>

              {activeCategory === category && data.subcategories.length > 0 && (
                <ul className="subcategory-list space-y-1">
                  {data.subcategories.map((sub) => (
                    <li key={`${category}-${sub}`} className="subcategory-item">
                      {sub}
                    </li>
                  ))}
                </ul>
              )}

              {activeCategory === category && data.subcategories.length === 0 && (
                <p className="subcategory-list text-sm text-gray-500 italic">
                  No subcategories
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default Sidebar;
