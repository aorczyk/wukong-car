let latestCommands: { [key: string]: number } = {}
let led1 = false;
let led2 = false;

let mode = 0;

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
            bluetooth.uartWriteLine('vc;import_start;')
            bluetooth.uartWriteLine('vc;init;')
            bluetooth.uartWriteLine('vc;sl;1;-100;100;1;1;0;1;;')
            bluetooth.uartWriteLine('vc;sr;1;120;240;1;1;0;0;;')
            bluetooth.uartWriteLine('vc;b;Digit1;1;0;M1;')
            bluetooth.uartWriteLine('vc;b;Digit2;0;0;2;')
            bluetooth.uartWriteLine('vc;ox;1;-45;45;120;240;1;0;0;')
            bluetooth.uartWriteLine('vc;oy;1;-45;45;-100;100;1;0;0;')
            bluetooth.uartWriteLine('vc;il;1;')
            bluetooth.uartWriteLine('vc;ir;1;')
            bluetooth.uartWriteLine('vc;show;sl,sr,br;')
            bluetooth.uartWriteLine('vc;import_end;')
        } else if (commandName == "oy" || commandName == "sl" || commandName == "jry") {
            if (mode == 0) {
                wuKong.setServoSpeed(wuKong.ServoList.S1, commandValue)
            } else if (mode == 1) {
                wuKong.setMotorSpeed(wuKong.MotorList.M1, commandValue)
            }
        } else if (commandName == "ox" || commandName == "sr" || commandName == "jrx") {
            wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S0, commandValue)
        } else if (commandName == "1") {
            if (mode < 1) {
                mode++
            } else {
                mode = 0
            }

            if (mode == 0) {
                bluetooth.uartWriteLine('vc;sl;1;-100;100;1;1;0;1;;')
                bluetooth.uartWriteLine('vc;sr;1;120;240;1;0;0;0;;')
                bluetooth.uartWriteLine('vc;ox;1;-45;45;120;240;1;0;0;')
                bluetooth.uartWriteLine('vc;b;Digit1;1;0;M1;')
            } else if (mode == 1) {
                bluetooth.uartWriteLine('vc;sl;1;-100;100;1;1;0;1;;')
                bluetooth.uartWriteLine('vc;sr;1;150;210;1;0;0;0;;')
                bluetooth.uartWriteLine('vc;ox;1;-45;45;150;210;1;0;0;')
                bluetooth.uartWriteLine('vc;b;Digit1;1;0;M2;')
            }
        } else if (commandName == "2") {

        }
    }
})