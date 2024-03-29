/*
  input  glyphwiki-dump.txt
  output 
         public/cjkbmp.js    //不帶gid 之 CJK 兩萬字加ExtensionA的 glyphdata
	     public/cjkext.js    //不帶gid 之 CJK Extension B~F 的glyphdata
	     public/gwcomp.js   //帶gid 的 glyphdata
		 public/ebag.js     //ebag 的造字

*/

import {LineBaser,nodefs,readTextLines,writeChanged,meta_ebag,LEMMA_DELIMITER,
	 escapeTemplateString,fromObj,writePitaka} from 'ptk/nodebundle.cjs'

	//run ptk/dev-cjs.cmd to get common js version of ptk
await nodefs;

import {prepareForNodejs,eachGlyphUnit,getGlyph_lexicon,setGlyph_lexicon,serializeGlyphUnit,
	loadComponents,frameOf,getGlyphWikiData,factorsOfGD ,gidIsCJK} from './src/gwformat.js'

console.log('compressing glyphwiki-dump.txt');
const lines=readTextLines('glyphwiki-dump.txt');
prepareForNodejs(lines);
const es6=process.argv[2]=='es6';
const split=false; //add split(/\r?\n/) add the end , old format
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
//hot fix for 寶,inorder to make 邏羅寶貝𩀨從䞃致招  look nice
setGlyph_lexicon('u5bf6-j','99:0:0:0:0:200:200:u21a67-03:0:0:0$99:0:0:0:100:200:195:u8c9d:0:0:0');
setGlyph_lexicon('u5348@1','99:0:0:0:0:200:200:u5348-j') ;//結尾有$ 是錯的
//'u5bf6-j=99:0:0:0:0:200:200:u21a67-03:0:0:0$99:0:0:0:50:200:195:u8c9d-04:0:0:0'

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

//remove unneeded entry
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


const gw=getGlyphWikiData().filter(it=> it[it.length-1]!=='\t'); //remove the deleted entry

/*
if (writeChanged('gw.txt',out.join('\n'))) {
	console.log('gw.txt',out.length);
}
*/

//切成 3 個 JS ，
let cjkbmp=new Array(0x66F5) ,cjkext=new Array(0xfa10+0x23AF) //20000~2fa10(BCDEF) 30000~323AF (GH)
,gwcomp=[], 
cjkebag=new Array(0x34FFF); //
// gw.sort(alphabetically);

for (let i=0;i<gw.length;i++) {
	const at=gw[i].indexOf('\t');
	let gid=gw[i].slice(0,at);
	let gd=gw[i].slice(at+1);//.replace(/@\d+/,'');

	gid=gid.replace(/ebag_(s\d\d\d\-\d\d\d)/g,(m,m1)=>{
		const seal=meta_ebag.toSeal(m1);
		if (!seal) {
			console.log('wrong ebag',m1)
		}
		return 'u'+seal.codePointAt(0).toString(16).toLowerCase()
	} );
	gd=gd.replace(/ebag_(s\d\d\d\-\d\d\d)/g,(m1)=>{
		const seal=meta_ebag.toSeal(m1);
		if (!seal) {
			console.log('wrong ebag',m1)
		}
		return 'u'+seal.codePointAt(0).toString(16).toLowerCase()
	} );



	const m=gid.match(/^u([\da-f]{4,5})$/);
	let done=false;
	if (!gd) {
		console.log('empty gd',gw[i],i)
	}
	let packedgd=packGD(gd);
	if (m) { //基本字
		let cp=parseInt(m[1],16);
		if (cp>=0x3400 && cp<=0x9fff) {
			cjkbmp[ cp-0x3400] = packedgd;done=true;
		} else if (cp>=0x20000 && cp<=0x3ffff){
			cjkext[ cp-0x20000] = packedgd;done=true;
		} else if (cp>=0xA0000 && cp<0xD4FFF) { //ebag
			cjkebag[ cp-0xA0000] = packedgd;done=true;
		}
	}
	if (!done ) {
		gwcomp.push( [gid,packedgd] ); //don not pack the gid 
	}
}

//console.log(cjkbmp.length,cjkext.length , gwcomp.length)
const createPitaka=async ()=>{
	const lbase=new LineBaser();	
	const keys=gwcomp.map(it=>it[0]).join(LEMMA_DELIMITER);
	const values=gwcomp.map(it=>it[1]).join('\n');
	lbase.append( keys , {name:'gid'});
	lbase.append( values , {name:'gwcomp'});
	lbase.append( cjkbmp,{name:'bmp'});
	lbase.append( cjkext,{name:'ext'});
	lbase.append( cjkebag,{name:'ebag'});
	const jsonp=true;
	//compress 1.9MB , 150ms more load time
	await writePitaka(lbase,{name:"hzpx" , jsonp, compress:false});
}
createPitaka();


const writePureJS=()=>{
	const wrapmod=(name,content)=>(es6?`export const ${name} =\``:`Hzpx.addFontData('${name.toLowerCase()}',\``)
		+escapeTemplateString(content.join('\n'))+(split?'`.split(/\\r?\\n/)':'') + (es6?'`':'`)');

	if (es6) console.log('output es6 *.mjs in public')
	if (writeChanged('public/cjkbmp.'+(es6?'mjs':'js'),wrapmod('CJKBMP',cjkbmp))) {
		console.log('cjkbmp',cjkbmp.length);
	}
	if (writeChanged('public/cjkext.'+(es6?'mjs':'js'),wrapmod('CJKEXT',cjkext))) {
		console.log('cjkext',cjkext.length);
	}
	// gwcomp.sort(alphabetically);

	if (writeChanged('public/gwcomp.'+(es6?'mjs':'js'),wrapmod('GWCOMP',gwcomp))) {
		console.log('gwcomp',gwcomp.length);
	}

	if (writeChanged('public/cjkebag.'+(es6?'mjs':'js'),wrapmod('CJKEBAG',cjkebag))) {
		console.log('cjkebag',cjkebag.length);
	}
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