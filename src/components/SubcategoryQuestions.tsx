// components/SubcategoryQuestions.tsx
import React, { useState } from "react";
import QuestionItem from "./QuestionItem";

interface SubcategoryQuestionsProps {
  questions: string[];
  definition: string | null;
}

const SubcategoryQuestions: React.FC<SubcategoryQuestionsProps> = ({ questions, definition }) => {
  const [answers, setAnswers] = useState<{ [index: number]: number }>({});

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

      {questions.length > 0 ? (
        questions.map((q, idx) => (
          <QuestionItem
            key={idx}
            index={idx}
            question={q}
            value={answers[idx]}
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
