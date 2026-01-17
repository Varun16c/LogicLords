const levels = ["easy", "medium", "hard"];

const DifficultySelector = ({ onSelect }) => (
  <div className="flex gap-4">
    {levels.map((lvl) => (
      <button
        key={lvl}
        onClick={() => onSelect(lvl)}
        className="px-6 py-2 border rounded capitalize hover:bg-blue-600 hover:text-white"
      >
        {lvl}
      </button>
    ))}
  </div>
);

export default DifficultySelector;
