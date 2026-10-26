
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import Sidebar from "../Sidebar/Sidebar";
import ChatHeader from "./ChatHeader";
import MobileSidebar from "../../components/Mobile/MobileSidebar";

import SettingsPage from "../../features/settings/pages/SettingsPage";
import SearchPage from "../../features/Search/pages/SearchPage";
import ImagesPage from "../../features/images/pages/ImagesPage";
import ExplorePage from "../../features/explore/pages/ExplorePage";
import LibraryPage from "../../features/library/pages/LibraryPage";
import ProjectPage from "../../features/projects/pages/ProjectPage";

import MessageList from "../../features/chat/components/MessageList";
import ChatComposer from "../../features/chat/components/ChatComposer";

import { useChatContext } from "../../context/ChatContext";

import {
  deleteConversation,
  getConversations,
} from "../../features/chat/chatService";

const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 420;
const SIDEBAR_DEFAULT_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_WIDTH_STORAGE_KEY = "omaxas-sidebar-width";
const MOBILE_BREAKPOINT = 760;

const NAVIGATION_PATHS = {
  "New chat": "/chat/new",
  Search: "/search",
  Images: "/images",
  Explore: "/explore",
  Library: "/library",
  Projects: "/projects",
  Settings: "/settings",
  Personalization: "/settings",
};

const GUEST_RESTRICTED_NAVIGATION = [
  "Search",
  "Images",
  "Explore",
  "Library",
  "Projects",
  "Settings",
  "Personalization",
];

const PAGE_COMPONENTS = {
  "/search": SearchPage,
  "/images": ImagesPage,
  "/explore": ExplorePage,
  "/library": LibraryPage,
  "/projects": ProjectPage,
};

function clampSidebarWidth(width) {
  return Math.min(
    SIDEBAR_MAX_WIDTH,
    Math.max(SIDEBAR_MIN_WIDTH, width)
  );
}

function getSavedSidebarWidth() {
  if (typeof window === "undefined") {
    return SIDEBAR_DEFAULT_WIDTH;
  }

  try {
    const savedWidth = Number(
      window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)
    );

    if (
      Number.isFinite(savedWidth) &&
      savedWidth >= SIDEBAR_MIN_WIDTH &&
      savedWidth <= SIDEBAR_MAX_WIDTH
    ) {
      return savedWidth;
    }
  } catch {
    // Use the default width if browser storage is unavailable.
  }

  return SIDEBAR_DEFAULT_WIDTH;
}

function extractConversations(response) {
  let data = response?.data ?? response;

  if (
    data &&
    !Array.isArray(data) &&
    data.data !== undefined
  ) {
    data = data.data;
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.conversations)) {
    return data.conversations;
  }

  return [];
}

function getConversationId(conversation) {
  const id =
    typeof conversation === "object" &&
    conversation !== null
      ? conversation.id ?? conversation.pk
      : conversation;

  if (id === null || id === undefined) {
    return null;
  }

  const parsedId = Number(id);

  return Number.isSafeInteger(parsedId) && parsedId > 0
    ? parsedId
    : null;
}

function getErrorMessage(error, fallback) {
  return (
    error?.data?.detail ||
    error?.response?.data?.detail ||
    error?.data?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getActiveNavFromPath(pathname) {
  if (pathname.startsWith("/settings")) {
    return "Settings";
  }

  if (pathname === "/chat/new" || pathname === "/") {
    return "New chat";
  }

  const navByPath = {
    "/search": "Search",
    "/images": "Images",
    "/explore": "Explore",
    "/library": "Library",
    "/projects": "Projects",
  };

  return navByPath[pathname] ?? null;
}

export default function ChatLayout({ guestMode = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isSettingsPage = location.pathname.startsWith("/settings");
  const RoutedPage = PAGE_COMPONENTS[location.pathname] ?? null;
  const isChatPage = !isSettingsPage && !RoutedPage;

  // Keep desktop and mobile sidebar rendering separate.
  const [isMobileViewport, setIsMobileViewport] = useState(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth <= MOBILE_BREAKPOINT
  );

  const [sidebarOpen, setSidebarOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth > MOBILE_BREAKPOINT
  );

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(
    getSavedSidebarWidth
  );

  const [isResizing, setIsResizing] = useState(false);
  const [activeNav, setActiveNav] = useState("New chat");
  const [selectedModel, setSelectedModel] = useState(null);
  const [notice, setNotice] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] =
    useState(false);

  const {
    messages,
    sendMessage,
    loading,
    error,
    clearMessages,
    loadConversation,
    startNewChat,
    activeConversationId,
  } = useChatContext();

  const resizeStartRef = useRef({
    clientX: 0,
    width: SIDEBAR_DEFAULT_WIDTH,
  });

  const sidebarWidthRef = useRef(sidebarWidth);

  // ---------------------------------------------------------
  // Mobile sidebar open / close
  // ---------------------------------------------------------

  const handleOpenSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Change sidebar mode only when crossing the mobile breakpoint.
  // This avoids closing the drawer when a mobile keyboard opens.
  useEffect(() => {
    let wasMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    const handleViewportResize = () => {
      const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

      if (isMobile === wasMobile) {
        return;
      }

      wasMobile = isMobile;

      setIsMobileViewport(isMobile);
      setSidebarOpen(!isMobile);
      setIsResizing(false);
    };

    window.addEventListener("resize", handleViewportResize);

    return () => {
      window.removeEventListener("resize", handleViewportResize);
    };
  }, []);

  // ---------------------------------------------------------
  // Navigation state
  // ---------------------------------------------------------

  useEffect(() => {
    const nextActiveNav = getActiveNavFromPath(location.pathname);

    if (nextActiveNav) {
      setActiveNav(nextActiveNav);
      setNotice("");
    }
  }, [location.pathname]);

  // ---------------------------------------------------------
  // Desktop sidebar resizing
  // ---------------------------------------------------------

  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  const saveSidebarWidth = useCallback((width) => {
    const nextWidth = clampSidebarWidth(width);

    sidebarWidthRef.current = nextWidth;
    setSidebarWidth(nextWidth);

    try {
      window.localStorage.setItem(
        SIDEBAR_WIDTH_STORAGE_KEY,
        String(nextWidth)
      );
    } catch {
      // Resizing still works if browser storage is unavailable.
    }
  }, []);

  const handleResizeStart = useCallback(
    (event) => {
      if (
        isMobileViewport ||
        sidebarCollapsed ||
        event.button !== 0
      ) {
        return;
      }

      event.preventDefault();

      resizeStartRef.current = {
        clientX: event.clientX,
        width: sidebarWidthRef.current,
      };

      setIsResizing(true);
    },
    [isMobileViewport, sidebarCollapsed]
  );

  useEffect(() => {
    if (!isResizing) {
      return undefined;
    }

    function handlePointerMove(event) {
      const delta =
        event.clientX - resizeStartRef.current.clientX;

      const nextWidth = clampSidebarWidth(
        resizeStartRef.current.width + delta
      );

      sidebarWidthRef.current = nextWidth;
      setSidebarWidth(nextWidth);
    }

    function finishResizing() {
      try {
        window.localStorage.setItem(
          SIDEBAR_WIDTH_STORAGE_KEY,
          String(sidebarWidthRef.current)
        );
      } catch {
        // Keep the selected width for the current session.
      }

      setIsResizing(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishResizing);
    window.addEventListener("pointercancel", finishResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishResizing);
      window.removeEventListener("pointercancel", finishResizing);
    };
  }, [isResizing]);

  const handleResizeKeyDown = useCallback(
    (event) => {
      let nextWidth;

      switch (event.key) {
        case "ArrowLeft":
          nextWidth = sidebarWidthRef.current - 10;
          break;

        case "ArrowRight":
          nextWidth = sidebarWidthRef.current + 10;
          break;

        case "Home":
          nextWidth = SIDEBAR_MIN_WIDTH;
          break;

        case "End":
          nextWidth = SIDEBAR_MAX_WIDTH;
          break;

        default:
          return;
      }

      event.preventDefault();
      saveSidebarWidth(nextWidth);
    },
    [saveSidebarWidth]
  );

  const handleResizeReset = useCallback(() => {
    saveSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
  }, [saveSidebarWidth]);

  // ---------------------------------------------------------
  // Conversation history
  // One shared loader is used for initial load and refresh.
  // ---------------------------------------------------------

  const refreshConversations = useCallback(async () => {
    if (guestMode) {
      setConversations([]);
      setLoadingConversations(false);
      return [];
    }

    setLoadingConversations(true);

    try {
      const response = await getConversations();
      const savedConversations = extractConversations(response);

      setConversations(savedConversations);

      return savedConversations;
    } catch (err) {
      setNotice(
        getErrorMessage(
          err,
          "Recent chat history load nahi ho paayi."
        )
      );

      return null;
    } finally {
      setLoadingConversations(false);
    }
  }, [guestMode]);

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  // ---------------------------------------------------------
  // New chat
  // ---------------------------------------------------------

  const handleNewChat = useCallback(() => {
    if (loading) {
      return;
    }

    if (typeof startNewChat === "function") {
      const started = startNewChat();

      if (started === false) {
        return;
      }
    } else if (typeof clearMessages === "function") {
      clearMessages();
    }

    setActiveNav("New chat");
    setNotice("");

    navigate(guestMode ? "/" : "/chat/new");

    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      setSidebarOpen(false);
    }
  }, [
    loading,
    startNewChat,
    clearMessages,
    navigate,
    guestMode,
  ]);

  // ---------------------------------------------------------
  // Select conversation
  // ---------------------------------------------------------

  const handleSelectConversation = useCallback(
    async (conversation) => {
      if (guestMode || loading) {
        return;
      }

      const conversationId = getConversationId(conversation);

      if (!conversationId) {
        setNotice("Selected conversation ID valid nahi hai.");
        return;
      }

      if (typeof loadConversation !== "function") {
        setNotice(
          "Conversation loader ChatContext mein available nahi hai."
        );
        return;
      }

      setNotice("");

      const loaded = await loadConversation(conversationId);

      if (!loaded) {
        setNotice("Conversation load nahi ho paayi.");
        return;
      }

      setActiveNav("New chat");
      navigate("/chat/new");

      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        setSidebarOpen(false);
      }
    },
    [guestMode, loading, loadConversation, navigate]
  );

  // ---------------------------------------------------------
  // Delete conversation
  // ---------------------------------------------------------

  const handleDeleteConversation = useCallback(
    async (conversation) => {
      if (guestMode || loading || loadingConversations) {
        return;
      }

      const conversationId = getConversationId(conversation);

      if (!conversationId) {
        setNotice(
          "Conversation delete nahi ho sakti: invalid ID."
        );
        return;
      }

      const title =
        typeof conversation?.title === "string" &&
        conversation.title.trim()
          ? conversation.title.trim()
          : "this conversation";

      const confirmed = window.confirm(
        `Delete "${title}"?\n\nThis will permanently delete this conversation and its saved messages.`
      );

      if (!confirmed) {
        return;
      }

      setNotice("");

      try {
        await deleteConversation(conversationId);

        setConversations((previous) =>
          previous.filter(
            (item) =>
              String(getConversationId(item)) !==
              String(conversationId)
          )
        );

        if (
          activeConversationId !== null &&
          activeConversationId !== undefined &&
          String(activeConversationId) === String(conversationId)
        ) {
          if (typeof startNewChat === "function") {
            startNewChat();
          } else {
            clearMessages?.();
          }

          setActiveNav("New chat");
          navigate(guestMode ? "/" : "/chat/new");
        }

        setNotice("Conversation deleted.");
      } catch (err) {
        setNotice(
          getErrorMessage(
            err,
            "Could not delete this conversation."
          )
        );
      }
    },
    [
      guestMode,
      loading,
      loadingConversations,
      activeConversationId,
      startNewChat,
      clearMessages,
      navigate,
    ]
  );

  // ---------------------------------------------------------
  // Shared navigation for desktop and mobile sidebars
  // ---------------------------------------------------------

  const handleNavigation = useCallback(
    (label) => {
      if (label === "New chat") {
        handleNewChat();
        return;
      }

      if (
        guestMode &&
        GUEST_RESTRICTED_NAVIGATION.includes(label)
      ) {
        setNotice("Is feature ko use karne ke liye log in karo.");
        return;
      }

      const destination = NAVIGATION_PATHS[label];

      if (destination) {
        setActiveNav(
          label === "Personalization" ? "Settings" : label
        );

        setNotice("");
        navigate(destination);

        if (window.innerWidth <= MOBILE_BREAKPOINT) {
          setSidebarOpen(false);
        }

        return;
      }

      setActiveNav(label);
      setNotice(
        `${label} page integration is not available yet.`
      );

      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        setSidebarOpen(false);
      }
    },
    [guestMode, handleNewChat, navigate]
  );

  // ---------------------------------------------------------
  // Suggested prompts
  // ---------------------------------------------------------

  const handleSelectPrompt = useCallback(
    async (prompt) => {
      if (
        loading ||
        typeof prompt !== "string" ||
        !prompt.trim()
      ) {
        return null;
      }

      setNotice("");
      setActiveNav("New chat");
      navigate(guestMode ? "/" : "/chat/new");

      try {
        return await sendMessage(prompt.trim(), {
          selectedModel,
          guestMode,
        });
      } finally {
        if (!guestMode) {
          await refreshConversations();
        }
      }
    },
    [
      loading,
      sendMessage,
      selectedModel,
      guestMode,
      refreshConversations,
      navigate,
    ]
  );

  // ---------------------------------------------------------
  // Send message
  // ---------------------------------------------------------

  const handleSendMessage = useCallback(
    async (text, options = {}) => {
      setNotice("");
      setActiveNav("New chat");

      navigate(guestMode ? "/" : "/chat/new");

      try {
        return await sendMessage(text, {
          ...options,
          selectedModel,
          guestMode,
        });
      } finally {
        if (!guestMode) {
          await refreshConversations();
        }
      }
    },
    [
      sendMessage,
      selectedModel,
      guestMode,
      refreshConversations,
      navigate,
    ]
  );

  // ---------------------------------------------------------
  // Miscellaneous handlers
  // ---------------------------------------------------------

  const handleModelChange = useCallback((model) => {
    setSelectedModel(model ?? null);
  }, []);

  const handleNotice = useCallback((message) => {
    setNotice(message);
  }, []);

  const effectiveSidebarWidth = sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : sidebarWidth;

  return (
    <div
      className={`app-shell ${isResizing ? "is-resizing" : ""}`}
      style={{
        "--sidebar-width": `${effectiveSidebarWidth}px`,
      }}
    >
      {/* Desktop sidebar: hidden by CSS on mobile. */}
      <div className="sidebar-resizable-region desktop-sidebar">
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          activeNav={
            getActiveNavFromPath(location.pathname) ?? activeNav
          }
          conversations={guestMode ? [] : conversations}
          activeConversationId={
            guestMode ? null : activeConversationId
          }
          loadingConversations={
            guestMode ? false : loadingConversations
          }
          onRefreshConversations={refreshConversations}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onToggleCollapse={() =>
            setSidebarCollapsed((current) => !current)
          }
          onClose={handleCloseSidebar}
          onNewChat={handleNewChat}
          onNavigate={handleNavigation}
          onNotice={handleNotice}
        />
      </div>

      {/* Independent mobile drawer. */}
      <MobileSidebar
        isOpen={isMobileViewport && sidebarOpen}
        onClose={handleCloseSidebar}
        guestMode={guestMode}
        conversations={guestMode ? [] : conversations}
        activeConversationId={
          guestMode ? null : activeConversationId
        }
        loadingConversations={
          guestMode ? false : loadingConversations
        }
        onRefreshConversations={refreshConversations}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewChat={handleNewChat}
        onNavigate={handleNavigation}
        onNotice={handleNotice}
      />

      {/* Desktop resize handle. */}
      {!sidebarCollapsed && (
        <div
          className="sidebar-resize-handle"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          aria-valuemin={SIDEBAR_MIN_WIDTH}
          aria-valuemax={SIDEBAR_MAX_WIDTH}
          aria-valuenow={sidebarWidth}
          aria-valuetext={`${sidebarWidth} pixels`}
          tabIndex={0}
          title="Drag to resize sidebar. Double-click to reset."
          onPointerDown={handleResizeStart}
          onKeyDown={handleResizeKeyDown}
          onDoubleClick={handleResizeReset}
        />
      )}

      <main className="main-panel">
        {/* Routed pages need their own mobile menu trigger because
            ChatHeader is only rendered on chat pages. */}
        {!isChatPage && (
          <button
            type="button"
            className="mobile-page-menu-button"
            onClick={handleOpenSidebar}
            aria-label="Open navigation menu"
            title="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        {isSettingsPage ? (
          <SettingsPage />
        ) : RoutedPage ? (
          <div className="h-full min-h-0 overflow-y-auto">
            <RoutedPage />
          </div>
        ) : isChatPage ? (
          <>

<ChatHeader
  sidebarOpen={sidebarOpen}
  onOpenSidebar={handleOpenSidebar}
  selectedModel={selectedModel}
  onModelChange={handleModelChange}
  onNotice={handleNotice}
  disabled={loading}
  guestMode={guestMode}
  onDelete={() => {
    const currentConversation = conversations.find(
      (item) =>
        String(getConversationId(item)) ===
        String(activeConversationId)
    );

    if (!currentConversation) {
      setNotice("Current conversation could not be found.");
      return;
    }

    void handleDeleteConversation(currentConversation);
  }}
/>


            {notice && (
              <div
                className="notice-banner chat-layout-notice"
                role="status"
              >
                <span>{notice}</span>

                <button
                  type="button"
                  className="small-icon-button"
                  onClick={() => setNotice("")}
                  aria-label="Dismiss notice"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <section className="conversation-area">
              <MessageList
                messages={messages}
                loading={loading}
                error={error}
                onSelectPrompt={handleSelectPrompt}
              />
            </section>

            <footer className="composer-area">
              <ChatComposer
                onSend={handleSendMessage}
                loading={loading}
              />

              <p className="disclaimer">
                OMAXAS AI can make mistakes. Check important information.
              </p>
            </footer>
          </>
        ) : null}
      </main>
    </div>
  );
}
