
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  "All",
  "AI Models",
  "Tools",
  "Productivity",
  "Creative",
];

const exploreItems = [
  {
    id: "omaxas-chat",
    title: "OMAXAS AI Chat",
    description:
      "Ask questions, explore ideas, learn concepts, and work through problems with an AI assistant.",
    category: "AI Models",
    icon: "✦",
    accent: "from-violet-500/20 to-indigo-500/5",
    iconColor: "text-violet-300",
    tags: ["Conversation", "Q&A"],
    featured: true,
    status: "Interface preview",
  },
  {
    id: "image-studio",
    title: "Image Studio",
    description:
      "Prepare image prompts, choose artistic styles, and configure image generation settings.",
    category: "Creative",
    icon: "🎨",
    accent: "from-pink-500/20 to-purple-500/5",
    iconColor: "text-pink-300",
    tags: ["Images", "Design"],
    featured: true,
    status: "Interface preview",
  },
  {
    id: "web-search",
    title: "Web Search",
    description:
      "Find current information on the web and organize relevant sources for your research.",
    category: "Tools",
    icon: "⌕",
    accent: "from-sky-500/20 to-blue-500/5",
    iconColor: "text-sky-300",
    tags: ["Research", "Web"],
    featured: false,
    status: "Integration needed",
  },
  {
    id: "code-assistant",
    title: "Code Assistant",
    description:
      "Explore programming concepts, understand errors, and get help planning software projects.",
    category: "Tools",
    icon: "</>",
    accent: "from-emerald-500/20 to-teal-500/5",
    iconColor: "text-emerald-300",
    tags: ["Python", "Development"],
    featured: false,
    status: "Integration needed",
  },
  {
    id: "document-assistant",
    title: "Document Assistant",
    description:
      "Plan workflows for summarizing documents, extracting information, and organizing notes.",
    category: "Productivity",
    icon: "▤",
    accent: "from-amber-500/20 to-orange-500/5",
    iconColor: "text-amber-300",
    tags: ["Documents", "Writing"],
    featured: false,
    status: "Integration needed",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    description:
      "Prepare an interface for exploring datasets, identifying patterns, and presenting results.",
    category: "Productivity",
    icon: "▥",
    accent: "from-cyan-500/20 to-blue-500/5",
    iconColor: "text-cyan-300",
    tags: ["Data", "Analysis"],
    featured: false,
    status: "Integration needed",
  },
  {
    id: "writing-assistant",
    title: "Writing Assistant",
    description:
      "Draft, rewrite, summarize, and improve text for different audiences and situations.",
    category: "Tools",
    icon: "✎",
    accent: "from-rose-500/20 to-pink-500/5",
    iconColor: "text-rose-300",
    tags: ["Writing", "Ideas"],
    featured: false,
    status: "Integration needed",
  },
  {
    id: "ai-agents",
    title: "AI Agents",
    description:
      "Plan agent workflows that can break down a task into steps and use connected tools.",
    category: "AI Models",
    icon: "◇",
    accent: "from-indigo-500/20 to-violet-500/5",
    iconColor: "text-indigo-300",
    tags: ["Automation", "Workflows"],
    featured: true,
    status: "Integration needed",
  },
];

export default function ExplorePage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return exploreItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const matchesFeatured = !featuredOnly || item.featured;

      const searchableText = [
        item.title,
        item.description,
        item.category,
        ...item.tags,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery || searchableText.includes(normalizedQuery);

      return matchesCategory && matchesFeatured && matchesQuery;
    });
  }, [query, activeCategory, featuredOnly]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/chat/new");
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("All");
    setFeaturedOnly(false);
    setSelectedItem(null);
  };

  return (
    <main className="min-h-screen bg-[#0b0b0d] px-4 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        {/* Back Button */}
        <div className="explore-back-row">
          <button
            type="button"
            onClick={handleBack}
            className="explore-back-button"
            aria-label="Go back to previous page"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="explore-back-icon"
            >
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back</span>
          </button>
        </div>

        {/* Header */}
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium tracking-wide text-violet-400">
            OMAXAS AI
          </p>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Explore
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Discover AI experiences, creative tools, and ways to make your
                everyday work easier.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-violet-400" />
              Explore workspace
            </span>
          </div>
        </header>

        {/* Featured Banner */}
        <section className="relative mb-8 overflow-hidden rounded-2xl border border-violet-400/15 bg-gradient-to-r from-[#21153a] via-[#171326] to-[#111116] p-6 sm:p-8">
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl"
          />

          <div className="relative max-w-2xl">
            <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs font-medium text-violet-200">
              YOUR AI WORKSPACE
            </span>

            <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">
              One place for your ideas.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              Explore the available interfaces and discover which AI
              capabilities you want to add to OMAXAS AI.
            </p>

            <button
              type="button"
              onClick={() => {
                setActiveCategory("All");
                setFeaturedOnly(true);
                setQuery("");
                setSelectedItem(null);
              }}
              className="mt-5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Explore featured items
              <span className="ml-2" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </section>

        {/* Search */}
        <section aria-label="Explore search">
          <label
            htmlFor="explore-search"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Find something useful
          </label>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#151517] px-4 py-3 transition focus-within:border-violet-500/60">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 shrink-0 text-zinc-400"
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
              id="explore-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedItem(null);
              }}
              placeholder="Search models, tools, writing, coding..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* Category Filters */}
        <section className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setSelectedItem(null);
                  }}
                  aria-pressed={isActive}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-violet-500 bg-violet-500/15 text-violet-200"
                      : "border-white/10 bg-[#141416] text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {category}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setFeaturedOnly((current) => !current);
                setSelectedItem(null);
              }}
              aria-pressed={featuredOnly}
              className={`ml-0 rounded-full border px-4 py-2 text-sm transition sm:ml-auto ${
                featuredOnly
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                  : "border-white/10 bg-[#141416] text-zinc-400 hover:text-white"
              }`}
            >
              ✦ Featured only
            </button>
          </div>
        </section>

        {/* Results Heading */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">
                {featuredOnly
                  ? "Featured experiences"
                  : activeCategory === "All"
                    ? "Explore everything"
                    : activeCategory}
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Browse the tools and experiences listed below.
              </p>
            </div>

            <span className="shrink-0 text-xs text-zinc-500">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Cards Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className={`flex flex-col rounded-2xl border bg-[#141416] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 ${
                    selectedItem?.id === item.id
                      ? "border-violet-500/60"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} ${item.iconColor}`}
                    >
                      <span
                        aria-hidden="true"
                        className="text-xl font-semibold"
                      >
                        {item.icon}
                      </span>
                    </div>

                    {item.featured && (
                      <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs text-amber-200">
                        ✦ Featured
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-medium text-violet-300">
                      {item.category}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold">
                      {item.title}
                    </h3>

                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-zinc-400">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 border-t border-white/5 pt-4">
                    <div className="mb-4 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          item.status === "Interface preview"
                            ? "bg-violet-400"
                            : "bg-amber-400"
                        }`}
                      />

                      <span className="text-xs text-zinc-500">
                        {item.status}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200"
                    >
                      View details
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
              <div className="text-3xl" aria-hidden="true">
                ⌕
              </div>

              <h3 className="mt-4 font-medium">
                No matching experiences
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Try a different keyword or reset your filters.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-white/10 px-4 py-2.5 text-sm transition hover:bg-white/15"
              >
                Reset filters
              </button>
            </div>
          )}
        </section>

        {/* Details Panel */}
        {selectedItem && (
          <section
            aria-live="polite"
            className="mt-8 rounded-2xl border border-violet-500/20 bg-[#15131b] p-5 sm:p-6"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${selectedItem.accent} ${selectedItem.iconColor}`}
                >
                  <span aria-hidden="true" className="text-xl">
                    {selectedItem.icon}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-violet-300">
                    {selectedItem.category}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    {selectedItem.title}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                    {selectedItem.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                aria-label="Close details"
                className="self-end rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/10 hover:text-white sm:self-start"
              >
                Close ✕
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium">Integration status</p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {selectedItem.status === "Interface preview"
                  ? "This experience is represented in the frontend interface. Its real AI functionality depends on the model and backend connection."
                  : "This is currently an interface concept. Connect the required backend endpoint or AI provider before using it for real tasks."}
              </p>
            </div>
          </section>
        )}

        {/* Footer Note */}
        <footer className="mt-10 border-t border-white/10 py-5">
          <p className="text-xs leading-5 text-zinc-500">
            OMAXAS AI Explore • The listed entries are frontend examples.
            Actual model availability and capabilities depend on configured
            backend services.
          </p>
        </footer>
      </div>
    </main>
  );
}
