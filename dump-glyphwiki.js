import {nodefs,readTextLines,writeChanged,fromObj,alphabetically} from 'pitaka/cli';
import {getGlyph,prepareRawGW,setGlyphDB,eachGlyph,loadComponents} from './src/gwformat.js'
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
	if (m) {
		gid=gid.replace(/@\d+$/,'');//remove variant
		const cp=parseInt( m[1],16);
		if ( (cp>=0x3400 && cp<=0x9FFF) || (cp>=0x20000 && cp<=0x2ffff) ){
			GW.push(gid+'='+data);
			added[gid]=true;
			loadComponents( data , components); //load all components needed by this unicode char
		}
	}
})

for (let comp in components) {
	comp=comp.replace(/@\d+$/,'');
	const cp=codePointOf(comp);
	if (!added[comp]){
		const d=getGlyph(comp);
		if (d) {
			GW.push(comp+'='+d)
		} else {
			console.log('cannot get glyph',comp)
		}
		added[comp]=true;
	}
}

GW.sort(alphabetically)

if (writeChanged('public/bmp.js','window.GW=`\n'+GW.join('\n')+'\n`.split(/\\r?\\n/);')){
	console.log('written bmp.js',GW.length)
}

const arr=fromObj(components,true);
if (writeChanged('compname.txt',arr.join('\n'))){
	console.log('written compname.txt',arr.length)
}


