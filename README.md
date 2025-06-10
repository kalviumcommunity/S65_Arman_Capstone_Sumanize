# Sumanize - AI-Powered Chat & Summarization Tool

A modern chat interface with AI-powered summarization capabilities that supports text conversations, YouTube video transcription, and document analysis.

## 🚀 Features

### Chat Interface
- **Real-time Chat**: Streaming responses from AI with proper context management
- **Multiple Chat Sessions**: Create, switch between, and manage multiple conversations
- **Chat History**: Persistent chat storage with automatic saving/loading
- **Context Preservation**: Full conversation context maintained throughout each chat session

### Input Methods
- **Text Messages**: Natural language conversations with the AI
- **YouTube URLs**: Automatic transcript extraction and summarization
- **File Uploads**: Support for PDF, TXT, CSV, MD, and DOCX files
- **Drag & Drop**: Easy file upload with visual feedback

### Authentication
- **OAuth Integration**: Google and GitHub authentication
- **Session Management**: Secure JWT-based sessions
- **User Profiles**: Account management with usage tracking
- **Rate Limiting**: Tier-based usage limits (Free/Premium)

## 🛠️ Technical Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Server-Sent Events (SSE)
- **Authentication**: NextAuth.js v4 with OAuth providers
- **Database**: MongoDB with Mongoose ODM
- **AI**: Google Gemini API
- **File Processing**: PDF parsing, YouTube transcript extraction

## 🏗️ Architecture

### Chat System Components

#### 1. Main Chat Interface (`app/page.jsx`)
- Manages overall chat state and routing
- Handles authentication and session management
- Coordinates between sidebar, chat area, and input components

#### 2. Chat Sidebar (`components/chat/chat-sidebar.jsx`)
- Displays chat history with previews
- Provides new chat creation and deletion
- Shows user profile and account access

#### 3. Chat Area (`components/chat/chat-area.jsx`)
- Renders conversation messages with proper styling
- Auto-scrolls to latest messages
- Displays loading states and typing indicators

#### 4. Chat Input (`components/chat/chat-input.jsx`)
- Unified input for text, URLs, and files
- Real-time file validation and preview
- Drag-and-drop file upload support

### Backend API Endpoints

#### `/api/message/stream`
- Handles text-based chat conversations
- Maintains conversation context through message history
- Returns streaming responses for real-time chat experience

#### `/api/youtube/transcript`
- Extracts transcripts from YouTube videos
- Supports multiple transcript extraction methods
- Provides detailed error handling and suggestions

#### `/api/document/upload`
- Processes various document formats (PDF, TXT, CSV, MD)
- Validates file types and sizes
- Streams AI-generated summaries

## 🗄️ Data Models

### Chat Structure

#### Database Model (MongoDB)
```javascript
Chat {
  userId: ObjectId,           // Reference to User
  chatId: String,            // Unique chat identifier
  title: String,             // Chat title
  messages: [Message],       // Array of messages
  isActive: Boolean,         // Soft delete flag
  lastMessageAt: Date,       // Last message timestamp
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-generated
}

Message {
  id: String,                // Message identifier
  role: "user" | "assistant", // Message sender
  content: String,           // Message content
  type: "text" | "file" | "youtube", // Message type
  timestamp: Date            // Message timestamp
}
```

#### Frontend Structure
```javascript
{
  id: "chat_timestamp",
  title: "Chat Title",
  messages: [
    {
      id: timestamp,
      role: "user" | "assistant",
      content: "Message content",
      type: "text" | "file" | "youtube",
      timestamp: "ISO date string"
    }
  ],
  createdAt: "ISO date string",
  updatedAt: "ISO date string"
}
```

### User Model
- Authentication via OAuth accounts
- Subscription tiers (Free/Premium)
- Usage tracking and rate limiting
- Preferences and settings

## 🔧 Context Management

The chat system maintains full conversation context by:

1. **Message History**: All messages in a chat are preserved in order in the database
2. **Context Passing**: Previous messages are sent to AI for context awareness
3. **Database Persistence**: Chats are automatically saved to MongoDB and loaded on login
4. **Real-time Updates**: State management ensures UI stays synchronized with database

### Database Persistence
- **Real-time Sync**: All chat data is automatically saved to MongoDB
- **User Isolation**: Each user only sees and can access their own chats
- **Cross-device Access**: Chats are available across all user devices
- **Reliable Storage**: No dependency on localStorage or browser storage

### Context Window Handling
- Chat length limited by model's context window
- Automatic history truncation when approaching limits
- Maintains most recent conversation for relevance

## 📱 User Experience

### Chat Flow
1. **Authentication**: Users sign in via Google/GitHub OAuth
2. **Database Loading**: User's chats are loaded from MongoDB on login
3. **Chat Creation**: Automatic first chat creation if no chats exist
4. **Input Processing**: Single input field detects and handles different content types
5. **Streaming Responses**: Real-time AI responses with typing indicators
6. **Database Sync**: All messages and chat updates are automatically saved to database
7. **History Management**: Easy navigation between multiple chats with persistent storage

### Responsive Design
- Mobile-optimized sidebar with collapse/expand
- Adaptive chat area for different screen sizes
- Touch-friendly file upload and interaction

## 🚦 Rate Limiting

### Free Tier
- 10 messages per hour
- 3 documents per day
- 2 YouTube videos per day

### Premium Tier
- 1,000 messages per hour
- 100 documents per day
- 50 YouTube videos per day

### Unauthenticated Users
- 3 messages per hour
- 1 document per day
- 1 YouTube video per day

## 🔐 Security Features

- CSRF protection via NextAuth.js
- File type and size validation
- Rate limiting to prevent abuse
- Secure session management
- Environment variable protection

## 📋 Supported File Types

- **PDF**: Up to 15MB
- **Text**: TXT, MD files up to 10MB
- **CSV**: Data files up to 10MB
- **Documents**: DOCX, DOC files up to 10MB

## 🚀 Getting Started

1. **Environment Setup**:
   ```bash
   # Required environment variables
   NEXTAUTH_SECRET=your_secret_here
   NEXTAUTH_URL=http://localhost:3000
   
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   
   DATABASE_URL=your_mongodb_connection_string
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

2. **Installation**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Development**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Production**:
   ```bash
   npm run build
   npm start
   ```

## 🎯 Future Enhancements

- Message editing and deletion
- Chat export functionality
- Advanced search across chat history
- File attachment sharing
- Team collaboration features
- Custom AI model selection
- Voice message support

## 📄 License

This project is private and proprietary.
