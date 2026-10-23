import { useMemo, useState } from "react";
import "./LibraryPage.css";

const initialLibraryItems = [
  {
    id: 1,
    title: "Python Interview Preparation",
    description:
      "Python fundamentals, OOP, decorators and common interview questions.",
    type: "Conversation",
    icon: "💬",
    date: "Today",
    updatedAt: "2026-10-21",
    favorite: true,
    color: "from-violet-500/20 to-indigo-500/5",
  },
  {
    id: 2,
    title: "AI Assistant Architecture",
    description: "Ideas and notes for building the OMAXAS AI assistant.",
    type: "Project",
    icon: "✦",
    date: "Yesterday",
    updatedAt: "2026-10-20",
    favorite: true,
    color: "from-blue-500/20 to-cyan-500/5",
  },
  {
    id: 3,
    title: "Future City Concept",
    description: "A creative concept for a futuristic city at sunset.",
    type: "Image",
    icon: "🎨",
    date: "October 18",
    updatedAt: "2026-10-18",
    favorite: false,
    color: "from-pink-500/20 to-purple-500/5",
  },
  {
    id: 4,
    title: "Django REST Framework Notes",
    description:
      "Notes covering serializers, views, URLs and API authentication.",
    type: "File",
    icon: "📄",
    date: "October 16",
    updatedAt: "2026-10-16",
    favorite: false,
    color: "from-emerald-500/20 to-teal-500/5",
    fileInfo: "Demo document",
  },
  {
    id: 5,
    title: "Understanding Large Language Models",
    description:
      "A conversation about model training, tokens and context windows.",
    type: "Conversation",
    icon: "💬",
    date: "October 14",
    updatedAt: "2026-10-14",
    favorite: true,
    color: "from-amber-500/20 to-orange-500/5",
  },
  {
    id: 6,
    title: "Minimal Logo Inspiration",
    description: "Visual inspiration for clean and modern logo design.",
    type: "Image",
    icon: "🖼️",
    date: "October 12",
    updatedAt: "2026-10-12",
    favorite: false,
    color: "from-rose-500/20 to-pink-500/5",
  },
  {
    id: 7,
    title: "OMAXAS AI Frontend",
    description: "Frontend implementation plan for the AI workspace.",
    type: "Project",
    icon: "🚀",
    date: "October 10",
    updatedAt: "2026-10-10",
    favorite: false,
    color: "from-cyan-500/20 to-blue-500/5",
  },
];

const libraryTabs = [
  { label: "All items", value: "All", icon: "▦" },
  { label: "Conversations", value: "Conversation", icon: "💬" },
  { label: "Images", value: "Image", icon: "🖼️" },
  { label: "Files", value: "File", icon: "📄" },
  { label: "Projects", value: "Project", icon: "✦" },
  { label: "Favorites", value: "Favorites", icon: "☆" },
];

export default function LibraryPage() {
  const [items, setItems] = useState(initialLibraryItems);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedItem, setSelectedItem] = useState(null);
  const [notice, setNotice] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const result = items.filter((item) => {
      const matchesTab =
        activeTab === "All"
          ? true
          : activeTab === "Favorites"
            ? item.favorite
            : item.type === activeTab;

      const matchesSearch =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.type.toLowerCase().includes(normalizedQuery);

      return matchesTab && matchesSearch;
    });

    return [...result].sort((a, b) => {
      if (sortOrder === "oldest") {
        return a.updatedAt.localeCompare(b.updatedAt);
      }

      if (sortOrder === "alphabetical") {
        return a.title.localeCompare(b.title);
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [items, activeTab, searchQuery, sortOrder]);

  const toggleFavorite = (id) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item
      )
    );

    setSelectedItem((current) =>
      current?.id === id
        ? { ...current, favorite: !current.favorite }
        : current
    );

    setNotice("Favorite updated.");
  };

  const deleteItem = (id) => {
    const itemToDelete = items.find((item) => item.id === id);

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );

    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }

    setNotice(
      `"${itemToDelete?.title ?? "Item"}" removed from this demo library.`
    );
  };

  const openItem = (item) => {
    setSelectedItem(item);
    setNotice("");
  };

  const resetLibraryView = () => {
    setActiveTab("All");
    setSearchQuery("");
    setSortOrder("newest");
    setSelectedItem(null);
    setNotice("");
  };

  const getCount = (tabValue) => {
    if (tabValue === "All") {
      return items.length;
    }

    if (tabValue === "Favorites") {
      return items.filter((item) => item.favorite).length;
    }

    return items.filter((item) => item.type === tabValue).length;
  };

  return (
    <main className="library-page">
      <div className="library-container">
        {/* Header */}
        <header className="library-header">
          <p className="library-eyebrow">OMAXAS AI WORKSPACE</p>

          <div className="library-header-layout">
            <div>
              <h1 className="library-title">Library</h1>

              <p className="library-description">
                Your saved conversations, creative work, files and projects,
                organized in one place.
              </p>
            </div>

            <div className="library-item-count">
              <span className="library-item-count-icon" aria-hidden="true">
                ▦
              </span>

              <div>
                <p className="library-item-count-label">
                  {items.length} items
                </p>
                <p className="library-item-count-caption">
                  In this demo library
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Search and sorting */}
        <section className="library-toolbar">
          <div className="library-search">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              width="20"
              height="20"
              style={{ flexShrink: 0, color: "#a1a1aa" }}
            >
              <circle
                cx="10.8"
                cy="10.8"
                r="6.8"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="m16 16 4.2 4.2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search your library..."
              aria-label="Search library"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="library-clear-button"
              >
                Clear
              </button>
            )}
          </div>

          <label className="library-sort">
            <span>Sort by</span>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-label="Sort library items"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="alphabetical">A–Z</option>
            </select>
          </label>
        </section>

        {/* Category tabs */}
        <nav className="library-tabs" aria-label="Library categories">
          {libraryTabs.map((tab) => {
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setActiveTab(tab.value);
                  setSelectedItem(null);
                  setNotice("");
                }}
                aria-pressed={isActive}
                className={`library-tab${isActive ? " active" : ""}`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <span>{tab.label}</span>

                <span className="library-tab-count">
                  {getCount(tab.value)}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Status message */}
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="library-notice"
          >
            {notice}
          </div>
        )}

        {/* Library results */}
        <section>
          <div className="library-results-heading">
            <div>
              <h2 className="library-results-title">
                {libraryTabs.find((tab) => tab.value === activeTab)?.label}
              </h2>

              <p className="library-results-description">
                Find and manage your saved items.
              </p>
            </div>

            <span className="library-results-count">
              {filteredItems.length} results
            </span>
          </div>

          {filteredItems.length > 0 ? (
            <div className="library-grid">
              {filteredItems.map((item) => (
                <article className="library-card" key={item.id}>
                  {/* Card header */}
                  <div className="library-card-header">
                    <div className="library-card-icon">
                      <span aria-hidden="true">{item.icon}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(item.id)}
                      aria-label={
                        item.favorite
                          ? `Remove ${item.title} from favorites`
                          : `Add ${item.title} to favorites`
                      }
                      aria-pressed={item.favorite}
                      title={
                        item.favorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      className={`library-favorite-button${
                        item.favorite ? " is-favorite" : ""
                      }`}
                    >
                      {item.favorite ? "★" : "☆"}
                    </button>
                  </div>

                  {/* Card content */}
                  <div className="library-card-content">
                    <div className="library-card-meta">
                      <span className="library-type-badge">{item.type}</span>
                      <span className="library-card-date">{item.date}</span>
                    </div>

                    <h3 className="library-card-title">{item.title}</h3>

                    <p className="library-card-description">
                      {item.description}
                    </p>
                  </div>

                  {/* Card actions */}
                  <div className="library-card-actions">
                    <button
                      type="button"
                      onClick={() => openItem(item)}
                      className="library-button library-button-view"
                    >
                      View details
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      aria-label={`Remove ${item.title}`}
                      title="Remove from this demo library"
                      className="library-button library-button-remove"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="library-empty-state">
              <div className="library-empty-icon" aria-hidden="true">
                ▦
              </div>

              <h3 className="library-empty-title">Nothing found</h3>

              <p className="library-empty-description">
                There are no items matching your search or selected category.
                Try another keyword or reset the filters.
              </p>

              <button
                type="button"
                onClick={resetLibraryView}
                className="library-reset-button"
              >
                Reset filters
              </button>
            </div>
          )}
        </section>

        {/* Selected item details */}
        {selectedItem && (
          <section className="library-details">
            <div className="library-details-header">
              <div className="library-details-main">
                <div className="library-card-icon">
                  <span aria-hidden="true">{selectedItem.icon}</span>
                </div>

                <div>
                  <p className="library-details-type">{selectedItem.type}</p>

                  <h2 className="library-details-title">
                    {selectedItem.title}
                  </h2>

                  <p className="library-details-description">
                    {selectedItem.description}
                  </p>

                  <p className="library-details-date">
                    Last updated: {selectedItem.date}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close item details"
                className="library-close-button"
              >
                ✕
              </button>
            </div>

            <div className="library-details-info">
              <p className="library-details-info-title">Library item</p>

              <p className="library-details-info-text">
                This is a demo item used to build the Library interface. To
                open the original conversation, image or file, connect this
                item to its real backend record and destination.
              </p>
            </div>

            <div className="library-details-actions">
              <button
                type="button"
                onClick={() => toggleFavorite(selectedItem.id)}
                className="library-button library-button-view"
              >
                {selectedItem.favorite
                  ? "★ Remove favorite"
                  : "☆ Add favorite"}
              </button>

              <button
                type="button"
                onClick={() => deleteItem(selectedItem.id)}
                className="library-button library-button-remove"
              >
                Remove item
              </button>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="library-footer">
          <p>
            OMAXAS AI Library · Demo data only. Saved content from your account
            will appear here after backend integration.
          </p>
        </footer>
      </div>
    </main>
  );
}