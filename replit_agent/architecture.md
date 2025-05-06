# Architecture Overview

## Overview

FlatFinder is a full-stack real estate property listing application built with React and Express. It allows users to browse, search, and filter property listings, save favorites, message property owners, and manage their own listings (for owners). The application follows a modern client-server architecture with a dedicated frontend and backend.

## System Architecture

FlatFinder uses a classic client-server architecture with the following key components:

1. **Frontend**: React-based single-page application with TypeScript
2. **Backend**: Express.js REST API server with TypeScript
3. **Database**: PostgreSQL database (Neon Serverless) with Drizzle ORM
4. **Authentication**: Session-based authentication with Passport.js

The application is structured as a monorepo, with clear separation between client and server code:

```
/
├── client/           # Frontend React application
├── server/           # Backend Express application
├── db/               # Database configuration and migrations
├── shared/           # Shared types and schemas used by both client and server
```

## Key Components

### Frontend Architecture

The frontend is built with React and follows a modular component-based architecture:

- **State Management**: Uses React Query for server state and React Context for application state
- **Routing**: Uses Wouter for client-side routing
- **UI Components**: Uses Shadcn UI component library built on Radix UI primitives
- **Forms**: Uses React Hook Form with Zod validation
- **Styling**: Uses Tailwind CSS for styling

Key frontend modules:

1. **Pages**: React components representing the application pages
2. **Components**: Reusable UI components
3. **Hooks**: Custom React hooks for shared logic
4. **Lib**: Utility functions and services

### Backend Architecture

The backend is built with Express.js and follows a RESTful API architecture:

- **API Routes**: Organized by resource type
- **Authentication**: Uses Passport.js with session-based authentication
- **Database Access**: Uses Drizzle ORM for type-safe database access
- **Error Handling**: Centralized error handling middleware

Key backend modules:

1. **Routes**: API endpoint definitions
2. **Auth**: Authentication logic
3. **Storage**: Database access layer
4. **Vite Integration**: Server-side Vite setup for development

### Database Schema

The application uses a PostgreSQL database with the following core tables:

1. **users**: Stores user information including authentication data and profile details
2. **properties**: Stores property listings with details like location, price, features
3. **property_images**: Stores images associated with properties
4. **amenities**: Stores available property amenities
5. **property_amenities**: Many-to-many relationship between properties and amenities
6. **favorites**: Tracks user's favorite properties
7. **messages**: Stores conversations between users about properties

The schema is defined using Drizzle ORM and includes relationships between tables with foreign key constraints.

### Authentication

The application uses session-based authentication with:

1. **Passport.js**: For authentication strategy management
2. **Local Strategy**: Username/password authentication
3. **Express-session**: For session management
4. **connect-pg-simple**: For PostgreSQL session storage

User passwords are securely hashed using the Node.js crypto module with scrypt.

## Data Flow

### Property Listing Flow

1. Property data is stored in the PostgreSQL database
2. The Express backend provides RESTful API endpoints to access property data
3. The React frontend fetches property data using React Query
4. Users can filter and search properties using various criteria
5. Property details are displayed in dedicated property pages

### User Authentication Flow

1. Users register or log in through the authentication forms
2. Credentials are validated by the Passport.js middleware
3. Upon successful authentication, a session is created and stored in the database
4. The session ID is stored in a cookie on the client
5. Protected routes check for valid session before granting access

### Favoriting Flow

1. Authenticated users can mark properties as favorites
2. Favorite status is stored in the database in the favorites table
3. The frontend displays favorited properties in the user dashboard
4. Users can view all their favorites in a dedicated page

## External Dependencies

### Frontend Dependencies

- **@radix-ui**: UI primitives for building accessible components
- **@tanstack/react-query**: Data fetching and caching
- **wouter**: Lightweight routing library
- **shadcn/ui**: Component library built on Radix UI
- **class-variance-authority**: For component styling variants
- **react-hook-form**: Form handling
- **zod**: Schema validation

### Backend Dependencies

- **express**: Web server framework
- **passport**: Authentication middleware
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: TypeScript ORM for database access
- **connect-pg-simple**: PostgreSQL session store
- **vite**: Development server and frontend build tool

## Deployment Strategy

The application is designed to be deployed on Replit, as evidenced by the presence of `.replit` configuration. It uses the following deployment approach:

1. **Build Process**: 
   - Frontend: Vite builds the React application into static assets
   - Backend: esbuild compiles the TypeScript server code

2. **Runtime Configuration**:
   - Environment variables for database connection and other sensitive information
   - Production mode configuration for the Express server

3. **Serving Strategy**:
   - Express serves both the API endpoints and the static frontend assets

4. **Database**:
   - Uses Neon Serverless PostgreSQL for database storage
   - Database migrations are managed with Drizzle Kit

The deployment is configured to start the server with `npm run start` after building with `npm run build`.

## Development Workflow

The development workflow is configured for a seamless experience:

1. **Dev Server**: Run both frontend and backend with a single command: `npm run dev`
2. **Database Migrations**: Apply schema changes with `npm run db:push`
3. **Database Seeding**: Populate initial data with `npm run db:seed`
4. **Type Checking**: Verify TypeScript types with `npm run check`

Hot module replacement is enabled for the frontend through Vite, allowing for rapid development iterations.