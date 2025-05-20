import React from "react";

interface QuestionItemProps {
  question: string;
  index: number;
  value?: number; // This is the selected value for the radio button
  onChange: (index: number, value: number) => void; // Callback to handle answer change
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, index, value, onChange }) => {
  return (
    <div className="mb-4 question-card">
      <p className="mb-2 font-medium">{question}</p>
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map((num) => (
          <label key={num} className="flex items-center gap-1">
            <input
              type="radio"
              name={`question-${index}`} // Group radio buttons by question index
              value={num}
              checked={value === num} // Check if the current option is selected
              onChange={() => onChange(index, num)} // Call onChange to update the selected answer
            />
            {num}
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionItem;
