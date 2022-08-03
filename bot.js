// intall node.js
// https://github.com/nodesource/distributions/blob/master/README.md

// npm init --yes
// npm install axios --save
// npm install telegraf
// npm install node-fetch --save
//
// "type": "module",
// in the package.json
// source: https://pprathameshmore.medium.com/top-level-await-support-in-node-js-v14-3-0-8af4f4a4d478

import axios from "axios";
import { Telegraf } from "telegraf";
import { token } from "./tokens.js";
import { PNZaddress } from "./tokens.js";

// I am in EU, so I want to separate thousands with "." and not with ","; so I choose DE format
var formatter0 = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

var formatter2 = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

///////////////////FUNCTIONS//////////////////

function price0digits(pick) {
  let priceF = formatter0.format(pick["data"]["last"]);
  return priceF;
}

function price2digit(pick) {
  // works with api.pro.coinbase.com/products/.../stats
  let priceF = formatter2.format(pick["data"]["last"]);
  return priceF;
}

///////////////////TELEGRAF///////////////////

if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(token);

// Commands name are case sensitive and must be lowercase because of BOTFATHER commands list

bot.start((context) => {
  console.log("PNZ priceBOT ACTIVATED! 🎩");
  context.reply("PNZ priceBOT ACTIVATED! 🎩");
});

bot.command("time", (context) => {
  context.reply("THIS IS A TEST COMMAND. DOES IT UPDATES?");
  async function testTime() {
    let pick = await axios("http://date.jsontest.com/");
    let data = pick["data"];
    let date = data["date"];
    let time = data["time"];
    console.log("today:", date, "- time:", time);
    context.reply(`today is ${date} and it's ${time} UTC`);
  }
  testTime();
});

bot.command("eth", (context) => {
  async function ETHprice() {
    let pick = await axios(
      `https://api.pro.coinbase.com/products/ETH-usd/stats`
    ).catch(function (error) {
      if (error.response) {
        context.reply(`ERROR ${error.response.status}`);
      } else if (error.request) {
        context.reply(error.request);
      } else {
        context.reply("ERROR", error.message);
      }
    });
    if (pick === undefined) {
      return;
    } else {
      let priceF = price2digit(pick);
      context.reply(`ETH price: ${priceF}`);
    }
  }
  ETHprice();
});

bot.command("btc", (context) => {
  async function BTCprice() {
    let pick = await axios(
      `https://api.pro.coinbase.com/products/BTC-usd/stats`
    ).catch(function (error) {
      if (error.response) {
        context.reply(`ERROR ${error.response.status}`);
      } else if (error.request) {
        context.reply(error.request);
      } else {
        context.reply("ERROR", error.message);
      }
    });
    if (pick === undefined) {
      return;
    } else {
      let priceF = price2digit(pick);
      context.reply(`BTC price: ${priceF}`);
    }
  }
  BTCprice();
});

bot.command("avax", (context) => {
  async function AVAXprice() {
    let pick = await axios(
      `https://api.pro.coinbase.com/products/AVAX-usd/stats`
    ).catch(function (error) {
      if (error.response) {
        context.reply(`ERROR ${error.response.status}`);
      } else if (error.request) {
        context.reply(error.request);
      } else {
        context.reply("ERROR", error.message);
      }
    });
    if (pick === undefined) {
      return;
    } else {
      let priceF = price2digit(pick);
      context.reply(`AVAX price: ${priceF}`);
    }
  }
  AVAXprice();
});

// A command to rule them all, a command to find them...

bot.command("ethbtc", (context) => {
  async function ALLprice() {
    // get BTC price
    let pickBTC = await axios(
      `https://api.pro.coinbase.com/products/BTC-usd/stats`
    ).catch(function (error) {
      if (error.response) {
        context.reply(`ERROR ${error.response.status}`);
      } else if (error.request) {
        context.reply(error.request);
      } else {
        context.reply("ERROR", error.message);
      }
    });
    let priceFBTC = price0digits(pickBTC);
    // get ETH price
    let pickETH = await axios(
      `https://api.pro.coinbase.com/products/ETH-usd/stats`
    ).catch(function (error) {
      if (error.response) {
        context.reply(`ERROR ${error.response.status}`);
      } else if (error.request) {
        context.reply(error.request);
      } else {
        context.reply("ERROR", error.message);
      }
    });
    let priceFETH = price0digits(pickETH);
    // calculate BTC's price in ETH
    let priceBTC = pickBTC["data"]["last"];
    let priceETH = pickETH["data"]["last"];
    let inBTC = priceBTC / priceETH;
    inBTC = inBTC.toFixed(2);
    // send response
    context.reply(
      `ETH price: ${priceFETH}\nBTC price: ${priceFBTC}\n1BTC = ${inBTC}ETH`
    );
  }
  ALLprice();
});

// NFTS commands
// Declare preferred NFTs slug for "nfts" BOT command
const BAYC = { ticker: "BAYC", slug: "boredapeyachtclub" };
const MAYC = { ticker: "MAYC", slug: "mutant-ape-yacht-club" };
const DOODLES = { ticker: "DOODLES", slug: "doodles-official" };
const SPACEDOODLES = { ticker: "SPACEDOODLES", slug: "space-doodles-official" };

// Command for having preferred floor price response
bot.command("nfts", (context) => {
  async function callfloor(slug) {
    let priceoutput = [];
    for (slug of arguments) {
      let result = await axios(
        `https://api.opensea.io/api/v1/collection/${slug.slug}/stats`
      ).catch(function (error) {
        if (error.response) {
          context.reply(`ERROR ${error.response.status}`);
        } else if (error.request) {
          context.reply(error.request);
        } else {
          context.reply("ERROR", error.message);
        }
      });
      if (result === undefined) {
        return;
      } else {
        let data = result["data"];
        let stats = data["stats"];
        let floor_price = stats["floor_price"];
        priceoutput.push(floor_price);
      }
      // sent FP values:
    }
    context.reply(
      `${arguments[0].ticker}: ${priceoutput[0]} ETH\n${arguments[1].ticker}: ${priceoutput[1]} ETH\n${arguments[2].ticker}: ${priceoutput[2]} ETH\n${arguments[3].ticker}: ${priceoutput[3]} ETH`
    );
  }
  // if n arguments are added, must increase the context.reply (↑) response with more [n]
  callfloor(BAYC, MAYC, DOODLES, SPACEDOODLES);
});

// CUSTOM SLUG FLOOR COMMAND
const cmdfloor = ["/floor"];
bot.command(`floor`, (context) => {
  // read message and decode it into a slug
  let message = context.message.text.split(` `);
  message.shift();
  let OPENSEAslug = message.join(` `);
  // the slug is a part of a URL: it must be lowercase
  OPENSEAslug = OPENSEAslug.toLowerCase();

  // if command /floor is sent empty, explain how to use it
  const comm = context.message.text;
  if (OPENSEAslug.length == 0) {
    context.reply(
      `Need to indicate an OpenSea collection's slug after ${cmdfloor}.\ne.g. 👇\n${cmdfloor} otherdeed\nDon't know what a slug is? use /slug`
    );
  }
  async function callfloor(slug) {
    let result = await axios(
      `https://api.opensea.io/api/v1/collection/${slug}/stats`
    ).catch(function (error) {
      if (error.response) {
        if (OPENSEAslug.length > 0) {
          context.reply(
            `ERROR ${error.response.status}\n"${OPENSEAslug}" is not a valid slug`
          );
        }
      } else if (error.request) {
        context.reply(error.request);
      } else {
        context.reply("ERROR", error.message);
      }
    });
    if (result === undefined) {
      return;
    } else if (OPENSEAslug === "cryptopunks") {
      context.reply(
        "Sorry, cryptopunks are not managed by OpenSea;\nyou have to visit https://cryptopunks.app/"
      );
    } else {
      let data = result["data"];
      let stats = data["stats"];
      let floor_price = stats["floor_price"];
      if (floor_price === null) {
        context.reply(`"${OPENSEAslug}" has a "null" floor price`);
      } else {
        floor_price = floor_price.toFixed(2);
        context.reply(`${OPENSEAslug} = ${floor_price} ETH floor price`);
      }
    }
  }
  callfloor(OPENSEAslug);
});

const cmdfloorURL = ["/floorurl"];
bot.command(`floorurl`, (context) => {
  // read message and decode it into a slug
  let message = context.message.text.split(` `);
  message.shift();
  let OPENSEAslug = message.join(` `);
  // the slug is a part of a URL: it must be lowercase
  OPENSEAslug = OPENSEAslug.toLowerCase();

  // if command /floor is sent empty, explain how to use it
  const comm = context.message.text;
  if (OPENSEAslug.length == 0) {
    context.reply(
      `Need to indicate an OpenSea collection's slug after ${cmdfloorURL}.\ne.g. 👇\n${cmdfloorURL} otherdeed\nDon't know what a slug is? use /slug`
    );
  }
  async function callfloor(slug) {
    let result = await axios(
      `https://api.opensea.io/api/v1/collection/${slug}/stats`
    ).catch(function (error) {
      if (error.response) {
        if (OPENSEAslug.length > 0) {
          context.reply(
            `ERROR ${error.response.status}\n"${OPENSEAslug}" is not a valid slug`
          );
        }
      } else if (error.request) {
        context.reply(error.request);
      } else {
        context.reply("ERROR", error.message);
      }
    });
    if (result === undefined) {
      return;
    } else if (OPENSEAslug === "cryptopunks") {
      context.reply(
        "Sorry, cryptopunks are not managed by OpenSea;\nyou have to visit https://cryptopunks.app/"
      );
    } else {
      let data = result["data"];
      let stats = data["stats"];
      let floor_price = stats["floor_price"];
      if (floor_price === null) {
        context.reply(`"${OPENSEAslug}" has a "null" floor price`);
      } else {
        floor_price = floor_price.toFixed(2);
        context.reply(
          `${OPENSEAslug} = ${floor_price} ETH floor price\nhttps://opensea.io/collection/${slug}`
        );
      }
    }
  }
  callfloor(OPENSEAslug);
});

// explain what is an OpenSea slug:
const SlugExplanation = `slug =  a slug is the part that comes at the very end of a URL and refers to the unique key that identifies a specific collection on OpenSea.\nTo find it look at end of the OpenSea URL.\ne.g. the Bored Ape Yacht Club's URL is https://openseaDOTio/collection/boredapeyachtclub\nSo the slug is boredapeyachtclub\nYou wanna see some of the most used slug? use /commonslug`;
bot.command("slug", (context) => {
  context.reply(`${SlugExplanation}`);
});

// return most used OS slug
bot.command("commonslug", (context) => {
  context.reply(
    `here you have some slugs to use after /floor command, easy to copypasta\ne.g.\n${cmdfloor} otherdeed\n🎩 👇`
  );
  setTimeout(() => {
    context.reply(BAYC.slug);
    context.reply(MAYC.slug);
    context.reply(`otherdeed`);
    context.reply(DOODLES.slug);
    context.reply(`the-dooplicator`);
    context.reply(`invisiblefriends`);
    context.reply(`bokinftofficial`);
    context.reply(`projectisekaimeta`);
  }, 300);
});

bot.command("info", (context) => {
  context.reply(
    `@pnz0x has made this bot with love and JS! 💙\nConsider dontating to\n${PNZaddress}\nThanks 🎩`
  );
});

bot.launch();
