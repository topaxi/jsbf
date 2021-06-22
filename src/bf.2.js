export class Brainfuck {
  /**
   * @param {string} code
   */
  constructor(code) {
    this._brainfuckSource = code
  }

  /**
   * @param {string} input
   * @param {boolean} [optimized]
   */
  exec(input, optimized) {
    return this.returnFunction(optimized)(input)
  }

  /**
   * @param {boolean} [optimized]
   * @returns {(input: string) => string}
   */
  returnFunction(optimized = true) {
    let code = this.cleanSource()
    let func = new Function(
      'mem',
      'input',
      this._generateJSSource(code, optimized)
    )
    let maxArrayLength = 30000

    return func.bind(null, new Uint8Array(maxArrayLength))
  }

  /**
   * @param {string} code
   * @param {boolean} optimized
   * @returns {string}
   */
  _generateJSSource(code, optimized) {
    let codeLength = code.length
    let JSSource = 'let index = 0, output = "", inputIndex = 0;'

    if (!optimized) {
      for (let i = 0; i < codeLength; i++) {
        JSSource += this._interpretInstruction(code[i])
      }
    } else {
      JSSource += this._optimizeCode(code)
    }

    JSSource += 'return output;'

    return JSSource
  }

  /**
   * this method reduces array index access dramatically! ;)
   *
   * @param {string} code
   * @returns {string}
   */
  _optimizeCode(code) {
    let optimizedCode = ''
    let codeLength = code.length

    let i = 0
    while (i < codeLength) {
      let ins = code[i]
      let c = 1

      if (ins !== code[i + 1] || ['[', ']', '.', ','].indexOf(ins) !== -1) {
        if (ins === '[' && code[i + 1] === '-' && code[i + 2] === ']') {
          optimizedCode += this._interpretOptimizedInstruction('0')
          i += 3
        } else {
          optimizedCode += this._interpretInstruction(ins)
          i++
        }

        continue
      } else while (ins === code[i + c]) c++

      optimizedCode += this._interpretOptimizedInstruction(ins, c)
      i += c
    }

    return optimizedCode
  }

  /**
   * @param {string} instruction
   * @param {number} [count]
   * @returns {string}
   */
  _interpretOptimizedInstruction(instruction, count) {
    switch (instruction) {
      case '+':
        return `mem[index] += ${count};\n`
      case '-':
        return `mem[index] -= ${count};\n`
      case '<':
        return `index -= ${count};\n`
      case '>':
        return `index += ${count};\n`
      case '0':
        return 'mem[index] = 0;\n'
      default:
        return ''
    }
  }

  /**
   * @param {string} instruction
   * @returns {string}
   */
  _interpretInstruction(instruction) {
    switch (instruction) {
      case '+':
        return '++mem[index];\n'
      case '-':
        return '--mem[index];\n'
      case '<':
        return '--index;\n'
      case '>':
        return '++index;\n'
      case '.':
        return 'output += String.fromCharCode(mem[index]);\n'
      case '[':
        return 'while(mem[index]){\n'
      case ']':
        return '}\n'
      case ',':
        return 'mem[index] = input.charCodeAt(inputIndex++);\n'
      case '#':
        return 'console.log("%d => %d", index, mem[index]);\n'
      case '*':
        return 'console.log("%d : %o", index, mem);\n'
      default:
        //console.log('Invalid character found: %s', instruction);
        return ''
    }
  }

  /**
   * @returns {string}
   */
  cleanSource() {
    return this._brainfuckSource.replace(/[^\+\-\[\]\.\,<>#\*]/g, '')
  }

  /**
   * @returns {string}
   */
  getSource() {
    return this._brainfuckSource
  }
}
