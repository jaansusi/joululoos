# Secret Santa

Secret Santa is a web application built with NestJS that allows users to participate in a Secret Santa gift exchange.
This project uses a SQLite database and supports Docker for containerization.

## Table of Contents

- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/jaansusi/secretsanta.git
    cd secretsanta
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file based on the `.env.template` and fill in the required environment variables.

## Running the Application

### Using Docker

1. Build and run the Docker container:
    ```sh
    docker-compose up
    ```

2. The application will be available at `http://localhost`.

### Without Docker

1. Build the project:
    ```sh
    npm run install
    npm run build
    ```

2. Start the application:
    ```sh
    npm start
    ```

3. The application will be available at `http://localhost:3000`.

## Environment Variables

The following environment variables are required:

- `NODE_ENV`: The environment in which the application is running (e.g., `development`, `production`).
- `PORT`: The port on which the application will run (inside the container, if applicable).
- `HOST`: The host address, used for Google auth callback.
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret.
- `COOKIE_SECRET`: Secret key for signing cookies.
- `INPUT_FILE_PATH`: Path to the input JSON file with people.

## Scripts

    build: Builds the project.
    format: Formats the code using Prettier.
    start: Starts the application.
    start:dev: Starts the application in development mode with hot-reloading.
    start:debug: Starts the application in debug mode.
    start:prod: Starts the application in production mode (note: run build first).
    lint: Lints the code using ESLint.
    test: Runs the tests.
    test:watch: Runs the tests in watch mode.
    test:debug: Runs the tests in debug mode.
    test:e2e: Runs end-to-end tests.

## License
This project is licensed under the UNLICENSED License.
