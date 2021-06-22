/**
 * @param {string} s
 * @returns {string}
 */
export function ASCII2Brainfuck(s) {
  let stringLength = s.length
  let prevCharCode = 0

  let [output, cachedChars] = cacheChars(s, stringLength)

  for (let i = 0; i < stringLength; i++) {
    let charCode = s.charCodeAt(i)
    let nextChar1 = ''
    let nextChar2 = ''

    if (charCode in cachedChars) {
      let level = cachedChars[charCode]

      nextChar2 += '<'.repeat(level) + '.' + '>'.repeat(level)
    }

    nextChar1 += add(charCode - prevCharCode, 1) + '.'

    if (nextChar2 && nextChar2.length < nextChar1.length) {
      output += nextChar2
    } else {
      output += nextChar1

      prevCharCode = charCode
    }
  }

  let clean = /(?:<>|><)/g // remove unnecessary pointer shifts
  while (output.match(clean)) output = output.replace(clean, '')

  return output.replace(/[^\.]+$/, '')
}

/**
 * @param {string} s
 * @param {number} stringLength
 * @returns {[string, Record<number, number>]}
 */
function cacheChars(s, stringLength) {
  let charsToCache = mostUsedChars(s, stringLength)
  let output = ''
  /**
   * @type {Record<number, number>}
   */
  let cache = {}

  for (let i = charsToCache.length; i--; ) {
    let charToCache = charsToCache[i]

    cache[charToCache] = i + 1
    output += add(charToCache, 1) + '>'
  }

  return [output, cache]
}

/**
 * @param {string} s
 * @param {number} stringLength
 * @returns {number[]}
 */
function mostUsedChars(s, stringLength) {
  /**
   * @type {Record<number, number>}
   */
  let chars = {}
  let toCache = []

  for (let i = 0; i < stringLength; i++) {
    let charCode = s.charCodeAt(i)
    chars[charCode] = (chars[charCode] >>> 0) + 1
  }

  // do not cache chars which are not used frequently
  for (let charCount in chars) {
    if (chars[charCount] < 3) delete chars[charCount]
  }

  for (let i = 20; i--; ) {
    toCache.push(max(chars))
  }

  return toCache
}

/**
 * @param {Record<number, number>} o
 * @returns {number}
 */
function max(o) {
  let h = '0'

  for (let i in o) {
    o[h] = o[h] >>> 0
    if (o[i] > o[h]) h = i
  }

  delete o[h]

  return Number(h)
}

/**
 * @param {number} i
 * @param {number} level
 * @returns {string}
 */
function add(i, level) {
  if (!i) return ''

  let l = Math.abs(i)

  if (l < 15) return (i < 0 ? '-' : '+').repeat(l)

  let f = getFactors(l)
  let fLength = f.length

  if (!fLength) return add(i - 1, level) + '+' // catch prime number

  let v1 = ~~(fLength / 2)
  let v2 = fLength % 2 ? v1 : v1 - 1

  return valueByMultiply(f[v1], i < 0 ? -f[v2] : f[v2], level)
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} level
 * @returns {string}
 */
function valueByMultiply(a, b, level) {
  let fSeek = '>'.repeat(level)
  let bSeek = '<'.repeat(level)

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

/**
 * @param {number} v
 * @returns {number[]}
 */
function getFactors(v) {
  let i = v
  let f = []

  while (--i) if (!(v % i)) f.push(i)

  f.pop() // every number is divisible by 1, we do not want it
  return f
}
