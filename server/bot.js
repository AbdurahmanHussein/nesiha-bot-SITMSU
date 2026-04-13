const TelegramBot = require('node-telegram-bot-api');
const { query, queryOne, execute } = require('./db');

let bot = null;
let nesihaState = {}; // tracks users in nesiha conversation flow

const NESIHA_CATEGORIES = [
  { id: 'general', label: '📋 General Advice' },
  { id: 'education', label: '📚 Education' },
  { id: 'time_management', label: '⏰ Time Management' },
  { id: 'ibadah', label: '🕌 Ibadah (Worship)' },
  { id: 'zikr', label: '📿 Zikr & Dua' },
  { id: 'family', label: '👨‍👩‍👧 Family' },
  { id: 'other', label: '💬 Other' },
];

const BOT_COMMANDS = [
  { command: 'start', description: 'Subscribe to the bot' },
  { command: 'programs', description: 'View upcoming Da\'wah programs' },
  { command: 'topics', description: 'Browse Da\'wah topics' },
  { command: 'nesiha', description: 'Submit an advice request (private)' },
  { command: 'help', description: 'Show all available commands' },
  { command: 'unsubscribe', description: 'Unsubscribe from the bot' },
];

function initBot(token) {
  if (bot) {
    bot.stopPolling();
    bot = null;
  }

  if (!token) return null;

  try {
    bot = new TelegramBot(token, { polling: true });

    // Register slash commands so they appear in menu
    bot.setMyCommands(BOT_COMMANDS).then(() => {
      console.log('✅ Bot commands registered successfully');
    }).catch(err => {
      console.error('Failed to set bot commands:', err.message);
    });

    registerHandlers();
    console.log('🤖 Nesiha Bot started successfully');
    return bot;
  } catch (err) {
    console.error('Failed to start bot:', err.message);
    return null;
  }
}

async function logCommand(chatId, command) {
  await execute('INSERT INTO command_logs (chat_id, command) VALUES ($1, $2)', [chatId, command]);
}

function registerHandlers() {
  // /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = String(msg.chat.id);
    const chatType = msg.chat.type;
    await logCommand(chatId, '/start');

    if (chatType === 'private') {
      // Subscribe user
      await execute(`
        INSERT INTO subscribers (chat_id, username, first_name, last_name, is_active, chat_type)
        VALUES ($1, $2, $3, $4, 1, $5)
        ON CONFLICT(chat_id) DO UPDATE SET
          username = EXCLUDED.username,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          is_active = 1,
          chat_type = EXCLUDED.chat_type
      `, [chatId, msg.from.username || '', msg.from.first_name || '', msg.from.last_name || '', chatType]);

      const welcomeMsg = await queryOne("SELECT value FROM settings WHERE key = 'welcome_message'");
      const text = welcomeMsg?.value || 'Welcome to Nesiha Bot! Use /help to see commands.';
      bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } else if (chatType === 'group' || chatType === 'supergroup') {
      // Track the group
      await execute(`
        INSERT INTO groups (chat_id, title)
        VALUES ($1, $2)
        ON CONFLICT(chat_id) DO UPDATE SET title = EXCLUDED.title
      `, [chatId, msg.chat.title || 'Unknown Group']);

      bot.sendMessage(chatId, '🌿 *Nesiha Bot* is now active in this group!\n\nUse /help to see available commands.', { parse_mode: 'Markdown' });
    }
  });

  // /help command
  bot.onText(/\/help/, async (msg) => {
    await logCommand(String(msg.chat.id), '/help');
    const helpText = `🌿 *Nesiha Bot - Commands*\n
/start — Subscribe to the bot
/programs — View upcoming Da'wah programs
/topics — Browse Da'wah topics and resources
/nesiha — Submit an advice request (private only)
/help — Show this help message
/unsubscribe — Unsubscribe from the bot

_Da'wah & Irshad Sector_`;
    bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  });

  // /programs command
  bot.onText(/\/programs/, async (msg) => {
    await logCommand(String(msg.chat.id), '/programs');
    const programs = await query(
      "SELECT * FROM programs WHERE status = 'upcoming' ORDER BY date ASC LIMIT 5"
    );

    if (programs.length === 0) {
      bot.sendMessage(msg.chat.id, '📅 No upcoming programs at the moment.\n\nStay tuned for new announcements!');
      return;
    }

    let text = '📅 *Upcoming Da\'wah Programs:*\n\n';
    programs.forEach((p, i) => {
      text += `*${i + 1}. ${p.title}*`;
      if (p.title_ar) text += ` — ${p.title_ar}`;
      text += '\n';
      if (p.speaker) text += `🎤 Speaker: ${p.speaker}\n`;
      if (p.date) text += `📆 Date: ${p.date}\n`;
      if (p.time) text += `🕐 Time: ${p.time}\n`;
      if (p.location) text += `📍 Location: ${p.location}\n`;
      if (p.description) text += `📝 ${p.description}\n`;
      text += '\n';
    });

    bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
  });

  // /topics command
  bot.onText(/\/topics/, async (msg) => {
    await logCommand(String(msg.chat.id), '/topics');
    const topics = await query("SELECT * FROM topics ORDER BY created_at DESC LIMIT 10");

    if (topics.length === 0) {
      bot.sendMessage(msg.chat.id, '📚 No topics available yet.\n\nCheck back soon!');
      return;
    }

    let text = '📚 *Da\'wah Topics:*\n\n';
    topics.forEach((t, i) => {
      text += `*${i + 1}. ${t.title}*`;
      if (t.title_ar) text += ` — ${t.title_ar}`;
      text += '\n';
      if (t.content) text += `${t.content.substring(0, 200)}${t.content.length > 200 ? '...' : ''}\n`;
      text += '\n';
    });

    bot.sendMessage(msg.chat.id, text, { parse_mode: 'Markdown' });
  });

  // /nesiha command — ONLY works in private chat
  bot.onText(/\/nesiha/, async (msg) => {
    await logCommand(String(msg.chat.id), '/nesiha');
    const chatId = String(msg.chat.id);

    if (msg.chat.type !== 'private') {
      bot.sendMessage(chatId,
        '🔒 The /nesiha command is only available in *private chat*.\n\nPlease message me directly to submit your advice request.',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    // Start nesiha conversation flow
    nesihaState[chatId] = { step: 'category' };

    const keyboard = NESIHA_CATEGORIES.map(cat => ([{
      text: cat.label,
      callback_data: `nesiha_cat_${cat.id}`
    }]));

    bot.sendMessage(chatId,
      '🌿 *Submit an Advice Request (Nesiha)*\n\nYour request will be sent anonymously to our advisors.\n\nPlease select a category:',
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard }
      }
    );
  });

  // Handle callback queries (inline keyboard buttons)
  bot.on('callback_query', async (query_data) => {
    const chatId = String(query_data.message.chat.id);
    const data = query_data.data;

    // Nesiha category selection
    if (data.startsWith('nesiha_cat_')) {
      const category = data.replace('nesiha_cat_', '');
      const catLabel = NESIHA_CATEGORIES.find(c => c.id === category)?.label || category;

      nesihaState[chatId] = { step: 'message', category };

      bot.answerCallbackQuery(query_data.id);
      bot.sendMessage(chatId,
        `✅ Category: *${catLabel}*\n\nNow please type your advice request or question.\n\n_Your message will be kept confidential._`,
        { parse_mode: 'Markdown' }
      );
    }
  });

  // Handle regular messages (for nesiha conversation flow)
  bot.on('message', async (msg) => {
    if (msg.text && msg.text.startsWith('/')) return; // ignore commands
    const chatId = String(msg.chat.id);

    // Check if user is in nesiha flow
    if (nesihaState[chatId] && nesihaState[chatId].step === 'message') {
      const state = nesihaState[chatId];

      await execute(`
        INSERT INTO submissions (chat_id, username, first_name, category, message)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        chatId,
        msg.from.username || '',
        msg.from.first_name || '',
        state.category,
        msg.text
      ]);

      delete nesihaState[chatId];

      bot.sendMessage(chatId,
        '✅ *Your advice request has been submitted successfully!*\n\nOur team will review it and respond to you InshaAllah.\n\n_JazakAllahu Khairan for reaching out._',
        { parse_mode: 'Markdown' }
      );
    }
  });

  // /unsubscribe command
  bot.onText(/\/unsubscribe/, async (msg) => {
    await logCommand(String(msg.chat.id), '/unsubscribe');
    const chatId = String(msg.chat.id);

    await execute("UPDATE subscribers SET is_active = 0 WHERE chat_id = $1", [chatId]);
    bot.sendMessage(chatId,
      '👋 You have been unsubscribed from Nesiha Bot.\n\nYou can always subscribe again by sending /start.\n\n_May Allah guide us all._',
      { parse_mode: 'Markdown' }
    );
  });

  // Track groups when bot is added
  bot.on('new_chat_members', async (msg) => {
    if (msg.new_chat_members?.some(m => m.is_bot)) {
      const chatId = String(msg.chat.id);
      await execute(`
        INSERT INTO groups (chat_id, title)
        VALUES ($1, $2)
        ON CONFLICT(chat_id) DO UPDATE SET title = EXCLUDED.title
      `, [chatId, msg.chat.title || 'Unknown Group']);
    }
  });

  bot.on('polling_error', (err) => {
    console.error('Bot polling error:', err.code, err.message);
  });
}

function getBot() {
  return bot;
}

// Send a response to a nesiha submission (private only)
async function sendNesihaResponse(chatId, responseText) {
  if (!bot) throw new Error('Bot is not running');

  await bot.sendMessage(chatId,
    `🌿 *Response to your Nesiha Request*\n\n${responseText}\n\n_From the Da'wah & Irshad Team_`,
    { parse_mode: 'Markdown' }
  );
}

// Broadcast a message to all active subscribers
async function broadcastMessage(message) {
  if (!bot) throw new Error('Bot is not running');

  const subs = await query("SELECT chat_id FROM subscribers WHERE is_active = 1 AND chat_type = 'private'");

  let sent = 0, failed = 0;
  for (const sub of subs) {
    try {
      await bot.sendMessage(sub.chat_id, message, { parse_mode: 'Markdown' });
      sent++;
    } catch (err) {
      failed++;
      if (err.response?.statusCode === 403) {
        await execute("UPDATE subscribers SET is_active = 0 WHERE chat_id = $1", [sub.chat_id]);
      }
    }
  }
  return { sent, failed };
}

// Send announcement for a program to all subscribers
async function announceProgram(programId) {
  if (!bot) throw new Error('Bot is not running');

  const program = await queryOne("SELECT * FROM programs WHERE id = $1", [programId]);
  if (!program) throw new Error('Program not found');

  let text = `📢 *New Da'wah Program Announcement!*\n\n`;
  text += `🌿 *${program.title}*`;
  if (program.title_ar) text += ` — ${program.title_ar}`;
  text += '\n\n';
  if (program.speaker) text += `🎤 Speaker: ${program.speaker}\n`;
  if (program.date) text += `📆 Date: ${program.date}\n`;
  if (program.time) text += `🕐 Time: ${program.time}\n`;
  if (program.location) text += `📍 Location: ${program.location}\n`;
  if (program.description) text += `\n📝 ${program.description}\n`;
  text += '\n_We look forward to seeing you there!_';

  return broadcastMessage(text);
}

// Send a poll to groups
async function sendPollToGroups(pollId) {
  if (!bot) throw new Error('Bot is not running');

  const poll = await queryOne("SELECT * FROM polls WHERE id = $1", [pollId]);
  if (!poll) throw new Error('Poll not found');

  const options = JSON.parse(poll.options);
  const groups = await query("SELECT * FROM groups");

  const pollIds = [];
  const sentGroups = [];
  let failed = 0;

  for (const group of groups) {
    try {
      const result = await bot.sendPoll(group.chat_id, poll.question, options, {
        is_anonymous: poll.is_anonymous === 1,
        allows_multiple_answers: poll.allows_multiple === 1,
      });
      pollIds.push(result.poll.id);
      sentGroups.push(group.chat_id);
    } catch (err) {
      failed++;
      console.error(`Failed to send poll to group ${group.chat_id}:`, err.message);
    }
  }

  await execute("UPDATE polls SET telegram_poll_ids = $1, sent_to_groups = $2 WHERE id = $3", [
    JSON.stringify(pollIds),
    JSON.stringify(sentGroups),
    pollId
  ]);

  return { sent: sentGroups.length, failed, pollIds };
}

module.exports = { initBot, getBot, sendNesihaResponse, broadcastMessage, announceProgram, sendPollToGroups };
