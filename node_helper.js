// node_helper.js
const NodeHelper = require("node_helper");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const moment = require("moment");
let addressCache = {};

module.exports = NodeHelper.create({
  start() {
    console.log("MMM-VESAR helper started…");
  },

  async lookupAddress(address, cb) {
    address = encodeURIComponent(address.trim());
    if (addressCache[address]) {
      return cb(null, addressCache[address]);
    }
    const lookupUrl = `https://vesar.no/umbraco/api/address/search?query=${address}`;
    try {
      let res = await fetch(lookupUrl, { timeout: 5000 });
      if (!res.ok) throw new Error(res.statusText);
      let body = await res.json();
      if (!Array.isArray(body) || body.length === 0) {
        throw new Error("Adresse ikke funnet");
      }
      const adresseId = body[0].Id || body[0].id;
      addressCache[address] = adresseId;
      cb(null, adresseId);
    } catch (e) {
      cb(new Error(e.message));
    }
  },

  async _fetchPickupDates(adresseId) {
    const self = this;
    const url = `https://vesar.no/umbraco/api/address/pickupdays/?id=${adresseId}`;
    try {
      let res = await fetch(url, { timeout: 5000 });
      if (!res.ok) throw new Error(res.statusText);
      let body = await res.json();
      if (!body || typeof body.html !== "string") {
        throw new Error("Invalid pickupdays response");
      }

      const $ = cheerio.load(body.html);
      const pickupDates = {};

      $(".pickup-dates .row .col").each((i, el) => {
        const $el = $(el);
        const imgSrc = $el.find("img").attr("src");
        const type = $el.find("div").first().text().trim();
        const rawDate = $el.find("h2").text().trim();
        moment.locale("nb");
        const mDate = moment(rawDate, "dddd DD.MMM.", "nb");
        pickupDates[type] = {
          date: mDate.isValid() ? mDate.toISOString() : null,
          icon: imgSrc,
        };
      });

      self.sendSocketNotification("PICKUP_DATES", pickupDates);
    } catch (e) {
      console.error("MMM-VESAR:", e);
      self.sendSocketNotification("PICKUP_DATES", {
        error: "Kan ikke hente hentetider",
      });
    }
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "GET_PICKUP_DATES") {
      this.lookupAddress(payload, (err, id) => {
        if (err) {
          return this.sendSocketNotification("PICKUP_DATES", {
            error: err.message,
          });
        }
        this._fetchPickupDates(id);
      });
    }
  },
});
