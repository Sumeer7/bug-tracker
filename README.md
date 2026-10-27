# Pulse Track

Full-stack bug and issue tracker (Jira / ClickUp–style) with a **midnight orchid + amber** theme.

## Stack

| Layer | Tech |
|--------|------|
| API | Node, Express, SQLite, Zod |
| Web | React, Vite, Tailwind |
| Design | Layered LLD: domain → repositories → services → HTTP |

## Features

- **Issue types:** bug, task, story, epic  
- **Fields:** title, description, status, priority, severity, assignee, reporter, labels, story points, due date, environment, steps to reproduce  
- **Views:** Kanban board (drag & drop status), sortable list  
- **Comments** on each issue  
- **Filters:** search, status, assignee  

## Sign in

Demo accounts (password for all: **`welcome123`**):

- `ava@pulse.dev` (admin)
- `jordan@pulse.dev` (member)

New users: use **Create an account** on the login page (email + password). Unknown email on sign-in prompts you to register below.

After login: **Settings** → Profile, Password, Preferences; admins can **Team → Create user** with email + password.

## Run locally

```bash
npm install
npm run dev
```

- Web: http://localhost:5173  
- API: http://localhost:4000  

Production build serves the UI from the API:

```bash
npm run build
npm start
```

## Tests

```bash
npm test
```
