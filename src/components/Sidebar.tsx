import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faCircleUser } from "@fortawesome/free-solid-svg-icons";
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
  onSubcategoryClick: (category: string, subcategory: string) => void;
  completedSubcategories: Set<string>;
  currentActiveCategory: string | null;
  currentActiveSubcategory: string | null;
  questions: any[];
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  isLoading = false,
  error = null,
  onSubcategoryClick,
  completedSubcategories,
  currentActiveCategory,
  currentActiveSubcategory,
  questions = [],
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [progressTrigger, setProgressTrigger] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => setProgressTrigger(prev => prev + 1);
    window.addEventListener("storage", handleStorageChange);

    const intervalId = setInterval(() => setProgressTrigger(prev => prev + 1), 500);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (currentActiveCategory) setActiveCategory(currentActiveCategory);
  }, [currentActiveCategory]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(prev => (prev === category ? null : category));
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

  const isSubcategoryEnabled = (category: string, subcategory: string): boolean => {
    const subcategories = categories[category]?.subcategories || [];
    const subcategoryIndex = subcategories.indexOf(subcategory);
    const categoryNames = Object.keys(categories);

    if (categoryNames[0] === category && subcategoryIndex === 0) return true;

    if (subcategoryIndex > 0) {
      const previousSubcategory = subcategories[subcategoryIndex - 1];
      return completedSubcategories.has(`${category}-${previousSubcategory}`);
    }

    const categoryIndex = categoryNames.indexOf(category);
    if (categoryIndex > 0) {
      const previousCategory = categoryNames[categoryIndex - 1];
      const previousSubcategories = categories[previousCategory]?.subcategories || [];
      return previousSubcategories.every(sub =>
        completedSubcategories.has(`${previousCategory}-${sub}`)
      );
    }

    return false;
  };

  const getCategoryProgress = (category: string): number => {
    const subcategories = categories[category]?.subcategories || [];
    if (subcategories.length === 0) return 0;
    const completedCount = subcategories.filter(sub =>
      completedSubcategories.has(`${category}-${sub}`)
    ).length;
    return (completedCount / subcategories.length) * 100;
  };

  const getCategoryProgressColor = (categoryIndex: number): string => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
    ];
    return colors[categoryIndex % colors.length];
  };

  const getSubcategoryProgress = (category: string, subcategory: string): number => {
    const savedAnswersStr = localStorage.getItem("dataQualityAssessmentAnswers");
    if (!savedAnswersStr) return 0;

    try {
      const savedAnswers = JSON.parse(savedAnswersStr);
      const categoryAnswers = savedAnswers[category];
      if (!categoryAnswers || !categoryAnswers[subcategory]) return 0;
      const answers = categoryAnswers[subcategory];
      const answeredCount = Object.keys(answers).length;

      if (
        currentActiveCategory === category &&
        currentActiveSubcategory === subcategory &&
        questions.length > 0
      ) {
        return Math.min((answeredCount / questions.length) * 100, 100);
      }

      if (completedSubcategories.has(`${category}-${subcategory}`) && answeredCount > 0) {
        return 100;
      }

      if (answeredCount > 0) {
        return Math.min((answeredCount / 5) * 100, 90);
      }

      return 0;
    } catch {
      return 0;
    }
  };

  const handleSubcategoryClick = (category: string, subcategory: string) => {
    if (!isSubcategoryEnabled(category, subcategory)) {
      const subcategories = categories[category]?.subcategories || [];
      const subcategoryIndex = subcategories.indexOf(subcategory);

      if (subcategoryIndex > 0) {
        const prevSubcategory = subcategories[subcategoryIndex - 1];
        alert(`Please complete "${prevSubcategory}" before accessing "${subcategory}".`);
      } else {
        const categoryNames = Object.keys(categories);
        const categoryIndex = categoryNames.indexOf(category);
        if (categoryIndex > 0) {
          const prevCategory = categoryNames[categoryIndex - 1];
          alert(`Please complete all subcategories in "${prevCategory}" before accessing "${category}".`);
        }
      }

      return;
    }

    onSubcategoryClick(category, subcategory);
  };

  const isSubcategoryActive = (category: string, subcategory: string): boolean => {
    return currentActiveCategory === category && currentActiveSubcategory === subcategory;
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
          {Object.entries(categories).map(([category, data], categoryIndex) => {
            const categoryProgress = getCategoryProgress(category);
            const progressColor = getCategoryProgressColor(categoryIndex);

            return (
              <li key={category}>
                <div className="category-container">
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="category-button"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '0.75rem',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    <div
                      className="category-label"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FontAwesomeIcon
                          icon={getIconByName(data.icon)}
                          className="category-icon"
                        />
                        <span className="font-medium">{category}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: progressColor, fontWeight: '600', fontSize: '0.875rem' }}>
                          {Math.round(categoryProgress)}%
                        </span>
                        <FontAwesomeIcon
                          icon={activeCategory === category ? faMinus : faPlus}
                        />
                      </div>
                    </div>

                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: 'rgba(229, 231, 235, 0.5)',
                      borderRadius: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      <div style={{
                        height: '100%',
                        backgroundColor: progressColor,
                        borderRadius: '0.5rem',
                        transition: 'width 0.3s ease-in-out',
                        width: `${categoryProgress}%`
                      }}></div>
                    </div>
                  </button>

                  {activeCategory === category && data.subcategories.length > 0 && (
                    <ul className="subcategory-list">
                      {data.subcategories.map((subcategory) => {
                        const subcategoryEnabled = isSubcategoryEnabled(category, subcategory);
                        const isCompleted = completedSubcategories.has(`${category}-${subcategory}`);
                        const isActive = isSubcategoryActive(category, subcategory);
                        const subcategoryProgress = getSubcategoryProgress(category, subcategory);

                        return (
                          <li key={`${category}-${subcategory}`}>
                            <div className="subcategory-container">
                              <button
                                onClick={() => handleSubcategoryClick(category, subcategory)}
                                className={`subcategory-item ${!subcategoryEnabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`}
                              >
                                <span className={!subcategoryEnabled ? 'text-gray-400' : ''}>
                                  {subcategory}
                                </span>
                                <div className="subcategory-progress-bar">
                                  <div
                                    className="subcategory-progress-fill"
                                    style={{ width: `${subcategoryProgress}%` }}
                                  ></div>
                                </div>
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
};

export default Sidebar;
