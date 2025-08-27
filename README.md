# PingUp

PingUp is a project designed to provide real-time chat services. The project is organized into separate client and server directories.

## Project Structure

```
PingUp/
├── client/                # Frontend application (details TBD)
└── server/                # Backend services
   ├── chat/              # Chat service (real-time messaging)
   ├── mail/              # (Reserved for future use)
   └── user/              # User-related endpoints (not a full user management system)
        ├── package.json
        ├── pnpm-lock.yaml
        ├── tsconfig.json
        └── src/
            ├── index.ts
            ├── config/
            │   ├── dbConnect.ts
            │   └── redisConnect.ts
            ├── controllers/
            ├── model/
            │   └── User.ts
            └── routes/
                └── user.ts
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (preferred package manager)
- Redis (for caching/session management)
- MongoDB or another database (for data storage)

### Installation

1. **Clone the repository:**

   ```sh
   git clone <repo-url>
   cd PingUp
   ```

2. **Install dependencies for the server user service:**

   ```sh
   cd server/user
   pnpm install
   ```

3. **Set up environment variables:**

   - Create a `.env` file in `server/user` and add your configuration (DB connection, Redis URL, etc).

4. **Run the user service:**
   ```sh
   pnpm start
   # or
   pnpm dev
   ```

## Features

- Real-time chat service (under `server/chat`)
- Basic user-related endpoints (not a full user management system)
- Redis integration for caching/session

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
