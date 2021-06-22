var ASCII2Brainfuck = (function () {
  function ASCII2Brainfuck(s) {
    var stringLength = s.length,
      output = '',
      prevCharCode = 0,
      cachedChars

    var [output, cachedChars] = cacheChars(s, stringLength)

    for (var i = 0; i < stringLength; i++) {
      var charCode = s.charCodeAt(i),
        nextChar1 = '',
        nextChar2 = ''

      if (charCode in cachedChars) {
        var level = cachedChars[charCode]

        nextChar2 += mchar('<', level) + '.' + mchar('>', level)
      }

      nextChar1 += add(charCode - prevCharCode, 1) + '.'

      if (nextChar2 && nextChar2.length < nextChar1.length) {
        output += nextChar2
      } else {
        output += nextChar1

        prevCharCode = charCode
      }
    }

    var clean = /(?:<>|><)/g // remove unnecessary pointer shifts
    while (output.match(clean)) output = output.replace(clean, '')

    return output.replace(/[^\.]+$/, '')
  }

  function cacheChars(s, stringLength) {
    var charsToCache = mostUsedChars(s, stringLength),
      output = '',
      cache = {}

    for (var i = charsToCache.length; i--; ) {
      var charToCache = charsToCache[i]

      cache[charToCache] = i + 1
      output += add(charToCache, 1) + '>'
    }

    return [output, cache]
  }

  function mostUsedChars(s, stringLength) {
    var chars = {},
      toCache = []

    for (var i = 0; i < stringLength; i++) {
      var charCode = s.charCodeAt(i)
      chars[charCode] = (chars[charCode] >>> 0) + 1
    }

    // do not cache chars which are not used frequently
    for (var charCount = chars.length; charCount--; ) {
      if (chars[charCount] < 3) delete chars[charCount]
    }

    for (var i = 20; i--; ) {
      toCache.push(max(chars))
    }

    return toCache
  }

  function max(o) {
    var h = 0,
      i
    for (i in o) {
      o[h] = o[h] >>> 0
      if (o[i] > o[h]) h = i
    }

    delete o[h]

    return h
  }

  function add(i, level) {
    if (!i) return ''

    var l = Math.abs(i)

    if (l < 15) return mchar(i < 0 ? '-' : '+', l)

    var f = getFactors(l),
      fLength = f.length

    if (!fLength) return add(i - 1, level) + '+' // catch prime number

    var v1 = ~~(fLength / 2),
      v2 = fLength % 2 ? v1 : v1 - 1

    return valueByMultiply(f[v1], i < 0 ? -f[v2] : f[v2], level)
  }

  function valueByMultiply(a, b, level) {
    var fSeek = mchar('>', level),
      bSeek = mchar('<', level)

    return (
      fSeek +
      add(a, level + 1) +
      '[' +
      bSeek +
      add(b, level + 1) +
      fSeek +
      (a > 0 ? '-' : '+') +
      ']' +
      bSeek
    )
  }

  function mchar(c, i) {
    var o = ''
    while (i--) o += c
    return o
  }

  function getFactors(v) {
    var i = v,
      f = []

    while (--i) if (!(v % i)) f.push(i)

    f.pop() // every number is divisible by 1, we do not want it
    return f
  }

  return ASCII2Brainfuck
})()

;(function () {
  var exec = document.getElementById('a2b')

  var a2b = document.getElementById('ascii')
  var bf = document.getElementById('bf')

  exec.onclick = function () {
    bf.value = ASCII2Brainfuck(a2b.value)
  }
})()
