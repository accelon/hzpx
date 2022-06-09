/*
input : glyphwiki website dump 
output: 

1) glyphwiki-dump.txt : 所有的漢字加上組成這些字形的所有。
2) compfreq.txt       : 構件的id 以及循環引用次數。
                        (雖然「盟」=明皿 沒有直接用到日和月, 但由於「明」，日和月的引用次數也增加。)
                       口8262 , 冖 5655, 艹 5259 意思是在八萬多個字中，會看到「口」八千多次。

*/

import {nodefs,readTextLines,writeChanged,fromObj,alphabetically} from 'pitaka/cli';
import {getGlyph,prepareRawGW,setGlyphDB,eachGlyph,loadComponents,gid2ch} from './src/gwformat.js'
await nodefs;

const lines=readTextLines('glyphwiki/dump_newest_only.txt');
prepareRawGW(lines);
//first pass , dump the BM
const GW=[], added={};
const components={};
console.log('loaded dump_newest_only')
const codePointOf=str=>{
	if (str.match(/^u[a-f\d]{4,5}$/)) {
		return parseInt(str.slice(1,5),16);
	}
}
eachGlyph( (gid, data)=>{
	const m=gid.match(/^u([a-f\d]{4,5})$/);
	data=data.replace(/@\d+/g,'')
	if (m) {
		gid=gid.replace(/@\d+$/,'');//remove variant
		const cp=parseInt( m[1],16);
		if ( (cp>=0x3400 && cp<=0x9FFF) || (cp>=0x20000 && cp<=0x3134A) ){
			GW.push(gid+'='+data);
			added[gid]=true;
			loadComponents( data , components,true); //load all components needed by this unicode char
		}
	}
})

for (let comp in components) {
	comp=comp.replace(/@\d+$/,'');
	const cp=codePointOf(comp);
	if (!added[comp]){
		const d=getGlyph(comp);
		if (d) {
			GW.push(comp+'='+d.replace(/@\d+/g,''))
		} else {
			console.log('cannot get glyph',comp)
		}
		added[comp]=true;
	}
}

GW.sort(alphabetically)


if (writeChanged('glyphwiki-dump.txt',GW.join('\n'))){
	console.log('written glyphwiki-dump.txt',GW.length)
}

const arr=fromObj(components,true);
const gid2ids=gid=>gid.split('-').map(s=>gid2ch(s)).join('').trim(); //convert a gid to a char or IDS
const compfreq=arr.map(([gid,freq])=>[gid, gid2ids(gid), freq]);
if (writeChanged('compfreq.txt',compfreq.join('\n'))){
	console.log('written compfreq.txt',compfreq.length)
}


