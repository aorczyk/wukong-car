let latestCommands: { [key: string]: number } = {}
music.setVolume(127)
let mode = 0;
let lastSrValue = 0;
basic.clearScreen()
let lightsOn = false;
let lightsBrightness = false;
let lightsBrightnessLevel = 0;
let strip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB)
let acc: number[];
let alarmActive = false;
let oyEnabled = false;

strip.setBrightness(20)

function activateAlarm() {
    let sensitiveness = [
        100,
        100,
        120
    ];

    alarmActive = true;

    acc = [
        input.acceleration(Dimension.X),
        input.acceleration(Dimension.Y),
        input.acceleration(Dimension.Z)
    ]

    control.inBackground(() => {
        while (alarmActive) {
            let accTest = [
                input.acceleration(Dimension.X),
                input.acceleration(Dimension.Y),
                input.acceleration(Dimension.Z)
            ]

            let test = false;

            for (let n=0; n < 3; n++) {
                if (Math.abs(accTest[n] - acc[n]) > sensitiveness[n]) {
                    test = true;
                    break;
                }
            }

            if (test) {
                runAlarm()
                break;
            }

            basic.pause(50)
        }
    })
}

function runAlarm(){
    control.inBackground(() => {
        let time = input.runningTime()

        while (alarmActive && (input.runningTime() - time < 3000)) {
            music.ringTone(Note.C)
            // setLeds(20)

            basic.pause(200)
            
            music.stopAllSounds()
            // setLeds(0)

            basic.pause(200)
        }

        if (alarmActive) {
            activateAlarm()
        }
    })
}

function stopAll() {
    wuKong.setServoSpeed(wuKong.ServoList.S7, 0)
    wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S0, 180)
    music.stopAllSounds()
    lightsOn = false
    lightsBrightness = false
    lightsBrightnessLevel = 0;
    setLeds(0)

    bluetooth.uartWriteLine('vc;b;4;1;0;')
    bluetooth.uartWriteLine('vc;b;7;1;0;')
    bluetooth.uartWriteLine('vc;b;8;1;0;')
    bluetooth.uartWriteLine('vc;sr;1;-60;60;1;0;0;0;;')
    bluetooth.uartWriteLine('vc;srv;0;')
}

bluetooth.startUartService()

bluetooth.onBluetoothConnected(function () {
})

bluetooth.onBluetoothDisconnected(function () {
    stopAll()
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
            bluetooth.uartWriteLine('vc;sl;1;-100;100;1;0;0;1;;')
            bluetooth.uartWriteLine('vc;sr;1;-60;60;1;1;0;0;;')
            bluetooth.uartWriteLine('vc;jrx;-60;60;1;1;0;')
            bluetooth.uartWriteLine('vc;jry;-100;100;1;1;0;')
            bluetooth.uartWriteLine('vc;b;w;1;0;<i class="fa-solid fa-arrows-up-down"></i>;')
            bluetooth.uartWriteLine('vc;b;a;0;0;A;')
            bluetooth.uartWriteLine('vc;b;d;0;0;D;')
            bluetooth.uartWriteLine('vc;b;s;0;0;S;')
            bluetooth.uartWriteLine('vc;b;2;0;')
            bluetooth.uartWriteLine('vc;b;3;0;')
            bluetooth.uartWriteLine('vc;b;1;1;4;<i class="fa-solid fa-volume-high"></i>;')
            bluetooth.uartWriteLine('vc;b;2;1;1;<i class="fa-solid fa-lock-open"></i>;')
            bluetooth.uartWriteLine('vc;b;4;1;0;<i class="fa-regular fa-lightbulb"></i>;')
            bluetooth.uartWriteLine('vc;b;7;1;0;<i class="fa-solid fa-lightbulb"></i>;')
            bluetooth.uartWriteLine('vc;b;8;1;0;<i class="fa-solid fa-sun"></i>;')
            bluetooth.uartWriteLine('vc;ox;1;-30;30;-60;60;1;0;0;')
            bluetooth.uartWriteLine('vc;oy;1;-30;30;-100;100;1;0;0;')
            bluetooth.uartWriteLine('vc;il;1;')
            bluetooth.uartWriteLine('vc;ir;1;')
            bluetooth.uartWriteLine('vc;show;sl,sr,jr,al,br,bl;')
            bluetooth.uartWriteLine('vc;import_end;')

            stopAll()

            if (!alarmActive) {
                bluetooth.uartWriteLine('vc;b;2;1;1;<i class="fa-solid fa-lock-open"></i>;')
            } else {
                bluetooth.uartWriteLine('vc;b;2;1;4;<i class="fa-solid fa-lock"></i>;')
            }
        } else if (commandName == "STOP" || commandName == "PLAY_DONE") {
            stopAll()
        } else if (commandName == "2") {
            alarmActive = !alarmActive
            if (alarmActive) {
                activateAlarm()
                bluetooth.uartWriteLine('vc;b;2;1;4;<i class="fa-solid fa-lock"></i>;')
            } else {
                bluetooth.uartWriteLine('vc;b;2;1;1;<i class="fa-solid fa-lock-open"></i>;')
            }
        } else if (alarmActive) {
            return
        } else if ((oyEnabled && commandName == "oy") || commandName == "sl" || commandName == "jry") {
            wuKong.setServoSpeed(wuKong.ServoList.S7, commandValue)
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
        } else if (commandName == "1") {
            music.ringTone(Note.C)
        } else if (commandName == "!1") {
            music.stopAllSounds()
        } else if (commandName == "4") {
            setBrightness(20, 4)
        } else if (commandName == "7") {
            setBrightness(100,7)
        } else if (commandName == "8") {
            setBrightness(255, 8)
        } else if (commandName == "w") {
            oyEnabled = true
        } else if (commandName == "!w") {
            oyEnabled = false
            wuKong.setServoSpeed(wuKong.ServoList.S7, 0)
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

function setLeds(brightness = 0, color = 0xFFFFF) {
    if (brightness) {
        strip.setBrightness(brightness)
        strip.setPixelColor(2, color)
        strip.setPixelColor(3, color)
    } else {
        strip.setPixelColor(2, 0)
        strip.setPixelColor(3, 0)
        strip.show()
    }

    strip.show()

    return brightness
}

function setBrightness(brightness:number, buttonNr:number){
    const buttonBrightness: { [key: number]: number } = {
        20: 4,
        100: 7,
        255: 8,
    };

    if (lightsBrightnessLevel == brightness) {
        lightsBrightnessLevel = setLeds(0)
        bluetooth.uartWriteLine(`vc;b;${buttonNr};1;0;`)
    } else {
        if (lightsBrightnessLevel) {
            bluetooth.uartWriteLine(`vc;b;${buttonBrightness[lightsBrightnessLevel]};1;0;`)
        }
        lightsBrightnessLevel = setLeds(brightness)
        bluetooth.uartWriteLine(`vc;b;${buttonNr};1;1;`)
    }
}