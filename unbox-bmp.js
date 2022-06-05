import {nodefs,readTextLines,writeChanged } from 'pitaka/cli'
await nodefs;
import {alphabetically,splitUTF32Char,bsearch} from 'pitaka/utils'
import {prepreNodejs,getGlyph,gw,eachGlyph,setGlyph_js,loadComponents,frameOf} from './src/gwformat.js'
const lines=readTextLines('./public/bmp.js');
prepreNodejs(lines);
/*
u824d-jv=99:0:0:2:0:172:200:u821f-01$99:0:0:15:0:200:200:u5c45-02 //no other reference bu u824d
u824d=99:0:0:0:0:200:200:u824d-jv //full frame include 

convert to 

u824d=99:0:0:2:0:172:200:u821f-01$99:0:0:15:0:200:200:u5c45-02

*/
const refcount={};
const fullframechar=[];

eachGlyph( (gid,data)=>{
	const compObj={}
	loadComponents(data,compObj,true);
	for (let c in compObj) {
		if (!refcount[c])refcount[c]=0;
		refcount[c]++;
	}
	if (data.slice(0,18)=='99:0:0:0:0:200:200' && data.indexOf('$')==-1) {
		const comp=data.slice(19);
		fullframechar.push([ gid, comp]);
	}
})
//now we can an array of full frame char and it's sole component,
//if the component is not used elsewhere , we can combine replace the full frame char with the component data
let cannotdelete=0;
for (let i=0;i<fullframechar.length;i++) {
	const [gid , comp]=fullframechar[i];
	if (refcount[comp]==1) {
		setGlyph_js(gid ,getGlyph(comp) );
		setGlyph_js(comp, '');//delete the comp, last char will be =
	} else {
		cannotdelete++;
		// console.log('comp',comp,'reference',refcount[comp])
	}
}
const out=gw.filter(it=> it[it.length-1]!=='='); //remove the deleted entry
console.log('cannot delete',cannotdelete ,'removed count',gw.length-out.length)
if (writeChanged('gw-unbox.txt',out.join('\n'))) {
	console.log('gw-unbox.txt',out.length,);
}
//bmp.js 只省了 7kb , 188 個部件