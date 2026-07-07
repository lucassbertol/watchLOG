# watchLOG Agents

## Backend Expert
Expert in Django REST Framework for the watchLOG backend.

**When to use**: Django models, viewsets, serializers, URLs, migrations, `manage.py` commands, TMDB API integration, project settings.

**Instructions**:
- All backend code is under `backend/` — models in `app/models.py`, views in `app/views.py`, serializers in `app/serializers.py`, URLs in `app/urls.py` and `projeto/urls.py`, settings in `projeto/settings.py`.
- The `Series` model has fields: `tmdb_id`, `title`, `description`, `poster_path`, `status` (ongoing/completed/dropped), `grade` (Decimal 0-10), `dateEnded`, `collection_type` (backlog/watchLater).
- The API uses a `ModelViewSet` (`SeriesViewSet`) registered via `DefaultRouter` at `/api/series/`.
- A custom `@action search-tmdb` endpoint queries TMDB API using an API key from `TMDB_API_KEY` env var.
- Always check existing migrations before creating new ones. Run `python manage.py makemigrations` and `python manage.py migrate` after model changes.
- Use environment variables for secrets (TMDB_API_KEY, DATABASE_URL, etc.).
- Follow PEP8, keep views thin, use serializers for validation.

## Frontend Expert
Expert in React (Vite) for the watchLOG frontend.

**When to use**: React components, JSX, state management, CSS, forms, consuming the Django REST API.

**Instructions**:
- All frontend code is under `frontend/src/` — main component in `App.jsx`, styles in `App.css` and `index.css`, entry point in `main.jsx`.
- The app has two tabs: **Backlog** and **Watch Later**, controlled by `activeTab` state.
- Series are fetched from `http://127.0.0.1:8000/api/series/` and filtered by `collection_type`.
- TMDB search is done via `GET /api/series/search-tmdb/?q=<query>` — results are displayed in a dropdown.
- The form has conditional fields: status/grade/dateEnded only show on the Backlog tab.
- Cards display poster (from TMDB image CDN), title, description, grade, status badge, and date ended.
- Follow the existing CSS patterns in `App.css` (BEM-like class names, CSS variables for colors).
- Use plain `fetch` for API calls (no axios). Handle errors with `.catch()` and `console.error`.
- Keep the UI in Portuguese (labels, messages, placeholders).

## TMDB Integration
Expert in the The Movie Database (TMDB) API integration for watchLOG.

**When to use**: TMDB search, poster/image URLs, API key management, error handling, data mapping.

**Instructions**:
- The TMDB search is implemented in `backend/app/views.py` in the `search_tmdb` method of `SeriesViewSet`.
- API key is loaded from `TMDB_API_KEY` environment variable (defined in `backend/.env`).
- The search endpoint calls `https://api.themoviedb.org/3/search/tv` with `api_key`, `query`, and `language=pt-BR`.
- Each result is mapped to: `tmdb_id` (item.id), `title` (item.name), `description` (item.overview), `poster_path` (item.poster_path).
- Poster images are rendered on the frontend via `https://image.tmdb.org/t/p/w300{poster_path}`.
- Language is set to `pt-BR` for Portuguese results.
- Handle errors gracefully — return empty array for short queries, return error response for API failures.

## Testing
Expert in testing for watchLOG.

**When to use**: Writing Django tests (`tests.py`), frontend tests, test data factories, test coverage.

**Instructions**:
- Backend tests go in `backend/app/tests.py` — use Django TestCase and REST framework's APIClient.
- Test CRUD endpoints: `GET /api/series/`, `POST /api/series/`, `GET /api/series/<id>/`, `PUT /api/series/<id>/`, `DELETE /api/series/<id>/`.
- Test TMDB search endpoint (`/api/series/search-tmdb/?q=<query>`) with mocked requests.
- Test model validation (grade range, status choices, collection_type choices).
- Use `from unittest.mock import patch` to mock external TMDB API calls.
- No frontend testing framework detected yet — if adding one, prefer Vitest + React Testing Library.
- Run backend tests with: `python manage.py test` from the `backend/` directory.

## Database Migrations
Expert in Django database migrations for watchLOG.

**When to use**: Schema changes, new fields, data migrations, squashing migrations.

**Instructions**:
- Migration files are in `backend/app/migrations/`.
- After modifying `backend/app/models.py`, run `python manage.py makemigrations` to generate migration files, then `python manage.py migrate` to apply them.
- Always review auto-generated migration names — rename them to be descriptive if needed (e.g., `0002_series_dateended_series_grade_series_status.py`).
- For data migrations, create an empty migration with `python manage.py makemigrations app --empty` and write a custom `RunPython` function.
- The database is SQLite by default (`db.sqlite3` at `backend/db.sqlite3`). Keep this in mind for migration compatibility.
- Never delete migration files that have already been applied — create new migrations instead.
