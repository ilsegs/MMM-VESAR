const NodeHelper = require("node_helper");
const request = require("request");
const cheerio = require("cheerio");
const moment = require("moment");

module.exports = NodeHelper.create({
  start: function () {
    console.log("Starting node helper for: " + this.name);
  },

  getPickupDates: function (address) {
    let self = this;
    let url = `https://vesar.no/tommeplan?address=${encodeURIComponent(
      address
    )}`;
    request.get(url, function (error, response) {
      const pickup_dates = {};
      if (error || !response || !response.body) {
        self.sendSocketNotification("PICKUP_DATES", {
          error: "Could not fetch data",
        });
        return;
      }
      const $ = cheerio.load(response.body);

      $("table.pickup-table tr").each((_idx, el) => {
        let category = $(el).find("td:nth-child(1)").text().trim();
        let pickup_date = moment(
          $(el).find("td:nth-child(2)").text().trim(),
          "DD.MM.YYYY"
        );
        if (category && pickup_date.isValid()) {
          pickup_dates[category] = pickup_date;
        }
      });

      if (Object.keys(pickup_dates).length == 0) {
        self.sendSocketNotification("PICKUP_DATES", {
          error: "No pickup dates found",
        });
      } else {
        self.sendSocketNotification("PICKUP_DATES", pickup_dates);
      }
    });
  },

  socketNotificationReceived: function (message, payload) {
    if (message === "GET_PICKUP_DATES") {
      this.getPickupDates(payload);
    }
  },
});
