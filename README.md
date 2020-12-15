# Salah

Track your prayers with Salah©!

### For contributors

`npm i`
Run this once at the beginning to install required dependancies

`npm i local-cordova -g`
If you don't already have local-cordova, run this command once at the beginning to install a helper tool that allows you to run the locally installed cordova version

`lcordova platform add android`
Run this once at the beginning to install the development tools for Android
development. **Important: You need to have the Android SDK installed beforehand.**

`lcordova platform add ios`
Run this once at the beginning to install the development tools for iOS
development. **Important: You need to have the iOS SDK installed beforehand, which is currently only possible on macOS.**

`lcordova build android`
Run this to build the Android app

`lcordova run android`
Run this to build and deploy the app on an Android device or emulator

`lcordova emulate android`
Run this to build the Android app, as well as install and deploy it on an Android emulator. If a device is connected it will be used, unless an eligible emulator is already running.

test
