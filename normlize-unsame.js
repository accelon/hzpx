/* 異體部件認同 */
import {nodefs,readTextLines,writeChanged } from 'pitaka/cli'
await nodefs;
import {splitUTF32Char,splitUTF32} from 'pitaka/utils'
import {UnifiedComps} from './src/gw-chise-unified.js'; //glyphwiki 與 chise 的認同表
const lines=readTextLines('./unsame-ids.txt');
const same2=[],unsame2=[];
const sortComp=str=>splitUTF32(str).sort().map(i=>String.fromCodePoint(i)).join('')
for (let i=0;i<lines.length;i++) {
	const [wh,gw,chise]=lines[i].split(/[=\$]/);
	// console.log(splitUTF32Char(gw).sort())

	let gw2=sortComp(gw);//glyphwiki order is messed-up
	let chise2=sortComp(chise);
	let same=false;
	const comps=splitUTF32Char(gw2);
	for (let i=0;i<comps.length;i++) {
		const unified=UnifiedComps[comps[i]];
		if ( unified) {
			chise2=chise2.replace(unified,comps[i]);
		}
		if (sortComp(gw2)==sortComp(chise2)) { //sort again , as replaced
			same2.push(wh)
			same=true;
			break;
		}
	}

	if (!same) unsame2.push(wh+'='+gw+'$'+chise);
	
}
if (writeChanged('same-unified-ids.txt',same2.join('\n'))){
	console.log('same-unified-ids.txt',same2.length)
}
if (writeChanged('unsame2.txt',unsame2.join('\n'))){
	console.log('unsame2.txt',unsame2.length)
}