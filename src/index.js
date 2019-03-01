const fs = require("fs")
const superagent = require("superagent")
const cheerio = require("cheerio")
const config = require('./config')

let results = []

async function collectInfo(address) {
  return new Promise((resolve, reject) => {
    superagent.get(address).end((error, response) => {
      let content = response.text
      let $ = cheerio.load(content)
      let result = []
      $(".resblock-list-wrapper li.resblock-list").each((index, item) => {
        let rooms = ''
        $(item).find('.resblock-room span').each((index, room) => {
          room = room.children[0].data
          if(index !== 0) room = ',' + room
          rooms += room 
        })
        result.push({
          name: $(item).find(".resblock-name .name").text(),
          price: $(item).find(".resblock-price .second").text(),
          pricePerMeter: $(item).find('.resblock-price .main-price .number').text(),
          address: $(item).find('.resblock-location a').text(),
          room: rooms,
          area: $(item).find('.resblock-area span').text()
        })
      })
      result = JSON.stringify(result)
      resolve(result)
    })
  })
}

async function run() {
  for (let i = 0; i < config.TOTAL_PAGES; i++) {
    let address = `${config.BASE_URL}${i + 1}/`
    results.push(await collectInfo(address))
  }
  fs.writeFile("data/houses.json", results, "utf-8", error => {
    if (error == null) {
      console.log(
        `${config.TOTAL_PAGES} Pages logged.`
      )
    }
  })
}

run()






