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
    let PoolList = [{TokenName : "the-virtua-kolect", OurPrice : 0.005, TokenTicker : "TVK"}, {TokenName : "wiva", OurPrice : 0.023, TokenTicker : "WIV"}, 
                    {TokenName : "attack-wagon", OurPrice : 0.0094, TokenTicker : "ATK"}, {TokenName : "blockchainspace", OurPrice : 0.03, TokenTicker : "GUILD"}, 
                    {TokenName : "chain-guardians", OurPrice : 0.07, TokenTicker : "CGG"}, {TokenName : "hodooi-com", OurPrice : 0.03, TokenTicker : "HOD"}, 
                    {TokenName : "memecoin", OurPrice : 0.3, TokenTicker : "MEM"}, {TokenName : "yield-guild-games", OurPrice : 0.09, TokenTicker : "YGG"},
                    {TokenName : "burp", OurPrice : 0.0524, TokenTicker : "BURP"}];

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

        let DailyVolume = Number(tempAnswer[1]).toFixed(0);
        
        function kFormatter(num) {
          return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'k' : Math.sign(num)*Math.abs(num)
        }

        DailyVolume = kFormatter(DailyVolume);
        
        //message.reply(PoolList[i].TokenName + " : " + tempAnswer + " Profit/Loss: " + ProfitLoss + "%");
        tempBotString = tempBotString + "**"+PoolList[i].TokenTicker+"**:" + "\n" + String(Number(tempAnswer[0]).toFixed(4) + "$ | P/L: " + ProfitLoss + "%" + " | " + "24h %: " + Number(tempAnswer[2]).toFixed(2) + "%" + " | 24h Vol: " + DailyVolume + "$" + "\n");
      }
      message.reply(tempBotString);

    } else if(UserCommand == "poolinfo") {
      message.reply(JSON.stringify(PoolList));

    } else if(UserCommand == "bntil") {
      message.reply("query BNT IL");
      let BancorMasterVault = await MastervaultQuery();
      let bnDaiArray = await EtherscanQuery("0x06CD589760Da4616a0606da1367855808196C352"); //contract address of bnDai
      let bnLinkArray = await EtherscanQuery("0x516c164A879892A156920A215855C3416616C46E");
      await sleep(2005);
      let bnwBTCArray = await EtherscanQuery("0x2CE37087559CBe8022FA5D70A0c502B7AE03F290");
      

      let bnDaiLoss = null;
      let bnwBTCLoss = null;
      let bnLinkLoss = null;

      for(j=0; j<BancorMasterVault.length; j++) {
        if(BancorMasterVault[j].Name == "Dai") {
          bnDaiLoss = BancorMasterVault[j].MasterSupply;
          bnDaiLoss = Number(bnDaiLoss / bnDaiArray.TotalSupply * 100).toFixed(2);
        }
        if(BancorMasterVault[j].Name == "Chainlink") {
          bnLinkLoss = BancorMasterVault[j].MasterSupply;
          bnLinkLoss = Number(bnLinkLoss / bnLinkArray.TotalSupply * 100).toFixed(2);
        }
        if(BancorMasterVault[j].Name == "Wrapped Bitcoin") {
          bnwBTCLoss = BancorMasterVault[j].MasterSupply;
          bnwBTCLoss = Number(bnwBTCLoss / bnwBTCArray.TotalSupply * 100).toFixed(2);
        }
      }

      message.reply("**Bancor Impermanent Loss**\nDai:" + bnDaiLoss + "% & "+ bnDaiArray.Holders +" Holders\nLink:" + bnLinkLoss + "% & "+ bnLinkArray.Holders +" Holders\nwBTC:" + bnwBTCLoss + "% & "+ bnwBTCArray.Holders +" Holders\n");

    } else if(UserCommand == "help") {
      message.reply("pool, poolinfo, bntil");

    } else {
      message.reply("unknown or missing command");
    }
  }
});

async function QueryPool(CGName) {

  let tempString = [];

  await fetch("https://api.coingecko.com/api/v3/simple/price?ids="+CGName+"&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true")

  .then(function(response) { 
    return response.json(); 
  })
            
  .then(function(data) {
    tempString.push(String(data[CGName].usd));
    tempString.push(String(data[CGName].usd_24h_vol));
    tempString.push(String(data[CGName].usd_24h_change));
  });   
  return tempString;     
}

async function EtherscanQuery(ContractAddress) {
  let tempEtherArray = [];

  await fetch("https://api.ethplorer.io/getTokenInfo/"+ContractAddress+"?apiKey=freekey")

  .then(function(response) { 
    return response.json(); 
  })
            
  .then(function(data) {
    console.log(data);
    let tempTotalSupply = Number(WeiConverter(data.totalSupply)).toFixed(4);
    tempEtherArray.push({Name : data.name, TotalSupply : tempTotalSupply, Holders : data.holdersCount});
  });   
  return tempEtherArray;   
}

async function MastervaultQuery() {
  let tempMasterArray = [];

  await fetch("https://api.ethplorer.io/getAddressInfo/0x649765821d9f64198c905ec0b2b037a4a52bc373?apiKey=freekey")

  .then(function(response) { 
    return response.json(); 
  })
            
  .then(function(data) {
    for(i=0; i<data.tokens.length; i++) {
      let tempValue = Number(WeiConverter(data.tokens[i].rawBalance)).toFixed(4);
      tempMasterArray.push({Name : data.tokens[i].tokenInfo.name, MasterSupply : tempValue});
    }
  });   
  return tempMasterArray;  
}

function WeiConverter(a) {
  a = a.slice(0,a.length - 18) + "." + a.slice(a.length - 18, a.length);
  return a;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Here you can login the bot. It automatically  attempts to login the bot with the environment variable you set for your bot token (either "CLIENT_TOKEN" or "DISCORD_TOKEN")
client.login(process.env.DISCORD_TOKEN);

