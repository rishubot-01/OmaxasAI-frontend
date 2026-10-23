
import { useEffect, useMemo, useState } from "react";
import "./SearchPage.css";

const RECENT_SEARCHES_KEY = "omaxas-ai-recent-searches";
const MAX_RECENT_SEARCHES = 6;

const trendingSearches = [
  { label: "AI agents", icon: "✦" },
  { label: "Python", icon: "</>" },
  { label: "LLM training", icon: "◇" },
  { label: "Prompt engineering", icon: "✧" },
  { label: "Django REST Framework", icon: "⌘" },
  { label: "Image generation", icon: "▧" },
];

const demoConversations = [
  {
    id: 1,
    title: "Python interview preparation",
    preview: "Python fundamentals, OOP concepts and interview questions.",
    date: "Today",
    category: "Coding",
  },
  {
    id: 2,
    title: "Build my own AI assistant",
    preview: "Planning the architecture for an AI assistant using APIs.",
    date: "Yesterday",
    category: "AI",
  },
  {
    id: 3,
    title: "Django REST Framework",
    preview: "Understanding serializers, views, URLs and authentication.",
    date: "Yesterday",
    category: "Coding",
  },
  {
    id: 4,
    title: "Frontend page design",
    preview: "Building Search, Images, Explore and Library pages.",
    date: "Earlier",
    category: "Projects",
  },
  {
    id: 5,
    title: "Understanding large language models",
    preview: "How LLMs are trained and how tokens and context windows work.",
    date: "Earlier",
    category: "AI",
  },
];

const filters = ["All", "AI", "Coding", "Projects"];

function getStoredSearches() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = JSON.parse(
      window.localStorage.getItem(RECENT_SEARCHES_KEY) || "[]"
    );

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved
      .filter(
        (item) => typeof item === "string" && item.trim().length > 0
      )
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

function SearchIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
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
  );
}

function HistoryIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ConversationIcon({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v9a2.5 2.5 0 0 1-2.5 2.5H11l-5 4v-4.5a2.5 2.5 0 0 1-1-2V5.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 8h6M9 12h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SearchPage() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [recentSearches, setRecentSearches] = useState(
    getStoredSearches
  );

  const hasSearch = Boolean(submittedQuery.trim());

  // Save recent searches in browser storage.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(recentSearches)
      );
    } catch {
      // Search remains usable if browser storage is unavailable.
    }
  }, [recentSearches]);

  // Filter demo conversations using the submitted search term.
  const filteredConversations = useMemo(() => {
    const normalizedQuery = submittedQuery.trim().toLowerCase();

    return demoConversations.filter((conversation) => {
      const matchesQuery =
        !normalizedQuery ||
        conversation.title.toLowerCase().includes(normalizedQuery) ||
        conversation.preview.toLowerCase().includes(normalizedQuery) ||
        conversation.category.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        filter === "All" || conversation.category === filter;

      return matchesQuery && matchesFilter;
    });
  }, [submittedQuery, filter]);

  function runSearch(value) {
    const searchTerm = value.trim();

    if (!searchTerm) {
      return;
    }

    setInputValue(searchTerm);
    setSubmittedQuery(searchTerm);
    setFilter("All");

    setRecentSearches((previous) => [
      searchTerm,
      ...previous.filter(
        (item) => item.toLowerCase() !== searchTerm.toLowerCase()
      ),
    ].slice(0, MAX_RECENT_SEARCHES));
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    runSearch(inputValue);
  }

  function clearSearch() {
    setInputValue("");
    setSubmittedQuery("");
    setFilter("All");
  }

  function removeRecentSearch(value) {
    setRecentSearches((previous) =>
      previous.filter((item) => item !== value)
    );
  }

  function clearRecentSearches() {
    setRecentSearches([]);
  }

  return (
    <main className="omaxas-search-page">
      <div className="search-page__container">
        {/* Header */}
        <header className="search-page__header">
          <p className="search-page__eyebrow">OMAXAS AI</p>

          <h1 className="search-page__title">Search</h1>

          <p className="search-page__description">
            Find conversations, explore ideas and discover useful topics.
          </p>
        </header>

        {/* Search bar */}
        <form
          className="search-page__search-form"
          onSubmit={handleSearchSubmit}
          role="search"
        >
          <SearchIcon className="search-page__search-icon" />

          <input
            className="search-page__input"
            type="search"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Search chats, AI, coding, projects..."
            aria-label="Search conversations and topics"
          />

          {inputValue && (
            <button
              type="button"
              className="search-page__clear-button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}

          <button
            type="submit"
            className="search-page__submit-button"
            disabled={!inputValue.trim()}
          >
            Search
          </button>
        </form>

        {!hasSearch ? (
          <>
            {/* Recent searches */}
            <section className="search-page__section">
              <div className="search-page__section-heading">
                <div className="search-page__heading-label">
                  <HistoryIcon className="search-page__heading-icon" />
                  <h2>Recent searches</h2>
                </div>

                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    className="search-page__text-button"
                    onClick={clearRecentSearches}
                  >
                    Clear history
                  </button>
                )}
              </div>

              {recentSearches.length > 0 ? (
                <div className="search-page__recent-list">
                  {recentSearches.map((item) => (
                    <div
                      key={item}
                      className="search-page__recent-row"
                    >
                      <button
                        type="button"
                        className="search-page__recent-search"
                        onClick={() => runSearch(item)}
                      >
                        <HistoryIcon className="search-page__recent-icon" />
                        <span>{item}</span>
                      </button>

                      <button
                        type="button"
                        className="search-page__remove-recent"
                        onClick={() => removeRecentSearch(item)}
                        aria-label={`Remove recent search ${item}`}
                        title="Remove from history"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="m6 6 12 12M18 6 6 18"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="search-page__empty-recent">
                  <HistoryIcon className="search-page__empty-history-icon" />

                  <p>Your recent searches will appear here.</p>
                </div>
              )}
            </section>

            {/* Trending suggestions */}
            <section className="search-page__section search-page__trending-section">
              <div className="search-page__section-heading">
                <div className="search-page__heading-label">
                  <span
                    className="search-page__trending-symbol"
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  <h2>Trending searches</h2>
                </div>
              </div>

              <p className="search-page__section-description">
                Explore suggested topics to get started.
              </p>

              <div className="search-page__trending-grid">
                {trendingSearches.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className="search-page__trending-card"
                    onClick={() => runSearch(item.label)}
                  >
                    <span className="search-page__trending-icon">
                      {item.icon}
                    </span>

                    <span className="search-page__trending-content">
                      <span className="search-page__trending-title">
                        {item.label}
                      </span>
                      <span className="search-page__trending-caption">
                        Suggested topic
                      </span>
                    </span>

                    <span
                      className="search-page__trending-arrow"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </button>
                ))}
              </div>

              <p className="search-page__trending-note">
                These are suggested topics, not live popularity rankings.
              </p>
            </section>

            {/* Discovery note */}
            <div className="search-page__discovery-note">
              <p className="search-page__discovery-title">
                Search your OMAXAS AI workspace
              </p>
              <p className="search-page__discovery-description">
                Search results currently use sample conversations. Your
                account's saved chats can be connected through the backend API.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Result filters */}
            <div className="search-page__filters">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`search-page__filter ${
                    filter === item
                      ? "search-page__filter--active"
                      : ""
                  }`}
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                >
                  {item}
                </button>
              ))}

              <button
                type="button"
                className="search-page__back-button"
                onClick={clearSearch}
              >
                Back to discovery
              </button>
            </div>

            {/* Results */}
            <section className="search-page__results-section">
              <div className="search-page__results-heading">
                <div>
                  <h2>Search results</h2>
                  <p>
                    Results for{" "}
                    <strong>“{submittedQuery}”</strong>
                  </p>
                </div>

                <span className="search-page__results-count">
                  {filteredConversations.length}{" "}
                  {filteredConversations.length === 1 ? "result" : "results"}
                </span>
              </div>

              {filteredConversations.length > 0 ? (
                <div className="search-page__results-list">
                  {filteredConversations.map((conversation) => (
                    <article
                      key={conversation.id}
                      className="search-page__result-card"
                    >
                      <div className="search-page__result-icon">
                        <ConversationIcon />
                      </div>

                      <div className="search-page__result-content">
                        <div className="search-page__result-title-row">
                          <h3>{conversation.title}</h3>

                          <span className="search-page__category">
                            {conversation.category}
                          </span>
                        </div>

                        <p className="search-page__result-preview">
                          {conversation.preview}
                        </p>

                        <p className="search-page__result-date">
                          {conversation.date}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="search-page__no-results">
                  <span className="search-page__no-results-icon">
                    <SearchIcon />
                  </span>

                  <h3>No conversations found</h3>

                  <p>
                    No sample conversations match “{submittedQuery}”.
                    Try another keyword or choose a different category.
                  </p>

                  <button
                    type="button"
                    className="search-page__back-button search-page__back-button--empty"
                    onClick={clearSearch}
                  >
                    Back to discovery
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
