I'll create a comprehensive guide for running the RBAC project based on the provided repository files.

# RBAC Project Setup Guide

## Prerequisites
- Node.js/Bun installed
- PostgreSQL database
- Git

## Initial Setup

1. **Clone the Repository**
```bash
git clone https://github.com/tekmindlabs/lxp-rbac.git
cd lxp-rbac
```

2. **Install Dependencies**
```bash
# Using bun (recommended)
bun install

# Using npm
npm install
```

3. **Environment Setup**
```bash
# Copy example environment file
cp .env.example .env.local

# Configure your .env.local with these required variables:
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
```

## Database Setup

1. **Generate Prisma Client**
```bash
# Using bun
bun prisma:generate

# Using npm
npm run prisma:generate
```

2. **Push Database Schema**
```bash
# Using bun
bun prisma:push

# Using npm
npm run prisma:push
```

3. **Seed Database** (for initial data)
```bash
# Using bun
bun db:seed

# Using npm
npm run db:seed
```

## Development Commands

1. **Start Development Server**
```bash
# Using bun
bun dev

# Using npm
npm run dev
```
- Server will start at `http://localhost:3000`

2. **Type Checking**
```bash
# Using bun
bun type-check

# Using npm
npm run type-check
```

3. **Linting**
```bash
# Using bun
bun lint

# Using npm
npm run lint
```

4. **Running Tests**
```bash
# Using bun
bun test

# Using npm
npm run test
```

## Production Commands

1. **Build Application**
```bash
# Using bun
bun run build

# Using npm
npm run build
```

2. **Start Production Server**
```bash
# Using bun
bun start

# Using npm
npm run start
```

## Database Management Tips

1. **View Database Schema**
- Check `prisma/schema.prisma` for the complete data model

2. **Reset Database**
```bash
# Drop and recreate database
bun prisma db push --force-reset
```

3. **View Database in Prisma Studio**
```bash
npx prisma studio
```

## Project Structure
```
/
├── src/
│   ├── components/     # UI components
│   ├── features/       # Feature modules
│   ├── pages/         # Route pages
│   └── api/           # API routes
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Seed data
├── package.json       # Project dependencies
└── README.md         # Project documentation
```

## Troubleshooting

1. **Database Connection Issues**
- Verify DATABASE_URL in .env.local
- Ensure PostgreSQL is running
- Check database credentials

2. **Build Errors**
- Run `bun type-check` to find type errors
- Clear `.next` folder and node_modules
- Reinstall dependencies

3. **Prisma Issues**
```bash
# Reset Prisma
bun prisma generate --force
```

## Additional Notes

- The project uses tRPC for API routes
- Authentication is handled through NextAuth.js
- RBAC (Role-Based Access Control) is implemented at the core
- Make sure to run type checks before commits
- Follow the existing code style and patterns

Remember to check the project's README.md for any specific updates or additional instructions that might have been added to the project.