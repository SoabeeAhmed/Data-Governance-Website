import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Sidebar from "./components/Sidebar";
import SubcategoryQuestions from "./components/SubcategoryQuestions";
import "./App.css";

interface CategoryData {
  [category: string]: {
    icon: string;
    subcategories: string[];
    legends: { [subcategory: string]: string }; // Updated to support legend per subcategory
  };
}

const App: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [definition, setDefinition] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [activeLegend, setActiveLegend] = useState<string | null>(null);

  // Load categories, subcategories, and legends from Heading.csv
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch("/data/Heading.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch Heading.csv: ${response.statusText}`);
        }
        return response.text();
      })
      .then((csvData) => {
        const parsed = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().toLowerCase(),
        });

        const result: CategoryData = {};

        parsed.data.forEach((row: any) => {
          const icon = row["icon"]?.trim();
          const category = row["category"]?.trim();
          const subcategory = row["subcategory"]?.trim();
          const legend = row["legend"]?.trim();

          if (!icon || !category) return;

          if (!result[category]) {
            result[category] = {
              icon: icon,
              subcategories: [],
              legends: {},
            };
          }

          if (
            subcategory &&
            subcategory.toLowerCase() !== "none" &&
            !result[category].subcategories.includes(subcategory)
          ) {
            result[category].subcategories.push(subcategory);
          }

          if (subcategory && legend) {
            result[category].legends[subcategory] = legend;
          }
        });

        setCategories(result);
      })
      .catch((err) => {
        console.error("Error loading Heading.csv:", err);
        setError(`Failed to load categories: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSubcategoryClick = (category: string, subcategory: string) => {
    setActiveCategory(category);
    setActiveSubcategory(subcategory);
    setDefinition(null);
    setQuestions([]);
    setError(null);

    // Set legend dynamically based on both category and subcategory
    const legend = categories[category]?.legends?.[subcategory] || null;
    setActiveLegend(legend);

    const categoryFile = `/data/${category}.csv`;

    fetch(categoryFile)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${categoryFile}: ${response.statusText}`);
        }
        return response.text();
      })
      .then((csvData) => {
        const parsed = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().toLowerCase(),
        });

        const questionsList: string[] = [];
        let subDefinition: string | null = null;

        parsed.data.forEach((row: any) => {
          const rowCategory = row["category"]?.trim().toLowerCase();
          const rowSubcategory = row["subcategory"]?.trim().toLowerCase();
          const rowQuestion = row["question"]?.trim();
          const rowDefinition = row["definition"]?.trim();

          if (
            rowCategory === category.toLowerCase() &&
            rowSubcategory === subcategory.toLowerCase()
          ) {
            if (!subDefinition && rowDefinition) {
              subDefinition = rowDefinition;
            }
            if (rowQuestion) {
              questionsList.push(rowQuestion);
            }
          }
        });

        setDefinition(subDefinition);
        setQuestions(questionsList);
      })
      .catch((err) => {
        console.error("Error loading questions:", err);
        setError(`Failed to load questions: ${err.message}`);
      });
  };

  return (
    <div className="app-container">
      <Sidebar
        categories={categories}
        isLoading={isLoading}
        error={error}
        onSubcategoryClick={handleSubcategoryClick}
      />

      <main className="main-content">
        <div className="content-header">
          <h1 className="text-2xl font-bold mb-4">Data Quality Index</h1>
        </div>
        <div className="content-body">
          {error && <p className="error mb-4">{error}</p>}

          {activeCategory && activeSubcategory && (
            <>
              <h2 className="text-xl font-semibold mb-2">
                {activeCategory} / {activeSubcategory}
              </h2>

              {activeLegend && (
                <div className="legend mb-4">
                  <h3 className="text-lg font-semibold">Legend</h3>
                  <p>{activeLegend}</p>
                </div>
              )}

              {questions.length > 0 ? (
                <SubcategoryQuestions questions={questions} definition={definition} />
              ) : (
                <p className="text-gray-500 italic">No questions available.</p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
