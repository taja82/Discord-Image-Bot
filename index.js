const Discord = require('discord.js');
const moment = require('moment');
const cheerio = require('cheerio');
const axios = require("axios");
const token = require('./token.json');
const client = new Discord.Client();
const root_url = "https://safebooru.org";
const load_thumbnail_img = false;
let url;
async function getHTML(url) {
  try {
    return await axios.get(url);
  } catch (error) {
    console.log(error);
  }
}
const timer = function () { };
timer.prototype = {
  start: function () {
    this._time = moment(new Date().getTime());
  },
  end: function () {
    return moment(new Date().getTime()).diff(this._time);
  }
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
const t = new timer;
client.on('message', msg => {
  let content = msg.content;

  if (content[0] === "!") {
    content = msg.content.trim().toLowerCase().slice(1);
    let command = content.split(" ")[0];
    let val = content.split(" ")[1];
    console.log(command);
    //console.log(content);
    if (command === "help") {
      msg.reply("help, ping\n현재 이미지 사이즈가 크면 미리보기가 안뜨는 문제가 있습니다.");
    }
    if (command === "ping") {
      msg.reply("pong");
    }
    if (command === "random") {
      if (val != null) {
        if (/[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*/g.test(val) == true) {
          t.start();
          url = "https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=" + val + "&limit=1";
          getHTML(url).then(html => {
            let $ = cheerio.load(html.data, { xmlMode: true });
            const $page_info = $("posts").attr("count");
            if ($page_info != 0) {
              /*const pid = Math.floor((parseInt($page_info) - 1) / 100);
              let page_random = getRandomInt(1, pid);
              console.log(page_random);*/
              let page_random = getRandomInt(1,(parseInt($page_info-1)));
              console.log(page_random);
              url += "&pid=" + page_random;
              getHTML(url).then(html => {
                $ = cheerio.load(html.data, { xmlMode: true });
                /*let post_random = getRandomInt(0, 99);
                console.log(post_random);
                const post_num = $("post").eq(post_random);*/
                const post_num = $("post");
                const image_url = post_num.attr("file_url");
                //const image_url = post_num.attr("sample_url");
                const preview_url = post_num.attr("preview_url");
                const img_width = post_num.attr("sample_width");
                const img_height = post_num.attr("sample_height");
                console.log(img_width + " * " + img_height);
                let display_img;
                if (!load_thumbnail_img) {
                  display_img = image_url;
                } else {
                  display_img = preview_url;
                }
                msg.channel.send({
                  embed: {
                    color: 3447003,
                    author: {
                      name: client.user.username,
                      icon_url: client.user.avatarURL
                    },
                    title: "링크",
                    url: image_url,
                    description: val,
                    image: {
                      url: display_img,
                      width:100
                    },
                    footer: {
                      text: t.end() + "ms"
                    }
                  }
                });
              });
            } else {
              msg.reply("검색 결과가 없는듯...?")
            }
          });
        } else {
          msg.reply("명령어 형식에 맞지 않는듯...?")
        }
      } else {
        msg.reply("값을 안 입력 하신듯...?")
      }
    }
  }
});
client.login(token.token);