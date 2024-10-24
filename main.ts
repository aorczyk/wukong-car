let latestCommands: { [key: string]: number } = {}
let led1 = false;
let led2 = false;

basic.clearScreen()

bluetooth.startUartService()

bluetooth.onBluetoothConnected(function () {
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
            bluetooth.uartWriteLine('vc;init;')
            bluetooth.uartWriteLine('vc;sl;1;-100;100;1;1;0;1;;')
            bluetooth.uartWriteLine('vc;sr;1;150;210;1;0;0;0;;')
            bluetooth.uartWriteLine('vc;ox;0;-45;45;-7;7;1;0;0;')
            bluetooth.uartWriteLine('vc;oy;0;-45;45;-7;7;1;0;0;')
            bluetooth.uartWriteLine('vc;il;1;')
            bluetooth.uartWriteLine('vc;ir;1;')
            bluetooth.uartWriteLine('vc;show;sl,sr,br;')
        } else if (commandName == "oy" || commandName == "sl" || commandName == "jry") {
            // wuKong.setMotorSpeed(wuKong.MotorList.M1, commandValue)
            wuKong.setServoSpeed(wuKong.ServoList.S1, commandValue)
        } else if (commandName == "ox" || commandName == "sr" || commandName == "jrx") {
            wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S0, commandValue)
        } else if (commandName == "1") {
            if (led1) {
                wuKong.setLightMode(wuKong.LightMode.OFF)
            } else {
                wuKong.setLightMode(wuKong.LightMode.BREATH)
            }

            led1 = !led1
        } else if (commandName == "2") {
            let myStrip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB)

            if (led2) {
                myStrip.clear()
                myStrip.show()
            } else {
                myStrip.showColor(neopixel.colors(NeoPixelColors.Yellow))
            }

            led2 = !led2
        }
    }
})