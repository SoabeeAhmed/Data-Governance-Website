import React from "react";

interface QuestionItemProps {
  question: string;
  index: number;
  value?: number;
  options: number[];
  onChange: (index: number, value: number) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, index, value, options, onChange }) => {
  return (
    <div className="mb-4 question-card">
      <p className="mb-2 font-medium">{question}</p>
      <div className="flex gap-2">
        {options.map((num) => (
          <label key={num} className="custom-radio">
            <input
              type="radio"
              name={`question-${index}`}
              value={num}
              checked={value === num}
              onChange={() => onChange(index, num)}
            />
            <span>{num}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionItem;
