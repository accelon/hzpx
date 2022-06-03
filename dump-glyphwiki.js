import {nodefs,readTextLines,writeChanged,fromObj,alphabetically} from 'pitaka/cli';
import {getGlyph,prepareRawGW,setGlyphDB,eachGlyph,loadComponents} from './src/gwformat.js'
await nodefs;
const lines=readTextLines('glyphwiki/dump_newest_only.txt');
prepareRawGW(lines);
//first pass , dump the BMP
const BMP=[], COMP=[];
const components={};
const Compdata=[];
const codePointOf=str=>{
	if (str.match(/^u[a-f\d]{4,5}$/)) {
		return parseInt(str.slice(1,5),16);
	}
}
eachGlyph( (gid, data)=>{
	if (gid.match(/^u[a-f\d]{4,5}$/)) {
		const cp=codePointOf(gid);
		if (cp>=0x4E00 && cp<=0x9ffd){
			BMP.push(gid+'='+data);
			loadComponents( data , components);
		}
	}
})
for (let comp in components) {
	const cp=codePointOf(comp);
	if (!(cp>=0x4E00 && cp<=0x9ffd)){
		const d=getGlyph(comp);
		if (d) {
			BMP.push(comp+'='+d)
		} else {
			console.log('cannot get glyph',comp)
		}
	}
}
BMP.sort(alphabetically)
// Compdata.sort(alphabetically)
if (writeChanged('public/bmp.js','window.BMP=`'+BMP.join('\n')+'`.split(/\\r?\\n/);')){
	console.log('written bmp.js',BMP.length)
}
// if (writeChanged('comp.js',Compdata.join('\n'))){
// 	console.log('written comp.js',Compdata.length)
// }

const arr=fromObj(components,true);
if (writeChanged('compname.txt',arr.join('\n'))){
	console.log('written compname.txt',arr.length)
}


