
import { useMemo, useState } from "react";

const initialProjects = [
  {
    id: 1,
    name: "OMAXAS AI",
    description:
      "Build an AI workspace with chat, search, image tools and a personal library.",
    category: "AI Development",
    status: "In Progress",
    progress: 65,
    icon: "✦",
    color: "from-violet-500/20 to-indigo-500/5",
    updatedAt: "2026-10-21",
  },
  {
    id: 2,
    name: "OMNIX Social",
    description:
      "Develop a social networking platform with messaging, reels and user profiles.",
    category: "Web Development",
    status: "In Progress",
    progress: 40,
    icon: "◎",
    color: "from-pink-500/20 to-purple-500/5",
    updatedAt: "2026-10-19",
  },
  {
    id: 3,
    name: "Python Backend",
    description:
      "Build APIs using Django REST Framework, authentication and database models.",
    category: "Backend",
    status: "Planning",
    progress: 15,
    icon: "</>",
    color: "from-emerald-500/20 to-teal-500/5",
    updatedAt: "2026-10-17",
  },
  {
    id: 4,
    name: "AI Learning Roadmap",
    description:
      "Organize Python, machine learning, LLMs and AI agent learning milestones.",
    category: "Learning",
    status: "Completed",
    progress: 100,
    icon: "◇",
    color: "from-amber-500/20 to-orange-500/5",
    updatedAt: "2026-10-12",
  },
];

const statuses = ["All", "Planning", "In Progress", "Completed"];

const categories = [
  "AI Development",
  "Web Development",
  "Backend",
  "Learning",
  "Mobile App",
  "Other",
];

function getStatusStyle(status) {
  switch (status) {
    case "Completed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    case "In Progress":
      return "border-violet-500/20 bg-violet-500/10 text-violet-300";
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }
}

export default function ProjectPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "AI Development",
  });

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.category.toLowerCase().includes(query);

      const matchesStatus =
        activeStatus === "All" || project.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, activeStatus]);

  const getCount = (status) => {
    if (status === "All") {
      return projects.length;
    }

    return projects.filter((project) => project.status === status).length;
  };

  const completedCount = projects.filter(
    (project) => project.status === "Completed"
  ).length;

  const inProgressCount = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const handleCreateProject = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setNotice("Please enter a project name.");
      return;
    }

    const newProject = {
      id: Date.now(),
      name,
      description: description || "No project description added yet.",
      category: form.category,
      status: "Planning",
      progress: 0,
      icon: "✦",
      color: "from-violet-500/20 to-blue-500/5",
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setProjects((current) => [newProject, ...current]);
    setForm({
      name: "",
      description: "",
      category: "AI Development",
    });
    setActiveStatus("All");
    setSearchQuery("");
    setShowCreateForm(false);
    setSelectedProject(newProject);
    setNotice("Project created in this demo workspace.");
  };

  const updateProject = (id, changes) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === id
          ? {
              ...project,
              ...changes,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : project
      )
    );

    setSelectedProject((current) =>
      current?.id === id ? { ...current, ...changes } : current
    );
  };

  const deleteProject = (id) => {
    const project = projects.find((item) => item.id === id);

    setProjects((current) => current.filter((item) => item.id !== id));

    if (selectedProject?.id === id) {
      setSelectedProject(null);
    }

    setNotice(`"${project?.name ?? "Project"}" removed from this demo list.`);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setActiveStatus("All");
    setNotice("");
  };

  return (
    <main className="min-h-screen bg-[#0b0b0d] px-4 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        {/* Page header */}
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium tracking-wide text-violet-400">
            OMAXAS AI WORKSPACE
          </p>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Projects
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Organize your ideas, manage your work and keep track of every
                project in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm((current) => !current);
                setSelectedProject(null);
                setNotice("");
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
            >
              <span aria-hidden="true" className="text-lg">
                +
              </span>
              New project
            </button>
          </div>
        </header>

        {/* Summary cards */}
        <section
          aria-label="Project statistics"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-white/10 bg-[#141416] p-5">
            <p className="text-sm text-zinc-400">Total projects</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums">
              {projects.length}
            </p>
            <p className="mt-2 text-xs text-zinc-500">Across your workspace</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141416] p-5">
            <p className="text-sm text-zinc-400">In progress</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-violet-300">
              {inProgressCount}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Projects currently underway
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#141416] p-5">
            <p className="text-sm text-zinc-400">Completed</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-emerald-300">
              {completedCount}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              Projects marked as completed
            </p>
          </div>
        </section>

        {/* Create project form */}
        {showCreateForm && (
          <section className="mb-8 rounded-2xl border border-violet-500/30 bg-[#15131b] p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Create a project</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Add a name and basic details for your new project.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                aria-label="Close create project form"
                className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Project name
                </label>

                <input
                  id="project-name"
                  type="text"
                  maxLength={100}
                  required
                  autoFocus
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. My AI Assistant"
                  className="w-full rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/70"
                />
              </div>

              <div>
                <label
                  htmlFor="project-description"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Description
                </label>

                <textarea
                  id="project-description"
                  rows={3}
                  maxLength={1000}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="What do you want to build?"
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/70"
                />
              </div>

              <div>
                <label
                  htmlFor="project-category"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Category
                </label>

                <select
                  id="project-category"
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/70"
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                      className="bg-[#141416]"
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
                >
                  Create project
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Search and filters */}
        <section className="mb-6 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#151517] px-4 py-3 focus-within:border-violet-500/60">
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
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSelectedProject(null);
              }}
              placeholder="Search projects..."
              aria-label="Search projects"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => {
              const isActive = activeStatus === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setActiveStatus(status);
                    setSelectedProject(null);
                  }}
                  aria-pressed={isActive}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-violet-500/50 bg-violet-500/10 text-violet-200"
                      : "border-white/10 bg-[#141416] text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {status}
                  <span className="ml-2 text-xs opacity-70">
                    {getCount(status)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Notification */}
        {notice && (
          <div
            role="status"
            aria-live="polite"
            className="mb-5 rounded-xl border border-white/10 bg-[#151517] px-4 py-3 text-sm text-zinc-300"
          >
            {notice}
          </div>
        )}

        {/* Projects grid */}
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">Your projects</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Review progress and update your project status.
              </p>
            </div>

            <span className="shrink-0 text-xs text-zinc-500">
              {filteredProjects.length} results
            </span>
          </div>

          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <article
                  key={project.id}
                  className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-[#141416] p-5 transition hover:border-violet-500/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${project.color}`}
                    >
                      <span
                        aria-hidden="true"
                        className="text-xl font-semibold text-violet-200"
                      >
                        {project.icon}
                      </span>
                    </div>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs ${getStatusStyle(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="mt-5 flex-1">
                    <p className="text-xs font-medium text-violet-300">
                      {project.category}
                    </p>

                    <h3 className="mt-2 break-words text-lg font-semibold">
                      {project.name}
                    </h3>

                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-zinc-400">
                      {project.description}
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-zinc-500">Progress</span>

                      <span className="text-xs font-medium tabular-nums text-zinc-300">
                        {project.progress}%
                      </span>
                    </div>

                    <div
                      role="progressbar"
                      aria-label={`${project.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={project.progress}
                      className="h-2 overflow-hidden rounded-full bg-white/10"
                    >
                      <div
                        className={`h-full rounded-full transition-all ${
                          project.status === "Completed"
                            ? "bg-emerald-400"
                            : "bg-violet-500"
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    <p className="mt-3 text-xs text-zinc-500">
                      Updated {project.updatedAt}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-white/5 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowCreateForm(false);
                        setNotice("");
                      }}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200"
                    >
                      Manage
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteProject(project.id)}
                      className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                      aria-label={`Remove ${project.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl">
                ✦
              </div>

              <h3 className="mt-4 font-medium">No projects found</h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Try another keyword or status filter, or create a new project
                to get started.
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

        {/* Project detail / management panel */}
        {selectedProject && (
          <section className="mt-8 rounded-2xl border border-violet-500/20 bg-[#15131b] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-violet-300">
                  PROJECT MANAGEMENT
                </p>

                <h2 className="mt-2 break-words text-xl font-semibold">
                  {selectedProject.name}
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {selectedProject.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="shrink-0 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="manage-project-status"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Project status
                </label>

                <select
                  id="manage-project-status"
                  value={selectedProject.status}
                  onChange={(event) => {
                    const status = event.target.value;
                    const changes = {
                      status,
                      ...(status === "Completed" ? { progress: 100 } : {}),
                    };

                    updateProject(selectedProject.id, changes);
                    setNotice("Project status updated.");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/70"
                >
                  {statuses
                    .filter((status) => status !== "All")
                    .map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-[#141416]"
                      >
                        {status}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="manage-project-progress"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Progress: {selectedProject.progress}%
                </label>

                <input
                  id="manage-project-progress"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedProject.progress}
                  onChange={(event) => {
                    const progress = Number(event.target.value);

                    const status =
                      progress === 100
                        ? "Completed"
                        : selectedProject.status === "Completed"
                          ? "In Progress"
                          : selectedProject.status;

                    updateProject(selectedProject.id, {
                      progress,
                      status,
                    });
                  }}
                  className="mt-3 w-full accent-violet-500"
                />

                <div className="mt-2 flex justify-between text-xs text-zinc-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium">Project workspace</p>

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                This panel currently updates the project's status and progress
                in the local page state. Connecting project conversations,
                files, tasks and permanent storage requires backend integration.
              </p>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-white/10 py-5">
          <p className="text-xs leading-5 text-zinc-500">
            OMAXAS AI Projects · Demo data is stored in the current page state.
            Backend integration is required to save projects permanently.
          </p>
        </footer>
      </div>
    </main>
  );
}