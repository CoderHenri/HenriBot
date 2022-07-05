const Discord = require("discord.js");
// Importing this allows you to access the environment variables of the running node process
require("dotenv").config();

const client = new Discord.Client();

// "process.env" accesses the environment variables for the running node process. PREFIX is the environment variable you defined in your .env file
const prefix = process.env.PREFIX;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", message => {

  if (message.content === "ping") {
    message.reply("Pong!");
  }
});

// Here you can login the bot. It automatically  attempts to login the bot with the environment variable you set for your bot token (either "CLIENT_TOKEN" or "DISCORD_TOKEN")
client.login(process.env.DISCORD_TOKEN);