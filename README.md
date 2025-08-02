# MMM-VESAR

MagicMirror² module for showing next pickup dates for different types of trash for Vestfold.

## Screenshot

![Example of MMM-Template](./example_1.png)

## Installation

### Install

In your terminal, go to the modules directory and clone the repository:

```bash
cd ~/MagicMirror/modules
git clone [https://github.com/ilsegs/MMM-Vesar]
```

### Update

Go to the module directory and pull the latest changes:

```bash
cd ~/MagicMirror/modules/MMM-Template
git pull
```

## Configuration

To use this module, you have to add a configuration object to the modules array in the `config/config.js` file.

```js
{
 module: "MMM-VESAR",
  position: "top_right",  // or wherever you like
  header: "Mitt avfall",
  config: {
    header: "Tømmeplan"
    address: "Stasjonsveien 1",
    blnLabel: true,
    blnDate: true,
    blnNumberOfDays: false,
    displayIcons: true,
    displayWasteType: true,
    exclusions: ["Restavfall"]
  }
}
```

### Configuration options

| Option             | Possible values | Default           | Description                                        |
| ------------------ | --------------- | ----------------- | -------------------------------------------------- |
| `header`           | `string`        | "Tømmeplan"       | Header text, change or set empty string to remove. |
| `address`          | `string`        | "Stasjonsveien 1" | Change to your own address.                        |
| `blnLabel`         | `string`        | false             | Display label.                                     |
| `blnDate`          | `string`        | false             | Display next pickup date.                          |
| `blnNumberOfDays`  | `string`        | false             | Display number of days until next pickup.          |
| `displayIcons`     | `string`        | true              | Display icons                                      |
| `displayWasteType` | `boolean`       | true              | Display type of waste in text.                     |
| `exclusions`       | `string`        | []                | Waste types to exclude from list.                  |

##### Inspired by:

- https://github.com/blixhavn/MMM-AvfallshentingOslo
- https://github.com/reidarw/MMM-TRV-WastePlan

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
