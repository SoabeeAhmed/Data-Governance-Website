import React from "react";

interface QuestionItemProps {
  question: string;
  index: number;
  value?: number;
  options: number[];
  onChange: (index: number, value: number) => void;
}

// Function to map the selected number to a color using the provided switch case
const getOptionColor = (level: number): string => {
  switch (level) {
    case 0:
      return "bg-gray-400"; // Gray
    case 1:
      return "bg-red-400"; // Red
    case 2:
      return "bg-orange-400"; // Orange
    case 3:
      return "bg-yellow-400"; // Yellow
    case 4:
      return "bg-green-400"; // Green
    case 5:
      return "bg-blue-400"; // Blue
    case 6:
      return "bg-indigo-400"; // Indigo
    default:
      return "bg-gray-300"; // Default (Gray) for other cases
  }
};

const QuestionItem: React.FC<QuestionItemProps> = ({ question, index, value, options, onChange }) => {
  return (
    <div className="mb-4 question-card">
      <p className="mb-2 font-medium">{question}</p>
      <div className="flex gap-2">
        {options.map((num) => (
          <label key={num} className={`custom-radio ${getOptionColor(num)}`}>
            <input
              type="radio"
              name={`question-${index}`}
              value={num}
              checked={value === num}
              onChange={() => onChange(index, num)}
            />
            <span
              className={`${getOptionColor(num)} ${value === num ? 'text-white' : 'text-gray-800'} p-2`} // Apply dynamic background color
            >
              {num}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionItem;
