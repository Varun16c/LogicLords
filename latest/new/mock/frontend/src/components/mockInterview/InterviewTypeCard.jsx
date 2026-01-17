const InterviewTypeCard = ({ title, description, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer p-6 border rounded hover:shadow-lg transition"
  >
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-gray-600 mt-2">{description}</p>
  </div>
);

export default InterviewTypeCard;
