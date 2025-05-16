import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Sidebar from "./components/Sidebar";
import "./App.css";

interface CategoryData {
  [category: string]: {
    icon: string;
    subcategories: string[];
  };
}

const App: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch("/data/Heading.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
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
          const iconRaw = row["icon"]?.trim();
          const category = row["category"]?.trim();
          const subcategory = row["subcategory"]?.trim();

          if (!iconRaw || !category) return;

          if (!result[category]) {
            result[category] = {
              icon: iconRaw, // e.g. fa-star
              subcategories: [],
            };
          }

          if (
            subcategory &&
            subcategory.toLowerCase() !== "none" &&
            !result[category].subcategories.includes(subcategory)
          ) {
            result[category].subcategories.push(subcategory);
          }
        });

        setCategories(result);
      })
      .catch((err) => {
        console.error("Error loading CSV:", err);
        setError(`Failed to load categories: ${err.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <Sidebar categories={categories} isLoading={isLoading} error={error} />
      <main className="main-content">
        <h1 className="text-2xl font-bold">Content Area</h1>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </main>
    </div>
  );
};

export default App;
