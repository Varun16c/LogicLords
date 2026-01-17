const ResultCard = ({ score, suggestions }) => (
  <div className="border rounded p-6">
    <h3 className="text-xl font-bold mb-2">Your Score: {score}/50</h3>
    <p className="text-gray-700">{suggestions}</p>
  </div>
);

export default ResultCard;
