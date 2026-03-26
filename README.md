# Here are your Instructions

## Local dev with ngrok

1. Install ngrok if missing:
	- macOS: `brew install --cask ngrok`
	- Linux: use package manager or https://ngrok.com/download

2. Start both servers and ngrok:
	- `bash run_with_ngrok.sh`

3. Confirm URLs:
	- Backend: `http://127.0.0.1:8000` (`/api/auth/signup`)
	- Frontend: `http://localhost:3000`
	- ngrok public URLs in `~/.ngrok2/ngrok.yml` or logs `/tmp/ngrok-backend.log` and `/tmp/ngrok-frontend.log`

4. To stop, `pkill -f "uvicorn server:app"`, `pkill -f "npm start"`, `pkill -f ngrok`.
