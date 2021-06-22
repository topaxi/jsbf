export function Brainfuck(code) {
  this._init(code)
}

Brainfuck.prototype = {
  _init: function (code) {
    this._brainfuckSource = code
  },
  exec: function (input, optimized) {
    return this.returnFunction(optimized)(input)
  },
  returnFunction: function (optimized) {
    optimized = optimized === undefined ? true : optimized

    var code = this.cleanSource(),
      func = new Function('input', this._generateJSSource(code, optimized))

    return func
  },
  _generateJSSource: function (code, optimized) {
    var codeLength = code.length,
      maxArrayLength = 30000,
      JSSource =
        'var index = 0,\n    mem = [' +
        (function (maxArrayLength) {
          var s = []
          for (var i = maxArrayLength; i--; s[i] = 0);

          return s.join(',')
        })(maxArrayLength) +
        '],\n    output = "",\n    inputIndex = 0;\n'

    if (!optimized) {
      for (var i = 0; i < codeLength; i++) {
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
    var optimizedCode = '',
      codeLength = code.length

    var i = 0
    while (i < codeLength) {
      var ins = code[i],
        c = 1

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
