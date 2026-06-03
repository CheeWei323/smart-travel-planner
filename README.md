# Smart Travel Planner

A full-stack travel planner application featuring a Node.js backend and a React frontend. This project includes user authentication with JWT, protected API routes, and integration with MongoDB for data management.

## Features

-   **User Authentication:** Secure user registration and login functionality.
-   **JWT-Based Security:** Implements JSON Web Tokens (JWT) for authenticating API requests and securing routes.
-   **RESTful API:** A well-structured backend API built with Express.js for managing users and travel data.
-   **Database Integration:** Utilizes MongoDB Atlas for data storage, with Mongoose for object data modeling.
-   **Modern Frontend:** A responsive user interface built with React and Vite for a fast development experience.

## Tech Stack

**Frontend:**
- React
- Vite
- React Router
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB Atlas & Mongoose
- JSON Web Token (JWT)
- bcryptjs
- Helmet
- CORS

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- Node.js and npm (or a compatible package manager) installed on your system.
- A MongoDB Atlas account and a connection string (URI).

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/cheewei323/smart-travel-planner.git
    cd smart-travel-planner
    ```

2.  **Backend Setup:**
    - Navigate to the backend directory:
      ```sh
      cd backend
      ```
    - Install dependencies:
      ```sh
      npm install
      ```
    - Create a `.env` file in the `backend` directory and add the following environment variables:
      ```env
      MONGO_URI=<YOUR_MONGODB_CONNECTION_STRING>
      JWT_SECRET=<YOUR_CHOSEN_JWT_SECRET>
      PORT=5000
      ```
    - Start the backend development server:
      ```sh
      npm run dev
      ```
      The server will be running on `http://localhost:5000`.

3.  **Frontend Setup:**
    - Open a new terminal and navigate to the frontend directory:
      ```sh
      cd frontend
      ```
    - Install dependencies:
      ```sh
      npm install
      ```
    - Start the frontend development server:
      ```sh
      npm run dev
      ```
      The application will open in your browser, typically at `http://localhost:5173`.

## API Endpoints

The following are the primary API endpoints available.

### Authentication

-   `POST /api/auth/register`
    -   Registers a new user.
    -   **Request Body:**
        ```json
        {
          "username": "testuser",
          "email": "test@example.com",
          "password": "yourpassword"
        }
        ```

-   `POST /api/auth/login`
    -   Logs in a user and returns a JWT token.
    -   **Request Body:**
        ```json
        {
          "email": "test@example.com",
          "password": "yourpassword"
        }
        ```

### Protected Routes
-   `GET /api/test/protected`
    -   An example of a protected route. Requires a valid JWT to be included in the request header.
    -   **Authorization Header:** `Bearer <YOUR_JWT_TOKEN>`