# TaskFlow - REST API CI/CD Demo

A lightweight Node.js/Express REST API project equipped with a stylish frontend, Jest tests, ESLint, and a GitHub Actions CI workflow. This project is built as a complete reference codebase for studying CI/CD pipelines.

## Project Structure

```
├── .github
│   └── workflows
│       └── ci.yml      # CI workflow configuration running on push/pull requests
├── src
│   ├── app.js          # Express app definition & middleware setup
│   ├── server.js       # Entry point starting the server on a port
│   ├── public          # Static Frontend Assets
│   │   ├── index.html  # Dashboard UI structure (Outfit Google Font)
│   │   ├── style.css   # Glassmorphic, modern responsive styling
│   │   └── app.js      # Frontend JS client (async fetch handler)
│   └── routes
│       └── tasks.js    # Task management endpoints & in-memory database
├── tests
│   └── tasks.test.js   # Jest & Supertest integration tests
├── .eslintrc.json      # Linting configuration rules
├── .gitignore          # File exclusion configuration
├── package.json        # Project metadata, scripts, and dependencies
└── README.md           # Documentation
```

## Features

- **Express Server**: High-performance HTTP server serving REST API endpoints.
- **REST Endpoints**:
  - `GET /tasks` - Fetch all tasks from in-memory array database.
  - `POST /tasks` - Create a task (validated `title` parameter required).
  - `DELETE /tasks/:id` - Deletes a task by ID.
- **Modern UI**: Dark mode dashboard built with modern glassmorphism design system, Outfit typography, smooth CSS transitions, toast notifications, responsive card layouts, and live task counters.
- **Robust Testing Suite**: 8 Jest integration tests covering valid operations, input validations, deletion edge cases, and fallback API routing.
- **ESLint**: Standard JS code-quality check rules configuration.

## Getting Started Locally

Follow these steps to run the project on your machine:

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (version 18 or above recommended).

### Installation

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Start the Express server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

### Running Checks

- **Linting**: Run the code quality checks:
  ```bash
  npm run lint
  ```

- **Testing**: Run the automated test suite:
  ```bash
  npm run test
  ```

---

## How the CI Pipeline Works

The GitHub Actions configuration is stored in [.github/workflows/ci.yml](file:///.github/workflows/ci.yml). 

### Trigger Conditions
The workflow executes automatically on:
- Any `push` to the `main` branch.
- Any `pull_request` targeting the `main` branch.

### Pipeline Stages
When triggered, a virtual Ubuntu container spawns and executes the following steps:
1. **Checkout Code**: Copies the repository code into the runner container.
2. **Setup Node.js Environment**: Sets up Node.js versions `18.x` and `20.x` (configured in a matrix to check multiple engine targets).
3. **Install Dependencies**: Executes `npm ci` (clean install) for quick, repeatable, and locked package versions.
4. **Run Linter**: Executes `npm run lint` to enforce style guide compliance and ensure zero syntax/quality warnings.
5. **Run Tests**: Executes `npm run test` using Jest. If any test fails, the pipeline exits with a non-zero code, marking the build status as failed.
