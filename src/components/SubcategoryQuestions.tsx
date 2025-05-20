import React, { useState, useEffect } from "react";
import QuestionItem from "./QuestionItem";

interface SubcategoryQuestionsProps {
  questions: string[]; // Questions list
  definition: string | null;
  onReturn: () => void;
}

const SubcategoryQuestions: React.FC<SubcategoryQuestionsProps> = ({
  questions,
  definition,
  onReturn,
}) => {
  const [answers, setAnswers] = useState<{ [index: number]: number }>({});
  const [averageScore, setAverageScore] = useState<number>(0);

  useEffect(() => {
    // Calculate total score and total answered questions
    const totalScore = Object.values(answers).reduce((acc, score) => acc + score, 0);
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = questions.length;
    const score = answeredCount > 0 ? totalScore / answeredCount : 0;

    setAverageScore(score); // Update the average score

    // Optional: You could display how many questions were answered and the total number of questions
  }, [answers, questions.length]);

  const handleAnswerChange = (index: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      {definition && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Definition</h2>
          <p className="text-gray-700">{definition}</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold">
          Questions Attempted: {Object.keys(answers).length} / {questions.length}
        </h3>
        <h3 className="text-lg font-semibold">
          Average Score: {averageScore.toFixed(1)} / 5
        </h3>
      </div>

      {questions.length > 0 ? (
        questions.map((q, idx) => (
          <QuestionItem
            key={idx}
            index={idx}
            question={q}
            value={answers[idx] || 0}
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
