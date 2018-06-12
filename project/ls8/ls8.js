const fs = require('fs');
const RAM = require('./ram');
const CPU = require('./cpu');

/**
 * Load an LS8 program into memory
 *
 * TODO: load this from a file on disk instead of having it hardcoded
 */
function loadMemory() {

    const fileName = process.argv[2];


    // Hardcoded program to print the number 8 on the console

    const builtInprogram = [ // print8.ls8
        "10011001", // LDI R0,8  Store 8 into R0
        "00000000",
        "00001000",
        "01000011", // PRN R0    Print the value in R0
        "00000000",
        "00000001"  // HLT       Halt and quit
    ];

    const program = fileName ? readFile(fileName) : builtInprogram;  

    // Load the program into the CPU's memory a byte at a time
    for (let i = 0; i < program.length; i++) {
        cpu.poke(i, parseInt(program[i], 2));
    }
}

function readFile(fileName) {
    const filedata = fs.readFileSync(fileName, "utf8");
    return filedata.trim().split(/[\r\n]+/g).filter(line => line[0] === '1' || line[0] === '0');
}

/**
 * Main
 */

let ram = new RAM(256);
let cpu = new CPU(ram);

// TODO: get name of ls8 file to load from command line

loadMemory(cpu);

cpu.startClock();
