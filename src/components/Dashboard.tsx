// import React, { useEffect, useState } from "react";

// interface DashboardProps {
//   categories: {
//     [category: string]: {
//       icon: string;
//       subcategories: string[];
//       legends: { [subcategory: string]: string };
//     };
//   };
//   categoryScores: { [key: string]: { [key: string]: number } };
//   onSubcategoryClick: (category: string, subcategory: string) => void;
// }

// interface AssessmentEntry {
//   category: string;
//   subcategory: string;
//   averageScore: number;
// }

// const Dashboard: React.FC<DashboardProps> = ({
//   categories,
//   categoryScores,
//   onSubcategoryClick,
// }) => {
//   const [overallScore, setOverallScore] = useState<number>(0);
//   const [aggregatedCategoryScores, setAggregatedCategoryScores] = useState<{ [key: string]: number }>({});
//   const [recommendedActions, setRecommendedActions] = useState<{
//     title: string;
//     description: string;
//     priority: string;
//     category?: string;
//     subcategory?: string;
//   }[]>([]);

//   useEffect(() => {
//     calculateScores();
//     generateRecommendedActions();
//   }, [categoryScores, categories]);

//   const calculateScores = () => {
//     const aggregated: { [key: string]: number } = {};
//     let totalScore = 0;
//     let totalEntries = 0;

//     Object.entries(categoryScores).forEach(([category, subcategories]) => {
//       const subcategoryScores = Object.values(subcategories);
//       if (subcategoryScores.length > 0) {
//         const categoryAvg = subcategoryScores.reduce((sum, score) => sum + score, 0) / subcategoryScores.length;
//         aggregated[category] = categoryAvg;
//         totalScore += categoryAvg;
//         totalEntries++;
//       } else {
//         aggregated[category] = 0;
//       }
//     });

//     Object.keys(categories).forEach(category => {
//       if (aggregated[category] === undefined) {
//         aggregated[category] = 0;
//       }
//     });

//     setAggregatedCategoryScores(aggregated);
//     setOverallScore(totalEntries > 0 ? totalScore / totalEntries : 0);
//   };

//   const generateRecommendedActions = () => {
//     const actions: {
//       title: string;
//       description: string;
//       priority: string;
//       category?: string;
//       subcategory?: string;
//     }[] = [];

//     Object.entries(categoryScores).forEach(([category, subcategories]) => {
//       Object.entries(subcategories).forEach(([subcategory, score]) => {
//         if (score < 3) {
//           const priority = score < 2 ? "high" : "medium";
//           actions.push({
//             title: `Improve ${subcategory} in ${category}`,
//             description: `Current score is ${score.toFixed(1)}/5.`,
//             priority,
//             category,
//             subcategory,
//           });
//         }
//       });
//     });

//     if (actions.length < 2) {
//       if (Object.keys(categoryScores).length === 0) {
//         actions.push({
//           title: "Start your data quality assessment",
//           description: "Complete assessments for at least one subcategory to see recommendations.",
//           priority: "medium",
//         });
//       } else {
//         actions.push({
//           title: "Continue data quality assessment",
//           description: "Complete assessments for more subcategories to get better insights.",
//           priority: "medium",
//         });
//       }
//     }

//     const sortedActions = actions
//       .sort((a, b) => {
//         if (a.priority === "high" && b.priority !== "high") return -1;
//         if (a.priority !== "high" && b.priority === "high") return 1;
//         return 0;
//       })
//       .slice(0, 5);

//     setRecommendedActions(sortedActions);
//   };

//   const getScoreColorClass = (score: number): string => {
//     if (score >= 4) return "score-high";
//     if (score >= 3) return "score-medium";
//     return "score-low";
//   };

//   const getCompletionStats = () => {
//     const totalSubcategories = Object.values(categories).reduce(
//       (sum, category) => sum + category.subcategories.length,
//       0
//     );

//     const completedSubcategories = Object.values(categoryScores).reduce(
//       (sum, subcategories) => sum + Object.keys(subcategories).length,
//       0
//     );

//     return {
//       completed: completedSubcategories,
//       total: totalSubcategories,
//       percentage: totalSubcategories > 0
//         ? Math.round((completedSubcategories / totalSubcategories) * 100)
//         : 0,
//     };
//   };

//   const completion = getCompletionStats();

//   return (
//     <div className="dashboard-overview">
//       <div className="overall-score-card">
//         <h2 className="text-xl font-semibold mb-2">Overall Data Quality Score</h2>
//         <div className="score-display">
//           <span className={`score ${getScoreColorClass(overallScore)}`}>
//             {overallScore.toFixed(1)}
//           </span>
//           <div className="score-bar-container">
//             <div
//               className={`score-bar score-bar-${getScoreColorClass(overallScore).split('-')[1]}`}
//               style={{ width: `${(overallScore / 5) * 100}%` }}
//             ></div>
//           </div>
//         </div>
//         <div className="assessment-progress mt-2">
//           <p>
//             Assessment completion: {completion.completed} of {completion.total} subcategories ({completion.percentage}%)
//           </p>
//         </div>
//       </div>

//       <div className="category-scores mt-6">
//         <h2 className="text-xl font-semibold mb-2">Category Scores</h2>
//         <div className="score-cards-grid">
//           {Object.entries(aggregatedCategoryScores).filter(([category, score]) => score > 0).map(([category, score]) => (
//             <div key={category} className="category-score-card">
//               <div className="categoryscore flex justify-between items-center mb-2">
//                 <h3 className="text-md font-medium">{category}</h3>
//                 <span className={`score-small ${getScoreColorClass(score)}`}>
//                   {score.toFixed(1)}
//                 </span>
//               </div>
//               <div className="score-bar-container">
//                 <div
//                   className={`score-bar score-bar-${getScoreColorClass(score).split('-')[1]}`}
//                   style={{ width: `${(score / 5) * 100}%` }}
//                 ></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="recommended-actions mt-6">
//         <h2 className="text-xl font-semibold mb-2">Recommended Actions</h2>
//         <div className="action-cards">
//           {recommendedActions.map((action, index) => (
//             <div key={index} className={`action-card action-${action.priority}`}>
//               <h3 className="text-md font-medium">{action.title}</h3>
//               <p className="text-sm">
//                 {action.description}{" "}
//                 {action.category && action.subcategory && (
//                   <button
//                     className="text-blue-600 underline hover:text-blue-800"
//                     onClick={() => onSubcategoryClick(action.category!, action.subcategory!)}
//                   >
//                     Click to view assessment
//                   </button>
//                 )}
//               </p>
//               <div className="action-priority-tag">
//                 {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)} Priority
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface DashboardProps {
  categories: {
    [category: string]: {
      icon: string;
      subcategories: string[];
      legends: { [subcategory: string]: string };
    };
  };
  categoryScores: { [key: string]: { [key: string]: number } };
  onSubcategoryClick: (category: string, subcategory: string) => void;
}

interface AssessmentEntry {
  category: string;
  subcategory: string;
  averageScore: number;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  categories,
  categoryScores,
  onSubcategoryClick,
}) => {
  const [overallScore, setOverallScore] = useState<number>(0);
  const [aggregatedCategoryScores, setAggregatedCategoryScores] = useState<{ [key: string]: number }>({});
  const [recommendedActions, setRecommendedActions] = useState<{
    title: string;
    description: string;
    priority: string;
    category?: string;
    subcategory?: string;
  }[]>([]);

  useEffect(() => {
    calculateScores();
    generateRecommendedActions();
  }, [categoryScores, categories]);

  const calculateScores = () => {
    const aggregated: { [key: string]: number } = {};
    let totalScore = 0;
    let totalEntries = 0;

    Object.entries(categoryScores).forEach(([category, subcategories]) => {
      const subcategoryScores = Object.values(subcategories);
      if (subcategoryScores.length > 0) {
        const categoryAvg = subcategoryScores.reduce((sum, score) => sum + score, 0) / subcategoryScores.length;
        aggregated[category] = categoryAvg;
        totalScore += categoryAvg;
        totalEntries++;
      } else {
        aggregated[category] = 0;
      }
    });

    Object.keys(categories).forEach(category => {
      if (aggregated[category] === undefined) {
        aggregated[category] = 0;
      }
    });

    setAggregatedCategoryScores(aggregated);
    setOverallScore(totalEntries > 0 ? totalScore / totalEntries : 0);
  };

  const generateRecommendedActions = () => {
    const actions: {
      title: string;
      description: string;
      priority: string;
      category?: string;
      subcategory?: string;
    }[] = [];

    Object.entries(categoryScores).forEach(([category, subcategories]) => {
      Object.entries(subcategories).forEach(([subcategory, score]) => {
        if (score < 3) {
          const priority = score < 2 ? "high" : "medium";
          actions.push({
            title: `Improve ${subcategory} in ${category}`,
            description: `Current score is ${score.toFixed(1)}/5.`,
            priority,
            category,
            subcategory,
          });
        }
      });
    });

    if (actions.length < 2) {
      if (Object.keys(categoryScores).length === 0) {
        actions.push({
          title: "Start your data quality assessment",
          description: "Complete assessments for at least one subcategory to see recommendations.",
          priority: "medium",
        });
      } else {
        actions.push({
          title: "Continue data quality assessment",
          description: "Complete assessments for more subcategories to get better insights.",
          priority: "medium",
        });
      }
    }

    const sortedActions = actions
      .sort((a, b) => {
        if (a.priority === "high" && b.priority !== "high") return -1;
        if (a.priority !== "high" && b.priority === "high") return 1;
        return 0;
      })
      .slice(0, 5);

    setRecommendedActions(sortedActions);
  };

  const getScoreColorClass = (score: number): string => {
    if (score >= 4) return "score-high";
    if (score >= 3) return "score-medium";
    return "score-low";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 4) return "#10b981"; // Green
    if (score >= 3) return "#f59e0b"; // Yellow
    return "#ef4444"; // Red
  };

  const getCompletionStats = () => {
    const totalSubcategories = Object.values(categories).reduce(
      (sum, category) => sum + category.subcategories.length,
      0
    );

    const completedSubcategories = Object.values(categoryScores).reduce(
      (sum, subcategories) => sum + Object.keys(subcategories).length,
      0
    );

    return {
      completed: completedSubcategories,
      total: totalSubcategories,
      percentage: totalSubcategories > 0
        ? Math.round((completedSubcategories / totalSubcategories) * 100)
        : 0,
    };
  };

  const getPieChartData = (): ChartData[] => {
    const completedCategories = Object.entries(aggregatedCategoryScores)
      .filter(([_, score]) => score > 0);
    
    return completedCategories.map(([category, score]) => ({
      name: category,
      value: score,
      color: getScoreColor(score),
    }));
  };

  const getBarChartData = () => {
    return Object.entries(aggregatedCategoryScores)
      .filter(([_, score]) => score > 0)
      .map(([category, score]) => ({
        category: category.length > 12 ? category.substring(0, 12) + '...' : category,
        fullCategory: category,
        score: parseFloat(score.toFixed(1)),
        color: getScoreColor(score),
      }));
  };

  const getSubcategoryDetailData = () => {
    const data: any[] = [];
    Object.entries(categoryScores).forEach(([category, subcategories]) => {
      Object.entries(subcategories).forEach(([subcategory, score]) => {
        data.push({
          name: `${category} - ${subcategory}`,
          category,
          subcategory,
          score: parseFloat(score.toFixed(1)),
          color: getScoreColor(score),
        });
      });
    });
    return data.sort((a, b) => a.score - b.score);
  };

  const completion = getCompletionStats();
  const pieData = getPieChartData();
  const barData = getBarChartData();
  const subcategoryData = getSubcategoryDetailData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{payload[0].payload.fullCategory || label}</p>
          <p className="tooltip-value">
            Score: {payload[0].value}/5
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">Score: {payload[0].value.toFixed(1)}/5</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-overview">
      <div className="overall-score-card">
        <h2 className="text-xl font-semibold mb-2">Overall Data Quality Score</h2>
        <div className="score-display">
          <span className={`score ${getScoreColorClass(overallScore)}`}>
            {overallScore.toFixed(1)}
          </span>
          <div className="score-bar-container">
            <div
              className={`score-bar score-bar-${getScoreColorClass(overallScore).split('-')[1]}`}
              style={{ width: `${(overallScore / 5) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="assessment-progress mt-2">
          <p>
            Assessment completion: {completion.completed} of {completion.total} subcategories ({completion.percentage}%)
          </p>
        </div>
      </div>

      {/* Charts Section */}
      {pieData.length > 0 && (
        <div className="charts-section">
          <h2 className="text-xl font-semibold mb-4">Data Quality Analytics</h2>
          
          <div className="charts-grid">
            {/* Category Distribution Pie Chart */}
            <div className="chart-card">
              <h3 className="chart-title">Category Score Distribution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                {pieData.map((entry, index) => (
                  <div key={index} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span>{entry.name}: {entry.value.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Comparison Bar Chart */}
            <div className="chart-card">
              <h3 className="chart-title">Category Performance</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="category" 
                      angle={-45}
                      textAnchor="end"
                      height={90}
                    />
                    <YAxis domain={[0, 5]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

    
      <div className="category-scores mt-6">
        <h2 className="text-xl font-semibold mb-2">Category Scores</h2>
        <div className="score-cards-grid">
          {Object.entries(aggregatedCategoryScores).filter(([category, score]) => score > 0).map(([category, score]) => (
            <div key={category} className="category-score-card">
              <div className="categoryscore flex justify-between items-center mb-2">
                <h3 className="text-md font-medium">{category}</h3>
                <span className={`score-small ${getScoreColorClass(score)}`}>
                  {score.toFixed(1)}
                </span>
              </div>
              <div className="score-bar-container">
                <div
                  className={`score-bar score-bar-${getScoreColorClass(score).split('-')[1]}`}
                  style={{ width: `${(score / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="recommended-actions mt-6">
        <h2 className="text-xl font-semibold mb-2">Recommended Actions</h2>
        <div className="action-cards">
          {recommendedActions.map((action, index) => (
            <div key={index} className={`action-card action-${action.priority}`}>
              <h3 className="text-md font-medium">{action.title}</h3>
              <p className="text-sm">
                {action.description}{" "}
                {action.category && action.subcategory && (
                  <button
                    className="text-blue-600 underline hover:text-blue-800"
                    onClick={() => onSubcategoryClick(action.category!, action.subcategory!)}
                  >
                    Click to view assessment
                  </button>
                )}
              </p>
              <div className="action-priority-tag">
                {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)} Priority
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;