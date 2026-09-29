// A liquid glass button.
//
// Based on the Liquid Glass Button by Ali Imam (21st.dev). An SVG filter
// bends the scene behind the button a little, like thick glass, on top of
// the frosted glass look from the ".glass-button" class.
//
// Only Chrome and Edge can bend the scene behind a button. main.jsx marks
// the page with "can-bend" in those browsers. Safari and Firefox show the
// frosted glass, which still looks good. The bending is only used on
// small buttons, because it costs a lot of drawing work over big areas.

// Put this once on the page. It holds the filter the buttons use.
export function LiquidGlassFilter() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0">
      <filter id="liquid-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        {/* Soft random ripples... */}
        <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
        <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
        {/* ...that push the pixels behind the button around, like glass. */}
        <feDisplacementMap
          in="SourceGraphic"
          in2="blurredNoise"
          scale="60"
          xChannelSelector="R"
          yChannelSelector="B"
          result="displaced"
        />
        <feGaussianBlur in="displaced" stdDeviation="3" result="finalBlur" />
        <feComposite in="finalBlur" in2="finalBlur" operator="over" />
      </filter>
    </svg>
  );
}

export default function GlassButton({ className = "", children, ...props }) {
  return (
    <button type="button" {...props} className={`glass-button liquid-glass flex items-center justify-center gap-2 ${className}`}>
      {children}
    </button>
  );
}
