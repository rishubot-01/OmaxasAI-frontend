import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  X,
  Search,
  MessageSquare,
  MessageSquarePlus,
  Images,
  Compass,
  Library,
  FolderKanban,
  Settings,
  UserRound,
  LogOut,
  RefreshCw,
  Trash2,
} from "lucide-react";

import omaxasLogo from "../../assets/Analysis output 1.png";
import { useAuth } from "../../features/auth/useAuth";

export default function MobileSidebar({
  isOpen = false,
  onClose,
  guestMode = false,
  conversations = [],
  activeConversationId = null,
  loadingConversations = false,
  onRefreshConversations,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  onNavigate,
  onNotice,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");

  const displayName =
    user?.display_name ||
    user?.full_name ||
    user?.name ||
    user?.email ||
    "Your account";

  const email = user?.email || "";

  const userInitial =
    String(displayName).trim().charAt(0).toUpperCase() || "U";

  // Lock background scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const closeDrawer = () => {
    onClose?.();
  };

  const handleNewChat = () => {
    closeDrawer();

    if (typeof onNewChat === "function") {
      onNewChat();
    } else {
      navigate(guestMode ? "/" : "/chat/new");
    }
  };

  const handleNavigate = (label) => {
    closeDrawer();

    if (typeof onNavigate === "function") {
      onNavigate(label);
      return;
    }

    const destinations = {
      Search: "/search",
      Images: "/images",
      Explore: "/explore",
      Library: "/library",
      Projects: "/projects",
      Settings: "/settings",
      Personalization: "/settings",
    };

    const destination = destinations[label];

    if (destination) {
      navigate(destination);
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (guestMode) {
      handleNavigate("Search");
      return;
    }

    closeDrawer();

    navigate(
      query
        ? `/search?q=${encodeURIComponent(query)}`
        : "/search"
    );
  };

  const handleSelectConversation = (conversation) => {
    if (guestMode || loadingConversations) return;

    if (typeof onSelectConversation !== "function") {
      onNotice?.("Conversation history is not connected yet.");
      return;
    }

    closeDrawer();
    onSelectConversation(conversation);
  };

  const handleDeleteConversation = (event, conversation) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      guestMode ||
      loadingConversations ||
      typeof onDeleteConversation !== "function"
    ) {
      return;
    }

    onDeleteConversation(conversation);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeDrawer();
      navigate("/login", { replace: true });
    } catch (error) {
      onNotice?.(
        error?.message || "Unable to log out. Please try again."
      );
    }
  };

  const getConversationTitle = (conversation) => {
    const title =
      conversation?.title ||
      conversation?.name ||
      conversation?.last_message ||
      "";

    return typeof title === "string" && title.trim()
      ? title.trim()
      : "New chat";
  };

  const getConversationId = (conversation) =>
    conversation?.id ?? conversation?.pk ?? null;

  const filteredConversations = conversations.filter((conversation) =>
    getConversationTitle(conversation)
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

  const isActivePath = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(`${path}/`);

  return (
    <div className="mobile-sidebar-root">
      {isOpen && (
        <button
          type="button"
          className="mobile-sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={closeDrawer}
        />
      )}

      <aside
        className={`mobile-sidebar-panel ${
          isOpen ? "mobile-sidebar-panel-open" : ""
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        {/* Header: centered OmaxasAI brand */}
        <div className="">
          <button
            type="button"
            className="mobile-sidebar-brand"
            onClick={handleNewChat}
            aria-label="OmaxasAI home"
          >
            <span className="mobile-sidebar-brand-mark">
              <img src={omaxasLogo} alt="" />
            </span>

            <span>OmaxasAI</span>
          </button>

          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={closeDrawer}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <form
          className="mobile-sidebar-search"
          onSubmit={handleSearch}
        >
          <Search size={18} aria-hidden="true" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search"
            aria-label="Search conversations"
          />
        </form>

        {/* Main navigation */}
        <nav
          className="mobile-sidebar-nav"
          aria-label="Main navigation"
        >
          <button
            type="button"
            className="mobile-sidebar-nav-item"
            onClick={handleNewChat}
          >
            <MessageSquarePlus size={19} />
            <span>New chat</span>
          </button>

          <button
            type="button"
            className={`mobile-sidebar-nav-item ${
              isActivePath("/search") ? "mobile-sidebar-nav-active" : ""
            }`}
            onClick={() => handleNavigate("Search")}
          >
            <Search size={19} />
            <span>Search</span>
          </button>

          <button
            type="button"
            className={`mobile-sidebar-nav-item ${
              isActivePath("/images") ? "mobile-sidebar-nav-active" : ""
            }`}
            onClick={() => handleNavigate("Images")}
          >
            <Images size={19} />
            <span>Images</span>
          </button>

          <button
            type="button"
            className={`mobile-sidebar-nav-item ${
              isActivePath("/explore") ? "mobile-sidebar-nav-active" : ""
            }`}
            onClick={() => handleNavigate("Explore")}
          >
            <Compass size={19} />
            <span>Explore</span>
          </button>

          <button
            type="button"
            className={`mobile-sidebar-nav-item ${
              isActivePath("/library") ? "mobile-sidebar-nav-active" : ""
            }`}
            onClick={() => handleNavigate("Library")}
          >
            <Library size={19} />
            <span>Library</span>
          </button>

          <button
            type="button"
            className={`mobile-sidebar-nav-item ${
              isActivePath("/projects") ? "mobile-sidebar-nav-active" : ""
            }`}
            onClick={() => handleNavigate("Projects")}
          >
            <FolderKanban size={19} />
            <span>Projects</span>
          </button>

          <button
            type="button"
            className={`mobile-sidebar-nav-item ${
              isActivePath("/settings") ? "mobile-sidebar-nav-active" : ""
            }`}
            onClick={() => handleNavigate("Settings")}
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Recent conversations */}
        <section className="mobile-sidebar-recents">
          <div className="mobile-sidebar-section-heading">
            <span>Recents</span>

            {!guestMode && (
              <button
                type="button"
                className="mobile-sidebar-refresh"
                onClick={() => onRefreshConversations?.()}
                disabled={loadingConversations}
                aria-label="Refresh recent chats"
                title="Refresh recent chats"
              >
                <RefreshCw
                  size={15}
                  className={
                    loadingConversations
                      ? "mobile-sidebar-spinning"
                      : ""
                  }
                />
              </button>
            )}
          </div>

          {guestMode ? (
            <p className="mobile-sidebar-empty">
              Log in to save and view your chats.
            </p>
          ) : loadingConversations && conversations.length === 0 ? (
            <p className="mobile-sidebar-empty" role="status">
              Loading conversations...
            </p>
          ) : filteredConversations.length === 0 ? (
            <p className="mobile-sidebar-empty">
              {searchTerm.trim()
                ? "No matching conversations."
                : "No conversations yet."}
            </p>
          ) : (
            <div className="mobile-sidebar-history-list">
              {filteredConversations.map((conversation, index) => {
                const id = getConversationId(conversation);
                const title = getConversationTitle(conversation);

                const isActive =
                  activeConversationId != null &&
                  String(activeConversationId) === String(id);

                return (
                  <div
                    className={`mobile-sidebar-history-row ${
                      isActive ? "mobile-sidebar-history-active" : ""
                    }`}
                    key={id ?? `${title}-${index}`}
                  >
                    <button
                      type="button"
                      className="mobile-sidebar-history-item"
                      onClick={() =>
                        handleSelectConversation(conversation)
                      }
                      disabled={loadingConversations || id == null}
                      title={title}
                    >
                      <MessageSquare size={16} />
                      <span>{title}</span>
                    </button>

                    <button
                      type="button"
                      className="mobile-sidebar-delete"
                      aria-label={`Delete chat: ${title}`}
                      title="Delete conversation"
                      disabled={
                        loadingConversations ||
                        id == null ||
                        guestMode
                      }
                      onClick={(event) =>
                        handleDeleteConversation(event, conversation)
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Account footer */}
        <footer className="mobile-sidebar-footer">
          {guestMode || !user ? (
            <>
              <button
                type="button"
                className="mobile-sidebar-nav-item"
                onClick={() => {
                  closeDrawer();
                  navigate("/login");
                }}
              >
                <UserRound size={19} />
                <span>Log in</span>
              </button>

              <button
                type="button"
                className="mobile-sidebar-signup"
                onClick={() => {
                  closeDrawer();
                  navigate("/register");
                }}
              >
                Sign up for free
              </button>
            </>
          ) : (
            <>
              <div className="mobile-sidebar-account">
                <div className="mobile-sidebar-avatar">
                  {userInitial}
                </div>

                <div className="mobile-sidebar-account-text">
                  <strong>{displayName}</strong>
                  {email && <small>{email}</small>}
                </div>
              </div>

              <button
                type="button"
                className="mobile-sidebar-nav-item"
                onClick={() => handleNavigate("Settings")}
              >
                <Settings size={19} />
                <span>Settings</span>
              </button>

              <button
                type="button"
                className="mobile-sidebar-nav-item mobile-sidebar-logout"
                onClick={handleLogout}
              >
                <LogOut size={19} />
                <span>Log out</span>
              </button>
            </>
          )}
        </footer>
      </aside>
    </div>
  );
}