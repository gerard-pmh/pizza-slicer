const fs = require('fs')
const path = require('path')

const mushroom = 'M'
const tomato = 'T'

function parsePizzaFile (pizzaFile) {
  const pizzaData = fs.readFileSync(path.resolve(pizzaFile)).toString().split('\n')
  const pizzaDataConf = pizzaData[0].split(' ')
  const pizza = {
    height: parseInt(pizzaDataConf[0]),
    width: parseInt(pizzaDataConf[1]),
    minIngredient: parseInt(pizzaDataConf[2]),
    maxSize: parseInt(pizzaDataConf[3])
  }
  pizzaData.shift()
  pizza.content = pizzaData
    .map(row => row.split('').filter(ingredient => [mushroom, tomato].includes(ingredient)))
    .filter(row => row.length > 0)
  return pizza
}

function getSlicedPizza (pizza, startY = 0 , startX = 0) {
  const m = pizza.height
  const n = pizza.width

  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      // edge cases
      if ((i === 0 && j === 0) ||
        (i === m && j === n) ||
        (i === 0 && j === n) ||
        (i === m && j === 0)) {
        continue
      }

      let result = []
      const slices = [
        [0, i, 0, j],
        [i, m, 0, j],
        [0, i, j, n],
        [i, m, j, n]
      ].filter(([a, b, c, d]) => (b - a) * (d - c) > 0)

      let allSlicesOk = slices.length !== 0

      for (let slice of slices) {
        const [a, b, c, d] = slice
        const sliceSize = (b - a) * (d - c)

        if (!checkIngredient(pizza, slice)) {
          allSlicesOk = false
          break
        }
        const subSlices = getSlicedPizza(cutPizza(pizza, slice), a, c)
        if (!subSlices) {
          if (sliceSize > pizza.maxSize) {
            allSlicesOk = false
            break
          }
          result.push(slice)
        } else {
          result = result.concat(subSlices)
        }
      }
      if (allSlicesOk) {
        return result.map(([a, b, c, d]) => [a + startY, b + startY, c + startX, d + startX])
      }
    }
  }
}

function cutPizza (pizza, slice) {
  const [a, b, c, d] = slice
  const newPizza = Object.assign({}, pizza)
  newPizza.height = b - a
  newPizza.width = d - c
  newPizza.content = pizza.content.map(row => row.slice(c, d)).slice(a, b)
  return newPizza
}

function checkIngredient (pizza, slice) {
  const [a, b, c, d] = slice
  let tomatoCounter = 0
  let mushroomCounter = 0
  for (let i = a; i < b; i++) {
    for (let j = c; j < d; j++) {
      switch (pizza.content[i][j]) {
        case tomato:
          tomatoCounter++
          break
        case mushroom:
          mushroomCounter++
          break
        default:
          break
      }
      if (tomatoCounter >= pizza.minIngredient &&
        mushroomCounter >= pizza.minIngredient) {
        return true
      }
    }
  }
  return false
}

function printSlicedPizza (slicedPizza) {
  let result = ''
  result += slicedPizza.length
  result += '\n'
  for (let slice of slicedPizza) {
    const [a, b, c, d] = slice
    result += a
    result += ' '
    result += c
    result += ' '
    result += (b - 1)
    result += ' '
    result += (d - 1)
    result += '\n'
  }
  return result
}

const inputFile = process.argv[2]
const outputFile = process.argv[3]
if (inputFile) {
  const printedSlicedPizza = printSlicedPizza(getSlicedPizza(parsePizzaFile(inputFile)))
  if (outputFile) {
    fs.writeFileSync(path.resolve(outputFile), printedSlicedPizza)
  } else {
    console.log(printedSlicedPizza)
  }
} else {
  console.log('please specify an input file')
}
