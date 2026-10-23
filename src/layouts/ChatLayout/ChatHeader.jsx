
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  MoreHorizontal,
  Share2,
  Pencil,
  Pin,
  Archive,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import ModelSelector from "../../features/chat/components/ModelSelector";

export default function ChatHeader({
  sidebarOpen = true,
  onOpenSidebar,
  selectedModel = "",
  onModelChange,
  onNotice,
  disabled = false,
  guestMode = false,

  // Conversation actions supplied by the parent component
  conversationTitle = "",
  isPinned = false,
  onShare,
  onRename,
  onPin,
  onArchive,
  onDelete,
}) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/register");
  };

  // Close the menu when clicking outside or pressing Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Share the current conversation URL.
  const handleShare = async () => {
    closeMenu();

    try {
      if (onShare) {
        await onShare();
        return;
      }

      const shareData = {
        title: conversationTitle || "OmaxasAI conversation",
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        onNotice?.("Conversation link copied to clipboard.");
      } else {
        onNotice?.("Sharing is not supported in this browser.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        onNotice?.("Unable to share this conversation.");
      }
    }
  };

  const handleRename = () => {
    closeMenu();

    const newTitle = window.prompt(
      "Enter a new conversation name:",
      conversationTitle
    );

    if (newTitle === null) return;

    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      onNotice?.("Conversation name cannot be empty.");
      return;
    }

    if (trimmedTitle === conversationTitle) return;

    if (onRename) {
      onRename(trimmedTitle);
    } else {
      onNotice?.(
        "Rename needs to be connected to your conversation update handler."
      );
    }
  };

  const handlePin = () => {
    closeMenu();

    if (onPin) {
      onPin(!isPinned);
    } else {
      onNotice?.(
        "Pin needs to be connected to your conversation update handler."
      );
    }
  };

  const handleArchive = () => {
    closeMenu();

    if (onArchive) {
      onArchive();
    } else {
      onNotice?.(
        "Archive needs to be connected to your conversation handler."
      );
    }
  };

  const handleDelete = () => {
    closeMenu();

    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation? This action may not be reversible."
    );

    if (!confirmed) return;

    if (onDelete) {
      onDelete();
    } else {
      onNotice?.(
        "Delete needs to be connected to your conversation handler."
      );
    }
  };

  return (
    <header className="topbar chat-topbar">
      {/* LEFT SIDE */}
      <div className="topbar-left">
        {!sidebarOpen && (
          <button
            type="button"
            className="icon-button"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="topbar-right">
        {guestMode ? (
          <div className="chat-header-guest-actions">
            <button
              type="button"
              onClick={handleLogin}
              className="chat-header-login-button"
            >
              Log in
            </button>

            <button
              type="button"
              onClick={handleSignup}
              className="chat-header-signup-button"
            >
              Sign up for free
            </button>
          </div>
        ) : (
          <>
            <div className="chat-header-model-selector">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                disabled={disabled}
              />
            </div>

            {/* THREE-DOT MENU */}
            <div className="chat-header-menu-wrap" ref={menuRef}>
              <button
                type="button"
                className="icon-button chat-header-more-button"
                aria-label="Conversation options"
                title="Conversation options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((current) => !current)}
              >
                <MoreHorizontal size={26} />
              </button>

              {menuOpen && (
                <div
                  className="chat-header-dropdown"
                  role="menu"
                  aria-label="Conversation options"
                >
                  <button
                    type="button"
                    className="chat-header-menu-item"
                    role="menuitem"
                    onClick={handleShare}
                  >
                    <Share2 size={17} />
                    <span>Share</span>
                  </button>

                  <button
                    type="button"
                    className="chat-header-menu-item"
                    role="menuitem"
                    onClick={handleRename}
                  >
                    <Pencil size={17} />
                    <span>Rename</span>
                  </button>

                  <button
                    type="button"
                    className="chat-header-menu-item"
                    role="menuitem"
                    onClick={handlePin}
                  >
                    <Pin size={17} />
                    <span>{isPinned ? "Unpin" : "Pin"}</span>
                  </button>

                  <button
                    type="button"
                    className="chat-header-menu-item"
                    role="menuitem"
                    onClick={handleArchive}
                  >
                    <Archive size={17} />
                    <span>Archive</span>
                  </button>

                  <div className="chat-header-menu-divider" />

                  <button
                    type="button"
                    className="chat-header-menu-item chat-header-menu-item-danger"
                    role="menuitem"
                    onClick={handleDelete}
                  >
                    <Trash2 size={17} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
