jsmm = require('./jsmm')
result = jsmm.test.runAll()

console.log jsmm.test.output

unless result
	throw new Error('Testing was unsuccessful...')
