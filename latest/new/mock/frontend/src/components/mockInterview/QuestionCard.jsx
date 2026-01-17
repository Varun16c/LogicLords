const QuestionCard = ({ question, value, onChange }) => (
  <div className="mb-4">
    <p className="font-medium mb-2">{question}</p>
    <textarea
      className="w-full border rounded p-2"
      rows="4"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default QuestionCard;
