import {nodefs,readTextLines} from 'pitaka/cli'
await nodefs;
import {splitIRE} from '../src/pinx.js'
import {prepreNodejs,getGlyph} from '../src/gwformat.js'    
const lines=readTextLines('../public/bmp.js');
prepreNodejs(lines);
let test=0,pass=0;
/* split renderable unit */ 

const s='一個起己狗句美囡女空間';
let r=splitIRE(s);
console.log(s,r )
r.length==5?pass++:0;test++;

console.log('test',test,'pass',pass) 