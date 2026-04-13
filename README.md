# Nesiha Da'wah & Irshad Bot

A Telegram bot with an admin dashboard for managing Da'wah programs, subscribers, advice requests (Nesiha), broadcasts, polls, and more.

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** React (Vite)
- **Database:** PostgreSQL (Neon)
- **Bot:** node-telegram-bot-api (polling)
- **Hosting:** Render.com

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `BOT_TOKEN` | Telegram bot token from @BotFather |
| `JWT_SECRET` | Secret key for admin dashboard JWT tokens |
| `PORT` | Server port (Render sets this automatically) |

## Local Development

```bash
# 1. Clone the repository
git clone https://github.com/AbdurahmanHussein/nesiha-bot-SITMSU.git

# 2. Install dependencies
npm install

# 3. Copy .env.example to .env and fill in your values
cp .env.example .env

# 4. Run both server and client in dev mode
npm run dev
```

## Deployment (Render)

1. Push to GitHub
2. Connect your Render service to this repository
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `node server/index.js`
5. Set the environment variables listed above

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Subscribe to the bot |
| `/programs` | View upcoming Da'wah programs |
| `/topics` | Browse Da'wah topics |
| `/nesiha` | Submit an advice request (private only) |
| `/help` | Show available commands |
| `/unsubscribe` | Unsubscribe from the bot |