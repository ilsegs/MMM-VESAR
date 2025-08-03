Module.register("MMM-VESAR", {
  defaults: {
    header: "Neste hentedag for avfall",
    address: "Stasjonsveien 1, Horten",

    // Date formatting
    useHumanFormat: "by_week", // "by_week" or "strict"
    dateFormat: "dddd Do MMM", // fallback format

    // Display options
    displayNumberOfDays: true, // show "(2 dager)"
    displayDate: false,
    showHeader: true,
    displayIcons: true,
    displayWasteType: true,
    exclusions: [],
    minWidth: 120,

    // Refresh
    updateInterval: 6 * 60 * 60 * 1000, // 6h
    animationSpeed: 1000,
  },

  getTranslations() {
    return {
      en: "translations/en.json",
      nb: "translations/nb.json",
    };
  },

  getScripts() {
    return ["moment.js"];
  },

  getStyles() {
    return ["MMM-VESAR.css"];
  },

  start() {
    this.pickupDates = {};
    this.loaded = false;
    this.getData();
    this.scheduleUpdate();
  },

  scheduleUpdate() {
    setInterval(() => this.getData(), this.config.updateInterval);
  },

  getData() {
    this.sendSocketNotification("GET_PICKUP_DATES", this.config.address);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "PICKUP_DATES") {
      this.pickupDates = payload;
      this.loaded = true;
      this.updateDom(this.config.animationSpeed);
    }
  },

  getNumberOfDaysLabel(today, pickUpDate) {
    let days = pickUpDate.diff(today, "days");
    let label = this.translate(days === 1 ? "day" : "days");
    if (days === 0) {
      return this.translate("today");
    }
    return `${days} ${label}`;
  },

  getDateString(dateIso) {
    const dateObj = moment(dateIso);
    const now = moment();
    if (dateObj.isSame(now, "day")) {
      return this.translate("today");
    }
    if (dateObj.diff(now.startOf("day"), "days") === 1) {
      return this.translate("tomorrow");
    }

    if (this.config.useHumanFormat === "by_week") {
      const weekDiff = dateObj.week() - now.week();
      if (weekDiff === 0) {
        return dateObj.format("dddd");
      }
      if (weekDiff === 1) {
        const dayName = dateObj.format("dddd");
        const nextDowTemplate = this.translate("next_dow");
        return nextDowTemplate.replace("{day}", dayName);
      }
    } else if (this.config.useHumanFormat === "strict") {
      const daysUntil = dateObj.diff(now, "days");
      if (daysUntil < 7) {
        return dateObj.format("dddd");
      }
    }
    return dateObj.format(this.config.dateFormat);
  },

  // Loader for icons
  getImage(iconPath) {
    const img = document.createElement("img");
    img.src = iconPath;
    img.className = "vesar-icon";
    img.alt = "";
    return img;
  },

  getDom() {
    moment.locale("nb"); // Norwegian Bokmål
    const wrapper = document.createElement("div");
    wrapper.style.minWidth = this.config.minWidth + "px";

    // loading or error
    if (!this.loaded) {
      wrapper.innerHTML = this.translate("loading") + "...";
      wrapper.className = "dimmed light small";
      return wrapper;
    }
    if (this.pickupDates.error) {
      wrapper.innerHTML = `<span class="bright small">${this.pickupDates.error}</span>`;
      return wrapper;
    }

    // Header
    if (this.config.showHeader) {
      const hdr = document.createElement("div");
      hdr.innerHTML = this.config.header;
      hdr.className = "light small";
      wrapper.appendChild(hdr);
    }

    // Table
    const table = document.createElement("table");
    for (let [type, info] of Object.entries(this.pickupDates)) {
      // exclusions
      if (
        this.config.exclusions
          .map((e) => e.toLowerCase())
          .includes(type.toLowerCase())
      )
        continue;

      const row = document.createElement("tr");
      row.className = "medium";

      // Icon
      if (this.config.displayIcons && info.icon) {
        const td = document.createElement("td");
        td.appendChild(this.getImage(info.icon));
        row.appendChild(td);
      }

      // Waste type
      if (this.config.displayWasteType) {
        const td = document.createElement("td");
        td.className = "align-left small wasteType light";
        td.innerHTML = type;
        row.appendChild(td);
      }

      // Date cell
      const dateCell = document.createElement("td");
      const m = moment(info.date);

      let daysLabel = "";
      let dateLabel = "";
      if (this.config.displayNumberOfDays) {
        daysLabel = this.getNumberOfDaysLabel(moment().startOf("day"), m);
      }
      if (this.config.displayDate || !this.config.displayNumberOfDays) {
        dateLabel = this.getDateString(info.date);
      } else {
        dateLabel = m.format(this.config.dateFormat);
      }

      // Compose cell: daysLabel first, then dateLabel below
      dateCell.className = "date";
      dateCell.innerHTML = `<div class="daysLabel">${daysLabel}</div><div class="dateLabel">${dateLabel}</div>`;
      row.appendChild(dateCell);

      // dim past
      if (m.isBefore(moment().startOf("day"))) {
        row.classList.add("dimmed");
      }

      table.appendChild(row);
    }

    wrapper.appendChild(table);
    return wrapper;
  },
});
