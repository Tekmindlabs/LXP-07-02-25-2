# LXP (Learning Experience Platform)

## Database Setup

### Prerequisites
- PostgreSQL installed and running
- Node.js and npm installed
- Environment variables configured (see `.env.example`)

### Database Management

#### Push Database Changes
To push database schema changes:
```bash
npm run db:push
```

#### Reset Database
To reset the database (warning: this will delete all data):
```bash
npm run db:reset
```

#### Generate Prisma Client
After schema changes, generate the Prisma client:
```bash
npm run prisma:generate
```

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Push database schema:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── lib/
│   ├── db/           # Database utilities
│   ├── context/      # API context generation
│   └── auth/         # Authentication utilities
├── server/
│   └── api/          # tRPC API routes
└── components/       # React components
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run db:push` - Push database changes
- `npm run db:reset` - Reset database
- `npm run prisma:generate` - Generate Prisma client