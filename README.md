# Salah

Track your prayers with Salah!

[![Mockup](https://media.discordapp.net/attachments/787102126606123038/791381788299362344/132143972_398462931468762_7390489076958054486_n.png?width=679&height=701)]()  
 _For illustration purposes only. Actual app may vary due to enhancements._

### For contributors

**Required**

`npm i`
Run this once at the beginning to install required dependancies

`npm i cordova -g`
If you don't already have Cordova, run this command once at the beginning to install it globally

`cordova platform add android`
Run this once at the beginning to install the development tools for Android
development. **Important: You need to have the Android SDK installed beforehand.**

`cordova platform add ios`
Run this once at the beginning to install the development tools for iOS
development. **Important: You need to have the iOS SDK installed beforehand, which is currently only possible on macOS.**

**To run the application**

`npm run emulate`
Run this to rebundle the projct, as well as rebuild and redeploy the Android app on a running emulator.

`npm run device`
Run this to rebundle the projct, as well as rebuild and redeploy the Android app on a connected Android device.
