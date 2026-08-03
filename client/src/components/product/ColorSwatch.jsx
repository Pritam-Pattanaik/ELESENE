const ColorSwatch = ({ colors, selectedColor, onSelect }) => {
  if (!colors || colors.length === 0) return null;

  const colorMap = {
    'Ivory': '#EFEAE4',
    'Dusty Pink': '#F4C7C3',
    'Pink': '#F4C7C3',
    'Noir': '#1A1A1A',
    'Black': '#1A1A1A',
    'Sage Green': '#A3B19B',
    'Sage': '#A3B19B',
    'Gold': '#D4AF37',
    'Ivory Gold': '#E8D48B',
    'Burgundy': '#800020',
    'Champagne': '#F7E7CE',
    'Emerald': '#046307',
    'Navy': '#000080'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-futura tracking-[0.2em] uppercase text-[#1A1A1A] font-bold">
          COLOR:
        </span>
        <span className="text-[11px] font-futura tracking-[0.2em] uppercase text-[#1A1A1A] font-semibold">
          {selectedColor || 'DEFAULT'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {colors.map((color) => {
          const hex = colorMap[color] || '#DCD5C9';
          const isSelected = selectedColor === color;
          
          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelect(color)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                isSelected 
                  ? 'ring-2 ring-offset-2 ring-[#1A1A1A] scale-105' 
                  : 'hover:scale-105 opacity-85 hover:opacity-100'
              }`}
              aria-label={`Select color ${color}`}
            >
              <span 
                className="w-full h-full rounded-full border border-black/10 shadow-inner" 
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
