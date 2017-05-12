# /!\ Before doing anything /!\

This plugin is a fork from [tjwoon's csZBar plugin](https://github.com/tjwoon/csZBar) and 
currently used for personal uses.

The main problem this plugin is trying to solve is the customization of the ZBar layout, like adding button & stuff...

All credit should go to 'tjwoon' for all work before 1.3.3

Thank you.



# ZBar Barcode Scanner Plugin

This plugin integrates with the [ZBar](http://zbar.sourceforge.net/) library,
exposing a JavaScript interface for scanning barcodes (QR, 2D, etc).
In this fork a button has been added to turn off and on device flash. In addition the plugin can now handle the device orientation change.

## Installation

This plug-in is available on npm, be careful of the version.

Install from NPM :

    ionic plugin add cordova-plugin-cszbar-exj

or you can install it from GitHub :
 
    ionic plugin add https://github.com/aNkM/csZBar.git

## API

### Scan barcode

    cloudSky.zBar.scan(params, onSuccess, onFailure)

Arguments:

- **params**: Optional parameters:

    ```javascript
    {
        camera: "front" || "back", // defaults to "back"
        flash: "on" || "off" || "auto", // defaults to "auto". See Quirks
        drawSight: true || false, // defaults to true, create a red sight/line in the center of the scanner view.
        connected: true || false, // defaults to false, triggers the appearance of the login button if false
        askOpen: true || false // shows openDialogPopup if the barcode is an external url
    }
    ```

- **onSuccess**: function (s) {...} _Callback for successful scan._
- **onFailure**: function (s) {...} _Callback for cancelled scan or error._

Return:

- success('scanned bar code') _Successful scan with value of scanned code_
    - _open_ : (String) equals to "true" || "false", inform the app to re-open the scanner
    - _text_ : (String) result of the scan, can be an url or just a number
    - _format_ : (String) format of the scan, can be "QRCODE" || "EAN13" || ...
- error('cancelled') _If user cancelled the scan (with back button etc)_
- error('misc error message') _Misc failure_

Status:

- Android:
    - Layout : in progress
    - Scan : DONE
- iOS:
    - Layout : TODO
    - Scan : DONE


## LICENSE [Apache 2.0](LICENSE.md)

This plugin is released under the Apache 2.0 license, but the ZBar library on which it depends (and which is distribute with this plugin) is under the LGPL license (2.1).


## Thanks

Thank you to @tjwoon, @PaoloMessina and @nickgerman for code contributions before 1.3.3.
