const Discord = require("discord.js");
// Importing this allows you to access the environment variables of the running node process
require("dotenv").config();

const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });

// "process.env" accesses the environment variables for the running node process. PREFIX is the environment variable you defined in your .env file
const prefix = process.env.PREFIX;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async message => {

  let UserMessage = message.content;
  let UserCommand = message.content;

  UserMessage = UserMessage.slice(0,2);
  UserCommand = UserCommand.slice(3);

  if (UserMessage == ">h") {
    message.reply("Bot got a command!");
    let tempBotString = "";
    let PoolList = [{TokenName : "the-virtua-kolect", OurPrice : 0.005}, {TokenName : "wiva", OurPrice : 0.023}, 
                    {TokenName : "attack-wagon", OurPrice : 0.0094}, {TokenName : "blockchainspace", OurPrice : 0.03}, 
                    {TokenName : "chain-guardians", OurPrice : 0.07}, {TokenName : "hodooi-com", OurPrice : 0.03}, 
                    {TokenName : "memecoin", OurPrice : 0.3}, {TokenName : "yield-guild-games", OurPrice : 0.09},
                    {TokenName : "burp", OurPrice : 0.0524}];

    if(UserCommand == "pool") {
      for(i=0; i<PoolList.length; i++) {
        let tempAnswer = await QueryPool(PoolList[i].TokenName);
        let ProfitLoss = null;
        if(parseFloat(tempAnswer[0]) >= PoolList[i].OurPrice) {
          ProfitLoss = Number(parseFloat(tempAnswer[0])/PoolList[i].OurPrice*100).toFixed(2);
        }
        
        if(parseFloat(tempAnswer[0]) <= PoolList[i].OurPrice) {
          ProfitLoss = Number((PoolList[i].OurPrice-parseFloat(tempAnswer[0]))/PoolList[i].OurPrice*100).toFixed(2);
          ProfitLoss = ProfitLoss * -1;
        }
        //message.reply(PoolList[i].TokenName + " : " + tempAnswer + " Profit/Loss: " + ProfitLoss + "%");
        tempBotString = tempBotString + PoolList[i].TokenName + String(" : " + Number(tempAnswer[0]).toFixed(5) + " | Profit/Loss: " + ProfitLoss + "%" + " | 24h Volume: " + Number(tempAnswer[1]).toFixed(2) + "$" + "\n");
      }
      message.reply(tempBotString);
    } else if(UserCommand == "poolinfo") {
      message.reply(JSON.stringify(PoolList));
    } else if(UserCommand == "bntil") {
      message.reply("query BNT IL");
    } else if(UserCommand == "help") {
      message.reply("pool, poolinfo, bntil");
    } else {
      message.reply("unknown or missing command");
    }
  }
});

async function QueryPool(CGName) {

  let tempString = [];

  await fetch("https://api.coingecko.com/api/v3/simple/price?ids="+CGName+"&vs_currencies=usd&include_24hr_vol=true")

  .then(function(response) { 
    return response.json(); 
  })
            
  .then(function(data) {
    tempString.push(String(data[CGName].usd));
    tempString.push(String(data[CGName].usd_24h_vol));
  });   
  return tempString;     
}

// Here you can login the bot. It automatically  attempts to login the bot with the environment variable you set for your bot token (either "CLIENT_TOKEN" or "DISCORD_TOKEN")
client.login(process.env.DISCORD_TOKEN);

