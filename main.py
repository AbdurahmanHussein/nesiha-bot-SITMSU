from flask import Flask
from threading import Thread
import os

app = Flask('')

@app.route('/')
def home():
    return "Nesiha Bot is Alive!"

def run():
    # Render provides a PORT environment variable automatically
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)

def keep_alive():
    t = Thread(target=run)
    t.start()

# --- Your Bot Logic Starts Here ---
# Call keep_alive() right before your bot's polling starts
if __name__ == "__main__":
    keep_alive()
    # bot.infinity_polling() or whatever your bot start command is