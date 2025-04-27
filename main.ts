let latestCommands: { [key: string]: number } = {}
music.setVolume(127)
let mode = 0;
let lastSrValue = 0;
basic.clearScreen()
let lightsOn = false;
let lightsBrightness = false;
let strip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB)
strip.setBrightness(20)

bluetooth.startUartService()

bluetooth.onBluetoothConnected(function () {
})

bluetooth.onBluetoothDisconnected(function () {
    wuKong.setServoSpeed(wuKong.ServoList.S1, 0)
    music.stopAllSounds()
    lightsOn = false
    lightsBrightness = false
    updateLeds()
})

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let command = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    let commadParts = command.split("=")

    latestCommands[commadParts[0]] = parseFloat(commadParts[1])
})

basic.forever(function () {
    while (Object.keys(latestCommands).length) {
        let commandName = Object.keys(latestCommands)[0]
        let commandValue = latestCommands[commandName]
        delete latestCommands[commandName];

        if (commandName == "-v") {
            bluetooth.uartWriteLine('vc;import_start;')
            bluetooth.uartWriteLine('vc;init;')
            bluetooth.uartWriteLine('vc;sl;1;-100;100;1;1;0;1;;')
            bluetooth.uartWriteLine('vc;sr;1;-60;60;1;1;0;0;;')
            bluetooth.uartWriteLine('vc;jrx;-60;60;1;1;0;')
            bluetooth.uartWriteLine('vc;jry;-100;100;1;1;0;')
            bluetooth.uartWriteLine('vc;b;2;0;0;2;')
            bluetooth.uartWriteLine('vc;b;3;1;4;<i class="fa-solid fa-volume-high"></i>;')
            bluetooth.uartWriteLine('vc;b;4;1;0;<i class="fa-solid fa-lightbulb"></i>;')
            bluetooth.uartWriteLine('vc;b;7;1;0;<i class="fa-regular fa-lightbulb"></i>;')
            bluetooth.uartWriteLine('vc;ox;1;-30;30;-60;60;1;1;0;')
            bluetooth.uartWriteLine('vc;oy;0;-30;30;-100;100;1;0;0;')
            bluetooth.uartWriteLine('vc;il;1;')
            bluetooth.uartWriteLine('vc;ir;1;')
            bluetooth.uartWriteLine('vc;show;sl,sr,jr,bl;')
            bluetooth.uartWriteLine('vc;import_end;')

            bluetooth.uartWriteLine('vc;b;4;1;0;')
            bluetooth.uartWriteLine('vc;b;7;1;0;')
            bluetooth.uartWriteLine('vc;sr;1;-60;60;1;0;0;0;;')
            bluetooth.uartWriteLine('vc;srv;0;')
        } else if (commandName == "oy" || commandName == "sl" || commandName == "jry") {
                wuKong.setServoSpeed(wuKong.ServoList.S1, commandValue)
        } else if (commandName == "ox" || commandName == "sr" || commandName == "jrx") {
            let value = commandValue + 180;
            if (mode == 0) {
                if (value >= 120 && value <= 240) {
                    wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S0, value)
                }
            } else if (mode == 1) {
                if (value >= 100 && value <= 260) {
                    lastSrValue = commandValue
                    wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S7, value)
                }
            }
        } else if (commandName == "3") {
            // music.playTone(250, 500)
            music.ringTone(Note.C)
        } else if (commandName == "!3") {
            music.stopAllSounds()
        } else if (commandName == "4") {
            // if (mode == 0) {
            //     mode = 1
            //     bluetooth.uartWriteLine('vc;b;4;1;1;')
            //     bluetooth.uartWriteLine('vc;sr;0;-60;60;1;0;0;0;;')
            //     bluetooth.uartWriteLine(`vc;srv;${lastSrValue}`)
                
            // } else if (mode == 1) {
            //     mode = 0
            //     bluetooth.uartWriteLine('vc;b;4;1;0;')
            //     bluetooth.uartWriteLine('vc;sr;1;-60;60;1;0;0;0;;')
            //     bluetooth.uartWriteLine('vc;srv;0;')
            // }

            // Lights

            if (!lightsOn) {
                lightsOn = true
                lightsBrightness = true
                strip.setBrightness(100)
                bluetooth.uartWriteLine('vc;b;4;1;1;')
            } else {
                if (lightsBrightness) {
                    lightsOn = false
                    bluetooth.uartWriteLine('vc;b;4;1;0;')
                } else {
                    lightsBrightness = true
                    strip.setBrightness(100)
                    bluetooth.uartWriteLine('vc;b;4;1;1;')
                    bluetooth.uartWriteLine('vc;b;7;1;0;')
                }
            }
            updateLeds()
        } else if (commandName == "7") {
            // Lights

            if (!lightsOn) {
                lightsOn = true
                lightsBrightness = false
                strip.setBrightness(20)
                bluetooth.uartWriteLine('vc;b;7;1;1;')
            } else {
                if (!lightsBrightness) {
                    lightsOn = false
                    bluetooth.uartWriteLine('vc;b;7;1;0;')
                } else {
                    lightsBrightness = false
                    strip.setBrightness(20)
                    bluetooth.uartWriteLine('vc;b;7;1;1;')
                    bluetooth.uartWriteLine('vc;b;4;1;0;')
                }
            }
            updateLeds()
        }
    }
})


function updateLeds() {
    if (lightsOn) {
        // wuKong.lightIntensity(1)
        // wuKong.setLightMode(wuKong.LightMode.BREATH)
        strip.setPixelColor(2, 0xFFFFF)
        strip.setPixelColor(3, 0xFFFFF)
    } else {
        // wuKong.setLightMode(wuKong.LightMode.OFF)
        // wuKong.lightIntensity(0)
        strip.setPixelColor(2, 0)
        strip.setPixelColor(3, 0)
        strip.show()
    }

    strip.show()
}