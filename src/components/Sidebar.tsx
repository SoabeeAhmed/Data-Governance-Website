import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import { faCircleUser } from "@fortawesome/free-solid-svg-icons";
interface SidebarProps {
  categories: {
    [category: string]: {
      icon: string;
      subcategories: string[];
    };
  };
  isLoading?: boolean;
  error?: string | null;
  onSubcategoryClick: (category: string, subcategory: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  isLoading = false,
  error = null,
  onSubcategoryClick,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (category: string) => {
    setActiveCategory((prev) => (prev === category ? null : category));
  };

  const getIconByName = (iconName: string) => {
    const camelName = iconName
      .split("-")
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
    return (Icons as any)[camelName] || faPlus;
  };

  return (
    <aside className="sidebar">
      <h2 className="text-lg font-bold mb-4">
        <FontAwesomeIcon icon={faCircleUser} style={{ marginRight: "10px" }} />
        Hello User
      </h2>


      {isLoading && (
        <div className="loading flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
          <span>Loading categories...</span>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      {!isLoading && !error && Object.keys(categories).length === 0 && (
        <p className="no-categories">No categories available</p>
      )}

      {!isLoading && !error && (
        <ul className="space-y-2">
          {Object.entries(categories).map(([category, data]) => (
            <li key={category}>
              <button
                onClick={() => handleCategoryClick(category)}
                className="category-button"
              >
                <div className="category-label">
                  <FontAwesomeIcon
                    icon={getIconByName(data.icon)}
                    className="category-icon"
                  />
                  <span className="font-medium">{category}</span>
                </div>
                <FontAwesomeIcon
                  icon={activeCategory === category ? faMinus : faPlus}
                />
              </button>

              {activeCategory === category && data.subcategories.length > 0 && (
                <ul className="subcategory-list">
                  {data.subcategories.map((subcategory) => (
                    <li key={`${category}-${subcategory}`}>
                      <button
                        onClick={() => onSubcategoryClick(category, subcategory)}
                        className="subcategory-item"
                      >
                        {subcategory}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default Sidebar;
