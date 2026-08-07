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
    'Navy': '#000080',
    'White': '#FFFFFF',
    'Beige': '#F5F0E8',
    'Caramel': '#C68642',
    'Rust': '#B7410E',

    'Blush': '#FFBFBE',
    'Teal': '#008080',
    'Olive': '#808000',
  };

  // Light colors that need a stronger visible border to stand out on any background
  const lightColors = new Set([
    'Ivory', 'Dusty Pink', 'Pink', 'Champagne', 'Ivory Gold',
    'White', 'Beige', 'Blush',
  ]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-futura tracking-[0.2em] uppercase text-[#1A1A1A] font-bold">
          COLOR:
        </span>
        <span className="text-[11px] font-futura tracking-[0.2em] uppercase text-[#9E8B6D] font-semibold">
          {selectedColor || colors[0] || 'DEFAULT'}
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-3">
        {colors.filter((color) => colorMap[color]).map((color) => {
          const hex = colorMap[color] || '#DCD5C9';
          const isSelected = selectedColor === color;
          const isLight = lightColors.has(color);

          return (
            <div key={color} className="relative group">
              <button
                type="button"
                onClick={() => onSelect(color)}
                aria-label={`Select color ${color}`}
                title={color}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-200 cursor-pointer
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9E8B6D]
                  ${isSelected
                    ? 'scale-110 shadow-md'
                    : 'hover:scale-105 hover:shadow-sm opacity-90 hover:opacity-100'
                  }
                `}
                style={{
                  /* Outer ring for selected: gold accent; inner swatch circle */
                  padding: '3px',
                  background: isSelected
                    ? 'linear-gradient(135deg, #9E8B6D, #C4A97D)'
                    : 'transparent',
                  boxShadow: isSelected
                    ? '0 0 0 1px #9E8B6D'
                    : isLight
                    ? '0 0 0 1px rgba(0,0,0,0.18)'
                    : '0 0 0 1px rgba(0,0,0,0.08)',
                }}
              >
                <span
                  className="block w-full h-full rounded-full"
                  style={{
                    backgroundColor: hex,
                    /* Extra inner border for light swatches so they're visible */
                    boxShadow: isLight
                      ? 'inset 0 0 0 1px rgba(0,0,0,0.12)'
                      : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                />
              </button>

              {/* Tooltip: show color name on hover */}
              <span
                className="
                  pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2
                  bg-[#1A1A1A] text-white text-[9px] font-futura tracking-wider
                  px-2 py-1 rounded whitespace-nowrap
                  opacity-0 group-hover:opacity-100 transition-opacity duration-150
                  z-10
                "
              >
                {color}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSwatch;
