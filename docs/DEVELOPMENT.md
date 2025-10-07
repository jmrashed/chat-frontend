# Development Guide

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── chat/           # Chat pages
│   ├── login/          # Authentication pages
│   └── globals.css     # Global styles
├── components/         # Reusable components
│   ├── ui/            # UI components (shadcn/ui)
│   └── wrapper/       # Layout wrappers
├── features/          # Feature-specific components
├── lib/               # Utility functions
├── types/             # TypeScript type definitions
└── middleware.ts      # Next.js middleware
```

## Development Workflow

1. **Setup Environment**
   ```bash
   cp .env.example .env.local
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm test              # Run once
   npm run test:watch    # Watch mode
   npm run test:coverage # With coverage
   ```

4. **Linting and Formatting**
   ```bash
   npm run lint          # Check for issues
   npm run lint:fix      # Auto-fix issues
   ```

## Code Style Guidelines

- Use TypeScript for all new files
- Follow the existing component structure
- Use Tailwind CSS for styling
- Implement proper error handling
- Write tests for new features
- Use meaningful commit messages

## Component Guidelines

### Creating New Components

1. Use functional components with hooks
2. Define proper TypeScript interfaces
3. Include JSDoc comments for complex logic
4. Export components as default

```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

/**
 * Reusable button component
 */
export default function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}`}
    >
      {children}
    </button>
  )
}
```

## Testing Guidelines

- Write unit tests for utility functions
- Write integration tests for components
- Mock external dependencies
- Aim for >80% code coverage

## Deployment

The application is configured for deployment on Vercel, but can be deployed anywhere that supports Next.js applications.