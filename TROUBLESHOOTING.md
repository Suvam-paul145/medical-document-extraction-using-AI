# Troubleshooting Guide

Common issues and their solutions for beginners.

## Installation Issues

### Problem: "npm is not recognized as an internal or external command"

**Cause:** Node.js is not installed or not in PATH

**Solution:**
1. Download Node.js from https://nodejs.org/
2. Install with default settings
3. Restart Command Prompt
4. Try again

### Problem: "npm install" fails with errors

**Solution 1 - Clean install:**
```cmd
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install
```

**Solution 2 - Run as Administrator:**
1. Right-click Command Prompt
2. Select "Run as administrator"
3. Navigate to project folder
4. Run `npm install`

**Solution 3 - Check internet connection:**
- Make sure you're connected to the internet
- Try disabling VPN if you're using one

### Problem: Installation is very slow

**Cause:** Slow internet or npm registry issues

**Solution:**
- Be patient - first install can take 5-10 minutes
- Check your internet speed
- Try again later if npm registry is down

## Server Startup Issues

### Problem: "Port 3000 is already in use"

**Cause:** Another application is using port 3000

**Solution 1 - Find and close the app:**
```cmd
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

**Solution 2 - Change the port:**
1. Open `vite.config.ts`
2. Change `port: 3000` to `port: 3001`
3. Access app at http://localhost:3001

### Problem: "Port 5000 is already in use"

**Cause:** Another application is using port 5000

**Solution:**
1. Open `.env` file
2. Change `PORT=5000` to `PORT=5001`
3. Open `vite.config.ts`
4. Change proxy target to `http://localhost:5001`

### Problem: Backend server won't start

**Cause:** Missing dependencies or syntax errors

**Solution:**
1. Check Command Prompt for error messages
2. Run `npm install` again
3. Make sure all files are saved
4. Check for typos in configuration files

### Problem: Frontend shows blank page

**Cause:** Build errors or missing files

**Solution:**
1. Press F12 in browser to open Developer Tools
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Try refreshing page (F5)
5. Clear browser cache (Ctrl+Shift+Delete)

## Upload Issues

### Problem: "Invalid file type" error

**Cause:** Trying to upload unsupported file format

**Solution:**
- Only PDF, JPEG, and PNG files are supported
- Check file extension is correct
- Try converting file to supported format

### Problem: "File size exceeds limit" error

**Cause:** File is larger than 10MB

**Solution:**
- Compress the PDF file
- Reduce image quality/size
- Split large documents into smaller files

### Problem: Upload progress stuck at 0%

**Cause:** Backend server not running or network issue

**Solution:**
1. Check backend server is running
2. Look for errors in Command Prompt
3. Check browser console (F12) for errors
4. Try refreshing page and uploading again

### Problem: Upload completes but nothing happens

**Cause:** WebSocket connection failed

**Solution:**
1. Check browser console (F12) for WebSocket errors
2. Make sure backend server is running
3. Check firewall isn't blocking WebSocket
4. Try refreshing page

## Processing Issues

### Problem: Processing stuck at one stage

**Cause:** Backend error or job queue issue

**Solution:**
1. Check backend Command Prompt for errors
2. Wait 30 seconds - might be processing
3. Refresh page and try again
4. Restart both servers

### Problem: No real-time updates showing

**Cause:** WebSocket not connected

**Solution:**
1. Open browser console (F12)
2. Look for "WebSocket connected" message
3. If not connected, check backend is running
4. Try refreshing page
5. Check firewall settings

### Problem: Extraction shows no data

**Cause:** Processing failed or demo data not loading

**Solution:**
1. Check backend logs for errors
2. Make sure `backend/services/extraction.js` exists
3. Try uploading a different file
4. Restart servers

## Display Issues

### Problem: Animations not working

**Cause:** Browser doesn't support animations or reduced motion enabled

**Solution:**
- Use a modern browser (Chrome, Firefox, Edge)
- Check browser settings for reduced motion
- Update browser to latest version

### Problem: Layout looks broken

**Cause:** CSS not loading or browser compatibility

**Solution:**
1. Hard refresh page (Ctrl+Shift+R)
2. Clear browser cache
3. Check browser console for CSS errors
4. Try different browser

### Problem: Text is too small/large

**Cause:** Browser zoom setting

**Solution:**
- Press Ctrl+0 to reset zoom
- Or adjust zoom with Ctrl+Plus/Minus

## Export Issues

### Problem: Export button does nothing

**Cause:** Backend export endpoint not working

**Solution:**
1. Check backend logs for errors
2. Make sure backend server is running
3. Check browser console for errors
4. Try different export format

### Problem: Downloaded file is empty or corrupted

**Cause:** Export generation failed

**Solution:**
1. Check backend logs
2. Make sure extraction completed successfully
3. Try exporting again
4. Try different format (JSON usually works best)

### Problem: Can't find downloaded file

**Cause:** Browser download settings

**Solution:**
1. Check browser's Downloads folder
2. Check browser download settings
3. Look in default Downloads directory
4. Try export again and watch for download notification

## Performance Issues

### Problem: Application is very slow

**Cause:** Computer resources or large files

**Solution:**
- Close other applications
- Try smaller files first
- Check CPU/memory usage in Task Manager
- Restart computer if needed

### Problem: Browser becomes unresponsive

**Cause:** Too many animations or memory leak

**Solution:**
1. Refresh page (F5)
2. Close other browser tabs
3. Restart browser
4. Try different browser

## General Debugging Steps

### Step 1: Check the Logs

**Backend logs:**
- Look at Command Prompt where backend is running
- Red text usually indicates errors

**Frontend logs:**
- Press F12 in browser
- Go to Console tab
- Look for red error messages

### Step 2: Restart Everything

Often fixes mysterious issues:
1. Press Ctrl+C in Command Prompt (stops servers)
2. Close browser
3. Run `npm run dev` again
4. Open browser to http://localhost:3000

### Step 3: Clean Restart

For persistent issues:
1. Stop all servers (Ctrl+C)
2. Close all browser windows
3. Delete `node_modules` folder
4. Run `npm install`
5. Run `npm run dev`

### Step 4: Check File Integrity

Make sure all files exist:
```cmd
dir src\components
dir backend\services
dir backend\routes
```

Should see all the component and service files.

## Getting More Help

### Check Error Messages

Error messages usually tell you exactly what's wrong:
- "Cannot find module" → Run `npm install`
- "Port in use" → Change port or close other app
- "Permission denied" → Run as Administrator
- "Syntax error" → Check for typos in code

### Browser Developer Tools

Press F12 to open:
- **Console tab:** JavaScript errors
- **Network tab:** Failed requests
- **Application tab:** Storage and cache issues

### Command Prompt Output

Read the messages:
- Green/white text: Normal operation
- Yellow text: Warnings (usually okay)
- Red text: Errors (need to fix)

## Still Having Issues?

### Create a Bug Report

Include:
1. What you were trying to do
2. What happened instead
3. Error messages (copy exact text)
4. Screenshots if helpful
5. Your Node.js version (`node --version`)
6. Your operating system

### Common Fixes That Work

1. **Restart everything** - Fixes 50% of issues
2. **Run `npm install` again** - Fixes 30% of issues
3. **Clear browser cache** - Fixes 10% of issues
4. **Update Node.js** - Fixes 5% of issues
5. **Run as Administrator** - Fixes 5% of issues

## Prevention Tips

### Before Starting Work

- Make sure Node.js is up to date
- Close unnecessary applications
- Have stable internet connection
- Save all files before testing

### During Development

- Save files frequently
- Check logs regularly
- Test with small files first
- Keep Command Prompt visible

### After Making Changes

- Restart servers to see changes
- Clear browser cache if needed
- Test thoroughly before moving on

## Quick Reference

### Restart Servers
```cmd
Ctrl+C (in Command Prompt)
npm run dev
```

### Clean Install
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Check Ports
```cmd
netstat -ano | findstr :3000
netstat -ano | findstr :5000
```

### Kill Process
```cmd
taskkill /PID [number] /F
```

### Clear npm Cache
```cmd
npm cache clean --force
```

Remember: Most issues are simple and can be fixed by restarting or reinstalling. Don't panic! 😊
