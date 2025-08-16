# AI Meeting Summarizer

This is a full-stack web application that uses AI to summarize meeting transcripts. Users can upload a text file, choose from various AI models (Groq, OpenAI, Gemini) to generate a summary, edit the result, and share it via email.

## Features

-   **File Upload**: Upload `.txt` files or paste text directly.
-   **Multi-API Support**: Choose between Groq, OpenAI (GPT-4o), and Gemini for summarization.
-   **Customizable Summaries**: Specify summary length and add custom instructions.
-   **Rich Text Editor**: Format the summary with bold, italic, and underline options.
-   **Gemini-Powered Actions**: Automatically suggest action items or draft a follow-up email from the summary.
-   **Email Sharing**: Send the final summary via email (uses Ethereal.email for testing).

## Project Structure


ai-summarizer-project/
├── index.html         # Frontend HTML
├── style.css          # Frontend CSS
├── script.js          # Frontend JavaScript (React)
└── backend/
├── server.js      # Backend server (Node.js/Express)
├── .env           # Secure API keys (ignored by Git)
└── package.json


## Setup and Installation

### Prerequisites

-   [Node.js](https://nodejs.org/) installed on your machine.
-   API keys for Groq, OpenAI, and/or Google Gemini.

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install the required packages:
    ```bash
    npm install
    3.  Create a `.env` file in the `backend` folder and add your API keys:
    ```
    GROQ_API_KEY="YOUR_GROQ_KEY"
    OPENAI_API_KEY="YOUR_OPENAI_KEY"
    GEMINI_API_KEY="YOUR_GEMINI_KEY"
    ```

### Running the Project

You need to run two processes in separate terminals.

1.  **Start the Backend Server**:
    * Navigate to the `backend` directory and run:
        ```bash
        node server.js
        ```
    * The server will be running at `http://localhost:3001`.
