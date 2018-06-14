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

    this.initializeSP();

    this.jumped = false;

    this.instructionRunner = {
      0b10011001: this.LDI.bind(this),
      0b01000011: this.PRN.bind(this),
      0b00000001: this.HLT.bind(this),
      0b01001101: this.PUSH.bind(this),
      0b01001100: this.POP.bind(this),
      0b01001000: this.CALL.bind(this),
      0b00001001: this.RET.bind(this),
      0b10101000: this.ADD.bind(this),
      0b10011010: this.ST.bind(this),
      0b00001011: this.IRET.bind(this),
      0b01010000: this.JMP.bind(this),
      0b01000010: this.PRA.bind(this),
    };

    this.ALU_OPS = [0b10101010];

  }

  /**
   * Store value in memory address, useful for program loading
   */
  poke(address, value) {
    this.ram.write(address, value);
  }

  /**
   * Starts the clock ticking on the CPU
   */
  startClock() {
    this.clock = setInterval(() => {
      this.tick();
    }, 1); // 1 ms delay == 1 KHz clock == 0.000001 GHz

    this.startInterruptClock();
  }

  stopClock() {
    this.stopInterruptClock();
    clearInterval(this.clock);
  }

  startInterruptClock() {
    this.interruptClock = setInterval(() => {
      this.setIS();
    }, 1000); 
  }

  stopInterruptClock() {
    clearInterval(this.interruptClock);
  }

  setIS() {
    this.reg[6] = 0b00000001;
  }

  clearIS() {
    this.reg[6] = 0;
  }

  IS() {
    return this.reg[6];
  }

  IM() {
    return this.reg[5];
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
      case 0b10101010: // MUL 
        // 0xff gets rid of extra high bits, limit to 8 bits
        this.reg[regA] = this.reg[regA] * this.reg[regB] & 0xff;
        break;
    }
  }

  saveState() {
    this.pushStack(this.PC);
    this.pushStack(this.FL);

    for (let i = 0; i <=6; i++) {
      this.pushStack(this.reg[i]);
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {

    if (this.IS()) {
      const interrupts = this.IM() & this.IS();
      let interruptHappened = false;

      for (let i = 0; i < 8; i++) {
        // Right shift interrupts down by i, then mask with 1 to see if that bit was set
        // let value = (interrupts >> i)
        if (((interrupts >> i) & 1) == 1) interruptHappened = true;
      }

      if (interruptHappened) {
        this.stopInterruptClock();
        this.clearIS();
        this.saveState();
        let address = this.ram.read(0xF8); // I0 vector
        this.PC = address;
      }
    }

    // Load the instruction register (IR--can just be a local variable here)
    // from the memory address pointed to by the PC. (I.e. the PC holds the
    // index into memory of the instruction that's about to be executed
    // right now.)

    let IR = this.ram.read(this.PC);
    // Get the two bytes in memory _after_ the PC in case the instruction
    // needs them.

    let operandA = this.ram.read(this.PC + 1);
    let operandB = this.ram.read(this.PC + 2);

    // Execute the instruction. Perform the actions for the instruction as
    // outlined in the LS-8 spec.

    if (this.ALU_OPS.includes(IR)) {
      this.alu(IR, operandA, operandB);
    } else {
      const opCodeFunction = this.instructionRunner[IR];
      // console.log(`${this.PC}: ${IR.toString(2)}`);
      if (!opCodeFunction) throw Error(`${IR.toString(2)} is not a recognized op code`);

      this.instructionRunner[IR](operandA, operandB);
    }
    // Increment the PC register to go to the next instruction. Instructions
    // unless we're doing a CALL or RET.  in that case, the PC has been set to another address
    // and we need to go to next tick to load the instruction register

    if (this.jumped) {
      this.jumped = false;
      return;
    }

    this.PC += this.getNumberOfOperands(IR) + 1;
  }

  // get value of the 2 high bits
  getNumberOfOperands(instructionRegister) {
    return instructionRegister >> 6;
  }

  initializeSP() {
    this.reg[7] = 0xF4; 
  }

  incrementSP() {
    this.reg[7]++;
  }

  decrementSP() {
    this.reg[7]--;
  }

  SP() {
    return this.reg[7];
  }

  // Set the value of a register to an integer.
  LDI(register, integerValue) {
    this.reg[register] = integerValue;
  }

  PRN(register) {
    console.log(this.reg[register]);
  }

  HLT() {
    console.log('finis!');
    this.stopClock();
  }

  PUSH(regAddress) {
    this.pushStack(this.reg[regAddress]);
  }

  POP(regAddress) {
    this.reg[regAddress] = this.popStack(); 
  }

  CALL(regAddress) {
    // because CALL always has one operand, so we need to do Call opcode + operand
    // so we need to add 2 to PC to get to next instruction to be saved in stack
    this.pushStack(this.PC + 2);
    this.PC = this.reg[regAddress];
    this.jumped = true;
  }

  ADD(a, b) {
    this.reg[a] = this.reg[a] + this.reg[b];
  }

  RET() {
    this.PC = this.popStack();
    this.jumped = true;
  }

  IRET() {
    this.restoreState();
    this.startInterruptClock();
    this.jumped = true;
  }

  ST(registerAIndex, registerBIndex) {
    this.ram.write(this.reg[registerAIndex], this.reg[registerBIndex]);
  }

  JMP(registerIndex) {
    this.PC = this.reg[registerIndex];
    this.jumped = true;
  }

  PRA(registerIndex) {
    console.log(String.fromCharCode(this.reg[registerIndex]));
  }

  restoreState() {
    for (let i = 0; i <=6; i++) {
      this.reg[0] = this.popStack();
    }

    this.FL = this.popStack();
    this.PC = this.popStack();
  }

  pushStack(value) {
    this.decrementSP();
    this.ram.write(this.SP(), value); 
  }

  popStack() {
    const value = this.ram.read(this.SP());
    this.incrementSP();
    return value;
  }
}

module.exports = CPU;
