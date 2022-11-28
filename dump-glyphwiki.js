/*
input : glyphwiki website dump 
output: 

1) glyphwiki-dump.txt : 所有的漢字加上組成這些字形的所有。
2) compfreq.txt       : 構件的id 以及循環引用次數。
                        (雖然「盟」=明皿 沒有直接用到日和月, 但由於「明」，日和月的引用次數也增加。)
                       口8262 , 冖 5655, 艹 5259 意思是在八萬多個字中，會看到「口」八千多次。

*/

import {nodefs,readTextLines,writeChanged,fromObj,alphabetically} from 'ptk/nodebundle.cjs';
import {getGlyph,prepareRawGW,getLatestVersion,eachGlyph,loadComponents,gid2ch} from './src/gwformat.js'
await nodefs;

//manually remove extra space before |, nodejs cannot convert string more than 500MB 0x1ffffe8
//remove leading space, replace \@ to @
const lines=readTextLines('glyphwiki/dump_all_versions_small.txt','utf8');

prepareRawGW(lines);

//first pass , dump the BM
const GW=[], added={};
const components={};
console.log('loaded dump_all_versions')
const codePointOf=str=>{
	if (str.match(/^u[a-f\d]{4,5}$/)) {
		return parseInt(str.slice(1,5),16);
	}
}
const errordata={
	'u3659-g@1':true, //99:0:0:0:0:200:200zihai-023754
	'u2f8b1-kp@1':true, //99:0:0:0:0:200:200u2f8b1-t
	'dkw-03417@12':true,
	'u20bf0@15':true,// 99:0:0:0:0:200:200u20bf0-jv
	'u24f57-var-003@1':true,//
	'u3a9a-t@1':true,//recursive
	'u5b57-v02@1':true,
	'u5b57-v02@2':true,
}
eachGlyph( (gid, data)=>{
	if (!gid ||errordata[gid]) return;
	const m=gid.match(/^u([a-f\d]{4,5})@\d+/);
	if (m) {
		//cjk A~H
		const latest=getLatestVersion(gid);
		if (latest==gid) { //only add the latest version
			if (!components[gid]) components[gid]=0;
			components[gid]++;	
			loadComponents( data , components,true,gid); //load all components needed by this unicode char	
		}
	} else if (gid.match(/ebag_s\d\d\d\-\d\d\d/)) {
		if (!components[gid]) components[gid]=0;
		components[gid]++;
		loadComponents(data,components, true,gid)
	}
})

for (let comp in components) {
	//comp=comp.replace(/@\d+$/,'');
	const d=getGlyph(comp);
	const latest=getLatestVersion(comp);
	if (latest==comp) {
		comp=comp.replace(/@\d+/,'');
	}
	if (d) {
		GW.push(comp+'='+d);//.replace(/@\d+/g,''))
	} else {
		console.log('cannot get glyph',comp)
	}
}

GW.sort(alphabetically)


if (writeChanged('glyphwiki-dump.txt',GW.join('\n'))){
	console.log('written glyphwiki-dump.txt',GW.length)
}

const arr=fromObj(components,true);
const gid2ids=gid=>gid.split('-').map(s=>gid2ch(s)).join('').trim(); //convert a gid to a char or IDS
const compfreq=arr.map(([gid,freq])=>[gid, gid2ids(gid), freq]).filter(it=>it[2]>1);
if (writeChanged('compfreq.txt',compfreq.join('\n'))){
	console.log('written compfreq.txt',compfreq.length)
}


