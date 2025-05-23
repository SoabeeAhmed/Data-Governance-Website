import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Sidebar from "./components/Sidebar";
import SubcategoryQuestions from "./components/SubcategoryQuestions";
import Dashboard from "./components/Dashboard";
import "./App.css";

interface CategoryData {
  [category: string]: {
    icon: string;
    subcategories: string[];
    legends: { [subcategory: string]: string };
  };
}

interface Question {
  id: number;
  text: string;
  options: number[];
}

interface AssessmentEntry {
  category: string;
  subcategory: string;
  averageScore: number;
}

const App: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [definition, setDefinition] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [categoryScores, setCategoryScores] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [activeLegend, setActiveLegend] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [completedSubcategories, setCompletedSubcategories] = useState<Set<string>>(new Set());
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
    loadDashboardScores();
    loadCompletedSubcategories();
  }, []);

  const fetchCategories = () => {
    fetch("/data/Heading.csv")
      .then((res) => res.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase(),
        });
        const result: CategoryData = {};
        parsed.data.forEach((row: any) => {
          const icon = row["icon"]?.trim();
          const category = row["category"]?.trim();
          const subcategory = row["subcategory"]?.trim();
          const legend = row["legend"]?.trim();
          if (!category || !icon) return;

          if (!result[category]) {
            result[category] = { icon, subcategories: [], legends: {} };
          }

          if (subcategory && !result[category].subcategories.includes(subcategory)) {
            result[category].subcategories.push(subcategory);
            if (legend) {
              result[category].legends[subcategory] = legend;
            }
          }
        });

        setCategories(result);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load Heading.csv");
        setIsLoading(false);
      });
  };

  const loadCompletedSubcategories = () => {
    const savedAnswersStr = localStorage.getItem("dataQualityAssessmentAnswers");
    if (savedAnswersStr) {
      try {
        const savedAnswers = JSON.parse(savedAnswersStr);
        const completed = new Set<string>();
        Object.entries(savedAnswers).forEach(([category, categoryData]: [string, any]) => {
          Object.entries(categoryData).forEach(([subcategory, answers]: [string, any]) => {
            const questionCount = getQuestionCountForSubcategory(category, subcategory);
            const answeredCount = Object.keys(answers).length;
            if (questionCount > 0 && answeredCount >= questionCount) {
              completed.add(`${category}-${subcategory}`);
            }
          });
        });
        setCompletedSubcategories(completed);
      } catch (err) {
        console.error("Error loading completed subcategories", err);
      }
    }
  };

  const getQuestionCountForSubcategory = (category: string, subcategory: string): number => {
    return 5;
  };

  const handleSubcategoryClick = (category: string, subcategory: string) => {
    setActiveCategory(category);
    setActiveSubcategory(subcategory);
    setDefinition(null);
    setQuestions([]);
    setError(null);
    setIsNavigating(false);
    const legend = categories[category]?.legends?.[subcategory] || null;
    setActiveLegend(legend);
    const categoryFile = `/data/${category}.csv`;
    fetch(categoryFile)
      .then((res) => res.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h) => h.trim().toLowerCase(),
        });

        const questionsList: Question[] = [];
        let subDefinition: string | null = null;

        parsed.data.forEach((row: any, index: number) => {
          const rowCategory = row["category"]?.trim().toLowerCase();
          const rowSubcategory = row["subcategory"]?.trim().toLowerCase();
          const rowQuestion = row["question"]?.trim();
          const rowDefinition = row["definition"]?.trim();
          const rowOptions = row["options"]?.trim();

          if (
            rowCategory === category.toLowerCase() &&
            rowSubcategory === subcategory.toLowerCase()
          ) {
            if (!subDefinition && rowDefinition) subDefinition = rowDefinition;
            if (rowQuestion && rowOptions) {
              const options = rowOptions
                .split(",")
                .map((v: string) => parseInt(v.trim()))
                .filter((v) => !isNaN(v));
              questionsList.push({
                id: index + 1,
                text: rowQuestion,
                options,
              });
            }
          }
        });

        setDefinition(subDefinition);
        setQuestions(questionsList);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load questions");
      });
  };

  const handleAssessmentSubmit = (score: number) => {
    if (!activeCategory || !activeSubcategory) return;
    setCategoryScores((prevScores) => {
      const newScores = { ...prevScores };
      if (!newScores[activeCategory]) {
        newScores[activeCategory] = {};
      }
      newScores[activeCategory][activeSubcategory] = score;
      return newScores;
    });
    const key = "dataQualityAssessmentSubmitted";
    const current = localStorage.getItem(key);
    let updated: AssessmentEntry[] = [];
    if (current) {
      try {
        updated = JSON.parse(current);
        updated = updated.filter(
          (e) => !(e.category === activeCategory && e.subcategory === activeSubcategory)
        );
      } catch (err) {
        console.error("Error parsing existing assessment data", err);
      }
    }
    updated.push({
      category: activeCategory,
      subcategory: activeSubcategory,
      averageScore: score,
    });
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const handleAllQuestionsAnswered = () => {
    if (!activeCategory || !activeSubcategory || isNavigating) return;
    setIsNavigating(true);
    const newCompleted = new Set(completedSubcategories);
    newCompleted.add(`${activeCategory}-${activeSubcategory}`);
    setCompletedSubcategories(newCompleted);
    const currentCategoryData = categories[activeCategory];
    if (currentCategoryData) {
      const currentSubcategoryIndex = currentCategoryData.subcategories.indexOf(activeSubcategory);
      if (currentSubcategoryIndex < currentCategoryData.subcategories.length - 1) {
        const nextSubcategory = currentCategoryData.subcategories[currentSubcategoryIndex + 1];
        setTimeout(() => {
          handleSubcategoryClick(activeCategory, nextSubcategory);
          setIsNavigating(false);
        }, 1500);
      } else {
        const categoryNames = Object.keys(categories);
        const currentCategoryIndex = categoryNames.indexOf(activeCategory);
        if (currentCategoryIndex < categoryNames.length - 1) {
          const nextCategory = categoryNames[currentCategoryIndex + 1];
          const nextSubcategory = categories[nextCategory].subcategories[0];
          setTimeout(() => {
            handleSubcategoryClick(nextCategory, nextSubcategory);
            setIsNavigating(false);
          }, 1500);
        } else {
          setIsNavigating(false);
        }
      }
    } else {
      setIsNavigating(false);
    }
  };

  const loadDashboardScores = () => {
    const key = "dataQualityAssessmentSubmitted";
    const data = localStorage.getItem(key);
    if (!data) return;
    try {
      const parsed: AssessmentEntry[] = JSON.parse(data);
      const scores: { [key: string]: { [key: string]: number } } = {};
      parsed.forEach((entry) => {
        if (!scores[entry.category]) {
          scores[entry.category] = {};
        }
        scores[entry.category][entry.subcategory] = entry.averageScore;
      });
      setCategoryScores(scores);
    } catch (err) {
      console.error("Error reading assessment data", err);
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        categories={categories}
        isLoading={isLoading}
        error={error}
        onSubcategoryClick={handleSubcategoryClick}
        completedSubcategories={completedSubcategories}
        currentActiveCategory={activeCategory}
        currentActiveSubcategory={activeSubcategory}
        questions={questions}
      />
      <main className="main-content">
        <div className="content-header">
          <h1 className="text-2xl font-bold">Data Quality Index</h1>
        </div>
        <div className="content-body">
          {error && <p className="error">{error}</p>}
          {!activeCategory && !activeSubcategory && (
            <div className="welcome-message">
              <h2 className="text-xl font-semibold mb-4">Welcome to Data Quality Index</h2>
              <p className="text-gray-600 mb-4">
                Please select a category from the sidebar to begin your assessment.
              </p>
              <Dashboard 
                categories={categories}
                categoryScores={categoryScores}
                onSubcategoryClick={handleSubcategoryClick}
              />
            </div>
          )}
          {activeCategory && activeSubcategory && (
            <SubcategoryQuestions
              questions={questions}
              definition={definition}
              legend={activeLegend}
              onSubmit={handleAssessmentSubmit}
              activeCategory={activeCategory}
              activeSubcategory={activeSubcategory}
              onBackToDashboard={() => {
                setActiveCategory(null);
                setActiveSubcategory(null);
                loadDashboardScores();
              }}
              onAllQuestionsAnswered={handleAllQuestionsAnswered}
              isAlreadyCompleted={completedSubcategories.has(`${activeCategory}-${activeSubcategory}`)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
