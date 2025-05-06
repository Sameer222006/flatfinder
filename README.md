# FlatFinder - Property Rental Marketplace

FlatFinder is a full-stack web application that connects property owners with potential tenants. It provides a modern, responsive interface for searching, viewing, and managing property listings.

## Screenshots

### Homepage
![FlatFinder Homepage](screenshots/homepage.png)

### Property Search
![Property Search Page](screenshots/search.png)

### Authentication
![Authentication Page](screenshots/auth.png)

## Features

- **Property Listings:** Browse and search for apartments, houses, and other rental properties
- **Advanced Search:** Filter by location, price range, property type, bedrooms, and amenities
- **User Authentication:** Register and login as a tenant or property owner
- **Property Management:** Property owners can add, edit, and remove their listings
- **Messaging System:** Built-in communication between tenants and owners
- **Favorites:** Save properties for later viewing
- **Responsive Design:** Mobile-friendly interface that works on all devices
- **Interactive Maps:** Visualize property locations with an interactive map interface

## Tech Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching
- Wouter for client-side routing
- Shadcn UI + Tailwind CSS for styling
- React Hook Form for form management
- Zod for validation

### Backend
- Express.js
- PostgreSQL database
- Drizzle ORM for database operations
- Passport.js for authentication
- Session-based authentication with secure password hashing

## Project Structure

```
flatfinder/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and services
│   │   └── pages/        # Page components
├── db/                   # Database configuration and migrations
├── server/               # Backend Express application
│   ├── auth.ts           # Authentication logic
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Database access layer
│   └── index.ts          # Server entry point
└── shared/               # Shared types and schemas
    └── schema.ts         # Database schema definitions
```

## Installation and Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/flatfinder.git
   cd flatfinder
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/flatfinder
   ```

4. Push the database schema
   ```bash
   npm run db:push
   ```

5. Seed the database (optional)
   ```bash
   npm run db:seed
   ```

### Running the application

1. Start the development server
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Usage

### For Tenants
- Browse property listings on the homepage
- Use filters to narrow down your search
- Create an account to save favorite properties and message property owners
- View your saved properties and conversations in your dashboard

### For Property Owners
- Register as a property owner
- Add your properties with detailed information and images
- Manage your listings through the owner dashboard
- Respond to inquiries from potential tenants

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Property images from Unsplash
- Icons from Lucide React
- Map integration with Google Maps API