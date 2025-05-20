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

interface Question {
  text: string;
  id: number;
}

const App: React.FC = () => {
  const [categories, setCategories] = useState<CategoryData>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [definition, setDefinition] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [categoryScores, setCategoryScores] = useState<{[key: string]: number}>({});
  const [recommendedActions, setRecommendedActions] = useState<{title: string, description: string, priority: string}[]>([]);
  const [activeLegend, setActiveLegend] = useState<string | null>(null);

  
  const updateDashboardScores = () => {
    try {
      const submittedDataStr = localStorage.getItem('dataQualityAssessmentSubmitted');
      if (!submittedDataStr) return;
      
      const assessments = JSON.parse(submittedDataStr);
      if (!assessments || (Array.isArray(assessments) && assessments.length === 0)) return;
      
      const assessmentArray = Array.isArray(assessments) ? assessments : [assessments];
      
      
      const scoresByCategory: {[key: string]: number[]} = {};
      
      assessmentArray.forEach(assessment => {
        const subcategory = assessment.subcategory;
        if (!subcategory) return;
        
        if (!scoresByCategory[subcategory]) {
          scoresByCategory[subcategory] = [];
        }
        
        if (assessment.averageScore) {
          scoresByCategory[subcategory].push(assessment.averageScore);
        }
      });
      
    
      const newCategoryScores: {[key: string]: number} = {};
      
      Object.entries(scoresByCategory).forEach(([category, scores]) => {
        if (scores.length > 0) {
          const sum = scores.reduce((total, score) => total + score, 0);
          newCategoryScores[category] = parseFloat((sum / scores.length).toFixed(1));
        }
      });
      
      
      if (Object.keys(newCategoryScores).length > 0) {
        
        setCategoryScores(prev => {
          const updated = {...prev, ...newCategoryScores};
          const overallSum = Object.values(updated).reduce((total, score) => total + score, 0);
          const overallAvg = overallSum / Object.values(updated).length;
          setOverallScore(parseFloat(overallAvg.toFixed(1)));
          
          return updated;
        });
      }
    } catch (error) {
      console.error("Error updating dashboard scores:", error);
    }
  };

  
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

  // Load scores from localStorage or fallback to mock data
  const loadScores = () => {
    try {
      const submittedData = localStorage.getItem("dataQualityAssessmentSubmitted");
      const categoryScoresData: { [key: string]: number } = {};

      const mockScores = {
        // Data Quality
        "Data Accuracy": 4.2,
        "Data Completeness": 3.8,
        "Data Consistency": 3.5,
        "Data Reliability": 4.0,
        "Data Quality Improvement & Training": 3.2,
        "Data Quality Technology & Tools": 3.6,
        "Data Quality Reporting & Compliance": 3.9,
        "Data Quality Governance & Management": 3.4,
        // Data Security
        "Data Encryption": 4.3,
        "Access Control": 3.7,
        "Threat Detection": 3.2,
        // Data Privacy
        "Consent Management": 3.6,
        "Data Anonymization": 4.1,
        "Privacy Compliance": 3.9,
        // Data Policies
        "Policy Documentation": 3.8,
        "Enforcement": 3.0,
        "Updates & Revisions": 2.8,
        // Data Ownership
        "Stewardship Roles": 3.4,
        "Accountability Framework": 3.3,
        "Ownership Transfer": 3.5,
        // Data Architecture
        "Data Models": 4.0,
        "Integration Patterns": 3.7,
        "Technical Standards": 3.9,
        // Data Procurement
        "Vendor Assessment": 3.6,
        "Contract Management": 3.8,
        "Data Acquisition": 3.5,
        // Data Cataloging
        "Metadata Management": 3.3,
        "Search Capabilities": 3.7,
        "Data Discovery": 3.9,
      };

      if (submittedData) {
        // You can replace this with real calculation logic if desired
        Object.assign(categoryScoresData, mockScores);
      } else {
        Object.assign(categoryScoresData, mockScores);
      }

      setCategoryScores(categoryScoresData);

      const avg =
        Object.values(categoryScoresData).reduce((sum, score) => sum + score, 0) /
        Object.values(categoryScoresData).length;

      setOverallScore(parseFloat(avg.toFixed(1)));
    } catch (error) {
      console.error("Error loading scores:", error);
    }
  };

  loadScores();

  // Load recommended actions
  setRecommendedActions([
    {
      title: "Implement data validation rules",
      description: "Add validation checks during data entry to prevent inaccuracies.",
      priority: "high",
    },
    {
      title: "Schedule monthly data reconciliation",
      description: "Compare data across systems to identify and resolve inconsistencies.",
      priority: "medium",
    },
    {
      title: "Create data quality dashboard",
      description: "Build an accessible dashboard to monitor key quality metrics.",
      priority: "low",
    },
    {
      title: "Review encryption protocols",
      description: "Ensure all sensitive data is properly encrypted at rest and in transit.",
      priority: "high",
    },
    {
      title: "Update data privacy policies",
      description: "Align privacy policies with latest regulatory requirements.",
      priority: "medium",
    },
    {
      title: "Implement data ownership training",
      description: "Train staff on data stewardship responsibilities.",
      priority: "medium",
    },
  ]);
}, []);

  // Handle subcategory selection
  const handleSubcategoryClick = (category: string, subcategory: string) => {
  setActiveCategory(category);
  setActiveSubcategory(subcategory);
  setDefinition(null);
  setQuestions([]);
  setError(null);

  // Set legend dynamically from pre-parsed categories state
  const legend = categories[category]?.legends?.[subcategory] || null;
  setActiveLegend(legend);

  // Determine which CSV file to load (e.g., /data/Data Quality.csv)
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
      setQuestions(
        questionsList.map((q, index) => ({ id: index + 1, text: q }))
      );
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
          <h1 className="text-2xl font-bold">Data Quality Index</h1>
        </div>
        
        <div className="content-body">
          {error && <p className="error mb-4">{error}</p>}

          {!activeCategory && !activeSubcategory && (
            <div className="dashboard-overview">
              <div className="overall-score-card">
                <h2 className="text-xl font-semibold mb-2">Overall Data Quality Score</h2>
                <div className="score-display">
                  <span className={`score ${overallScore >= 4 ? 'score-high' : overallScore >= 3 ? 'score-medium' : 'score-low'}`}>
                    {overallScore.toFixed(1)}
                  </span>
                  <div className="score-bar-container">
                    <div 
                      className={`score-bar ${overallScore >= 4 ? 'score-bar-high' : overallScore >= 3 ? 'score-bar-medium' : 'score-bar-low'}`} 
                      style={{ width: `${(overallScore / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Group scores by main category */}
              {Object.entries(categories).map(([mainCategory, data]) => {
                // Filter scores that belong to this category's subcategories
                const relevantScores = Object.entries(categoryScores).filter(([scoreName]) => 
                  data.subcategories.includes(scoreName)
                );
                
                if (relevantScores.length === 0) return null;
                
                return (
                  <div key={mainCategory} className="category-scores mt-6">
                    <h2 className="text-xl font-semibold mb-2">{mainCategory} Scores</h2>
                    <div className="score-cards-grid">
                      {relevantScores.map(([subcategory, score]) => (
                        <div key={subcategory} className="category-score-card">
                          <h3 className="text-md font-medium">{subcategory}</h3>
                          <div className="score-display-small">
                            <span className={`score-small ${score >= 4 ? 'score-high' : score >= 3 ? 'score-medium' : 'score-low'}`}>
                              {score.toFixed(1)}
                            </span>
                            <div className="score-bar-container">
                              <div 
                                className={`score-bar ${score >= 4 ? 'score-bar-high' : score >= 3 ? 'score-bar-medium' : 'score-bar-low'}`} 
                                style={{ width: `${(score / 5) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              <div className="recommended-actions mt-6">
                <h2 className="text-xl font-semibold mb-2">Recommended Actions</h2>
                <div className="action-cards">
                  {recommendedActions.map((action, index) => (
                    <div key={index} className={`action-card action-${action.priority}`}>
                      <h3 className="text-md font-medium">{action.title}</h3>
                      <p className="text-sm">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeCategory && activeSubcategory && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {activeCategory} / {activeSubcategory}
                </h2>
                <button 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                  onClick={() => {
                    setActiveCategory(null);
                    setActiveSubcategory(null);
                    // Update scores when returning to dashboard
                    updateDashboardScores();
                  }}
                >
                  <span className="mr-1">←</span> Back to Dashboard
                </button>
              </div>

              {questions.length > 0 ? (
                <SubcategoryQuestions 
                  questions={questions.map(q => q.text)}
                  definition={definition}
                  onReturn={() => {
                    setActiveCategory(null);
                    setActiveSubcategory(null);
                    // Update scores when returning to dashboard
                    updateDashboardScores();
                  }}
                />
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