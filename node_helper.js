// node_helper.js
const NodeHelper = require("node_helper");
const request = require("request");
const cheerio = require("cheerio");
const moment = require("moment");
let addressCache = {};

module.exports = NodeHelper.create({
  start: function () {
    console.log("MMM-VESAR helper started…");
  },

  lookupAddress: function (address, cb) {
    address = encodeURIComponent(address.trim());
    if (addressCache[address]) {
      return cb(null, addressCache[address]);
    }
    const lookupUrl = `https://vesar.no/umbraco/api/address/search?query=${address}`;
    request.get(
      { url: lookupUrl, json: true, timeout: 5000 },
      (err, res, body) => {
        if (
          err ||
          res.statusCode !== 200 ||
          !Array.isArray(body) ||
          body.length === 0
        ) {
          return cb(new Error("Adresse ikke funnet"));
        }
        const adresseId = body[0].Id || body[0].id;
        addressCache[address] = adresseId;
        cb(null, adresseId);
      }
    );
  },

  _fetchPickupDates: function (adresseId) {
    const self = this;
    const url = `https://vesar.no/umbraco/api/address/pickupdays/?id=${adresseId}`;
    request.get({ url, json: true, timeout: 5000 }, (error, res, body) => {
      if (error || !body || typeof body.html !== "string") {
        console.error("MMM-VESAR: Invalid / pickupdays response", error);
        return self.sendSocketNotification("PICKUP_DATES", {
          error: "Kan ikke hente hentetider",
        });
      }

      // load the returned HTML
      const $ = cheerio.load(body.html);
      const pickupDates = {};

      // for each column in .pickup-dates
      $(".pickup-dates .row .col").each((i, el) => {
        const $el = $(el);
        const imgSrc = $el.find("img").attr("src"); // e.g. "/media/yhjja3d4/matavfall.jpg"
        const type = $el.find("div").first().text().trim(); // e.g. "Matavfall"
        const rawDate = $el.find("h2").text().trim(); // e.g. "tirsdag 05.aug."

        // parse rawDate into a moment object
        // we know Oslo locale is needed
        moment.locale("nb");
        const date = moment(rawDate, "dddd DD.MMM.", "nb");

        // store both the ISO date and the icon path
        pickupDates[type] = {
          date: date.isValid() ? date.toISOString() : null,
          icon: imgSrc,
        };
      });

      self.sendSocketNotification("PICKUP_DATES", pickupDates);
    });
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_PICKUP_DATES") {
      // first do address → ID
      this.lookupAddress(payload, (err, adresseId) => {
        if (err) {
          return this.sendSocketNotification("PICKUP_DATES", {
            error: err.message,
          });
        }
        // then fetch the real pickup dates
        this._fetchPickupDates(adresseId);
      });
    }
  },
});
