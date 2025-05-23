import React, { useState, useEffect } from "react";
import QuestionItem from "./QuestionItem";

interface Question {
  id: number;
  text: string;
  options: number[];
}

interface SubcategoryQuestionsProps {
  questions: Question[];
  definition: string | null;
  legend: string | null;
  onBackToDashboard: () => void;
  onSubmit: (score: number) => void;
  activeCategory: string;
  activeSubcategory: string;
  onAllQuestionsAnswered: () => void;
  isAlreadyCompleted: boolean;
}

interface AnswersStore {
  [category: string]: {
    [subcategory: string]: {
      [questionIndex: number]: number;
    };
  };
}

const SubcategoryQuestions: React.FC<SubcategoryQuestionsProps> = ({
  questions,
  definition,
  legend,
  onBackToDashboard,
  onSubmit,
  activeCategory,
  activeSubcategory,
  onAllQuestionsAnswered,
  isAlreadyCompleted,
}) => {
  const [allAnswers, setAllAnswers] = useState<AnswersStore>({});
  const [currentAnswers, setCurrentAnswers] = useState<{ [index: number]: number }>({});
  const [averageScore, setAverageScore] = useState<number>(0);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState<boolean>(false);
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState<boolean>(false);

  useEffect(() => {
    const savedAnswersStr = localStorage.getItem("dataQualityAssessmentAnswers");
    if (savedAnswersStr) {
      try {
        const savedAnswers = JSON.parse(savedAnswersStr);
        setAllAnswers(savedAnswers);
      } catch (err) {
        console.error("Error loading saved answers", err);
      }
    }
  }, []);

  useEffect(() => {
    if (allAnswers[activeCategory]?.[activeSubcategory]) {
      setCurrentAnswers(allAnswers[activeCategory][activeSubcategory]);
    } else {
      setCurrentAnswers({});
    }
    setHasTriggeredCompletion(false);
  }, [activeCategory, activeSubcategory, allAnswers]);

  useEffect(() => {
    const totalScore = Object.values(currentAnswers).reduce((acc, score) => acc + score, 0);
    const answeredCount = Object.keys(currentAnswers).length;
    const score = answeredCount > 0 ? totalScore / answeredCount : 0;
    setAverageScore(score);

    const allAnswered = questions.length > 0 && answeredCount === questions.length;
    setAllQuestionsAnswered(allAnswered);

    if (allAnswered && score > 0 && !hasTriggeredCompletion && !isAlreadyCompleted) {
      setHasTriggeredCompletion(true);
      onSubmit(score);
      onAllQuestionsAnswered();
    }
  }, [currentAnswers, questions.length, onSubmit, onAllQuestionsAnswered, hasTriggeredCompletion, isAlreadyCompleted]);

  const handleAnswerChange = (index: number, value: number) => {
    setCurrentAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));

    setAllAnswers((prev) => {
      const updated = { ...prev };
      if (!updated[activeCategory]) {
        updated[activeCategory] = {};
      }
      if (!updated[activeCategory][activeSubcategory]) {
        updated[activeCategory][activeSubcategory] = {};
      }
      updated[activeCategory][activeSubcategory][index] = value;
      localStorage.setItem("dataQualityAssessmentAnswers", JSON.stringify(updated));
      return updated;
    });
  };

  const parseLegend = (legendStr: string) => {
    const regex = /(\d+)\s*-\s*([^,]+)/g;
    const results = [];
    let match;
    while ((match = regex.exec(legendStr)) !== null) {
      results.push({
        level: parseInt(match[1], 10),
        label: match[2].trim(),
      });
    }
    return results;
  };

  const getLegendColorClass = (level: number) => {
    switch (level) {
      case 0:
        return "bg-gray-400";
      case 1:
        return "bg-red-400";
      case 2:
        return "bg-orange-400";
      case 3:
        return "bg-yellow-400";
      case 4:
        return "bg-green-400";
      case 5:
        return "bg-blue-400";
      case 6:
        return "bg-indigo-400";
      default:
        return "bg-gray-300";
    }
  };

  const legendItems = legend ? parseLegend(legend) : [];

  const handleReset = () => {
    const newAnswers = { ...allAnswers };
    delete newAnswers[activeCategory]?.[activeSubcategory];
    setAllAnswers(newAnswers);
    setCurrentAnswers({});
    localStorage.setItem("dataQualityAssessmentAnswers", JSON.stringify(newAnswers));
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <div className="button-container flex justify-between mb-4">
        <button className="button back-button" onClick={onBackToDashboard}>
          ← Back to Dashboard
        </button>
        <button className="button reset-button" onClick={handleReset}>
          Reset Subcategory
        </button>
      </div>

      <div className="flex-row-container">
        <h2 className="mb-4">
          {activeCategory} / {activeSubcategory}
        </h2>

        <div className="alignment-container mt-6 mb-6">
          <h3 className="text-lg font-semibold score">
            Questions Attempted: {Object.keys(currentAnswers).length} / {questions.length}
            <br />
            Average Score: {averageScore.toFixed(1)} / 5
            {allQuestionsAnswered && !hasTriggeredCompletion && !isAlreadyCompleted && (
              <div className="mt-2 text-green-600 font-bold">
                ✓ All questions completed! Moving to next section...
              </div>
            )}
            {allQuestionsAnswered && (hasTriggeredCompletion || isAlreadyCompleted) && (
              <div className="mt-2 text-blue-600 font-bold">
                ✓ Section completed!
              </div>
            )}
          </h3>
        </div>
      </div>

      {legendItems.length > 0 && (
        <div className="legend-container mb-6 flex justify-between items-center">
          <div className="legend-left text-xs font-bold flex flex-col"></div>
          <div className="legend-right flex gap-8">
            {legendItems.map((item, index) => (
              <div key={index} className="legend-item flex items-center gap-2">
                <div
                  className={`legend-circle ${getLegendColorClass(item.level)} w-6 h-6 rounded-full`}
                ></div>
                <span className="legend-text text-sm">{`${item.level}-${item.label}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {questions.length > 0 ? (
        questions.map((q, idx) => (
          <QuestionItem
            key={q.id}
            index={idx}
            question={q.text}
            options={q.options}
            value={currentAnswers[idx]}
            onChange={handleAnswerChange}
          />
        ))
      ) : (
        <p className="text-gray-500 italic">No questions available.</p>
      )}
    </div>
  );
};

export default SubcategoryQuestions;
