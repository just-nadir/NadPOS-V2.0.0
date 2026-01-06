# System Patterns

## Architecture
The project follows a Monorepo structure using NPM version 7+ workspaces.

```mermaid
graph TD
    Root[Monorepo Root] --> Apps[apps/]
    Apps --> POS[pos-desktop (Electron/React)]
    Apps --> Server[cloud-server (NestJS/Postgres)]
    Apps --> Admin[cloud-admin (React)]
    
    POS <-->|API/Socket| Server
    Admin <-->|API| Server
```

## detailed Design

### POS Desktop (`apps/pos-desktop`)
-   **Framework**: Electron with Vite and React.
-   **State Management**: Likely uses React Context or Redux (to be verified).
-   **Local Database**: Uses `better-sqlite3` for offline data storage.
-   **Communication**: `socket.io-client` for real-time updates and `axios` for HTTP requests.

### Cloud Server (`apps/cloud-server`)
-   **Framework**: NestJS.
-   **Database**: PostgreSQL with TypeORM.
-   **API**: RESTful API structure standard to NestJS.

## Key Technical Decisions
-   **Monorepo**: Centralizes code and dependency management.
-   **Electron**: Ensures cross-platform desktop compatibility and access to system resources (printers, scanners).
-   **NestJS**: Provides a structured, scalable backend architecture.
-   **Offline-First**: The desktop app uses SQLite to ensure operations continue without internet.
