let latestCommands: { [key: string]: number } = {}
let led1 = false;
let led2 = false;

let mode = 0;

const modeToButton: { [key: number]: number } = {
    0: 3,
    1: 4,
    2: 7,
    3: 8
};

function switchMode(newMode: number) {
    bluetooth.uartWriteLine('vc;b;' + modeToButton[mode] + ';1;0;')
    mode = newMode
    // if (mode < 2) {
    //     mode++
    // } else {
    //     mode = 0
    // }

    bluetooth.uartWriteLine('vc;b;' + modeToButton[newMode] + ';1;1;')
}

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
            bluetooth.uartWriteLine('vc;sr;1;-60;60;10;1;0;0;;')
            bluetooth.uartWriteLine('vc;jrx;-60;60;10;1;0;')
            bluetooth.uartWriteLine('vc;jry;-100;100;1;0;0;')
            bluetooth.uartWriteLine('vc;b;Digit1;1;0;<i class="fa-solid fa-volume-high"></i>;')
            bluetooth.uartWriteLine('vc;b;Digit2;0;0;2;')
            // bluetooth.uartWriteLine('vc;b;Digit3;1;0;M1;')
            // bluetooth.uartWriteLine('vc;b;Digit4;0;0;4;')

            bluetooth.uartWriteLine('vc;b;3;1;1;W;')
            bluetooth.uartWriteLine('vc;b;4;1;0;L;')
            bluetooth.uartWriteLine('vc;b;7;1;0;P;')
            bluetooth.uartWriteLine('vc;b;8;1;0;K;')

            bluetooth.uartWriteLine('vc;ox;1;-30;30;-60;60;10;1;0;')
            bluetooth.uartWriteLine('vc;oy;0;-30;30;-100;100;10;0;0;')
            bluetooth.uartWriteLine('vc;il;1;')
            bluetooth.uartWriteLine('vc;ir;1;')
            bluetooth.uartWriteLine('vc;show;sl,sr,jr,br,bl;')
            bluetooth.uartWriteLine('vc;import_end;')

            // bluetooth.uartWriteLine('vc;b;3;1;0')
            bluetooth.uartWriteLine('vc;b;3;1;1;')
            bluetooth.uartWriteLine('vc;b;4;1;0;')
            bluetooth.uartWriteLine('vc;b;7;1;0;')
            bluetooth.uartWriteLine('vc;b;8;1;0;')
            mode = 0;
        } else if (commandName == "oy" || commandName == "sl" || commandName == "jry") {
            if (mode == 0) {
                wuKong.setServoSpeed(wuKong.ServoList.S1, commandValue)
            } else if (mode == 1 || mode == 2) {
                wuKong.setMotorSpeed(wuKong.MotorList.M1, commandValue)
            }
        } else if (commandName == "ox" || commandName == "sr" || commandName == "jrx") {
            let value = commandValue + 180;
            if ((mode == 0 && value >= 120 && value <= 240) || (mode == 1 && value >= 150 && value <= 210)) {
                wuKong.setServoAngle(wuKong.ServoTypeList._360, wuKong.ServoList.S0, value)
            } else if (mode == 2) {
                wuKong.setMotorSpeed(wuKong.MotorList.M2, commandValue)
            }
        } else if (commandName == "3" || commandName == "4" || commandName == "7" || commandName == "8") {
            if (commandName == "3") {
                switchMode(0)

                bluetooth.uartWriteLine('vc;sl;1;-100;100;1;1;0;1;;')
                bluetooth.uartWriteLine('vc;sr;1;-60;60;10;1;0;0;;')
                bluetooth.uartWriteLine('vc;ox;1;-30;30;-60;60;10;1;0;')
                bluetooth.uartWriteLine('vc;jrx;-60;60;10;1;0;')
                bluetooth.uartWriteLine('vc;jry;-100;100;1;1;0;')
                // bluetooth.uartWriteLine('vc;b;Digit3;1;0;M1;')
            } else if (commandName == "4") {
                switchMode(1)
                bluetooth.uartWriteLine('vc;sl;1;-100;100;1;1;0;1;;')
                bluetooth.uartWriteLine('vc;sr;1;-30;30;10;1;0;0;;')
                bluetooth.uartWriteLine('vc;ox;1;-30;30;-30;30;10;1;0;')
                bluetooth.uartWriteLine('vc;jrx;-30;30;5;1;0;')
                bluetooth.uartWriteLine('vc;jry;-100;100;1;0;0;')
                // bluetooth.uartWriteLine('vc;b;Digit3;1;1;M2;')
            } else if (commandName == "7") {
                switchMode(2)
                bluetooth.uartWriteLine('vc;sl;1;-100;100;1;1;0;1;;')
                bluetooth.uartWriteLine('vc;sr;1;-100;100;1;1;0;1;;')
                bluetooth.uartWriteLine('vc;jrx;-100;100;1;0;0;')
                bluetooth.uartWriteLine('vc;jry;-100;100;1;0;0;')
                // bluetooth.uartWriteLine('vc;b;Digit3;1;2;M3;')
            } else if (commandName == "8") {
                switchMode(3)
            }
        } else if (commandName == "1") {
            music.playTone(250, 500)
        }
    }
})