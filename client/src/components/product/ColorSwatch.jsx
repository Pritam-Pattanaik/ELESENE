const ColorSwatch = ({ colors, selectedColor, onSelect }) => {
  if (!colors || colors.length === 0) return null;

  const colorMap = {
    'Noir': '#0A0A0A',
    'Ivory': '#F5F0E8',
    'Gold': '#C9A84C',
    'Crimson': '#8B0000',
    'Emerald': '#50C878',
    'Navy': '#000080'
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-ivory/60">Color</span>
        <span className="text-[10px] font-futura tracking-[0.3em] uppercase text-gold/60">{selectedColor}</span>
      </div>
      <div className="flex gap-3">
        {colors.map((color) => {
          const hex = colorMap[color] || '#CCCCCC';
          const isSelected = selectedColor === color;
          
          return (
            <button
              key={color}
              onClick={() => onSelect(color)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSelected ? 'ring-1 ring-offset-2 ring-offset-noir ring-gold shadow-lg shadow-gold/10' : 'hover:scale-110'
              }`}
              aria-label={`Select ${color}`}
            >
              <span 
                className="w-7 h-7 rounded-full border border-white/10" 
                style={{ backgroundColor: hex }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSwatch;
