// App.tsx - Enhanced version with interactive features (Fixed)
import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import SubcategoryQuestions from "./components/SubcategoryQuestions";
import "./App.css";

// Mock chart components since recharts isn't available
interface ChartDataPoint {
  month: string;
  overall: number;
  accuracy: number;
  completeness: number;
  consistency: number;
  reliability: number;
}

const MockLineChart = ({ data }: { data: ChartDataPoint[] }) => (
  <div style={{
    width: '100%',
    height: '300px',
    background: 'linear-gradient(45deg, #f0f9ff, #e0f2fe)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    border: '2px dashed #3b82f6'
  }}>
    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>
      📈 Trend Chart
    </div>
    <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
      {data.length > 0 && (
        <>
          Overall Score: {data[data.length - 1]?.overall?.toFixed(1)} <br />
          Latest Month: {data[data.length - 1]?.month}
        </>
      )}
    </div>
  </div>
);

const MockPieChart = ({ data }: { data: Array<{ name: string; value: number; fullName: string }> }) => (
  <div style={{
    width: '100%',
    height: '300px',
    background: 'linear-gradient(45deg, #fef3c7, #fbbf24)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    border: '2px dashed #f59e0b'
  }}>
    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#d97706', marginBottom: '0.5rem' }}>
      🍕 Distribution Chart
    </div>
    <div style={{ fontSize: '0.875rem', color: '#92400e', textAlign: 'center' }}>
      {data.length} Categories<br />
      Avg Score: {data.length > 0 ? (data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(1) : '0'}
    </div>
  </div>
);

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
  
  // Enhanced dashboard state
  const [dashboardView, setDashboardView] = useState('overview'); // overview, trends, insights
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 3 Months');
  const [showComparison, setShowComparison] = useState(false);
  const [selectedCategoryForDetail, setSelectedCategoryForDetail] = useState<string | null>(null);
  const [notifications] = useState([
    { id: 1, type: 'warning', message: 'Data Consistency score needs attention', time: '2 hours ago' },
    { id: 2, type: 'success', message: 'Data Accuracy improved by 0.5 points', time: '1 day ago' },
    { id: 3, type: 'info', message: 'New assessment available for Data Privacy', time: '3 days ago' }
  ]);

  // Mock historical data for trends
  const historicalData = [
    { month: 'Jan', overall: 3.4, accuracy: 4.0, completeness: 3.6, consistency: 3.2, reliability: 3.8 },
    { month: 'Feb', overall: 3.5, accuracy: 4.1, completeness: 3.7, consistency: 3.3, reliability: 3.9 },
    { month: 'Mar', overall: 3.6, accuracy: 4.2, completeness: 3.8, consistency: 3.5, reliability: 4.0 },
  ];
  
  const updateDashboardScores = () => {
    try {
      const submittedDataStr = localStorage.getItem('dataQualityAssessmentSubmitted');
      if (!submittedDataStr) return;
      
      const assessments = JSON.parse(submittedDataStr);
      if (!assessments || (Array.isArray(assessments) && assessments.length === 0)) return;
      
      const assessmentArray = Array.isArray(assessments) ? assessments : [assessments];
      
      const scoresByCategory: {[key: string]: number[]} = {};
      
      assessmentArray.forEach((assessment: { subcategory?: string; averageScore?: number }) => {
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

  // Helper functions for enhanced UI
  const getScoreColor = (score: number) => {
    if (score >= 4.0) return '#10B981';
    if (score >= 3.0) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 4.5) return 'A+';
    if (score >= 4.0) return 'A';
    if (score >= 3.5) return 'B+';
    if (score >= 3.0) return 'B';
    if (score >= 2.5) return 'C+';
    if (score >= 2.0) return 'C';
    return 'D';
  };

  const getProgressPercentage = (score: number) => (score / 5) * 100;

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
      
      const loadScores = () => {
        try {
          const categoryScoresData: { [key: string]: number } = {};
          
          // Default scores
          categoryScoresData["Data Accuracy"] = 4.2;
          categoryScoresData["Data Completeness"] = 3.8;
          categoryScoresData["Data Consistency"] = 3.5;
          categoryScoresData["Data Reliability"] = 4.0;
          categoryScoresData["Data Quality Improvement & Training"] = 3.2;
          categoryScoresData["Data Quality Technology & Tools"] = 3.6;
          categoryScoresData["Data Quality Reporting & Compliance"] = 3.9;
          categoryScoresData["Data Quality Governance & Management"] = 3.4;
          categoryScoresData["Data Encryption"] = 4.3;
          categoryScoresData["Access Control"] = 3.7;
          categoryScoresData["Threat Detection"] = 3.2;
          categoryScoresData["Consent Management"] = 3.6;
          categoryScoresData["Data Anonymization"] = 4.1;
          categoryScoresData["Privacy Compliance"] = 3.9;
          categoryScoresData["Policy Documentation"] = 3.8;
          categoryScoresData["Enforcement"] = 3.0;
          categoryScoresData["Updates & Revisions"] = 2.8;
          categoryScoresData["Stewardship Roles"] = 3.4;
          categoryScoresData["Accountability Framework"] = 3.3;
          categoryScoresData["Ownership Transfer"] = 3.5;
          categoryScoresData["Data Models"] = 4.0;
          categoryScoresData["Integration Patterns"] = 3.7;
          categoryScoresData["Technical Standards"] = 3.9;
          categoryScoresData["Vendor Assessment"] = 3.6;
          categoryScoresData["Contract Management"] = 3.8;
          categoryScoresData["Data Acquisition"] = 3.5;
          categoryScoresData["Metadata Management"] = 3.3;
          categoryScoresData["Search Capabilities"] = 3.7;
          categoryScoresData["Data Discovery"] = 3.9;
          
          setCategoryScores(categoryScoresData);
          
          const submittedData = localStorage.getItem('dataQualityAssessmentSubmitted');
          if (submittedData) {
            updateDashboardScores();
          } else {
            const sum = Object.values(categoryScoresData).reduce((total, score) => total + score, 0);
            const avg = sum / Object.values(categoryScoresData).length;
            setOverallScore(avg);
          }
        } catch (error) {
          console.error("Error loading scores:", error);
        }
      };
      
      loadScores();
      
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

  const handleSubcategoryClick = (category: string, subcategory: string) => {
    setActiveCategory(category);
    setActiveSubcategory(subcategory);
    
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

  // Enhanced Score Card Component
  const EnhancedScoreCard = ({ title, score, trend, onClick, isSelected = false }: {
    title: string;
    score: number;
    trend?: number;
    onClick?: () => void;
    isSelected?: boolean;
  }) => (
    <div 
      className={`enhanced-score-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        border: isSelected ? `2px solid ${getScoreColor(score)}` : '2px solid transparent'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280', margin: 0 }}>{title}</h3>
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            fontSize: '0.75rem', 
            color: trend > 0 ? '#10B981' : '#EF4444' 
          }}>
            <span>{trend > 0 ? '↗' : '↘'}</span>
            <span style={{ marginLeft: '0.25rem' }}>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: getScoreColor(score) }}>
            {score.toFixed(1)}
          </span>
          <span style={{ fontSize: '0.875rem', color: '#9CA3AF', marginLeft: '0.5rem' }}>/5.0</span>
        </div>
        <div style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
          backgroundColor: getScoreColor(score) + '20',
          color: getScoreColor(score)
        }}>
          {getScoreGrade(score)}
        </div>
      </div>
      
      <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
        <div 
          style={{
            height: '100%',
            width: `${getProgressPercentage(score)}%`,
            backgroundColor: getScoreColor(score),
            transition: 'width 0.5s ease',
            borderRadius: '4px'
          }}
        />
      </div>
    </div>
  );

  // Enhanced Overall Score Widget
  const EnhancedOverallScoreWidget = () => (
    <div style={{
      background: 'linear-gradient(135deg, #EBF8FF 0%, #E0E7FF 100%)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937', marginBottom: '0.5rem' }}>
            Overall Data Quality Score
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Your organization's data health snapshot</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: getScoreColor(overallScore), marginBottom: '0.5rem' }}>
            {overallScore.toFixed(1)}
          </div>
          <div style={{
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '600',
            backgroundColor: getScoreColor(overallScore) + '20',
            color: getScoreColor(overallScore)
          }}>
            Grade: {getScoreGrade(overallScore)}
          </div>
        </div>
      </div>
      
      {/* Progress Ring */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          <svg style={{ width: '120px', height: '120px', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
            <path
              style={{ fill: 'none', stroke: '#E5E7EB', strokeWidth: '3' }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              style={{ 
                fill: 'none', 
                stroke: getScoreColor(overallScore), 
                strokeWidth: '3', 
                strokeLinecap: 'round',
                strokeDasharray: `${getProgressPercentage(overallScore)}, 100`,
                transition: 'stroke-dasharray 1s ease'
              }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            {getProgressPercentage(overallScore).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );

  // Notifications Panel
  const NotificationsPanel = () => (
    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937' }}>Recent Alerts</h3>
        <button style={{ fontSize: '0.875rem', color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }}>
          View All
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.map((notification) => (
          <div key={notification.id} style={{
            padding: '0.75rem',
            borderRadius: '8px',
            borderLeft: `4px solid ${
              notification.type === 'warning' ? '#F59E0B' :
              notification.type === 'success' ? '#10B981' : '#3B82F6'
            }`,
            backgroundColor: notification.type === 'warning' ? '#FFFBEB' :
              notification.type === 'success' ? '#ECFDF5' : '#EBF8FF'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#374151', margin: '0 0 0.25rem 0' }}>{notification.message}</p>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>{notification.time}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Quick Actions Panel
  const QuickActionsPanel = () => {
    const actions = [
      { label: '📊 New Assessment', color: '#3B82F6' },
      { label: '📈 View Reports', color: '#10B981' },
      { label: '⚙️ Settings', color: '#8B5CF6' },
      { label: '📋 Export Data', color: '#F59E0B' }
    ];

    return (
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {actions.map((action, index) => (
            <button key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              backgroundColor: action.color + '10',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = action.color + '20'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = action.color + '10'}
            >
              <span style={{ color: action.color, fontWeight: '500', fontSize: '0.875rem' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h1 className="text-2xl font-bold">Data Quality Index</h1>
            
            {/* Dashboard View Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', background: 'white', borderRadius: '8px', padding: '0.25rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                {['overview', 'trends', 'insights'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setDashboardView(view)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: dashboardView === view ? '#3B82F6' : 'transparent',
                      color: dashboardView === view ? 'white' : '#6B7280'
                    }}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
              
              <button style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>+</span>
                New Assessment
              </button>
            </div>
          </div>
        </div>
        
        <div className="content-body">
          {error && <p className="error mb-4">{error}</p>}

          {!activeCategory && !activeSubcategory && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Main Dashboard Content */}
              <div style={{ flex: '1' }}>
                {/* Enhanced Overall Score */}
                <EnhancedOverallScoreWidget />
                
                {dashboardView === 'overview' && (
                  <>
                    {/* Group scores by main category with enhanced cards */}
                    {Object.entries(categories).map(([mainCategory, data]) => {
                      const relevantScores = Object.entries(categoryScores).filter(([scoreName]) => 
                        data.subcategories.includes(scoreName)
                      );
                      
                      if (relevantScores.length === 0) return null;
                      
                      return (
                        <div key={mainCategory} style={{ marginBottom: '2rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F2937' }}>{mainCategory} Scores</h2>
                            <button 
                              onClick={() => setShowComparison(!showComparison)}
                              style={{ 
                                fontSize: '0.875rem', 
                                color: '#3B82F6', 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer' 
                              }}
                            >
                              {showComparison ? 'Hide' : 'Show'} Comparison
                            </button>
                          </div>
                          
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                            gap: '1rem' 
                          }}>
                            {relevantScores.map(([subcategory, score]) => (
                              <EnhancedScoreCard
                                key={subcategory}
                                title={subcategory}
                                score={score}
                                trend={Math.random() > 0.5 ? Math.floor(Math.random() * 10) : -Math.floor(Math.random() * 10)}
                                onClick={() => setSelectedCategoryForDetail(
                                  selectedCategoryForDetail === subcategory ? null : subcategory
                                )}
                                isSelected={selectedCategoryForDetail === subcategory}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {dashboardView === 'trends' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                    {/* Trend Chart */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937' }}>Score Trends</h3>
                        <select 
                          value={selectedTimeframe}
                          onChange={(e) => setSelectedTimeframe(e.target.value)}
                          style={{ fontSize: '0.875rem', border: '1px solid #D1D5DB', borderRadius: '6px', padding: '0.5rem' }}
                        >
                          <option>Last 3 Months</option>
                          <option>Last 6 Months</option>
                          <option>Last Year</option>
                        </select>
                      </div>
                      
                      <MockLineChart data={historicalData} />
                    </div>

                    {/* Category Distribution Pie Chart */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Score Distribution</h3>
                      <MockPieChart data={Object.entries(categoryScores).slice(0, 8).map(([name, value]) => ({
                        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
                        value: value,
                        fullName: name
                      }))} />
                    </div>
                  </div>
                )}

                {dashboardView === 'insights' && (
                  <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', marginTop: '1rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>AI-Powered Insights</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ padding: '1rem', backgroundColor: '#EBF8FF', borderRadius: '8px', borderLeft: '4px solid #3B82F6' }}>
                        <h4 style={{ fontWeight: '600', color: '#1E40AF', marginBottom: '0.5rem' }}>📊 Performance Analysis</h4>
                        <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                          Your overall data quality has improved by 8% over the last quarter. Data Accuracy leads with 4.2/5.0.
                        </p>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                        <h4 style={{ fontWeight: '600', color: '#92400E', marginBottom: '0.5rem' }}>⚠️ Areas for Improvement</h4>
                        <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                          Data Consistency (3.5/5.0) and Updates & Revisions (2.8/5.0) need immediate attention.
                        </p>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: '#ECFDF5', borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                        <h4 style={{ fontWeight: '600', color: '#065F46', marginBottom: '0.5rem' }}>🎯 Recommendations</h4>
                        <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                          Focus on implementing automated consistency checks and establishing regular policy review cycles.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Recommended Actions */}
                <div style={{ marginTop: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>
                    Recommended Actions
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {recommendedActions.map((action, index) => (
                      <div key={index} style={{
                        padding: '1.5rem',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        borderLeft: `4px solid ${
                          action.priority === 'high' ? '#EF4444' : 
                          action.priority === 'medium' ? '#F59E0B' : '#10B981'
                        }`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1F2937', margin: 0 }}>{action.title}</h3>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: action.priority === 'high' ? '#FEE2E2' : 
                              action.priority === 'medium' ? '#FEF3C7' : '#D1FAE5',
                            color: action.priority === 'high' ? '#DC2626' : 
                              action.priority === 'medium' ? '#D97706' : '#059669'
                          }}>
                            {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                          </span>
                        </div>
                        <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: '1.5', margin: 0 }}>{action.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Sidebar */}
              <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <NotificationsPanel />
                <QuickActionsPanel />
                
                {/* Key Insights Panel */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Key Insights</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#ECFDF5', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.875rem', color: '#065F46', fontWeight: '500', margin: '0 0 0.25rem 0' }}>
                        ✅ Data Accuracy Improved
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#059669', margin: 0 }}>Up 0.5 points this month</p>
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: '500', margin: '0 0 0.25rem 0' }}>
                        ⚠️ Consistency Needs Attention
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#D97706', margin: 0 }}>Below target threshold</p>
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: '#EBF8FF', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.875rem', color: '#1E40AF', fontWeight: '500', margin: '0 0 0.25rem 0' }}>
                        📈 Overall Trend Positive
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#3B82F6', margin: 0 }}>3-month improvement streak</p>
                    </div>
                  </div>
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