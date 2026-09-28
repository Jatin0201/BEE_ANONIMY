interface AliasAvatarProps {
  name: string;
  size?: number;
}

export function AliasAvatar({ name = "Anonymous", size = 40 }: AliasAvatarProps) {
  const normalized = (name || "").toLowerCase();

  // Small corner badge in warm copper/terracotta
  const badge = (
    <div
      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center shadow-xs"
      style={{ backgroundColor: "#D48255" }}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[#FAF7F4]" />
    </div>
  );

  if (normalized.includes("fox")) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#F4EFEA" />
          <path d="M10 13 L15 25 L20 28 L25 25 L30 13 L26 23 L20 29 L14 23 Z" fill="#D97746" />
          <polygon points="12,15 15,22 17,16" fill="#F8EDE3" />
          <polygon points="28,15 25,22 23,16" fill="#F8EDE3" />
          <path d="M15 25 L20 29 L17 29 Z" fill="#FFFFFF" />
          <path d="M25 25 L20 29 L23 29 Z" fill="#FFFFFF" />
          <circle cx="16" cy="22" r="1.5" fill="#2E241E" />
          <circle cx="24" cy="22" r="1.5" fill="#2E241E" />
          <circle cx="20" cy="27" r="1.2" fill="#2E241E" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes("raven") || normalized.includes("bird") || normalized.includes("hawk") || normalized.includes("owl") || normalized.includes("falcon") || normalized.includes("wren") || normalized.includes("finch")) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#EAEFF5" />
          <path
            d="M13 26 C13 20, 16 16, 21 14 C23 13, 27 12, 30 14 C31 14.5, 33 15, 35 15.5 C33 17, 30 18, 28 18 C28 22, 25 26, 20 28 C17 29, 14 28, 13 26 Z"
            fill="#1E293B"
          />
          <circle cx="25" cy="15.5" r="1" fill="#FFFFFF" />
          <path d="M18 22 C20 21, 23 21, 25 24" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes("oak") || normalized.includes("tree") || normalized.includes("wood") || normalized.includes("pine") || normalized.includes("spruce") || normalized.includes("grove")) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#EDF3ED" />
          <rect x="18.5" y="24" width="3" height="6" rx="1" fill="#655243" />
          <path
            d="M20 10 C23 10, 26 12, 27 14 C29 15, 30 17, 29 20 C30 22, 28 25, 25 25 C24 25, 23 25, 22 24.5 C21 25, 19 25, 18 24.5 C17 25, 16 25, 15 25 C12 25, 10 22, 11 20 C10 17, 11 15, 13 14 C14 12, 17 10, 20 10 Z"
            fill="#4F6D55"
          />
          <circle cx="17" cy="15" r="1.5" fill="#6A8D71" opacity="0.6" />
          <circle cx="23" cy="16" r="1.8" fill="#6A8D71" opacity="0.6" />
          <circle cx="20" cy="20" r="1.6" fill="#6A8D71" opacity="0.6" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes("sun") || normalized.includes("amber") || normalized.includes("crane") || normalized.includes("golden") || normalized.includes("solar")) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#FEF6E9" />
          <circle cx="20" cy="20" r="7" fill="#E69C24" />
          <line x1="20" y1="9" x2="20" y2="11" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="29" x2="20" y2="31" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="20" x2="11" y2="20" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="29" y1="20" x2="31" y2="20" stroke="#E69C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="12" x2="14" y2="14" stroke="#E69C24" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="26" y1="26" x2="28" y2="28" stroke="#E69C24" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="18" cy="19" r="1" fill="#875306" />
          <circle cx="22" cy="19" r="1" fill="#875306" />
          <path d="M18.5 22 C19.2 23, 20.8 23, 21.5 22" stroke="#875306" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
        {badge}
      </div>
    );
  }

  if (normalized.includes("wolf") || normalized.includes("lynx") || normalized.includes("deer")) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#ECEFF2" />
          <path d="M12 12 L16 24 L20 28 L24 24 L28 12 L24 21 L20 27 L16 21 Z" fill="#64748B" />
          <polygon points="14,14 16,20 18,15" fill="#CBD5E1" />
          <polygon points="26,14 24,20 22,15" fill="#CBD5E1" />
          <circle cx="17" cy="21" r="1.3" fill="#1E293B" />
          <circle cx="23" cy="21" r="1.3" fill="#1E293B" />
          <circle cx="20" cy="26" r="1.1" fill="#1E293B" />
        </svg>
        {badge}
      </div>
    );
  }

  if (
    normalized.includes("fern") ||
    normalized.includes("birch") ||
    normalized.includes("brook") ||
    normalized.includes("mist") ||
    normalized.includes("sage") ||
    normalized.includes("moss") ||
    normalized.includes("willow") ||
    normalized.includes("clover") ||
    normalized.includes("meadow")
  ) {
    return (
      <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
          <circle cx="20" cy="20" r="20" fill="#EBF4EE" />
          <path d="M20 30 C20 20, 22 14, 28 10 C24 14, 22 18, 20 30 Z" fill="#3B7A57" />
          <path d="M20 24 C16 22, 13 18, 12 14 C15 17, 18 20, 20 24 Z" fill="#5B9A77" />
          <path d="M20 18 C24 16, 27 12, 28 8 C25 11, 22 14, 20 18 Z" fill="#78B993" />
        </svg>
        {badge}
      </div>
    );
  }

  // Generic fallback
  return (
    <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rounded-full">
        <circle cx="20" cy="20" r="20" fill="#F1ECE6" />
        <circle cx="20" cy="20" r="9" fill="#9C897B" />
        <path d="M16 16 L24 24 M24 16 L16 24" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {badge}
    </div>
  );
}
