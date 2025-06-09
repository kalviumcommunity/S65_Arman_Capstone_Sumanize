# Sumanize API Documentation

## Overview
Sumanize provides AI-powered summarization services for text, documents, PDFs, and YouTube videos using Google's Gemini AI.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints require a `GEMINI_API_KEY` environment variable to be set.

## Rate Limits
- Text streaming: 10 requests per minute
- YouTube processing: 5 requests per minute  
- PDF processing: 8 requests per minute
- Document processing: 10 requests per minute

## Endpoints

### 1. Text Streaming Chat `/message/stream`
**POST** `/api/message/stream`

Streams AI responses for text summarization with chat history support.

**Request Body (JSON):**
```json
{
  "prompt": "Please summarize this text: [your text here]",
  "history": [
    {
      "role": "user",
      "text": "Previous message"
    },
    {
      "role": "ai", 
      "text": "Previous response"
    }
  ]
}
```

**Response:** Server-Sent Events (SSE) stream
```
data: {"status": "started"}

data: {"text": "chunk of response"}

data: {"status": "completed"}
```

---

### 2. YouTube Video Summarization `/youtube/transcript`
**POST** `/api/youtube/transcript`

Extracts transcript from YouTube videos and provides AI-generated summaries.

**Request Body (JSON):**
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "includeTranscript": false
}
```

**Response (JSON):**
```json
{
  "summary": "AI-generated summary of the video content...",
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "extractedAt": "2024-01-15T10:30:00.000Z",
  "transcriptLength": 15420,
  "transcript": "Full transcript text (if includeTranscript=true)"
}
```

**Supported URL Formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

---

### 3. PDF Document Processing `/document/pdf`
**POST** `/api/document/pdf`

Extracts text from PDF files and provides AI-generated summaries.

**Request:** Multipart form data
- `file`: PDF file (max 15MB)
- `includeExtractedText`: boolean (optional, default: false)

**Response (JSON):**
```json
{
  "summary": "AI-generated summary of the PDF content...",
  "fileName": "document.pdf",
  "fileSize": 1048576,
  "processedAt": "2024-01-15T10:30:00.000Z",
  "extractedTextLength": 12500,
  "extractedText": "Full extracted text (if includeExtractedText=true)"
}
```

---

### 4. General Document Processing `/document/upload`
**POST** `/api/document/upload`

Processes various document formats and provides AI-generated summaries.

**Supported Formats:** txt, json, csv, md, html, htm

**Request:** Multipart form data
- `file`: Document file (max 10MB)
- `includeExtractedText`: boolean (optional, default: false)

**Response (JSON):**
```json
{
  "summary": "AI-generated summary of the document content...",
  "fileName": "document.txt",
  "fileType": "TXT",
  "fileSize": 524288,
  "processedAt": "2024-01-15T10:30:00.000Z",
  "extractedTextLength": 8750,
  "extractedText": "Full extracted text (if includeExtractedText=true)"
}
```

---

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

**Common Error Codes:**
- `400`: Bad Request (validation errors, file format issues)
- `401`: Unauthorized (invalid API key)
- `404`: Not Found (model not available)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

---

## Postman Testing

### 1. Text Streaming Test

**Method:** POST  
**URL:** `http://localhost:3000/api/message/stream`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "prompt": "Summarize the key benefits of renewable energy sources including solar, wind, and hydroelectric power. Focus on environmental and economic advantages.",
  "history": []
}
```

### 2. YouTube Video Test

**Method:** POST  
**URL:** `http://localhost:3000/api/youtube/transcript`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "includeTranscript": true
}
```

### 3. PDF Upload Test

**Method:** POST  
**URL:** `http://localhost:3000/api/document/pdf`  
**Headers:** (none - Postman auto-sets multipart boundary)  
**Body (form-data):**
- Key: `file`, Type: File, Value: [Select a PDF file]
- Key: `includeExtractedText`, Type: Text, Value: `true`

### 4. Document Upload Test

**Method:** POST  
**URL:** `http://localhost:3000/api/document/upload`  
**Headers:** (none - Postman auto-sets multipart boundary)  
**Body (form-data):**
- Key: `file`, Type: File, Value: [Select a .txt/.json/.csv/.md/.html file]
- Key: `includeExtractedText`, Type: Text, Value: `false`

---

## Sample Test Files

### Sample TXT File Content
Create a file named `sample.txt`:
```
Artificial Intelligence in Healthcare

Artificial Intelligence (AI) is revolutionizing healthcare by enabling more accurate diagnoses, personalized treatments, and efficient operations. Machine learning algorithms can analyze medical images with precision that often exceeds human capabilities.

Key applications include:
- Medical imaging analysis for cancer detection
- Drug discovery and development
- Predictive analytics for patient outcomes
- Robotic surgery assistance
- Electronic health record optimization

The integration of AI in healthcare promises to reduce costs, improve patient outcomes, and make quality healthcare more accessible globally.
```

### Sample JSON File Content
Create a file named `sample.json`:
```json
{
  "company": "TechCorp",
  "quarterly_results": {
    "q1_2024": {
      "revenue": 2500000,
      "profit": 450000,
      "growth_rate": 12.5
    },
    "q2_2024": {
      "revenue": 2750000,
      "profit": 520000,
      "growth_rate": 15.2
    }
  },
  "key_metrics": {
    "customer_satisfaction": 4.2,
    "employee_retention": 89,
    "market_share": 15.8
  },
  "goals": [
    "Increase revenue by 20% in Q3",
    "Launch new product line",
    "Expand to European markets"
  ]
}
```

### Sample CSV File Content
Create a file named `sample.csv`:
```csv
Product,Sales,Revenue,Region
Laptop Pro,150,299999,North America
Smartphone X,300,179999,Europe
Tablet Air,200,129999,Asia
Smart Watch,400,99999,Global
Headphones,500,49999,North America
```

---

## Environment Setup

Ensure your `.env.local` file contains:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Notes

1. All file uploads are limited by size (PDF: 15MB, Others: 10MB)
2. Text extraction from PDFs uses basic parsing - complex PDFs may need OCR
3. YouTube transcript extraction relies on available captions
4. Rate limiting is implemented per IP address
5. All APIs are Edge Runtime compatible for Vercel deployment 