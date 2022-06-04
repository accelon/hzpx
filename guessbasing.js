/* 找出 glyphwiki 和 chise 相同IDS 的字 */
import {nodefs,readTextLines,writeChanged } from 'pitaka/cli'
import {fromObj, alphabetically, codePointLength} from 'pitaka/utils'
import {fitForBasing} from './src/fitforbasing.js';
import {autoIRE} from './src/pinx.js'

await nodefs;
const basings={};
let count=0;
const sameids=readTextLines('./same-ids.txt');

for (let i=0;i<sameids.length;i++) {
	// if (i>100) break;
	const cp= sameids[i].codePointAt(0);
	// if (!(cp>=0x8a00 && cp <=0x8b9f )) continue;

	if (i%100==0) console.log(i,'count',count)
	for (let basing in fitForBasing ) {
		const ire=autoIRE(sameids[i],basing);
		if (ire && sameids[i]!==basing) {
			// console.log(ire,sameids[i])
			if (!basings[basing]) basings[basing]='';
			basings[basing]+=sameids[i];
			// console.log(ire,sameids[i])
			count++;
			break;
		}
	}
}

const outfn='basing.txt';
const out=fromObj(basings,(a,b)=>a+'='+b);
out.sort(alphabetically);
if (writeChanged(outfn,out.join('\n') )){
	console.log(outfn,out.length)
}