# Innovate UK Chatbot

A sophisticated AI-powered chatbot for the Innovate Uttarakhand website, built with React, Material-UI, FastAPI, and OpenAI integration. The chatbot uses PDF documents as a knowledge base to answer questions about innovation, technology, and education.

## Features

- 🤖 **AI-Powered Chat**: Uses OpenAI GPT for intelligent responses
- 📚 **PDF Knowledge Base**: Processes and indexes PDF documents using LlamaIndex
- 💾 **Persistent Storage**: Stores chat history in CosmosDB (MongoDB)
- 🎨 **Modern UI**: Beautiful React interface with Material-UI components
- 🔄 **Real-time Chat**: Instant responses with loading indicators
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔍 **Vector Search**: Semantic search through PDF content

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **Vite** for build tooling
- **Axios** for API calls
- **React Markdown** for message rendering

### Backend
- **FastAPI** for REST API
- **OpenAI API** for AI responses
- **LlamaIndex** for document processing and vector search
- **MongoDB/CosmosDB** for data storage
- **PyPDF2** for PDF text extraction
- **Motor** for async MongoDB operations

## Project Structure

```
innovate_uk/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── pdf_processor.py        # PDF processing utilities
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Chatbot.tsx     # Main chatbot component
│   │   ├── services/
│   │   │   └── api.ts          # API service layer
│   │   ├── App.tsx             # Main app component
│   │   ├── main.tsx            # App entry point
│   │   └── index.css           # Global styles
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.ts          # Vite configuration
│   └── .env                    # Frontend environment variables
├── pdfs.zip                    # PDF documents (extracted from website)
└── README.md                   # This file
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB/CosmosDB access
- OpenAI API key

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   The `.env` file is already configured with your credentials:
   - OpenAI API key
   - CosmosDB connection string
   - Database configuration

5. **Extract PDFs:**
   ```bash
   # Extract the PDFs.zip to a pdfs folder in the project root
   unzip ../pdfs.zip -d ../pdfs
   ```

6. **Start the backend server:**
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Chat Endpoints
- `POST /chat` - Send a message to the chatbot
- `GET /chat/history/{session_id}` - Get chat history for a session

### Utility Endpoints
- `POST /upload-pdf` - Upload and process a new PDF
- `GET /health` - Health check endpoint

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_api_key
COSMOSDB_CONNECTION_STRING=your_cosmosdb_connection_string
DATABASE_NAME=innovate_uk_chatbot
COLLECTION_NAME=chat_history
VECTOR_COLLECTION_NAME=pdf_vectors
```

### Frontend (.env)
```
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_API_BASE_URL=http://localhost:8000
```

## Usage

1. **Start both servers** (backend and frontend)
2. **Open the frontend** in your browser at `http://localhost:3000`
3. **Start chatting** with the AI assistant
4. **Ask questions** about innovation, technology, education, or any content from the PDF documents

## Features in Detail

### PDF Processing
- Automatically processes all PDFs in the `pdfs` folder on startup
- Extracts text content and creates vector embeddings
- Stores vectors in MongoDB for fast semantic search
- Supports uploading new PDFs through the API

### Chat Interface
- Clean, modern Material-UI design
- Real-time message streaming
- Markdown support for rich text responses
- Session management for conversation history
- Error handling and loading states

### AI Integration
- Uses OpenAI GPT for generating responses
- Combines user questions with relevant PDF content
- Maintains conversation context
- Provides accurate, contextual answers

## Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check if all dependencies are installed
   - Verify environment variables are set correctly
   - Ensure MongoDB/CosmosDB is accessible

2. **Frontend can't connect to backend:**
   - Verify backend is running on port 8000
   - Check CORS settings in backend
   - Ensure API_BASE_URL is correct in frontend .env

3. **PDF processing fails:**
   - Ensure PDFs are extracted to the correct folder
   - Check file permissions
   - Verify OpenAI API key is valid

4. **Database connection issues:**
   - Verify CosmosDB connection string
   - Check network connectivity
   - Ensure database and collections exist

## Development

### Adding New Features
1. Backend: Add new endpoints in `main.py`
2. Frontend: Create new components in `src/components/`
3. API: Update service layer in `src/services/api.ts`

### Code Style
- Backend: Follow PEP 8 Python style guide
- Frontend: Use TypeScript strict mode
- Use meaningful variable and function names
- Add comments for complex logic

## License

This project is created for the Innovate Uttarakhand initiative.

## Support

For issues or questions, please check the troubleshooting section or contact the development team.
