import {nodefs,readTextLines,writeChanged } from 'pitaka/cli'
await nodefs;
import {alphabetically,splitUTF32Char,bsearch} from 'pitaka/utils'
import {prepreNodejs,getGlyph,gw,eachGlyph,setGlyph_js,loadComponents,frameOf} from './src/gwformat.js'

const lines=readTextLines('public/bmp.js');
prepreNodejs(lines);

import {packGD,packGID} from './src/gwpacker.js';

const out=[];
eachGlyph((gid,data)=>{
	out.push(packGID(gid)+'='+packGD(data));
})

if (writeChanged('bmp-packed.txt',out.join('\n'))) {
	console.log('bmp-packed.txt',out.length);
}