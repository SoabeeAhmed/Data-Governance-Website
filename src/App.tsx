// App.tsx
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import Sidebar from "./components/Sidebar";
import "./App.css";

interface CategoryData {
  [category: string]: string[];
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
        console.log("CSV data loaded:", csvData.substring(0, 100) + "...");

        const parsed = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim().toLowerCase(),
        });

        console.log("Parsed data:", parsed.data);

        if (parsed.errors.length > 0) {
          console.error("CSV parsing errors:", parsed.errors);
        }

        const result: CategoryData = {};
        parsed.data.forEach((row: any) => {
          const rowEntries = Object.entries(row);
          const category = rowEntries.find(([key]) => key.toLowerCase() === "category")?.[1]?.trim();
          const subcategory = rowEntries.find(([key]) => key.toLowerCase() === "subcategory")?.[1]?.trim();

          console.log("Category:", category, "Subcategory:", subcategory);

          if (category && subcategory) {
            if (!result[category]) {
              result[category] = [];
            }
            if (!result[category].includes(subcategory)) {
              result[category].push(subcategory);
            }
          }
        });

        console.log("Processed categories:", result);
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
