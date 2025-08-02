# MMM-VESAR

This is a MagicMirror² module for showing upcoming garbage collection dates for Vestfold.

##### Inspired by:

- https://github.com/blixhavn/MMM-AvfallshentingOslo
- https://github.com/reidarw/MMM-TRV-WastePlan

## Screenshot

![Example of MMM-Template](./example_1.png)

## Installation

### Install

In your terminal, go to the modules directory and clone the repository:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/ilsegs/MMM-Vesar
```

### Update

Go to the module directory and pull the latest changes:

```bash
cd ~/MagicMirror/modules/MMM-Vesar
git pull
```

## Configuration

To use this module, you have to add a configuration object to the modules array in the `config/config.js` file.

```js
{
  module: "MMM-VESAR",
  position: "top_right",
  config: {
    header: "Neste hentedag for avfall",
    address: "Stasjonsveien 1, Horten",
    displayLabel: true,
    displayDate: true,
    displayNumberOfDays: true,
    displayIcons: true,
    displayWasteType: true,
    exclusions: ["Restavfall"]
  }
}
```

### Configuration options

| Option                | Type    | Default                     | Description                                                                                                                                                                                                                                                |
| --------------------- | ------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `header`              | string  | "Neste hentedag for avfall" | Header text. Change or set empty string to remove.                                                                                                                                                                                                         |
| `address`             | string  | "Stasjonsveien 1, Horten"   | Change to your own address and town (use exact formatting as shown). This module is only covering the following areas at the moment: Tønsberg, Horten, Sandefjord, Larvik, Holmestrand, Færder. Check https://vesar.no/ to see if your address is covered. |
| `displayLabel`        | boolean | false                       | Show a human-friendly label (e.g. "today", "tomorrow") for pickup dates.                                                                                                                                                                                   |
| `displayDate`         | boolean | false                       | Show the next pickup date.                                                                                                                                                                                                                                 |
| `displayNumberOfDays` | boolean | false                       | Show number of days until next pickup.                                                                                                                                                                                                                     |
| `displayIcons`        | boolean | true                        | Display icons for each waste type.                                                                                                                                                                                                                         |
| `displayWasteType`    | boolean | true                        | Display the type of waste in text.                                                                                                                                                                                                                         |
| `exclusions`          | array   | []                          | Waste types to exclude from the list.                                                                                                                                                                                                                      |

## Customization

You can easily customize MMM-VESAR to fit your needs:

- **Change address:**  
  Update the `address` field in your config to your street and town (e.g. `"Stasjonsveien 1, Horten"`).  
  Make sure the format matches exactly as used on [vesar.no](https://vesar.no).

- **Show or hide details:**  
  Toggle `displayLabel`, `displayDate`, and `displayNumberOfDays` to show what you prefer (e.g., only show "today", only show dates, etc.).

- **Icons and waste types:**  
  Set `displayIcons` and `displayWasteType` to hide or show icons and text labels.

- **Exclude waste types:**  
  Add types (e.g., `"Restavfall"`) to the `exclusions` array if you don't want them displayed.

- **Translation:**  
  The module supports Norwegian and English out of the box. Set `language: "nb"` or `language: "en"` in your main MagicMirror `config.js` for your preferred language.

- **Styling:**  
  To adjust sizes or colors, edit `MMM-VESAR.css` in the module folder.

## Advanced Modification

For advanced changes (such as supporting other regions, more languages, or custom waste type translations), you can edit the files in the module folder:

- **Change waste type names:**  
  Edit the `wasteTypeTranslations` map in `MMM-VESAR.js` to show custom names for each waste type.

- **Add new translations:**  
  Create translation files in the `translations/` folder (e.g., `nb.json` for Norwegian, `en.json` for English).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
