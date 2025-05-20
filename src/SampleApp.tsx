import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import SubcategoryQuestions from "./components/SubcategoryQuestions";
import "./App.css";

interface CategoryData {
  [category: string]: {
    icon: string;
    subcategories: string[];
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
    
  
    setTimeout(() => {
      const mockCategories: CategoryData = {
        "Data Quality": {
          icon: "faCheckCircle",
          subcategories: [
            "Data Accuracy",
            "Data Completeness",
            "Data Consistency",
            "Data Reliability",
            "Data Quality Improvement & Training",
            "Data Quality Technology & Tools",
            "Data Quality Reporting & Compliance",
            "Data Quality Governance & Management"
          ]
        },
        "Data Security": {
          icon: "faLock",
          subcategories: ["Data Encryption", "Access Control", "Threat Detection"]
        },
        "Data Privacy": {
          icon: "faUserShield",
          subcategories: ["Consent Management", "Data Anonymization", "Privacy Compliance"]
        },
        "Data Policies": {
          icon: "faFileAlt",
          subcategories: ["Policy Documentation", "Enforcement", "Updates & Revisions"]
        },
        "Data Ownership": {
          icon: "faUsersCog",
          subcategories: ["Stewardship Roles", "Accountability Framework", "Ownership Transfer"]
        },
        "Data Architecture": {
          icon: "faDatabase",
          subcategories: ["Data Models", "Integration Patterns", "Technical Standards"]
        },
        "Data Procurement": {
          icon: "faShoppingCart",
          subcategories: ["Vendor Assessment", "Contract Management", "Data Acquisition"]
        },
        "Data Cataloging": {
          icon: "faSearch",
          subcategories: ["Metadata Management", "Search Capabilities", "Data Discovery"]
        }
      };
      
      setCategories(mockCategories);
      setIsLoading(false);
      
      // Get stored assessment data from localStorage
      const loadScores = () => {
        try {
          const submittedData = localStorage.getItem('dataQualityAssessmentSubmitted');
          if (submittedData) {
            // If we have submitted assessment data, use it to calculate real scores
            const categoryScoresData: { [key: string]: number } = {};
            
            // This is a simplification - in a real app, you would calculate based on assessment data
            // Default to mock data for any missing categories
            // Data Quality scores
            categoryScoresData["Data Accuracy"] = 4.2;
            categoryScoresData["Data Completeness"] = 3.8;
            categoryScoresData["Data Consistency"] = 3.5;
            categoryScoresData["Data Reliability"] = 4.0;
            categoryScoresData["Data Quality Improvement & Training"] = 3.2;
            categoryScoresData["Data Quality Technology & Tools"] = 3.6;
            categoryScoresData["Data Quality Reporting & Compliance"] = 3.9;
            categoryScoresData["Data Quality Governance & Management"] = 3.4;
            
            // Data Security scores
            categoryScoresData["Data Encryption"] = 4.3;
            categoryScoresData["Access Control"] = 3.7;
            categoryScoresData["Threat Detection"] = 3.2;
            
            // Data Privacy scores
            categoryScoresData["Consent Management"] = 3.6;
            categoryScoresData["Data Anonymization"] = 4.1;
            categoryScoresData["Privacy Compliance"] = 3.9;
            
            // Data Policies scores
            categoryScoresData["Policy Documentation"] = 3.8;
            categoryScoresData["Enforcement"] = 3.0;
            categoryScoresData["Updates & Revisions"] = 2.8;
            
            // Data Ownership scores
            categoryScoresData["Stewardship Roles"] = 3.4;
            categoryScoresData["Accountability Framework"] = 3.3;
            categoryScoresData["Ownership Transfer"] = 3.5;
            
            // Data Architecture scores
            categoryScoresData["Data Models"] = 4.0;
            categoryScoresData["Integration Patterns"] = 3.7;
            categoryScoresData["Technical Standards"] = 3.9;
            
            // Data Procurement scores
            categoryScoresData["Vendor Assessment"] = 3.6;
            categoryScoresData["Contract Management"] = 3.8;
            categoryScoresData["Data Acquisition"] = 3.5;
            
            // Data Cataloging scores
            categoryScoresData["Metadata Management"] = 3.3;
            categoryScoresData["Search Capabilities"] = 3.7;
            categoryScoresData["Data Discovery"] = 3.9;
            
            setCategoryScores(categoryScoresData);
            
            // Calculate overall score as average of category scores
            const sum = Object.values(categoryScoresData).reduce((total, score) => total + score, 0);
            const avg = sum / Object.values(categoryScoresData).length;
            setOverallScore(avg);
          } else {
            // If no submitted data, use sample data
            const categoryScoresData: { [key: string]: number } = {};
            
            // Data Quality scores
            categoryScoresData["Data Accuracy"] = 4.2;
            categoryScoresData["Data Completeness"] = 3.8;
            categoryScoresData["Data Consistency"] = 3.5;
            categoryScoresData["Data Reliability"] = 4.0;
            categoryScoresData["Data Quality Improvement & Training"] = 3.2;
            categoryScoresData["Data Quality Technology & Tools"] = 3.6;
            categoryScoresData["Data Quality Reporting & Compliance"] = 3.9;
            categoryScoresData["Data Quality Governance & Management"] = 3.4;
            
            // Data Security scores
            categoryScoresData["Data Encryption"] = 4.3;
            categoryScoresData["Access Control"] = 3.7;
            categoryScoresData["Threat Detection"] = 3.2;
            
            // Data Privacy scores
            categoryScoresData["Consent Management"] = 3.6;
            categoryScoresData["Data Anonymization"] = 4.1;
            categoryScoresData["Privacy Compliance"] = 3.9;
            
            // Data Policies scores
            categoryScoresData["Policy Documentation"] = 3.8;
            categoryScoresData["Enforcement"] = 3.0;
            categoryScoresData["Updates & Revisions"] = 2.8;
            
            // Data Ownership scores
            categoryScoresData["Stewardship Roles"] = 3.4;
            categoryScoresData["Accountability Framework"] = 3.3;
            categoryScoresData["Ownership Transfer"] = 3.5;
            
            // Data Architecture scores
            categoryScoresData["Data Models"] = 4.0;
            categoryScoresData["Integration Patterns"] = 3.7;
            categoryScoresData["Technical Standards"] = 3.9;
            
            // Data Procurement scores
            categoryScoresData["Vendor Assessment"] = 3.6;
            categoryScoresData["Contract Management"] = 3.8;
            categoryScoresData["Data Acquisition"] = 3.5;
            
            // Data Cataloging scores
            categoryScoresData["Metadata Management"] = 3.3;
            categoryScoresData["Search Capabilities"] = 3.7;
            categoryScoresData["Data Discovery"] = 3.9;
            
            setCategoryScores(categoryScoresData);
            setOverallScore(3.7);
          }
        } catch (error) {
          console.error("Error loading scores:", error);
          // Fall back to default mock data
          setCategoryScores({
            "Data Accuracy": 4.2,
            "Data Completeness": 3.8,
            "Data Consistency": 3.5,
            "Data Reliability": 4.0,
            "Data Quality Improvement & Training": 3.2,
            "Data Quality Technology & Tools": 3.6,
            "Data Quality Reporting & Compliance": 3.9,
            "Data Quality Governance & Management": 3.4
          });
          setOverallScore(3.7);
        }
      };
      
      loadScores();
      
      // Sample recommended actions
      setRecommendedActions([
        {
          title: "Implement data validation rules",
          description: "Add validation checks during data entry to prevent inaccuracies.",
          priority: "high"
        },
        {
          title: "Schedule monthly data reconciliation",
          description: "Compare data across systems to identify and resolve inconsistencies.",
          priority: "medium"
        },
        {
          title: "Create data quality dashboard",
          description: "Build an accessible dashboard to monitor key quality metrics.",
          priority: "low"
        },
        {
          title: "Review encryption protocols",
          description: "Ensure all sensitive data is properly encrypted at rest and in transit.",
          priority: "high"
        },
        {
          title: "Update data privacy policies",
          description: "Align privacy policies with latest regulatory requirements.",
          priority: "medium"
        },
        {
          title: "Implement data ownership training",
          description: "Train staff on data stewardship responsibilities.",
          priority: "medium"
        }
      ]);
    }, 800);
  }, []);

  // Handle subcategory selection
  const handleSubcategoryClick = (category: string, subcategory: string) => {
    setActiveCategory(category);
    setActiveSubcategory(subcategory);
    
    // Generate sample questions based on the subcategory
    let sampleQuestions: Question[] = [];
    let sampleDefinition = "";
    
    if (subcategory === "Data Consistency") {
      sampleDefinition = "Data consistency ensures information is uniform across different datasets and systems. It verifies that data remains coherent and compatible throughout the organization.";
      sampleQuestions = [
        { id: 1, text: "Are there clear guidelines for maintaining consistency in data formats (e.g., date formats, currency)?" },
        { id: 2, text: "Is there a mechanism to resolve inconsistencies between different data sources?" },
        { id: 3, text: "Are data consistency checks performed automatically across systems and platforms?" },
        { id: 4, text: "Do you have data standards documentation that all teams follow?" }
      ];
    } else if (subcategory === "Data Accuracy") {
      sampleDefinition = "Data accuracy measures how well data represents the real-world entity or event it describes. Accurate data is error-free, valid, and represents reality.";
      sampleQuestions = [
        { id: 1, text: "How often is data validated against source systems?" },
        { id: 2, text: "What percentage of data meets defined accuracy thresholds?" },
        { id: 3, text: "Are there automated checks to identify outliers or impossible values?" },
        { id: 4, text: "How quickly are accuracy issues resolved once identified?" }
      ];
    } else {
      // Generic questions for other subcategories
      sampleDefinition = `${subcategory} is an important dimension of data quality that ensures data reliability and trustworthiness across the organization.`;
      sampleQuestions = [
        { id: 1, text: `Are there established metrics for measuring ${subcategory.toLowerCase()}?` },
        { id: 2, text: `Does the organization have a formal process for managing ${subcategory.toLowerCase()}?` },
        { id: 3, text: `Is there regular reporting on ${subcategory.toLowerCase()} to leadership?` },
        { id: 4, text: `Are there automated tools used to monitor ${subcategory.toLowerCase()}?` }
      ];
    }
    
    setDefinition(sampleDefinition);
    setQuestions(sampleQuestions);
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
              
              <div className="mt-6 bg-white shadow rounded p-4">
                <h2 className="text-xl font-semibold mb-2">Recommended Actions</h2>
                <div className="recommended-actions-list">
                  <div className="action-item bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 rounded">
                    <h3 className="font-medium">Implement data validation rules</h3>
                    <p className="text-sm text-gray-600">Add validation checks during data entry to prevent inaccuracies.</p>
                  </div>
                  <div className="action-item bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded">
                    <h3 className="font-medium">Schedule monthly data reconciliation</h3>
                    <p className="text-sm text-gray-600">Compare data across systems to identify and resolve inconsistencies.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;