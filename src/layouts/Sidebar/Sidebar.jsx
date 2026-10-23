
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Compass,
  FolderKanban,
  Image,
  Library,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  SquarePen,
  Trash2,
  UserRound,
  SlidersHorizontal,
  CircleHelp,
  LogOut,
} from "lucide-react";

import omaxasLogo from "../../assets/Analysis output 1.png";
import { useAuth } from "../../features/auth/useAuth";

import {
  NAVIGATION_ITEMS,
  ACCOUNT_NAVIGATION_ITEMS,
  isNavigationItemActive,
} from "../../constants/navigation";

const ICON_COMPONENTS = {
  "square-pen": SquarePen,
  plus: Plus,
  search: Search,
  image: Image,
  compass: Compass,
  library: Library,
  folder: FolderKanban,
  settings: Settings,
  "settings-2": SlidersHorizontal,
  "sliders-horizontal": SlidersHorizontal,
  "user-round": UserRound,
  "circle-help": CircleHelp,
};

const ROUTE_BY_LABEL = {
  "New chat": "/chat/new",
  Search: "/search",
  Images: "/images",
  Image: "/images",
  Explore: "/explore",
  Library: "/library",
  Projects: "/projects",
  Settings: "/settings",
  Personalization: "/settings",
};

const GUEST_RESTRICTED_NAVIGATION = [
  "Search",
  "Images",
  "Image",
  "Explore",
  "Library",
  "Projects",
  "Settings",
  "Personalization",
];

const navigation = NAVIGATION_ITEMS
  .filter((item) => item.id !== "projects")
  .map((item) => ({
    ...item,
    icon: ICON_COMPONENTS[item.icon] || CircleHelp,
  }));

const projects = [
  "OmaxasAI project",
  "AI model training",
  "Website design",
];

const accountActions = ACCOUNT_NAVIGATION_ITEMS.map((item) => ({
  ...item,
  icon: ICON_COMPONENTS[item.icon] || CircleHelp,
}));

function getConversationId(conversation) {
  return conversation?.id ?? conversation?.pk ?? null;
}

function getConversationTitle(conversation) {
  const title =
    conversation?.title ||
    conversation?.name ||
    conversation?.last_message ||
    "";

  if (typeof title !== "string" || !title.trim()) {
    return "New chat";
  }

  return title.trim();
}

export default function Sidebar({
  open = true,
  collapsed = false,
  activeNav = "New chat",
  guestMode = false,
  conversations = [],
  activeConversationId = null,
  loadingConversations = false,
  onRefreshConversations,
  onSelectConversation,
  onDeleteConversation,
  onToggleCollapse,
  onNewChat,
  onNavigate,
  onNotice,
}) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [hoveredConversationKey, setHoveredConversationKey] =
    useState(null);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuRef = useRef(null);

  const displayName =
    user?.display_name ||
    user?.full_name ||
    user?.name ||
    user?.email ||
    "Your account";

  const email = user?.email || "";

  const userInitial =
    String(displayName).trim().charAt(0).toUpperCase() || "U";

  // Close the account menu when clicking outside or pressing Escape.
  useEffect(() => {
    if (!accountMenuOpen) {
      return undefined;
    }

    function handleOutsideClick(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsideClick
      );

      document.removeEventListener("keydown", handleEscape);
    };
  }, [accountMenuOpen]);

  // ---------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------

  function handleNavigation(item) {
    setAccountMenuOpen(false);

    const selectedItem =
      typeof item === "string"
        ? navigation.find((entry) => entry.label === item)
        : item;

    const label = selectedItem?.label || String(item);

    // IMPORTANT:
    // ChatLayout handles clearing chat state and navigation.
    // Do not navigate a second time after calling onNewChat.
    if (label === "New chat") {
      if (typeof onNewChat === "function") {
        onNewChat();
      } else {
        navigate(guestMode ? "/" : "/chat/new");
      }

      return;
    }

    // Restrict private pages in guest mode.
    if (
      guestMode &&
      GUEST_RESTRICTED_NAVIGATION.includes(label)
    ) {
      onNotice?.("Is feature ko use karne ke liye log in karo.");
      return;
    }

    const destination =
      ROUTE_BY_LABEL[label] || selectedItem?.path;

    if (typeof destination === "string" && destination) {
      navigate(destination);
      return;
    }

    if (typeof onNavigate === "function") {
      onNavigate(label);
      return;
    }

    onNotice?.(`${label} is not connected to a page yet.`);
  }

  // ---------------------------------------------------------
  // Conversation history
  // ---------------------------------------------------------

  function handleSelectConversation(conversation) {
    if (guestMode) {
      onNotice?.("Chat history dekhne ke liye log in karo.");
      return;
    }

    if (loadingConversations) {
      return;
    }

    if (typeof onSelectConversation !== "function") {
      onNotice?.("Conversation history is not connected yet.");
      return;
    }

    onSelectConversation(conversation);
  }

  function handleRefreshHistory() {
    if (guestMode) {
      onNotice?.("Chat history ke liye log in karo.");
      return;
    }

    if (loadingConversations) {
      return;
    }

    if (typeof onRefreshConversations === "function") {
      onRefreshConversations();
      return;
    }

    onNotice?.("Recent history refresh is not available.");
  }

  function handleDeleteConversation(event, conversation) {
    event.preventDefault();
    event.stopPropagation();

    if (guestMode || loadingConversations) {
      return;
    }

    if (typeof onDeleteConversation !== "function") {
      onNotice?.("Chat deletion is not connected yet.");
      return;
    }

    onDeleteConversation(conversation);
  }

  // ---------------------------------------------------------
  // Projects
  // ---------------------------------------------------------

  function openProjects() {
    handleNavigation("Projects");
  }

  // ---------------------------------------------------------
  // Account menu
  // ---------------------------------------------------------

  function handleAccountAction(item) {
    setAccountMenuOpen(false);

    const selectedItem =
      typeof item === "string"
        ? accountActions.find((entry) => entry.label === item)
        : item;

    const label = selectedItem?.label || String(item);

    if (
      guestMode &&
      GUEST_RESTRICTED_NAVIGATION.includes(label)
    ) {
      onNotice?.("Is feature ko use karne ke liye log in karo.");
      return;
    }

    const destination =
      ROUTE_BY_LABEL[label] || selectedItem?.path;

    if (typeof destination === "string" && destination) {
      navigate(destination);
      return;
    }

    if (typeof onNavigate === "function") {
      onNavigate(label);
      return;
    }

    onNotice?.(`${label} page is not connected yet.`);
  }

  async function handleLogout() {
    setAccountMenuOpen(false);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      onNotice?.(
        error?.message || "Unable to log out. Please try again."
      );
    }
  }

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <aside
      className={[
        "sidebar",
        open ? "sidebar-open" : "sidebar-closed",
        collapsed ? "sidebar-collapsed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Desktop sidebar"
    >
      {/* Brand */}
      <div className="sidebar-top">
        <button
          type="button"
          className="brand-button"
          onClick={
            collapsed
              ? onToggleCollapse
              : () => handleNavigation("New chat")
          }
          aria-label={
            collapsed ? "Expand sidebar" : "Start a new chat"
          }
          title={collapsed ? "Expand sidebar" : undefined}
        >
          <span className="brand-mark">
            <img src={omaxasLogo} alt="" />

            <PanelLeftOpen
              className="brand-expand-icon"
              size={18}
              aria-hidden="true"
            />
          </span>

          <span className="brand-name">OmaxasAI</span>
        </button>

        <button
          type="button"
          className="icon-button sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          aria-expanded={!collapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* Main navigation */}
      <nav className="primary-nav" aria-label="Main navigation">
        {navigation.map((item) => {
          const { id, label, icon: Icon, path } = item;

          const destination = ROUTE_BY_LABEL[label] || path;

          const routeIsActive = destination
            ? isNavigationItemActive(
                location.pathname,
                destination
              )
            : false;

          const isSettingsRoute =
            location.pathname.startsWith("/settings");

          const isActive =
            routeIsActive ||
            (activeNav === label && !isSettingsRoute);

          return (
            <button
              key={id}
              type="button"
              className={`nav-item ${
                isActive ? "nav-active" : ""
              }`}
              onClick={() => handleNavigation(item)}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Recent history */}
      <section className="sidebar-section">
        <div className="section-heading">
          <span>Recents</span>

          <button
            type="button"
            className="small-icon-button"
            aria-label="Refresh recent chats"
            title="Refresh recent chats"
            onClick={handleRefreshHistory}
            disabled={loadingConversations || guestMode}
          >
            <MoreHorizontal size={17} />
          </button>
        </div>

        {guestMode ? (
          <div className="history-empty">
            Log in to save and view your chats.
          </div>
        ) : loadingConversations && conversations.length === 0 ? (
          <div className="history-empty" role="status">
            Loading conversations...
          </div>
        ) : !loadingConversations && conversations.length === 0 ? (
          <div className="history-empty">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation, index) => {
            const conversationId =
              getConversationId(conversation);

            const title = getConversationTitle(conversation);

            const conversationKey =
              conversationId ?? `${title}-${index}`;

            const isActive =
              activeConversationId !== null &&
              activeConversationId !== undefined &&
              String(activeConversationId) ===
                String(conversationId);

            const isHovered =
              hoveredConversationKey === conversationKey;

            return (
              <div
                key={conversationKey}
                className={`history-row ${
                  isActive ? "history-row-active" : ""
                }`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  minWidth: 0,
                  gap: 4,
                  borderRadius: 8,
                }}
                onMouseEnter={() =>
                  setHoveredConversationKey(conversationKey)
                }
                onMouseLeave={() =>
                  setHoveredConversationKey((current) =>
                    current === conversationKey
                      ? null
                      : current
                  )
                }
                onFocusCapture={() =>
                  setHoveredConversationKey(conversationKey)
                }
                onBlurCapture={(event) => {
                  if (
                    !event.currentTarget.contains(
                      event.relatedTarget
                    )
                  ) {
                    setHoveredConversationKey(null);
                  }
                }}
                title={title}
              >
                <button
                  type="button"
                  className={`history-item ${
                    isActive ? "nav-active" : ""
                  }`}
                  style={{
                    flex: "1 1 auto",
                    width: "auto",
                    minWidth: 0,
                  }}
                  onClick={() =>
                    handleSelectConversation(conversation)
                  }
                  disabled={
                    loadingConversations ||
                    conversationId === null ||
                    conversationId === undefined
                  }
                  aria-current={isActive ? "page" : undefined}
                >
                  <MessageSquare size={15} />

                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {title}
                  </span>
                </button>

                <button
                  type="button"
                  className="history-delete-button"
                  aria-label={`Delete chat: ${title}`}
                  title={`Delete "${title}"`}
                  disabled={
                    loadingConversations ||
                    conversationId === null ||
                    conversationId === undefined
                  }
                  tabIndex={isHovered ? 0 : -1}
                  onClick={(event) =>
                    handleDeleteConversation(event, conversation)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "0 0 30px",
                    width: 30,
                    height: 30,
                    padding: 0,
                    border: "none",
                    borderRadius: 6,
                    background: "transparent",
                    color: "var(--text-secondary, #999)",
                    cursor: loadingConversations
                      ? "not-allowed"
                      : "pointer",
                    opacity: isHovered ? 1 : 0,
                    visibility: isHovered ? "visible" : "hidden",
                    pointerEvents: isHovered ? "auto" : "none",
                    transition: "opacity 0.15s ease",
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })
        )}
      </section>

      {/* Pinned */}
      <section className="sidebar-section">
        <div className="section-heading">
          <span>Pinned</span>
        </div>

        <button
          type="button"
          className="history-item"
          onClick={() =>
            onNotice?.(
              "Pinned conversations will be connected to saved history."
            )
          }
          title="Messaging Architecture Overview"
        >
          <MessageSquare size={15} />
          <span>Messaging Architecture Overview</span>
        </button>
      </section>

      {/* Projects */}
      <section className="sidebar-section projects-section">
        <div className="section-heading">
          <button
            type="button"
            className="projects-heading-button"
            onClick={openProjects}
            aria-current={
              location.pathname === "/projects"
                ? "page"
                : undefined
            }
            title="Open projects"
          >
            Projects
          </button>

          <button
            type="button"
            className="small-icon-button"
            aria-label="Open projects"
            title="Go to Projects"
            onClick={openProjects}
          >
            <Plus size={17} />
          </button>
        </div>

        {projects.map((project) => (
          <button
            key={project}
            type="button"
            className={`history-item ${
              location.pathname === "/projects"
                ? "nav-active"
                : ""
            }`}
            onClick={openProjects}
            title={project}
          >
            <FolderKanban size={15} />
            <span>{project}</span>
          </button>
        ))}
      </section>

      {/* Account footer */}
      <div className="sidebar-bottom">
        {guestMode || !user ? (
          <button
            type="button"
            className="profile-card"
            onClick={() => navigate("/login")}
            title="Log in to your OmaxasAI account"
          >
            <span className="profile-avatar">
              <UserRound size={18} />
            </span>

            <span className="profile-text">
              <strong>Log in</strong>
              <small>Access your saved chats</small>
            </span>
          </button>
        ) : (
          <div
            className="account-menu-container"
            ref={accountMenuRef}
          >
            <button
              type="button"
              className={`profile-card ${
                accountMenuOpen ? "profile-card-active" : ""
              }`}
              onClick={() =>
                setAccountMenuOpen((current) => !current)
              }
              aria-label={`Account menu for ${displayName}`}
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              title={collapsed ? displayName : "Account menu"}
            >
              <span className="profile-avatar">
                {userInitial}
              </span>

              <span className="profile-text">
                <strong>{displayName}</strong>
                <small>{email || "OMAXAS AI account"}</small>
              </span>
            </button>

            {accountMenuOpen && (
              <div
                className={`account-menu ${
                  collapsed ? "account-menu-collapsed" : ""
                }`}
                role="menu"
                aria-label="Account menu"
              >
                <div className="account-menu-header">
                  <span className="account-menu-avatar">
                    {userInitial}
                  </span>

                  <div className="account-menu-user-info">
                    <strong title={displayName}>
                      {displayName}
                    </strong>

                    {email && (
                      <span title={email}>{email}</span>
                    )}
                  </div>
                </div>

                <div className="account-menu-divider" />

                <div className="account-menu-items">
                  {accountActions.map((item) => {
                    const { id, label, icon: Icon } = item;

                    return (
                      <button
                        key={`${id}-${label}`}
                        type="button"
                        role="menuitem"
                        className="account-menu-item"
                        onClick={() => handleAccountAction(item)}
                      >
                        <Icon size={18} strokeWidth={1.8} />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="account-menu-divider" />

                <button
                  type="button"
                  role="menuitem"
                  className="account-menu-item account-menu-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={18} strokeWidth={1.8} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
