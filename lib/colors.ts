/**
 * Hệ thống màu sắc chuẩn cho toàn bộ ứng dụng
 * Chủ đề Crypto - Màu cam/vàng chủ đạo
 */

export const colorScheme = {
  // Primary Colors
  primary: {
    main: "#f97316", // Orange - Main brand color
    light: "#fb923c",
    dark: "#ea580c",
  },

  // Secondary Colors
  secondary: {
    yellow: {
      main: "#f59e0b",
      light: "#fcd34d",
      dark: "#d97706",
    },
    green: {
      main: "#4ade80",
      light: "#86efac",
      dark: "#22c55e",
    },
  },

  // Background Colors
  background: {
    main: "#f3f4f6", // gray-100
    card: "#ffffff", // white
    input: "#7c2d12", // orange-900
  },

  // Text Colors
  text: {
    primary: "#1f2937", // gray-800
    secondary: "#6b7280", // gray-500
    light: "#d1d5db", // gray-300
    white: "#ffffff",
  },

  // Section Colors (for category badges/borders)
  sections: {
    blue: {
      border: "#2563eb",
      text: "#1d4ed8",
    },
    orange: {
      border: "#ea580c",
      text: "#b45309",
    },
    green: {
      border: "#16a34a",
      text: "#15803d",
    },
    purple: {
      border: "#9333ea",
      text: "#7e22ce",
    },
  },

  // Status Colors
  status: {
    highlight: "#dc2626", // red-600 for featured labels
    new: "#4ade80", // green-400 for new badges
    muted: "#9ca3af", // gray-400
  },

  // Border Colors
  border: {
    light: "#e5e7eb", // gray-200
    default: "#d1d5db", // gray-300
  },

  // Hover States
  hover: {
    primary: "#ef4444", // red-500 for text hover
  },
} as const;

// Tailwind CSS class mappings for ease of use
export const colorClasses = {
  primary: {
    bg: "bg-[#b91c1c]",
    text: "text-red-700",
    hover: "hover:text-red-600",
    border: "border-red-600",
    light: "text-red-500",
  },
  secondary: {
    yellow: {
      text: "text-yellow-200",
      bg: "bg-yellow-400",
      light: "text-yellow-100",
    },
    green: {
      bg: "bg-green-400",
    },
  },
  background: {
    main: "bg-gray-100",
    card: "bg-white",
    input: "bg-red-800",
  },
  text: {
    primary: "text-gray-800",
    secondary: "text-gray-500",
    light: "text-gray-300",
    white: "text-white",
  },
  border: {
    light: "border-gray-200",
    default: "border-gray-300",
  },
  sections: {
    blue: {
      border: "border-blue-600",
      text: "text-blue-700",
    },
    orange: {
      border: "border-orange-600",
      text: "text-orange-700",
    },
    green: {
      border: "border-green-600",
      text: "text-green-700",
    },
    purple: {
      border: "border-purple-600",
      text: "text-purple-700",
    },
  },
} as const;
