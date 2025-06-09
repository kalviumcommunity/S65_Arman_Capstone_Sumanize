# Sumanize API - Quick Start Guide

## 🚀 Setup Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file in your project root:
```bash
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
```

### 3. Start Development Server
```bash
npm run dev
```

Your API will be available at: `http://localhost:3000/api`

---

## 📋 Postman Testing Commands

### Test 1: Text Summarization (Streaming)
```bash
curl -X POST http://localhost:3000/api/message/stream \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Summarize the key benefits of renewable energy sources including solar, wind, and hydroelectric power. Focus on environmental and economic advantages.",
    "history": []
  }'
```

### Test 2: YouTube Video Summary
```bash
curl -X POST http://localhost:3000/api/youtube/transcript \
  -H "Content-Type: application/json" \
  -d '{
    "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "includeTranscript": false
  }'
```

### Test 3: PDF Upload (use test-files/sample.pdf)
```bash
curl -X POST http://localhost:3000/api/document/pdf \
  -F "file=@test-files/sample.pdf" \
  -F "includeExtractedText=true"
```

### Test 4: Document Upload (TXT)
```bash
curl -X POST http://localhost:3000/api/document/upload \
  -F "file=@test-files/sample.txt" \
  -F "includeExtractedText=false"
```

### Test 5: Document Upload (JSON)
```bash
curl -X POST http://localhost:3000/api/document/upload \
  -F "file=@test-files/sample.json" \
  -F "includeExtractedText=false"
```

### Test 6: Document Upload (CSV)
```bash
curl -X POST http://localhost:3000/api/document/upload \
  -F "file=@test-files/sample.csv" \
  -F "includeExtractedText=false"
```

---

## 🧪 Postman Collection Setup

### Import Collection
1. Open Postman
2. Click "Import" 
3. Create a new collection called "Sumanize API"
4. Add the following requests:

### Request 1: Text Stream
- **Method**: POST
- **URL**: `{{baseUrl}}/message/stream`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "prompt": "Summarize the benefits of artificial intelligence in healthcare, focusing on diagnostic accuracy, treatment personalization, and operational efficiency.",
  "history": []
}
```

### Request 2: YouTube Summary
- **Method**: POST
- **URL**: `{{baseUrl}}/youtube/transcript`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "includeTranscript": true
}
```

### Request 3: PDF Upload
- **Method**: POST
- **URL**: `{{baseUrl}}/document/pdf`
- **Body** (form-data):
  - Key: `file`, Type: File, Value: [Upload PDF]
  - Key: `includeExtractedText`, Type: Text, Value: `true`

### Request 4: Document Upload
- **Method**: POST
- **URL**: `{{baseUrl}}/document/upload`
- **Body** (form-data):
  - Key: `file`, Type: File, Value: [Upload TXT/JSON/CSV/MD/HTML]
  - Key: `includeExtractedText`, Type: Text, Value: `false`

### Environment Variables
Set up environment variables in Postman:
- `baseUrl`: `http://localhost:3000/api`

---

## 📁 Test Files Structure

Your project should have this structure:
```
sumanize/
├── app/
│   ├── api/
│   │   ├── message/
│   │   │   └── stream/
│   │   │       └── route.js
│   │   ├── youtube/
│   │   │   └── transcript/
│   │   │       └── route.js
│   │   ├── document/
│   │   │   ├── pdf/
│   │   │   │   └── route.js
│   │   │   └── upload/
│   │   │       └── route.js
│   │   └── utils/
│   │       └── content-extractor.js
├── test-files/
│   ├── sample.txt
│   ├── sample.json
│   ├── sample.csv
│   └── [your-test.pdf]
├── .env.local
├── package.json
├── API_DOCUMENTATION.md
└── QUICK_START.md
```

---

## 🎯 Quick Test Scenarios

### Scenario 1: Basic Text Summarization
Test the streaming endpoint with a long text about any topic.

### Scenario 2: YouTube Video Analysis
Use any public YouTube video with captions. Try these examples:
- TED Talks
- Educational videos
- News segments
- Tutorials

### Scenario 3: Document Processing
Upload different file types:
- **TXT**: Articles, reports, documentation
- **JSON**: API responses, configuration files, data exports
- **CSV**: Sales data, analytics reports, spreadsheet exports
- **MD**: README files, documentation
- **HTML**: Web pages, saved articles

### Scenario 4: PDF Analysis
Upload PDFs like:
- Research papers
- Business reports
- Documentation
- eBooks (text-based)

---

## 🚨 Troubleshooting

### Common Issues

1. **GEMINI_API_KEY not set**
   - Ensure `.env.local` exists with valid API key
   - Restart development server after adding env variables

2. **File upload fails**
   - Check file size limits (PDF: 15MB, Others: 10MB)
   - Verify file format is supported
   - Ensure multipart/form-data is used

3. **YouTube transcript not found**
   - Video must have captions available
   - Try different videos with English captions
   - Some videos may have restricted access

4. **Rate limit exceeded**
   - Wait 1 minute before retrying
   - Rate limits vary by endpoint (5-10 requests/minute)

5. **PDF text extraction fails**
   - PDFs must be text-based (not image-based)
   - Try different PDF files
   - Check if PDF is password-protected

---

## 📊 Expected Response Times

- **Text streaming**: Immediate start, 2-10 seconds total
- **YouTube processing**: 10-30 seconds (depends on video length)
- **PDF processing**: 5-15 seconds (depends on file size)
- **Document processing**: 2-8 seconds (depends on content)

---

## 🔧 Development Commands

```bash
# Start development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Check logs in development
# Open browser dev tools and check Network tab for detailed responses
```

---

## 📈 Next Steps

1. Test all endpoints with sample data
2. Try with your own files and YouTube URLs
3. Monitor response times and accuracy
4. Deploy to Vercel for production testing
5. Integrate with your frontend application

Happy testing! 🎉 