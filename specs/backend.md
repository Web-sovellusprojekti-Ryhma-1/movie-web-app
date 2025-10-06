## Movie App Backend – Frontend Integration Spec

### Overview
- Base URL (local dev): `http://localhost:<PORT>/api`, where `<PORT>` comes from .env (see index.js).
- JSON-only REST API, CORS enabled.
- Shared response helper `responseHandler.handleResponse` wraps most success payloads; errors flow through `errorHandler`.

### Environment & Auth
- Required env vars: `PORT`, `JWT_SECRET_KEY`, TMDB + DB credentials (see .env.example).
- Auth tokens: JWT Bearer tokens issued by `userController.signInUser`. Include header `Authorization: Bearer <token>` for protected routes (`auth` middleware in `authorization.auth`).
- Authenticated requests expect `req.user.id`, `req.user.email`, `req.user.username`.

### Response Shapes
Most endpoints return:
````json
{
  "status": 200,
  "message": "Human-readable string",
  "data": { /* endpoint-specific payload */ }
}
````
Errors:
````json
{
  "success": false,
  "error": {
    "message": "Problem description",
    "status": 4xx|5xx
  }
}
````

### Users (`/api/user`, `userRouter`)
| Method & Path | Auth | Body | Response `data` |
| --- | --- | --- | --- |
| `POST /signup` | No | ````json { "user": { "username": "...", "email": "...", "password": "..." } } ```` | Created user `{ id, username, email }`. |
| `POST /signin` | No | ````json { "user": { "email": "...", "password": "..." } } ```` | `{ id, username, email, token }`. Store `token` for future calls. |
| `GET /:id` | No | – | `{ id, username, email }`. |
| `DELETE /deletecurrentuser` | Yes | – | Deleted user summary. |

### Favorites (`/api/favorite`, [`favoriteRouter`](Routes/favoriteRouter.js))
| Method & Path | Auth | Body/Params | Response `data` |
| --- | --- | --- | --- |
| `GET /user/:id` | No | – | Raw `rows` array from `favorites` table. |
| `POST /` | Yes | ````json { "tmdb_id": 123 } ```` | Insert result `rows`. |
| `DELETE /:id` | Yes | `:id` = TMDB movie ID | Deleted row `rows`. |

### Reviews (`/api/review`, [`reviewRouter`](Routes/reviewRouter.js))
| Method & Path | Auth | Body/Params | Response `data` |
| --- | --- | --- | --- |
| `GET /user/:id` | No | – | `{ rows: [...] }` of reviews by user. |
| `GET /movie/:id` | No | – | `{ rows: [...] }` of reviews for TMDB movie. |
| `POST /` | Yes | ````json { "review": { "title": "...", "body": "...", "rating": 1-5, "tmdb_id": 123 } } ```` | Newly created review row. |
| `DELETE /:id` | Yes | `:id` = TMDB movie ID | Deleted review row. |

### Groups (`/api/group`, [`groupRouter`](Routes/groupRouter.js))
| Method & Path | Auth | Body/Params | Response `data` |
| --- | --- | --- | --- |
| `GET /:id` | Yes | – | Group `{ id, group_name, owner_id }`. |
| `POST /` | Yes | ````json { "group_name": "..." } ```` | Created group; user auto-added as accepted member. |
| `DELETE /:id` | Yes | – | Message only. |

#### Group Members
| Endpoint | Notes |
| --- | --- |
| `GET /:group_id/members` (auth) → accepted member IDs array. |
| `GET /user/:user_id/groups` (auth) → accepted groups for user. |
| `PUT /:group_id/members` (auth) → current user acceptance flip to `true`. |
| `POST /members` (auth) – body ````json { "member": { "group_id": 1, "user_id": 42 } } ```` creates pending member. |
| `DELETE /:group_id/members/:user_id` (auth) removes membership. |

#### Group Showtimes
| Endpoint | Notes |
| --- | --- |
| `GET /:group_id/showtime` (auth) → ordered list of showtimes. |
| `POST /:group_id/showtime` (auth) body ````json { "showtime": { "finnkino_db_id": "...", "area_id": "...", "dateofshow": "YYYY-MM-DD" } } ````. |
| `DELETE /:group_id/showtime/:showtime_id` (auth) removes entry. |

### TMDB Proxy (`/api/tmdb`, [`tmdbapi`](apis/tmdbapi.js))
- `GET /search?query=...&page=...`
- `GET /movie/:id` – appends `credits`, `videos`; response augmented with `genres`, `allGenres`.
- `GET /genres`
- `GET /popular`
  Requires `TMDB_BEARER`.

### Finnkino Proxy (`/api/finnkino`, [`finnkinoapi`](apis/finnkinoapi.js))
- `GET /theatre-areas`
- `GET /movies?areaId=...`
- `GET /showtimes?areaId=...&date=YYYY-MM-DD`
  Uses headless Chromium via [`finnkinoClient`](Helpers/finnkinoClient.js); expect slower responses (2s delay).

### Finnkino ↔ TMDB Matching (`/api/match`, [`matchRouter`](Routes/matchRouter.js))
| Endpoint | Body | Response |
| --- | --- | --- |
| `GET /finnkino/:eventId` | – | `{ finnkinoEventId, finnkinoEvent, match, candidates }`. |
| `POST /finnkino` | ````json { "event": { "Title": "...", "OriginalTitle": "...", "dtLocalRelease": "...", "LengthInMinutes": ... } } ```` | Same shape. |

Matching logic described in [`movieMatcher`](Helpers/movieMatcher.js). Key fields:
- `match`: best candidate when `score ≥ 0.55`; includes `tmdbId`, titles, release date, runtime, `componentScores`, and raw TMDB payload.
- `candidates`: sorted array for fallback UI.

### Database Contract
Schema documented in [db.sql](db.sql). Frontend mainly interacts through API; notable fields:
- `favorites`: `(user_id, tmdb_id)`
- `reviews`: includes `rating`, `reviewed_at`
- `group_showtimes`: `dateOfShow` stored as `DATE` (format `YYYY-MM-DD` when sending/receiving).

### Frontend Integration Tips
- Always read `.data` from responses; raw `rows` imply direct PG row objects.
- Handle neutral scores (`0.5`) in matcher when data missing.
- On auth failure, API returns 401 with `ApiError` message.

This spec aligns with implementation across [`Controllers`](Controllers) and [`Routes`](Routes) modules for consistent frontend wiring.{ "user": { "username": "...", "email": "...", "password": "..." } } ```` | Created user `{ id, username, email }`. |
| `POST /signin` | No | ````json { "user": { "email": "...", "password": "..." } } ```` | `{ id, username, email, token }`. Store `token` for future calls. |
| `GET /:id` | No | – | `{ id, username, email }`. |
| `DELETE /deletecurrentuser` | Yes | – | Deleted user summary. |

### Favorites (`/api/favorite`, [`favoriteRouter`](Routes/favoriteRouter.js))
| Method & Path | Auth | Body/Params | Response `data` |
| --- | --- | --- | --- |
| `GET /user/:id` | No | – | Raw `rows` array from `favorites` table. |
| `POST /` | Yes | ````json { "tmdb_id": 123 } ```` | Insert result `rows`. |
| `DELETE /:id` | Yes | `:id` = TMDB movie ID | Deleted row `rows`. |

### Reviews (`/api/review`, [`reviewRouter`](Routes/reviewRouter.js))
| Method & Path | Auth | Body/Params | Response `data` |
| --- | --- | --- | --- |
| `GET /user/:id` | No | – | `{ rows: [...] }` of reviews by user. |
| `GET /movie/:id` | No | – | `{ rows: [...] }` of reviews for TMDB movie. |
| `POST /` | Yes | ````json { "review": { "title": "...", "body": "...", "rating": 1-5, "tmdb_id": 123 } } ```` | Newly created review row. |
| `DELETE /:id` | Yes | `:id` = TMDB movie ID | Deleted review row. |

### Groups (`/api/group`, [`groupRouter`](Routes/groupRouter.js))
| Method & Path | Auth | Body/Params | Response `data` |
| --- | --- | --- | --- |
| `GET /:id` | Yes | – | Group `{ id, group_name, owner_id }`. |
| `POST /` | Yes | ````json { "group_name": "..." } ```` | Created group; user auto-added as accepted member. |
| `DELETE /:id` | Yes | – | Message only. |

#### Group Members
| Endpoint | Notes |
| --- | --- |
| `GET /:group_id/members` (auth) → accepted member IDs array. |
| `GET /user/:user_id/groups` (auth) → accepted groups for user. |
| `PUT /:group_id/members` (auth) → current user acceptance flip to `true`. |
| `POST /members` (auth) – body ````json { "member": { "group_id": 1, "user_id": 42 } } ```` creates pending member. |
| `DELETE /:group_id/members/:user_id` (auth) removes membership. |

#### Group Showtimes
| Endpoint | Notes |
| --- | --- |
| `GET /:group_id/showtime` (auth) → ordered list of showtimes. |
| `POST /:group_id/showtime` (auth) body ````json { "showtime": { "finnkino_db_id": "...", "area_id": "...", "dateofshow": "YYYY-MM-DD" } } ````. |
| `DELETE /:group_id/showtime/:showtime_id` (auth) removes entry. |

### TMDB Proxy (`/api/tmdb`, [`tmdbapi`](apis/tmdbapi.js))
- `GET /search?query=...&page=...`
- `GET /movie/:id` – appends `credits`, `videos`; response augmented with `genres`, `allGenres`.
- `GET /genres`
- `GET /popular`
  Requires `TMDB_BEARER`.

### Finnkino Proxy (`/api/finnkino`, [`finnkinoapi`](apis/finnkinoapi.js))
- `GET /theatre-areas`
- `GET /movies?areaId=...`
- `GET /showtimes?areaId=...&date=YYYY-MM-DD`
  Uses headless Chromium via [`finnkinoClient`](Helpers/finnkinoClient.js); expect slower responses (2s delay).

### Finnkino ↔ TMDB Matching (`/api/match`, [`matchRouter`](Routes/matchRouter.js))
| Endpoint | Body | Response |
| --- | --- | --- |
| `GET /finnkino/:eventId` | – | `{ finnkinoEventId, finnkinoEvent, match, candidates }`. |
| `POST /finnkino` | ````json { "event": { "Title": "...", "OriginalTitle": "...", "dtLocalRelease": "...", "LengthInMinutes": ... } } ```` | Same shape. |

Matching logic described in [`movieMatcher`](Helpers/movieMatcher.js). Key fields:
- `match`: best candidate when `score ≥ 0.55`; includes `tmdbId`, titles, release date, runtime, `componentScores`, and raw TMDB payload.
- `candidates`: sorted array for fallback UI.

### Database Contract
Schema documented in [db.sql](db.sql). Frontend mainly interacts through API; notable fields:
- `favorites`: `(user_id, tmdb_id)`
- `reviews`: includes `rating`, `reviewed_at`
- `group_showtimes`: `dateOfShow` stored as `DATE` (format `YYYY-MM-DD` when sending/receiving).

### Frontend Integration Tips
- Always read `.data` from responses; raw `rows` imply direct PG row objects.
- Handle neutral scores (`0.5`) in matcher when data missing.
- On auth failure, API returns 401 with `ApiError` message.

This spec aligns with implementation across [`Controllers`](Controllers) and [`Routes`](Routes) modules for consistent frontend wiring.
