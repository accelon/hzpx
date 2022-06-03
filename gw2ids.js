//將glyphwiki 框件式 轉為 IDS ，方便與 chise 比較
//目的是算出可以用基字表達的 字形


import {nodefs,readTextLines,writeChanged} from 'pitaka/cli'
await nodefs;
import {eachGlyph,prepreNodejs,getGlyph,gid2ch,prepareRawGW} from './src/gwformat.js'
import {fromObj, alphabetically, codePointLength} from 'pitaka/utils'
console.log('reading glyphwiki dump')
const lines=readTextLines('glyphwiki/dump_newest_only.txt');
prepareRawGW(lines);
console.log('for Each Glyph')
let min=0,max=0;
const out={};
eachGlyph( (gid,data)=>{
	const entries=data.split('$');
	let ids='';
	if (!gid.match(/^u[\da-f]{4,5}/)) return;
	//if (gid.length>7) return;
	const wh=gid2ch(gid);
	const cp=wh.codePointAt(0);
	if (!((cp>=0x3400 && cp<=0x9FA5) || (cp>=0x20000&& cp<=0x30000))) return;
	entries.forEach(entry=>{
		const fields=entry.split(':');
		if (fields[0]!=='99') return;
		const gid=fields[7]
		const ch=gid2ch(gid);
		if (ch.codePointAt(0)>=0x3400) {
			ids+=ch;
		}
	})
	if ( codePointLength(ids)>1 ) {
		if (!out[wh]) out[wh]=[];
		if (out[wh].indexOf(ids)==-1) out[wh].push(ids);
	}
})
const arr=fromObj(out,(a,b)=>a+'='+b );
arr.sort(alphabetically)

if (writeChanged('gw-ids.txt',arr.join('\n'))){
	console.log('gw-ids.txt',arr.length)
}