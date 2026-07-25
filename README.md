# Blog Site

A full-stack bloggin platform where people can write, publish and discover posts - with likes, bookmarks, threaded comments, notifications and an admin moderation panel built in.

## What it does

### Accounts & Auth
- Email/username + password login, plus instant **guest login** for anyone who wants to try the app without signing up
- Email verification through a 6-digit OTP
- Full **forgot password** flow: find your account by email → verify OTP → reset password, with a masked shown at each step so users know where the code is going
- Profile editing (name, username) and avatar uploads

### Writing & Publishing
- Create posts as **draft** or publish them right away, with title, excerpt, tag, cover image, and rich text content
- Edit or delete your own posts at any time
- A personal "My Posts" dashboard with stats (total posts, published vs drafts, total views/likes/comments)

### Discovery & Feed
- Paginated home feed, filterable by tag
- **Trending posts**, ranked by a weighted score of likes, comments and views over a chosen time window (today, this week, this month, etc...)
- Public profile pages so anyone can check out a writer's published work
- View counts that only increment once per user (os per IP for guests), not on every page refresh

### Engagement
- Like/unlike posts and comments
- Bookmarks posts to read later
- **Threaded comments** - reply to a comment and it nests under the parent, sortable by newest or oldest
- **@mentions** in posts and comments that automatically notify the person mentioned
- A notifications center with unread counts and mark-as-read

## Moderation & Admin
- Users can report a post (spam, harassment, hate speech, etc...) with an optimal description
- Admins get a reports queue they can review, dismiss or act on by deleting the post
- A full **user management panel**: search/filter users by status or role, suspend, ban, unban or soft-delete accounts - with guardrails so an admin can't touch their own account or another admin

## Other nice touches
- Rate limiting on sensitive actions (login, registeration, OTP requests, password resets, post creation) to stop abuse
- Caching on hot endpoints like post feed and profiles, invalidated automatically when the underlying data changes

## Under the hood

**Backend** - Go with Gin framework, MySQL for storage and Redis for rate limiting and caching. Auth is handled with JWTs stored in an HTTP-only cookie. Emails (OTPs, notifications) go out through SMTP via gomail.

**Frontend** - React with React Router, styled with Tailwind CSS. State is kept simple with hooks - no heavier state library - and the UI leans on small, focused components (toasts, skeleton loaders, modals) for snappy feel.

**Structure** - the backend is split into `handlers` (route logic), `middleware` (auth, rate limiting, CORS), `models`, `config` (DB/Redis setup) and `utils`. The frontend mirrors that separation with `pages`, `components` and an `api` layer for all backend calls.

## Deployment

The application is deployed on a Linux VM using Docker and Nginx.

### Infrastructure

- **Virtual Machine (VM)** - Hosts the application containers and services
- **Docker & Docker Compose** - Used for containerizing and managing backend, frontend, database and supporting services
- **Nginx** - Used as a reverse proxy and static file server

### Deployement Process

1. Application code is pushed to the server
2. Docker images are built using Docker Compose.
3. Containers are started and managed through Docker Compose.
4. Nginx is onfigured as reverse proxy.
    - Serves the React frontend
    - Routes API requests to the Go Backend
    - Handles HTTPS traffic
5. Environment variables are used for database credentials, JWT secrets, SMTP configuration and other sensitive settings.

### Producation Setup

- Frontend runs inside an Nginx Docker container.
- Backend runs as a Go Gin application inside a Docker container.
- MySQL and Redis run as seperate containers.
- Nginx handles domain routing and forwards API requests to the backend service.
- Docker volumes are used for persistent database storage.

This setup provides an isolated, scalable and reproducible deployement environment.

---

*Built as a learning project to get hands-on with a real auth flow, moderation tooling and a threaded comment system - not just CRUD.