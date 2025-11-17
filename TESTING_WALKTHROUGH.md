# 🧪 Testing Walkthrough - Step by Step

## ⏱️ Total Time: ~15 minutes

## Phase 1: Unit Tests (2 minutes)

### Step 1: Open Terminal
```powershell
# Navigate to project folder
cd "C:\Users\suvam\Desktop\VS code\Projects\medical-document-extraction using AI"
```

### Step 2: Run Gateway Tests
```powershell
node test-gateway.js
```

### Expected Output
```
✅ Test 1: Store data and auto-detect content type - PASS
✅ Test 2: Generate intelligent ID - PASS
✅ Test 3: Generate schema from data - PASS
✅ Test 4: Convert to JSON - PASS
✅ Test 5: Convert to CSV - PASS
✅ Test 6: Convert to XML - PASS
✅ Test 7: Convert to HTML - PASS
✅ Test 8: Validate data quality - PASS

All tests passed! ✨
```

**What This Proves:**
- ✅ Data gateway works correctly
- ✅ All formats convert properly
- ✅ ID generation is unique
- ✅ Schema detection works
- ✅ Validation logic is sound

---

## Phase 2: Start Application (1 minute)

### Step 1: Install Dependencies (first time only)
```powershell
npm install
```

### Step 2: Start Development Server
```powershell
npm run dev
```

### Expected Output
```
> medical-document-extraction@1.0.0 dev
> concurrently "npm run dev:server" "npm run dev:client"

[0] ℹ ｢wds｣: Project is running at http://localhost:3000
[1] ℹ Listening at http://localhost:5000
[1] Server started on port 5000
```

**Keep this terminal open!** Both servers are running.

---

## Phase 3: Test Web Interface (8 minutes)

### Step 1: Open Browser
Navigate to: **http://localhost:3000**

You should see:
- 🎯 Medical document extraction interface
- 📤 Large upload area (drag & drop)
- ⚙️ Settings button (top right)
- 📋 Document area (for viewing results)

### Step 2: Prepare Test Document
Create a simple test document. Choose one:

**Option A: Create a text file**
```
Patient Name: John Doe
Date of Birth: 01/15/1985
Medical Record Number: MR123456

MEDICATIONS:
- Lisinopril 10mg daily
- Metformin 500mg twice daily

DIAGNOSES:
- Type 2 Diabetes Mellitus
- Essential Hypertension

LAB RESULTS:
- Glucose: 145 mg/dL (Normal: 70-100)
- Creatinine: 1.0 mg/dL (Normal: 0.7-1.3)
```

Then:
- Save as `test_document.txt`
- Convert to PDF (using Print → Save as PDF)
- OR Save as JPEG/PNG

**Option B: Download sample**
- Use any existing medical document you have
- Supported formats: **PDF, JPEG, PNG**

### Step 3: Upload Document
1. Click on the upload area OR
2. Drag & drop your document

You'll see:
```
📤 Processing...
[████░░░░░░] 40% - Analyzing document type...
```

### Step 4: Wait for Completion
Watch the progress bar advance:
- 10% - Extracting text
- 40% - Analyzing type
- 50% - Extracting data
- 85% - Validating
- 100% - **Complete! ✨**

### Step 5: View Results
Once complete, you'll see results displayed. Results will show:
- ✅ Patient Information
- ✅ Medications
- ✅ Diagnoses
- ✅ Lab Results
- ✅ Confidence scores

---

## Phase 4: Test Format Switching (3 minutes)

### Step 1: View Table Format (Default)
You should see results in a clean table format with:
- 📊 Organized sections
- 🎯 Easy-to-read layout
- 📌 Category headers

### Step 2: Click "JSON" Button
You'll see:
- 📄 Complete JSON structure
- 🔗 Nested data relationships
- 📋 Full data dump

Expected structure:
```json
{
  "documentId": "abc-123...",
  "contentType": "medical_report",
  "patientInfo": { ... },
  "medications": [ ... ],
  "diagnoses": [ ... ],
  "labResults": [ ... ]
}
```

### Step 3: Click "CSV" Button
You'll see:
- 📊 Spreadsheet format
- 📈 Comma-separated values
- 💾 Copy-paste ready

Example:
```
Field,Value
Patient Name,John Doe
Date of Birth,01/15/1985
MRN,MR123456
```

### Step 4: Click "HTML" Button
You'll see:
- 🌐 Beautiful formatted report
- 🎨 Professional styling
- 📑 Printer-friendly layout

Features:
- Color-coded sections
- Confidence badges (%)
- Responsive design

### Step 5: Click "XML" Button
You'll see:
- 🏗️ Machine-readable format
- 🔀 Hierarchical structure
- 🔧 Integration-ready

Example:
```xml
<?xml version="1.0"?>
<extraction>
  <document>
    <contentType>medical_report</contentType>
    <patientInfo>
      <name>John Doe</name>
      <dateOfBirth>01/15/1985</dateOfBirth>
    </patientInfo>
  </document>
</extraction>
```

---

## Phase 5: Test Export Buttons (2 minutes)

### Step 1: Export as JSON
1. Click format button: **JSON**
2. Click **Download JSON**
3. File saves as: `extraction_ABC123.json`
4. **Verify**: Open file, check content is valid JSON

### Step 2: Export as CSV
1. Click format button: **CSV**
2. Click **Download CSV**
3. File saves as: `extraction_ABC123.csv`
4. **Verify**: Open in Excel, check formatting

### Step 3: Export as HTML
1. Click format button: **HTML**
2. Click **Download HTML**
3. File saves as: `extraction_ABC123.html`
4. **Verify**: Open in browser, check styling

### Step 4: Export as XML
1. Click format button: **XML**
2. Click **Download XML**
3. File saves as: `extraction_ABC123.xml`
4. **Verify**: Open in text editor, check structure

---

## Phase 6: Test API Endpoints (2 minutes)

### Step 1: Open New Terminal
Keep the development server running. Open a new PowerShell terminal.

### Step 2: Get Document ID
From the web interface, copy the **Document ID** displayed in the results area.

### Step 3: Test Endpoints

**Get JSON:**
```powershell
curl "http://localhost:5000/api/documents/{docId}/result?format=json" | ConvertFrom-Json | ConvertTo-Json
```

**Get CSV:**
```powershell
curl "http://localhost:5000/api/documents/{docId}/result?format=csv"
```

**Get HTML:**
```powershell
curl "http://localhost:5000/api/documents/{docId}/result?format=html" > result.html
```

**Get XML:**
```powershell
curl "http://localhost:5000/api/documents/{docId}/result?format=xml"
```

**Get All Documents:**
```powershell
curl "http://localhost:5000/api/documents" | ConvertFrom-Json | ConvertTo-Json
```

**Expected Responses:**
- ✅ 200 OK for all endpoints
- ✅ Valid JSON/CSV/XML format
- ✅ Correct content type header
- ✅ Complete data included

---

## 📋 Test Checklist

### ✅ Unit Tests
- [ ] Run `node test-gateway.js`
- [ ] All 8 tests pass
- [ ] No errors in console

### ✅ Application Start
- [ ] `npm run dev` starts both servers
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend runs at http://localhost:5000
- [ ] No errors in console

### ✅ Document Upload
- [ ] Can upload PDF/JPEG/PNG
- [ ] Progress bar appears
- [ ] Processing completes
- [ ] Results display

### ✅ Format Switching
- [ ] JSON view works
- [ ] CSV view works
- [ ] HTML view works
- [ ] XML view works
- [ ] Table view works (default)

### ✅ Exports
- [ ] JSON export downloads
- [ ] CSV export downloads
- [ ] HTML export downloads
- [ ] XML export downloads
- [ ] Files are readable

### ✅ API Endpoints
- [ ] GET /api/documents/{id}/result works
- [ ] GET /api/documents/{id}/formatted works
- [ ] GET /api/export/{id} works
- [ ] GET /api/documents works
- [ ] All return correct formats

### ✅ Data Quality
- [ ] Confidence scores display
- [ ] Data validates correctly
- [ ] No missing fields
- [ ] Formatting preserved

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Port 3000 in use" | Close other apps using port 3000 |
| "Port 5000 in use" | Close other Node.js instances |
| "Module not found" | Run `npm install` first |
| "Cannot find test-gateway.js" | Make sure you're in project root |
| "Upload fails silently" | Check browser console for errors |
| "No results displayed" | Wait for "100% - Complete!" message |
| "Export button disabled" | Make sure processing is finished |
| "API returns 404" | Check document ID is correct |
| "CSV opens wrong in Excel" | Try "Unicode (UTF-8)" encoding |

---

## 🎯 Success Criteria

### You've Succeeded When:

1. **Unit Tests** ✅
   - All 8 tests pass
   - No console errors

2. **Application** ✅
   - Both servers start
   - Web UI loads
   - No startup errors

3. **Upload & Process** ✅
   - Document uploads
   - Progress bar shows
   - Results appear
   - Data is visible

4. **Format Switching** ✅
   - Can switch between 5 formats
   - Each format displays correctly
   - Data matches across formats

5. **Exports** ✅
   - All 4 export formats download
   - Files open correctly
   - Content is complete

6. **API** ✅
   - All endpoints return 200 OK
   - Correct format in response
   - Complete data included

---

## 📚 Next Steps After Testing

### If All Tests Pass ✅
1. Review the documentation:
   - `INTELLIGENT_GATEWAY_GUIDE.md` - Full feature guide
   - `INTELLIGENT_GATEWAY_SETUP.md` - Detailed setup
   - `COMPLETE_SOLUTION_SUMMARY.md` - System overview

2. Explore the code:
   - `backend/services/dataGateway.js` - Core engine
   - `backend/services/mockDataGenerator.js` - Fallback data
   - `src/components/ResultsDisplay.tsx` - Frontend

3. Try more documents:
   - Test with different document types
   - Try different file formats (PDF vs JPEG)
   - Upload larger documents
   - Test with real medical documents

4. Integrate with your system:
   - Add to your existing application
   - Customize formats
   - Integrate with your database
   - Deploy to production

### If Tests Fail ❌
1. Check error messages
2. Verify all files are present
3. Check Node.js version (should be 14+)
4. Try `npm install` again
5. Look in `INTELLIGENT_GATEWAY_SETUP.md` for detailed troubleshooting

---

## ⏱️ Time Breakdown

```
Unit Tests        2 min  ✅ Validates core system
Start App         1 min  ✅ Ensures servers work
Upload Test       3 min  ✅ Tests end-to-end flow
Format Tests      3 min  ✅ Tests all 5 formats
Export Tests      2 min  ✅ Tests file download
API Tests         2 min  ✅ Tests backend endpoints
─────────────────────────
Total Time       ~15 min
```

---

## 🎉 You're Done!

Once all tests pass, your intelligent medical document extraction system is:
- ✅ Fully functional
- ✅ Production-ready
- ✅ Tested and validated
- ✅ Ready to use

**Next: Read the documentation to understand all capabilities!**
