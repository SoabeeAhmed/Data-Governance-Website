import React from "react";

interface DashboardProps {
  overallScore: number;
  categoryScores: { [key: string]: number };
  recommendedActions: { title: string; description: string; priority: string }[];
}

const Dashboard: React.FC<DashboardProps> = ({
  overallScore,
  categoryScores,
  recommendedActions,
}) => {
  const getScoreColorClass = (score: number): string => {
    if (score >= 4) return "score-high";
    if (score >= 3) return "score-medium";
    return "score-low";
  };

  return (
    <div className="dashboard-overview">
      {/* Overall Score Card */}
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
      </div>

      {/* Category Scores */}
      <div className="category-scores">
        <h2 className="text-xl font-semibold mb-2">Category Scores</h2>
        <div className="score-cards-grid">
          {Object.entries(categoryScores).map(([category, score]) => (
            <div key={category} className="category-score-card">
              <h3 className="text-md font-medium">{category}</h3>
              <div className="score-display-small">
                <span className={`score-small ${getScoreColorClass(score)}`}>
                  {score.toFixed(1)}
                </span>
                <div className="score-bar-container">
                  <div
                    className={`score-bar score-bar-${getScoreColorClass(score).split('-')[1]}`}
                    style={{ width: `${(score / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="recommended-actions">
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
  );
};

export default Dashboard;
