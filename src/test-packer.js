import {packGD,unpackGD} from './gwpacker.js'
const s='99:200:-72:-22:2:183:159:u2008a-03:0:0:-75$99:0:0:0:31:200:197:u2ffb-u53e3-u4e5a-var-001:0:0:0'
console.log(unpackGD(packGD(s))==s)