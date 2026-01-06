# Tech Context

## Technologies Used

### Core
-   **Node.js**: Runtime environment.
-   **NPM**: Package manager (Workspaces).

### Apps

#### pos-desktop
-   **Build Tool**: Vite.
-   **UI Framework**: React.
-   **Desktop Wrapper**: Electron.
-   **Styling**: TailwindCSS.
-   **Local DB**: SQLite (`better-sqlite3`).
-   **Real-time**: Socket.IO Client.
-   **Routing**: React Router.

#### cloud-server
-   **Framework**: NestJS.
-   **ORM**: TypeORM.
-   **Database**: PostgreSQL.
-   **Testing**: Jest.

#### cloud-admin
-   **Build Tool**: Vite (implied from `dev:cloud-admin` script pattern).
-   **UI Framework**: React (implied).

## Development Setup
-   Run `npm install` in the root to install dependencies for all workspaces.
-   Use `npm run dev:pos` to start the desktop app in dev mode.
-   Use `npm run dev:server` to start the backend server.

## Technical Constraints
-   **Windows**: The user is on Windows, so building for Windows (`dist:win`) is a primary target.
-   **Node Version**: Should be compatible with the versions specified in `package.json` engines (if any) or current LTS.
