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
  onReturn: () => void;
  activeCategory: string;
  activeSubcategory: string;
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
  onReturn,
  activeCategory,
  activeSubcategory,
}) => {
  const [allAnswers, setAllAnswers] = useState<AnswersStore>({});
  const [currentAnswers, setCurrentAnswers] = useState<{ [index: number]: number }>({});
  const [averageScore, setAverageScore] = useState<number>(0);

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
  }, [activeCategory, activeSubcategory, allAnswers]);

  useEffect(() => {
    const totalScore = Object.values(currentAnswers).reduce((acc, score) => acc + score, 0);
    const answeredCount = Object.keys(currentAnswers).length;
    const score = answeredCount > 0 ? totalScore / answeredCount : 0;
    setAverageScore(score);
  }, [currentAnswers]);

  useEffect(() => {
    return () => {
      if (Object.keys(currentAnswers).length > 0) {
        const submittedDataStr = localStorage.getItem("dataQualityAssessmentSubmitted");
        const existingData = submittedDataStr ? JSON.parse(submittedDataStr) : [];

        const updatedData = [
          ...existingData.filter(
            (entry: any) =>
              !(
                entry.category === activeCategory &&
                entry.subcategory === activeSubcategory
              )
          ),
          {
            category: activeCategory,
            subcategory: activeSubcategory,
            averageScore: parseFloat(averageScore.toFixed(1)),
          },
        ];

        localStorage.setItem("dataQualityAssessmentSubmitted", JSON.stringify(updatedData));
      }
    };
  }, [averageScore, activeCategory, activeSubcategory, currentAnswers]);

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

  return (
    <div className="p-4 bg-white shadow rounded">
      {definition && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Definition</h2>
          <p className="text-gray-700">{definition}</p>
        </div>
      )}

      <div className="flex-row-container">
        <h2 className="mb-4">
          {activeCategory} / {activeSubcategory}
        </h2>

        <div className="alignment-container mt-6 mb-6">
          <h3 className="text-lg font-semibold score">
            Questions Attempted: {Object.keys(currentAnswers).length} / {questions.length}
            <br/>
            Average Score: {averageScore.toFixed(1)} / 5
          </h3>
        </div>
      </div>

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
