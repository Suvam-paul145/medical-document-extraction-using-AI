# OpenRouter Implementation - Step-by-Step Guide

## Step 1: Obtain OpenRouter API Key

### 1.1 Create Account
1. Visit https://openrouter.ai
2. Click "Sign Up" (Google or email)
3. Verify email
4. Complete profile

### 1.2 Generate API Key
1. Navigate to https://openrouter.ai/keys
2. Click "Create New Key"
3. Name it: "Medical Document Extraction"
4. Copy key (starts with `sk-or-`)
5. Save securely

### 1.3 Update .env File
```bash
# File: .env

# Add this line
OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE

# Optional: Specify which model to use
EXTRACTION_MODEL=openai/gpt-4-turbo-preview

# Optional: Your app info (helps with prioritization)
SITE_URL=http://localhost:5173
SITE_NAME=Medical Document Extraction
```

---

## Step 2: Choose Your Implementation

You have two options:

### Option A: JavaScript (Recommended for Your Project)
- Uses `/backend/services/openrouterClient.js`
- Drop-in replacement for current setup
- No TypeScript compilation needed
- Same performance as TypeScript version

### Option B: TypeScript
- Uses `/backend/services/openrouterClient.ts`
- If you want to convert your backend to TypeScript
- Better type checking and IDE support

**For this guide, we'll use Option A (JavaScript).**

---

## Step 3: Update Your Backend

### 3.1 Replace the Extraction Agent

**Option 1: Quick Swap (Rename files)**
```powershell
# Backup old agent
Move-Item -Path backend/services/extractionAgent.js `
          -Destination backend/services/extractionAgent.js.backup

# The new implementation is in openrouterClient.js
# We'll integrate it in the next step
```

**Option 2: Gradual Migration (Keep both)**
```powershell
# Keep both versions for comparison/rollback
# backend/services/extractionAgent.js (original - OpenAI)
# backend/services/openrouterClient.js (new - OpenRouter)
```

### 3.2 Update extraction.js

**File**: `backend/services/extraction.js`

Find this section (current code with OpenAI):
```javascript
import OpenAI from 'openai'
import { MedicalExtractionAgent } from './extractionAgent'

export async function processDocument(file, uploadPath, io) {
  const apiKey = process.env.OPENAI_API_KEY
  
  // ... existing OCR code ...
  
  const agent = new MedicalExtractionAgent(apiKey)
  const result = await agent.extractMedicalData(ocrText, (stage) => {
    // emit progress
  })
}
```

Replace with:
```javascript
// ✅ NEW: Import OpenRouter version
import { MedicalExtractionAgent } from './openrouterClient.js'

export async function processDocument(file, uploadPath, io) {
  // ✅ NEW: Use OpenRouter API key
  const apiKey = process.env.OPENROUTER_API_KEY
  
  // ✅ NEW: Specify model (optional, defaults to GPT-4-Turbo)
  const model = process.env.EXTRACTION_MODEL || 'openai/gpt-4-turbo-preview'
  
  // ... existing OCR code ...
  
  // ✅ NEW: Initialize with OpenRouter
  const agent = new MedicalExtractionAgent(apiKey, model)
  
  // ✅ SAME: Rest of the code works unchanged!
  const result = await agent.extractMedicalData(ocrText, (stage) => {
    // Progress callback works the same
    io.emit('extraction_progress', stage)
  })
  
  return result
}
```

**That's it! The extraction and progress events work exactly the same.**

### 3.3 Verify the Backend Routes

Your existing routes in `backend/routes/upload.js` should work without changes:

```javascript
// ✅ NO CHANGES NEEDED
import { processDocument } from '../services/extraction.js'

router.post('/upload', async (req, res) => {
  try {
    const result = await processDocument(req.file, uploadPath, io)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

---

## Step 4: Test the Integration

### 4.1 Start the Development Server
```powershell
# Terminal 1: Start backend
cd backend
npm install  # if needed
node server.js

# Terminal 2: Start frontend
npm run dev
```

### 4.2 Upload a Test Document

1. Open http://localhost:5173
2. Upload a medical document
3. Watch the progress stages update
4. Check extracted data

### 4.3 Monitor the Console

**Expected output:**
```
Analysis: Classifying (10%)
Analysis: Classification Complete (15%)
Extraction: Patient Info (30%)
Extraction: Patient Info Complete (40%)
Extraction: Medications (50%)
...
Validation: Complete (100%)
```

### 4.4 Check for Errors

**In browser console:**
- Should see WebSocket messages: `extraction_progress`
- AgentProcessing component should render
- No red error messages

**In terminal:**
- Should see API requests logged
- No "OPENROUTER_API_KEY" undefined errors
- No auth failures

---

## Step 5: Troubleshooting

### Issue: "OPENROUTER_API_KEY is undefined"
```
Solution:
1. Check .env file has the key
2. Restart backend server (env variables cached)
3. Verify key format: sk-or-xxx...
4. Check no extra spaces in .env
```

### Issue: "Invalid API Key"
```
Error: OpenRouter API error: 401 - Unauthorized

Solution:
1. Verify key is correct from https://openrouter.ai/keys
2. Make sure it's not expired
3. Check key has no leading/trailing spaces
4. Try creating a new key
```

### Issue: "Model not found"
```
Error: OpenRouter API error: 400 - Model not found

Solution:
1. Check model name format: openai/gpt-4-turbo-preview
2. Don't use: gpt-4-turbo-preview (missing openai/ prefix)
3. List available models: https://openrouter.ai/docs/models
```

### Issue: "Timeout / Slow responses"
```
Solution:
1. Check internet connection
2. Try different model (faster):
   - Change EXTRACTION_MODEL=openai/gpt-3.5-turbo
   - Reduces time to 4-6 seconds
3. Check OpenRouter status: https://status.openrouter.io/
4. Increase timeout in openrouterClient.js:
   - timeout: 60000  // 60 seconds instead of 30
```

### Issue: "Rate limit exceeded"
```
Error: OpenRouter API error: 429 - Too Many Requests

Solution:
1. Wait a few minutes before retrying
2. Implement queue system for multiple documents
3. Contact OpenRouter support for higher limits
4. Add exponential backoff in openrouterClient.js
```

---

## Step 6: Optimize for Your Use Case

### 6.1 Choose Best Model for Your Needs

**Fast & Cheap:**
```env
EXTRACTION_MODEL=openai/gpt-3.5-turbo
# Cost: $0.002 per document, 4-6 seconds
```

**Best Balance:**
```env
EXTRACTION_MODEL=anthropic/claude-3-sonnet
# Cost: $0.018 per document, 6-8 seconds
# Accuracy: 94%, Great at structured extraction
```

**Best Accuracy:**
```env
EXTRACTION_MODEL=openai/gpt-4-turbo-preview
# Cost: $0.040 per document, 8-10 seconds
# Accuracy: 96%, Best at complex medical documents
```

### 6.2 Fine-tune Temperature

In `openrouterClient.js`, adjust:

```javascript
async chatWithFunctions(messages, functions, options = {}) {
  const body = {
    temperature: options.temperature ?? 0.5,  // ← Adjust here
    // ...
  }
}
```

- `0.0`: Most deterministic (good for extraction)
- `0.5`: Balanced (current setting)
- `1.0`: Most creative (not for extraction)

### 6.3 Control Token Usage

Reduce costs by limiting output:

```javascript
async extractMedicalData(ocrText, onProgress) {
  // Reduce max_tokens for faster/cheaper extraction
  const maxTokens = process.env.MAX_TOKENS || 1024  // Instead of 2048
  
  // Per stage
  const response = await this.callAgent(systemPrompt, functions, {
    maxTokens: maxTokens
  })
}
```

---

## Step 7: Monitor Performance

### 7.1 Check API Usage
1. Visit https://openrouter.ai/activity
2. See all requests, costs, models used
3. Track usage trends

### 7.2 Track Extraction Metrics
```javascript
// In extraction.js, add timing
const startTime = Date.now()

const result = await agent.extractMedicalData(ocrText, (stage) => {
  // Track stage timing
  console.log(`${stage.stage}: ${stage.progress}% - ${Date.now() - startTime}ms`)
})

const totalTime = Date.now() - startTime
console.log(`Total extraction: ${totalTime}ms`)
```

### 7.3 Monitor Costs

**Monthly projection (1000 docs/month):**
| Model | Per Doc | Monthly | Annual |
|-------|---------|---------|--------|
| GPT-3.5-Turbo | $0.002 | $2 | $24 |
| Claude-Sonnet | $0.018 | $18 | $216 |
| GPT-4-Turbo | $0.040 | $40 | $480 |

---

## Step 8: Advanced Features (Optional)

### 8.1 Multi-Model Comparison
```javascript
// Run extraction with multiple models, compare results
const models = [
  'openai/gpt-4-turbo-preview',
  'anthropic/claude-3-sonnet',
  'openai/gpt-3.5-turbo'
]

const results = await Promise.all(
  models.map(model => {
    const agent = new MedicalExtractionAgent(apiKey, model)
    return agent.extractMedicalData(ocrText)
  })
)

// Compare accuracy vs cost
```

### 8.2 Fallback Chain
```javascript
// Try multiple models with fallback
const models = [
  'openai/gpt-4-turbo-preview',  // First choice
  'anthropic/claude-3-sonnet',    // Fallback 1
  'openai/gpt-3.5-turbo'         // Fallback 2
]

for (const model of models) {
  try {
    const agent = new MedicalExtractionAgent(apiKey, model)
    return await agent.extractMedicalData(ocrText)
  } catch (error) {
    console.log(`Model ${model} failed, trying next...`)
  }
}
```

### 8.3 A/B Testing
```javascript
// Send different users different models, compare results
const model = user.id % 2 === 0 
  ? 'openai/gpt-4-turbo-preview'  // Group A
  : 'anthropic/claude-3-sonnet'     // Group B

const agent = new MedicalExtractionAgent(apiKey, model)
const result = await agent.extractMedicalData(ocrText)

// Track which model produces better quality
```

---

## Step 9: Production Deployment

### 9.1 Environment Variables (Update in Deployment Platform)

**AWS:**
```
OPENROUTER_API_KEY = sk-or-xxx...
EXTRACTION_MODEL = openai/gpt-4-turbo-preview
SITE_URL = https://yourdomain.com
SITE_NAME = Medical Document Extraction
```

**Vercel:**
```
Same as above in Settings → Environment Variables
```

**Docker:**
```dockerfile
ENV OPENROUTER_API_KEY=sk-or-xxx...
ENV EXTRACTION_MODEL=openai/gpt-4-turbo-preview
```

### 9.2 Set Resource Limits
```javascript
// Prevent runaway costs
const MAX_MONTHLY_COST = 1000  // dollars
const MAX_REQUESTS_PER_HOUR = 100

// Add request tracking and cost monitoring
```

### 9.3 Enable Logging
```javascript
// Log all API calls
if (process.env.DEBUG_OPENROUTER === 'true') {
  console.log(`API Call: ${model}, Tokens: ${usage.completion_tokens}, Cost: $${estimatedCost}`)
}
```

---

## Step 10: Success Checklist

- [ ] OpenRouter account created
- [ ] API key obtained and added to .env
- [ ] `openrouterClient.js` exists in backend/services
- [ ] `extraction.js` updated with new imports
- [ ] Backend started without errors
- [ ] Upload a test document
- [ ] See progress stages updating
- [ ] Extraction completes successfully
- [ ] No "undefined API key" errors
- [ ] Check OpenRouter dashboard for usage
- [ ] Document extracted data matches expectations

---

## Quick Command Reference

```bash
# Start backend with OpenRouter
$env:OPENROUTER_API_KEY = "sk-or-your-key"
$env:EXTRACTION_MODEL = "openai/gpt-4-turbo-preview"
node backend/server.js

# Start frontend
npm run dev

# View OpenRouter usage
# https://openrouter.ai/activity

# Check API status
# https://status.openrouter.io/
```

---

## Need Help?

| Issue | Solution |
|-------|----------|
| API Key errors | Check .env file, restart server |
| Model not found | Add "openai/" prefix to model name |
| Slow extraction | Try gpt-3.5-turbo or claude-haiku |
| Rate limiting | Implement queue, reduce request frequency |
| Cost concerns | Use cheaper models or batch requests |

---

## Next Steps

After successful OpenRouter integration:

1. **Monitor costs** - Track actual vs projected
2. **Compare models** - Test different models for your documents
3. **Optimize extraction** - Tune temperature and tokens
4. **Scale up** - Process larger document volumes
5. **Integrate monitoring** - Add dashboards and alerts
6. **Plan fallbacks** - Setup multi-model failover chains

---

**Congratulations! You're now running on OpenRouter! 🚀**
