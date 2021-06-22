import { ASCII2Brainfuck } from './ascii2bf'
import { Brainfuck } from './bf.2'

main()

function main() {
  registerAscii2Brainfuck()
  registerExecuteBrainfuck()
}

function registerAscii2Brainfuck() {
  var exec = document.getElementById('a2b')

  var a2b = document.getElementById('ascii')
  var bf = document.getElementById('bf')

  exec.onclick = function () {
    bf.value = ASCII2Brainfuck(a2b.value)
  }
}

function registerExecuteBrainfuck() {
  var exec = document.getElementById('exec')

  exec.onclick = function () {
    var bf = new Brainfuck(document.getElementById('bf').value)
    var func = bf.returnFunction()

    if (typeof console !== 'undefined') {
      console.log(func.toString())
    }

    alert(func('test input'))
  }
}
