function IconBag() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function IconCard() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41L11 3.83A2 2 0 009.59 3.24L3 3v6.59a2 2 0 00.59 1.41l9.59 9.59a2 2 0 002.83 0l4.58-4.58a2 2 0 000-2.83z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconCartOutline() {
  return (
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

const ICONS = [
  { Icon: IconBag, top: '12%', left: '8%', duration: '11s', delay: '0s' },
  { Icon: IconCard, top: '68%', left: '12%', duration: '13s', delay: '1.5s' },
  { Icon: IconBox, top: '18%', left: '85%', duration: '10s', delay: '0.8s' },
  { Icon: IconTag, top: '78%', left: '82%', duration: '12s', delay: '2.2s' },
  { Icon: IconCartOutline, top: '45%', left: '92%', duration: '14s', delay: '0.4s' },
  { Icon: IconBag, top: '85%', left: '45%', duration: '12s', delay: '3s' },
];

export default function AuthBackground() {
  return (
    <div className="auth-bg" aria-hidden="true">
      {ICONS.map(({ Icon, top, left, duration, delay }, i) => (
        <div
          key={i}
          className="auth-bg-icon"
          style={{ top, left, animationDuration: duration, animationDelay: delay }}
        >
          <Icon />
        </div>
      ))}
    </div>
  );
}
