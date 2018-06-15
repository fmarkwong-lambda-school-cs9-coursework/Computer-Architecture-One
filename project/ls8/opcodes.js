// Opcodes mixin
// http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/

module.exports = superClass => class extends superClass {
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
    // this.startInterruptClock(); not sure if needed
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

  CMP(regAaddress, regBaddress) {
    const a = this.reg[regAaddress];
    const b = this.reg[regBaddress];

    this.FL = a < b   ? this.FL | 0b00000100 : this.FL & 0b11111011; 
    this.FL = a > b   ? this.FL | 0b00000010 : this.FL & 0b11111101; 
    this.FL = a === b ? this.FL | 0b00000001 : this.FL & 0b11111110; 
  }

  JEQ(registerAddress) {
    if (this.FL & 0b00000001) {
      this.PC = this.reg[registerAddress];
      this.jumped = true;
    }
  }

  JNE(registerAddress) {
    if (!(this.FL & 0b00000001)) {
      this.PC = this.reg[registerAddress];
      this.jumped = true;
    }
  }

}
