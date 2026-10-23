
/**
 * Omaxas AI - Navigation Configuration
 * File: src/constants/navigation.js
 *
 * Central configuration for application navigation.
 *
 * Connected routes:
 *   /chat/new
 *   /settings
 *
 * Other pages are marked as planned until their routes
 * and page components are implemented.
 */

// ---------------------------------------------------------
// Main sidebar navigation
// ---------------------------------------------------------

export const NAVIGATION_ITEMS = [
  {
    id: "new-chat",
    label: "New chat",
    icon: "square-pen",
    path: "/chat/new",
    section: "main",
    status: "connected",
  },
  {
    id: "search",
    label: "Search",
    icon: "search",
    path: null,
    section: "main",
    status: "planned",
  },
  {
    id: "images",
    label: "Images",
    icon: "image",
    path: null,
    section: "main",
    status: "planned",
  },
  {
    id: "explore",
    label: "Explore",
    icon: "compass",
    path: null,
    section: "main",
    status: "planned",
  },
  {
    id: "library",
    label: "Library",
    icon: "library",
    path: null,
    section: "main",
    status: "planned",
  },
];

// ---------------------------------------------------------
// Sidebar bottom navigation
// ---------------------------------------------------------

export const SIDEBAR_BOTTOM_ITEMS = [
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    path: "/settings",
    section: "bottom",
    status: "connected",
  },
];

// ---------------------------------------------------------
// Settings sections
//
// These sections currently belong to the Settings feature.
// Only /settings is registered as the actual route.
// Individual settings subpages must be implemented separately.
// ---------------------------------------------------------

export const SETTINGS_NAVIGATION_ITEMS = [
  {
    id: "general",
    label: "General",
    description: "Language, appearance and general preferences",
    icon: "settings-2",
    path: "/settings",
    section: "settings",
    status: "connected",
  },
  {
    id: "personalization",
    label: "Personalization",
    description: "Customize your Omaxas AI experience",
    icon: "sliders-horizontal",
    path: "/settings",
    section: "settings",
    status: "planned",
  },
  {
    id: "voice",
    label: "Voice and language",
    description: "Configure assistant language and voice preferences",
    icon: "audio-lines",
    path: "/settings",
    section: "settings",
    status: "planned",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Manage notification preferences",
    icon: "bell",
    path: "/settings",
    section: "settings",
    status: "planned",
  },
  {
    id: "data-controls",
    label: "Data controls",
    description: "Manage chat history and data preferences",
    icon: "database",
    path: "/settings",
    section: "settings",
    status: "planned",
  },
  {
    id: "security",
    label: "Security",
    description: "Manage account security and sessions",
    icon: "shield-check",
    path: "/settings",
    section: "settings",
    status: "planned",
  },
];

// ---------------------------------------------------------
// Account menu
// ---------------------------------------------------------

export const ACCOUNT_NAVIGATION_ITEMS = [
  {
    id: "profile",
    label: "Profile",
    icon: "user-round",
    path: null,
    section: "account",
    status: "planned",
  },
  {
    id: "personalization",
    label: "Personalization",
    icon: "sliders-horizontal",
    path: "/settings",
    section: "account",
    status: "planned",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    path: "/settings",
    section: "account",
    status: "connected",
  },
  {
    id: "help",
    label: "Help",
    icon: "circle-help",
    path: null,
    section: "account",
    status: "planned",
  },
];

// ---------------------------------------------------------
// All navigation items
// ---------------------------------------------------------

export const ALL_NAVIGATION_ITEMS = [
  ...NAVIGATION_ITEMS,
  ...SIDEBAR_BOTTOM_ITEMS,
  ...SETTINGS_NAVIGATION_ITEMS,
  ...ACCOUNT_NAVIGATION_ITEMS,
];

// ---------------------------------------------------------
// Find a navigation item by its ID
// ---------------------------------------------------------

export function getNavigationItem(id) {
  return (
    ALL_NAVIGATION_ITEMS.find((item) => item.id === id) ??
    null
  );
}

// ---------------------------------------------------------
// Get navigation items by section
// ---------------------------------------------------------

export function getNavigationItemsBySection(section) {
  return ALL_NAVIGATION_ITEMS.filter(
    (item) => item.section === section
  );
}

// ---------------------------------------------------------
// Check whether a navigation item is active
// ---------------------------------------------------------

export function isNavigationItemActive(pathname, itemPath) {
  if (
    typeof pathname !== "string" ||
    typeof itemPath !== "string" ||
    !pathname ||
    !itemPath
  ) {
    return false;
  }

  // The application home route for authenticated users is /chat/new.
  if (itemPath === "/") {
    return pathname === "/";
  }

  if (itemPath === "/chat/new") {
    return pathname === "/chat/new";
  }

  return (
    pathname === itemPath ||
    pathname.startsWith(`${itemPath}/`)
  );
}

// ---------------------------------------------------------
// Return only navigation items with implemented destinations
// ---------------------------------------------------------

export function getConnectedNavigationItems() {
  return ALL_NAVIGATION_ITEMS.filter(
    (item) =>
      item.status === "connected" &&
      typeof item.path === "string"
  );
}

// ---------------------------------------------------------
// Find the first connected navigation item for a route
// ---------------------------------------------------------

export function getNavigationItemByPath(pathname) {
  return (
    getConnectedNavigationItems().find((item) =>
      isNavigationItemActive(pathname, item.path)
    ) ?? null
  );
}
