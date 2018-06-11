/**
 * LS-8 v2.0 emulator skeleton code
 */

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        this.reg = new Array(8).fill(0); // General-purpose registers R0-R7
        
        // Special-purpose registers
        this.PC = 0; // Program Counter

        this.instructionRunner = [];
        this.instructionRunner[153] = this.LDI.bind(this);
        this.instructionRunner[67] = this.PRN.bind(this);
        this.instructionRunner[1] = this.HLT.bind(this);
    }
    
    /**
     * Store value in memory address, useful for program loading
     */
    poke(address, value) {
        // console.log('poke value', value);
        this.ram.write(address, value);
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        this.clock = setInterval(() => {
            this.tick();
        }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz
    }

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
    }

    /**
     * ALU functionality
     *
     * The ALU is responsible for math and comparisons.
     *
     * If you have an instruction that does math, i.e. MUL, the CPU would hand
     * it off to it's internal ALU component to do the actual work.
     *
     * op can be: ADD SUB MUL DIV INC DEC CMP
     */
    alu(op, regA, regB) {
        switch (op) {
            case 'MUL':
                // !!! IMPLEMENT ME
                break;
        }
    }

    /**
     * Advances the CPU one cycle
     */
    tick() {

        // Load the instruction register (IR--can just be a local variable here)
        // from the memory address pointed to by the PC. (I.e. the PC holds the
        // index into memory of the instruction that's about to be executed
        // right now.)

        // !!! IMPLEMENT ME
        let IR = this.ram.read(this.PC);

        // Debugging output
        // console.log(`${this.PC}: ${IR.toString(2)}`);
        // console.log('number of operands', this.getNumberOfOperands(IR));

        // Get the two bytes in memory _after_ the PC in case the instruction
        // needs them.

        // !!! IMPLEMENT ME
        let operandA = this.ram.read(this.PC + 1);
        let operandB = this.ram.read(this.PC + 2);

        // Execute the instruction. Perform the actions for the instruction as
        // outlined in the LS-8 spec.

        // !!! IMPLEMENT ME
        this.instructionRunner[IR](operandA, operandB);

        // Increment the PC register to go to the next instruction. Instructions
        // can be 1, 2, or 3 bytes long. Hint: the high 2 bits of the
        // instruction byte tells you how many bytes follow the instruction byte
        // for any particular instruction.
        
        // !!! IMPLEMENT ME
      // console.log('ram is', this.ram);
        this.PC += this.getNumberOfOperands(IR) + 1;
        // console.log('PC is', this.PC);
    }

    getNumberOfOperands(instructionRegister) {
      const toBinary = this.decimalTo8Bit(instructionRegister); 
      const highBits = toBinary.slice(0, 2);

      return parseInt(highBits, 2);
    }

    // Set the value of a register to an integer.
    LDI(register, integerValue) {
      this.reg[register] = integerValue;
      // this.storeRegister(register, integerValue);    
    }

    PRN(register) {
      console.log(this.reg[register]);
    }

    HLT() {
      console.log('finis!');
      this.stopClock();
    }

    // https://stackoverflow.com/questions/24337260/javascript-a-byte-is-supposed-to-be-8-bits
    decimalTo8Bit(decimal) {
      if (decimal < 0 || decimal > 255 || decimal % 1 !== 0) {
        throw new Error(decimal + " does not fit in a byte");
      }
      return ("000000000" + decimal.toString(2)).substr(-8)
    }

}

module.exports = CPU;
