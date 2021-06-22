export function Brainfuck(code) {
  this._brainfuckSource = code
}

Brainfuck.prototype = {
  exec: function (input, optimized) {
    return this.returnFunction(optimized)(input)
  },
  returnFunction: function (optimized) {
    optimized = optimized === undefined ? true : optimized

    let code = this.cleanSource()
    let func = new Function(
      'mem',
      'input',
      this._generateJSSource(code, optimized)
    )
    let maxArrayLength = 30000

    return func.bind(null, new Uint8Array(maxArrayLength))
  },
  _generateJSSource: function (code, optimized) {
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
  },
  /* this method reduces array index access dramatically! ;) */
  _optimizeCode: function (code) {
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
  },
  _interpretOptimizedInstruction: function (instruction, count) {
    switch (instruction) {
      case '+':
        return 'mem[index] += ' + count + ';\n'
      case '-':
        return 'mem[index] -= ' + count + ';\n'
      case '<':
        return 'index -= ' + count + ';\n'
      case '>':
        return 'index += ' + count + ';\n'
      case '0':
        return 'mem[index] = 0;\n'
      default:
        return ''
    }
  },
  _interpretInstruction: function (instruction) {
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
  },
  cleanSource: function () {
    return this._brainfuckSource.replace(/[^\+\-\[\]\.\,<>#\*]/g, '')
  },
  getSource: function () {
    return this._brainfuckSource
  },
}
