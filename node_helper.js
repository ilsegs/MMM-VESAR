const NodeHelper = require("node_helper");
const request = require("request");
const moment = require("moment");

module.exports = NodeHelper.create({
  start: function () {
    console.log("Starting node helper for: " + this.name);
  },

  getPickupDates: function (address) {
    let self = this;
    // Step 1: Search for the address to get the ID
    const searchUrl = `https://vesar.no/umbraco/api/address/search/?term=${encodeURIComponent(
      address
    )}`;
    request.get(
      { url: searchUrl, json: true },
      function (error, response, body) {
        if (error || !body || !Array.isArray(body) || body.length === 0) {
          self.sendSocketNotification("PICKUP_DATES", {
            error: "Could not find address in VESAR system",
          });
          return;
        }
        // Pick the first result (you could do fuzzy matching if you want)
        const addr = body[0];
        const id = addr.Id || addr.id;
        if (!id) {
          self.sendSocketNotification("PICKUP_DATES", {
            error: "Could not get address ID",
          });
          return;
        }

        // Step 2: Fetch pickup dates JSON
        const pickupUrl = `https://vesar.no/umbraco/api/address/pickupdays/?id=${id}`;
        request.get(
          { url: pickupUrl, json: true },
          function (err2, resp2, pickupBody) {
            if (err2 || !pickupBody || !pickupBody.html) {
              self.sendSocketNotification("PICKUP_DATES", {
                error: "Could not fetch pickup dates",
              });
              return;
            }
            // Parse the HTML block in pickupBody.html
            const cheerio = require("cheerio");
            const $ = cheerio.load(pickupBody.html);

            const pickup_dates = {};
            $(".pickup-dates .col").each((_idx, el) => {
              let category = $(el).find("div").first().text().trim();
              let dateText = $(el).find("h2.header-2").text().trim();
              // Parse date (e.g. "mandag 04.aug.")
              let dateMatch = dateText.match(/(\d{2})\.(\w{3})\./);
              let monthMap = {
                jan: "01",
                feb: "02",
                mar: "03",
                apr: "04",
                mai: "05",
                jun: "06",
                jul: "07",
                aug: "08",
                sep: "09",
                okt: "10",
                nov: "11",
                des: "12",
              };
              let dateIso = null;
              if (dateMatch) {
                let day = dateMatch[1];
                let mon = monthMap[dateMatch[2].toLowerCase()];
                let year = moment().year();
                // If the month is before the current month, it’s probably next year
                let nowMonth = moment().month() + 1;
                if (parseInt(mon) < nowMonth) year += 1;
                dateIso = `${year}-${mon}-${day}`;
              }
              let icon = $(el).find("img").attr("src");
              if (icon && icon.startsWith("/")) {
                icon = "https://vesar.no" + icon;
              }
              if (category && dateIso) {
                pickup_dates[category] = {
                  date: dateIso,
                  icon: icon,
                };
              }
            });

            if (Object.keys(pickup_dates).length == 0) {
              self.sendSocketNotification("PICKUP_DATES", {
                error: "No pickup dates found",
              });
            } else {
              self.sendSocketNotification("PICKUP_DATES", pickup_dates);
            }
          }
        );
      }
    );
  },

  socketNotificationReceived: function (message, payload) {
    if (message === "GET_PICKUP_DATES") {
      this.getPickupDates(payload);
    }
  },
});
