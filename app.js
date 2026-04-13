// ─── Dark Mode ─────────────────────────────────────────────────────────────────
// This IIFE runs instantly — before the rest of the page renders — so there's
// no "flash" of light mode when a user has dark mode saved.
(function initDarkMode() {
  if (localStorage.getItem("darkMode") === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

// Called by the 🌙 button in the header. Flips the theme and saves the choice.
function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  document.documentElement.setAttribute("data-theme", isDark ? "" : "dark");
  localStorage.setItem("darkMode", isDark ? "" : "dark");
  const btn = document.getElementById("dark-btn");
  if (btn) btn.textContent = isDark ? "🌙" : "☀️";
}

// ─── State Management ──────────────────────────────────────────────────────────
// Movie data is stored in localStorage so changes persist across page refreshes.
// On first visit, it loads the defaults from data.js.

function getState() {
  const saved = localStorage.getItem("movieTrackerState");
  if (saved) return JSON.parse(saved);
  return {
    recommendations: DEFAULT_RECOMMENDATIONS,
    history:         DEFAULT_HISTORY,
    watchlist:       DEFAULT_WATCHLIST,
  };
}

function saveState(state) {
  localStorage.setItem("movieTrackerState", JSON.stringify(state));
}

// Move a movie from recommendations/watchlist into history
function markAsWatched(id) {
  const state = getState();
  const movie =
    state.recommendations.find((m) => m.id === id) ||
    state.watchlist.find((m) => m.id === id);
  if (!movie) return;

  movie.watchedAt = new Date().toISOString().split("T")[0];

  state.history         = [movie, ...state.history];
  state.recommendations = state.recommendations.filter((m) => m.id !== id);
  state.watchlist       = state.watchlist.filter((m) => m.id !== id);

  saveState(state);
  renderCurrentPage();
  // Tell the React stats panel to refresh too
  if (window.refreshStats) window.refreshStats();
}

// Remove a movie from the watchlist
function removeFromWatchlist(id) {
  const state = getState();
  state.watchlist = state.watchlist.filter((m) => m.id !== id);
  saveState(state);
  renderCurrentPage();
  if (window.refreshStats) window.refreshStats();
}

// ── NEW: Add a recommendation to the watchlist without marking it watched ──
// The movie stays in Discover too — only markAsWatched removes it from there.
function addToWatchlist(id) {
  const state = getState();

  // Guard: skip if already in watchlist or history
  const alreadySaved =
    state.watchlist.find((m) => m.id === id) ||
    state.history.find((m) => m.id === id);
  if (alreadySaved) return;

  const movie = state.recommendations.find((m) => m.id === id);
  if (!movie) return;

  // Spread so we don't mutate the recommendations entry
  const entry = { ...movie, addedAt: new Date().toISOString().split("T")[0] };
  state.watchlist = [entry, ...state.watchlist];

  saveState(state);
  renderCurrentPage();
  if (window.refreshStats) window.refreshStats();
}

// ─── Movie Card HTML ───────────────────────────────────────────────────────────
// Returns the HTML string for one card.
// showMarkWatched / showRemove / showAddWatchlist control which hover buttons appear.

function createMovieCard(movie, showMarkWatched, showRemove, showAddWatchlist) {
  const actionButtons = `
    <div class="card-actions">
      ${showMarkWatched ? `
        <button class="action-btn action-btn-watch"
                onclick="markAsWatched(${movie.id})"
                title="Mark as watched">&#x2713;</button>` : ""}
      ${showRemove ? `
        <button class="action-btn action-btn-remove"
                onclick="removeFromWatchlist(${movie.id})"
                title="Remove from watchlist">&#x2715;</button>` : ""}
      ${showAddWatchlist ? `
        <button class="action-btn action-btn-add"
                onclick="addToWatchlist(${movie.id})"
                title="Save to watchlist">+</button>` : ""}
    </div>`;

  const showActions = showMarkWatched || showRemove || showAddWatchlist;

  return `
    <div class="movie-card">
      <div class="card-poster">
        <img
          src="${movie.poster}"
          alt="${movie.title}"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="poster-fallback" style="display:none;">${movie.title}</div>
        <div class="poster-overlay"></div>
        <div class="rating-badge">&#x2605; ${movie.rating.toFixed(1)}</div>
        ${showActions ? actionButtons : ""}
      </div>
      <div class="card-body">
        <div class="card-header">
          <h3 class="card-title" title="${movie.title}">${movie.title}</h3>
          <span class="card-year">${movie.year}</span>
        </div>
        <p class="card-genre">${movie.genre}</p>
        <p class="card-description">${movie.description}</p>
      </div>
    </div>`;
}

// ─── Grid Rendering ────────────────────────────────────────────────────────────
// Renders a list of movies into the element with the given id.
// showAddWatchlist is the new 4th param — false everywhere except Discover.

function renderGrid(movies, containerId, showMarkWatched, showRemove, showAddWatchlist) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (movies.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Nothing here yet.</p>
        <a href="recommendations.html">Discover movies</a>
      </div>`;
    return;
  }

  container.innerHTML = movies
    .map((m) => createMovieCard(m, showMarkWatched, showRemove, showAddWatchlist))
    .join("");
}

// ─── Page Routing ──────────────────────────────────────────────────────────────
// Each page overrides this with its own render function.
window.renderCurrentPage = function () {};

// ─── Nav Active State ──────────────────────────────────────────────────────────
function setActiveNav() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle(
      "active",
      href === page || (page === "" && href === "index.html")
    );
  });
  // Sync the dark-mode button emoji with the current theme
  const btn = document.getElementById("dark-btn");
  if (btn) {
    btn.textContent =
      document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
  }
}

document.addEventListener("DOMContentLoaded", setActiveNav);
