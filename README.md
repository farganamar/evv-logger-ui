# EVV Logger UI

A modern web application for managing electronic visit verification (EVV) appointments and caregiver activities.

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Context API for auth state
- **Routing**: React Router v6
- **Date/Time Handling**: Moment Timezone
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Maps**: React Leaflet for location tracking
- **Development**: Vite for fast builds and development

## Key Technical Decisions

1. **TypeScript**: Chosen for type safety and better developer experience
2. **Tailwind CSS**: Used for rapid UI development and consistent design system
3. **Context API**: Selected for simple global state management without Redux complexity
4. **Moment Timezone**: Implemented for reliable date/time handling across timezones
5. **React Leaflet**: Integrated for robust location tracking and mapping features

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/farganamar/evv-logger-ui.git
cd evv-logger-ui
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```
VITE_API_BASE_URL=your_api_url
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
```


5. **Build for production**
```bash
npm run build
# or
yarn build
```

## Docker Support

Build and run the application using Docker:

```bash
# Build the image
docker build -t evv-logger-ui .

# Run the container
docker run -p 8080:80 evv-logger-ui
```

Or use Docker Compose:

```bash
docker-compose up
```

use johndoe or janedoe as username while login

## Project Structure

```
evv-logger-ui/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/       # React Context providers
│   ├── layouts/       # Page layouts
│   ├── pages/         # Route components
│   ├── services/      # API services
│   ├── types/         # TypeScript definitions
│   └── utils/         # Helper functions
├── public/            # Static assets
└── ...config files
```

### Additional Features in the future
1. Tech stack
- implement refresh token

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
