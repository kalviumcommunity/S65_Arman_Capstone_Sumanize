# Postman Test Commands for Sumanize API

## Prerequisites
1. Make sure your server is running: `npm run dev`
2. Ensure you have set `GEMINI_API_KEY` in your `.env.local` file
3. Server should be running on `http://localhost:3000`

## 1. YouTube Transcript Summarization

### Endpoint
```
POST http://localhost:3000/api/youtube/transcript
```

### Headers
```
Content-Type: application/json
```

### Recommended Test Videos (High Success Rate)

#### Educational Content (Usually has captions)
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

#### TED Talks (Always have captions)
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=ZQUxL4Jm1Lo"
}
```

#### News Videos (BBC, CNN - usually captioned)
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=xuCn8ux2gbs"
}
```

#### Tech Tutorials (Popular channels)
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=Tn6-PIqc4UM"
}
```

### Alternative URL Formats
```json
{
  "youtubeUrl": "https://youtu.be/dQw4w9WgXcQ"
}
```

```json
{
  "youtubeUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
}
```

### Expected Success Response
```json
{
  "summary": "• The video discusses...\n• Key points include...",
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "transcriptLength": 1234,
  "processedAt": "2024-06-09T22:57:00.000Z"
}
```

### Expected Error Response (with helpful suggestions)
```json
{
  "error": "Failed to extract video transcript",
  "details": "No transcript available for this video. The video may not have captions enabled, may be private, or may not support transcript extraction.",
  "suggestions": [
    "This video doesn't have captions/subtitles available",
    "Try videos with auto-generated captions or manual subtitles",
    "Look for educational content, news videos, or popular creators who typically add captions",
    "Check if the video is public and not age-restricted"
  ],
  "helpfulVideos": [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ - Rick Astley (has captions)",
    "Any TED Talk video (they usually have captions)",
    "News videos from major channels (BBC, CNN, etc.)",
    "Educational channels (Khan Academy, Crash Course, etc.)"
  ]
}
```

## 2. PDF Upload and Summarization

### Endpoint
```
POST http://localhost:3000/api/document/pdf
```

### Headers
```
Content-Type: multipart/form-data
```

### Body (Form Data)
- Key: `file`
- Type: File
- Value: Select a PDF file

### Expected Response
```json
{
  "summary": "• The document covers...\n• Main findings include...",
  "fileName": "sample.pdf",
  "fileSize": 1234567,
  "extractedTextLength": 5678,
  "processedAt": "2024-06-09T22:57:00.000Z"
}
```

## Troubleshooting YouTube Issues

### Why do most YouTube videos fail?
1. **No Captions**: Many videos don't have captions/subtitles enabled
2. **Private/Restricted**: Video might be private or age-restricted
3. **Music Videos**: Often have no spoken content to transcribe
4. **Non-English**: Videos in other languages may not work with English extraction
5. **Live Streams**: May not have processed captions yet

### Which videos are most likely to work?
✅ **TED Talks** - Always captioned  
✅ **Educational channels** (Khan Academy, Crash Course, etc.)  
✅ **News videos** (BBC, CNN, major news outlets)  
✅ **Tech tutorials** from popular YouTubers  
✅ **Corporate presentations**  
✅ **University lectures**  

### Which videos often fail?
❌ **Music videos** (unless they have lyrics as captions)  
❌ **Gaming videos** (unless creator adds captions)  
❌ **Vlogs** (hit or miss - depends on creator)  
❌ **Short videos** (< 1 minute)  
❌ **Non-English content**  
❌ **Very old videos** (before auto-captions)  

## Testing Strategy

### Step 1: Test with guaranteed working videos
```bash
# TED Talk - should always work
curl -X POST http://localhost:3000/api/youtube/transcript \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl": "https://www.youtube.com/watch?v=ZQUxL4Jm1Lo"}'
```

### Step 2: Test with your target videos
```bash
# Your video
curl -X POST http://localhost:3000/api/youtube/transcript \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl": "YOUR_VIDEO_URL_HERE"}'
```

### Step 3: Check video has captions manually
1. Go to the YouTube video
2. Click the CC (closed captions) button
3. If captions appear, the video should work with our API

## Finding Videos with Captions

### Search Tips
- Add "CC" or "captions" to your YouTube search
- Look for educational content
- Check channels that focus on accessibility
- Universities often caption their lectures

### Quick Test URLs (Known to work)
- Rick Astley: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Any recent TED Talk
- BBC News videos
- Khan Academy tutorials

## cURL Commands

### YouTube Transcript
```bash
curl -X POST http://localhost:3000/api/youtube/transcript \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### PDF Upload
```bash
curl -X POST http://localhost:3000/api/document/pdf \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/sample.pdf"
```

## Error Codes Reference

- **400**: Bad request (invalid URL, no transcript available)
- **401**: Invalid API key
- **429**: Rate limit exceeded
- **500**: Server error

The API now provides helpful suggestions when videos fail, guiding users to try videos that are more likely to have captions available. 