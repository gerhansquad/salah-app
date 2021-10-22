# Salah

Pray on time with Salah!

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
