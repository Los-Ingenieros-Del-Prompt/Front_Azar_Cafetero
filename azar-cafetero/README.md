# Azar Cafetero - Frontend

Welcome to the frontend repository for **Azar Cafetero**, a modern multiplayer web game platform featuring classic games like *Brisca* and *Parqués*. This application provides a premium user experience powered by the "Noche en el Valle" design system, real-time multiplayer synchronization via WebSockets, and seamless authentication.

## 🚀 Technology Stack

This project is built using a modern, robust, and highly reactive web stack designed to handle the complexities of real-time multiplayer gaming:

### Core Framework & UI
- **[Next.js 16](https://nextjs.org/)**: Utilizing the App Router for optimal routing, API integrations, and leveraging React Server Components for enhanced performance and SEO.
- **[React 19](https://react.dev/)**: Taking advantage of the latest React features and hooks to manage complex client-side game states, player HUDs, and interactive game boards.
- **[TypeScript](https://www.typescriptlang.org/)**: Enforcing strict end-to-end type safety across the application, ensuring reliable refactoring and clear data models for complex game states and API payloads.

### Styling & Design System
- **[Tailwind CSS v4](https://tailwindcss.com/) & PostCSS**: A utility-first CSS framework used for rapid, responsive UI development. It is deeply integrated with our custom design tokens to maintain visual consistency.
- **Vanilla CSS Modules**: Used alongside Tailwind for complex, highly specific micro-animations (e.g., card dealing, dice rolling, piece movements) that require fine-grained control.
- **[Lucide React](https://lucide.dev/)**: Provides clean, scalable, and consistent SVG iconography across the entire user interface.

### Real-time Communication & Multiplayer
- **[STOMP.js](https://stomp-js.github.io/) (`@stomp/stompjs`) & [SockJS](https://github.com/sockjs/sockjs-client)**: The backbone of our multiplayer experience. These libraries establish persistent, low-latency bidirectional WebSocket connections with our backend gateway. They handle live game state synchronization, player matchmaking, bot integrations, and real-time lobby updates.

### Authentication & Security
- **[Google OAuth](https://developers.google.com/identity/gsi/web/guides/overview) (`@react-oauth/google`)**: Delivers a seamless and secure single sign-on (SSO) experience, allowing players to quickly log in, access their player profiles, and track their in-game balances.

### Testing & Quality Assurance
- **[Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)**: A comprehensive testing infrastructure configured with Babel and JSDOM to ensure that complex UI components and critical game logic remain bug-free and behave as expected under various scenarios.
- **ESLint**: Enforces strict code quality rules and best practices across the codebase.

## 🎨 Design System: "Noche en el Valle"

The application uses a custom premium design system called **"Noche en el Valle"**. It emphasizes:
- Atmospheric backgrounds and sleek dark modes.
- Parchment-style modals and vibrant, tailored colors.
- Smooth gradients and micro-animations for an interactive feel.
- A highly polished, responsive user interface across all game lobbies and boards.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory.
2. Install dependencies:

```bash
npm install
```

### Development Server

Run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🧪 Testing

The project is configured with Jest and React Testing Library for robust component testing.

To run the test suite:

```bash
npm run test
```

## 📁 Project Structure Highlights

- `/app`: Next.js App Router pages and layouts (e.g., `/lobby`, `/`).
- `/components`: Reusable UI components.
  - `/components/games`: Game-specific logic and UI (Brisca tables, Parqués boards, Animated Pieces, Dice mechanics).
  - `/components/lobby`: Lobby interfaces, Waiting Rooms, and Player HUDs.
  - `/components/login`: Authentication UI and Google OAuth integration components.
- `/lib`: Utility functions, API handlers (e.g., `balanceApi.ts`), and centralized WebSocket/STOMP configurations.

## ⚙️ Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production deployment.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality.
- `npm run test`: Executes the Jest test suite.
