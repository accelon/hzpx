/*
  input  glyphwiki-dump.txt
  output 
         public/cjkbmp.js    //不帶gid 之 CJK 兩萬字加ExtensionA的 glyphdata
	     public/cjkext.js    //不帶gid 之 CJK Extension B~F 的glyphdata
	     public/gwcomp.js   //帶gid 的 glyphdata

*/

import {nodefs,readTextLines,writeChanged } from 'pitaka/cli'
await nodefs;
import {alphabetically,splitUTF32,bsearch, packStrings,escapeTemplateString,fromObj} from 'pitaka/utils'
import {prepreNodejs,eachGlyphUnit,getGlyph_lexicon,setGlyph_lexicon,serializeGlyphUnit,
	loadComponents,frameOf,getGlyphWikiData,factorsOfGD ,derializeGlyphUnit,gidIsCJK} from './src/gwformat.js'
import {factorsOf} from 'hanziyin'
const lines=readTextLines('glyphwiki-dump.txt');
prepreNodejs(lines);

import {packGD,packGID} from './src/gwpacker.js';

const compFreq={};//
const unboxComp={}

//u65e5=99:0:0:0:0:200:200:u65e5-j
//所有用到 u65e5-j 都改為 u65e5
// "u65e5-j":"u65e5"
// u65e5 替換為 u65e5-j 的glyphdata
// u65e5-j 刪除 
// 這個步驟可省 1,619,589 bytes

// only one comp less than 0x7f 
// 1:0:2:33:37:149:37$1:22:23:149:37:149:152$1:0:0:15:96:188:96$1:0:2:34:152:149:152$99:0:0:40:-95:240:105:u002e$99:0:0:40:-35:240:165:u002e
// replace with basic stroke, taken from 母
setGlyph_lexicon('u200e0-jv','1:0:2:33:37:149:37$1:22:23:149:37:149:152$1:0:0:15:96:188:96$1:0:2:34:152:149:152$2:7:8:84:43:104:52:111:73$2:7:8:76:100:98:109:107:132');
setGlyph_lexicon('u002e','');

eachGlyphUnit((gid,units)=>{ //先找出所有 boxed glyph
	if (units.length==1 && units[0][0]=='99') {
		unboxComp[ units[0][7] ]=gid;		
	}
	for (let i=0;i<units.length;i++) {
		if (units[i][0]==='99') {
			const comp=units[i][7];
			if (!compFreq[comp])  compFreq[comp]=0;
			compFreq[comp]++;
		}
	}
})
const arr=fromObj(unboxComp);
writeChanged('unboxcomp.txt',arr.join('\n'))
const todelete=[];
eachGlyphUnit((gid,units)=>{ //先找出所有 boxed glyph
	let touched=false , newgid='' , oldgid;

	for (let i=0;i<units.length;i++) {
		if (units[i][0]=='99') {
			oldgid=units[i][7];
			newgid=unboxComp[oldgid];
			if (newgid && compFreq[oldgid]==1) {
				units[i][7]=newgid;
				touched=true;
			}
		}
	}
	if (touched) {
		if (gid===newgid) { //
			setGlyph_lexicon(gid, getGlyph_lexicon(oldgid));//replace with the comp glyphdata
			if (compFreq[oldgid]==1 && !gidIsCJK(oldgid) )  {
				setGlyph_lexicon(oldgid,''); //delete comp with sole reference
			}
		} else {
			setGlyph_lexicon(gid, serializeGlyphUnit(units))
		}
	}
})


const gw=getGlyphWikiData().filter(it=> it[it.length-1]!=='='); //remove the deleted entry

/*
if (writeChanged('gw.txt',out.join('\n'))) {
	console.log('gw.txt',out.length);
}
*/
//切成 3 個 JS ，
let cjkbmp=new Array(0x66F5) ,cjkext=new Array(0xfa10),gwcomp=[];

for (let i=0;i<gw.length;i++) {
	const at=gw[i].indexOf('=');
	let gid=gw[i].slice(0,at);
	let gd=gw[i].slice(at+1).replace(/@\d+/,'');
	const m=gid.match(/^u([\da-f]{4,5})$/);
	let done=false;
	let packedgd=packGD(gd);
	if (m) { //基本字
		const cp=parseInt(m[1],16);

		if (cp>=0x3400 && cp<=0x9fff) {
			cjkbmp[ cp-0x3400] = packedgd;done=true;
		} else if (cp>=0x20000 && cp<=0x2ffff){
			cjkext[ cp-0x20000] = packedgd;done=true;
		}

	}
	if (!done ) {
		gwcomp.push( gid+'='+packedgd ); //don not pack the gid 
	}
}

if (writeChanged('public/cjkbmp.js','window.CJKBMP=`'+escapeTemplateString(cjkbmp.join('\n'))+'`.split(/\\r?\\n/)')) {
	console.log('public/cjkbmp.js',cjkbmp.length);
}
if (writeChanged('public/cjkext.js','window.CJKEXT=`'+escapeTemplateString(cjkext.join('\n'))+'`.split(/\\r?\\n/)')) {
	console.log('public/cjkext.js',cjkext.length);
}
gwcomp.sort(alphabetically);

if (writeChanged('public/gwcomp.js','window.GWCOMP=`'+escapeTemplateString(gwcomp.join('\n'))+'`.split(/\\r?\\n/)')) {
	console.log('public/gwcomp.js',gwcomp.length);
}

// gid 和 gd  分開存，省約 30K
// const gwcompgid=gwcomp.map(([gid,gd])=>gid);
// const gwcompgd=gwcomp.map(([gid,gd])=>gd);

// if (writeChanged('public/gwcomp-gid.js','window.GWCOMPGID=`\n'+packStrings(gwcompgid)+'`.split(/\\r?\\n/)')) {
// 	console.log('public/gwcomp-gid.js',gwcompgid.length);
// }
// if (writeChanged('public/gwcomp-gd.js','window.GWCOMPGD=`\n'+gwcompgd.join('\n')+'`.split(/\\r?\\n/)')) {
// 	console.log('public/gwcomp-gd.js',gwcompgd.length);
// }

/* slow code ,  chise 式和 gw式 相同的部件內碼可去除 ，省300KB
		const gdfactors=factorsOfGD(gd);
		const factors=factorsOf( String.fromCodePoint(cp) ,{ids:true});
		if (factors && factors==gdfactors) {  //only works for pure composite glyphdata (no strokes)
			//replace gd and packed again (need to recalculate length of compname)
			const units=derializeGlyphUnit(gd,true);
			const F=splitUTF32(factors);
			if (units.length!==F.length) {
				console.log('unit len != factors.length',gid,gd, F, gdfactors)
			} else {
				for (let i=0;i<units.length;i++) {
					units[i][7]=units[i][7].replace('u'+F[i].toString(16), '');
				}
				// console.log('before',gd,'after',serializeGlyphUnit(units))
				packedgd=packGD(serializeGlyphUnit(units));

			}
		}
*/