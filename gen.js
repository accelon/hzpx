/*
  input  glyphwiki-dump.txt
  output 
         dist/cjkbmp.js    //不帶gid 之 CJK 兩萬字加ExtensionA的 glyphdata
	     dist/cjkext.js    //不帶gid 之 CJK Extension B~F 的glyphdata
	     dist/gwcomp.js   //帶gid 的 glyphdata
		// dist/ebag.js     //ebag 的造字

*/

import {LineBaser,nodefs,readTextLines,writeChanged,LEMMA_DELIMITER,packStrings,//meta_ebag
alphabetically,escapeTemplateString,fromObj,writePitaka} from 'ptk/nodebundle.cjs'

	//run ptk/dev-cjs.cmd to get common js version of ptk
await nodefs;

import {prepareForNodejs,eachGlyphUnit,getGlyph_lexicon,setGlyph_lexicon,serializeGlyphUnit,
	loadComponents,frameOf,getGlyphWikiData,factorsOfGD ,gidIsCJK} from './src/gwformat.js'
import {hotfix,tidyGlyphData} from './src/hotfix.js'

console.log('compressing glyphwiki-dump.txt');
const lines=readTextLines('glyphwiki-dump.txt'); //tab seperated 2 fields text file
prepareForNodejs(lines);
const es6=process.argv[2]=='es6';
const split=false; //add split(/\r?\n/) at the end , old format
import {packGD,packGID} from './src/gwpacker.js';

hotfix();
const {compFreq, unboxed} = tidyGlyphData();
writeChanged('unboxcomp.txt',unboxed.join('\n'));

const gw=getGlyphWikiData().filter(it=> it[it.length-1]!=='\t'); //remove the deleted entry

/*
if (writeChanged('gw.txt',out.join('\n'))) {
	console.log('gw.txt',out.length);
}
*/

//切成 3 個 JS ，
let cjkbmp=new Array(0x66F5) ,cjkext=new Array(0xfa10+0x23AF) //20000~2fa10(BCDEF) 30000~323AF (GH)
,gwcomp=[];
gw.sort(alphabetically);
//cjkebag=new Array(0x34FFF); //
// 

for (let i=0;i<gw.length;i++) {
	const at=gw[i].indexOf('\t');
	let gid=gw[i].slice(0,at);
	let gd=gw[i].slice(at+1);//.replace(/@\d+/,'');

	/*
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
    
*/

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
		//} else if (cp>=0xA0000 && cp<0xD4FFF) { //ebag
		//	cjkebag[ cp-0xA0000] = packedgd;done=true;
		//}
		}
		if (!done ) {
			gwcomp.push( [gid,packedgd] ); //don not pack the gid 
		}
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
	//lbase.append( cjkebag,{name:'ebag'});
	const jsonp=true;
	//compress 1.9MB , 150ms more load time
	await writePitaka(lbase,{name:"hzpx" , jsonp, compress:false});
}
//createPitaka();




// gid 和 gd  分開存，省約 30K
 const gwcompgid=gwcomp.map(([gid,gd])=>gid);
 const gwcompgd=gwcomp.map(([gid,gd])=>gd);

 if (writeChanged('dist/gwcomp-gid.js','window.GWCOMPGID=`\n'+packStrings(gwcompgid)+'`.split(/\\r?\\n/)')) {
 	console.log('dist/gwcomp-gid.js',gwcompgid.length);
 }
 if (writeChanged('dist/gwcomp-gd.js','window.GWCOMPGD=`\n'+gwcompgd.join('\n')+'`.split(/\\r?\\n/)')) {
 	console.log('dist/gwcomp-gd.js',gwcompgd.length);
 }



// slow code ,  chise 式和 gw式 相同的部件內碼可去除 ，省300KB

	// 	const gdfactors=factorsOfGD(gd);
	// 	const factors=factorsOf( String.fromCodePoint(cp) ,{ids:true});
	// 	if (factors && factors==gdfactors) {  //only works for pure composite glyphdata (no strokes)
	// 		//replace gd and packed again (need to recalculate length of compname)
	// 		const units=derializeGlyphUnit(gd,true);
	// 		const F=splitUTF32(factors);
	// 		if (units.length!==F.length) {
	// 			console.log('unit len != factors.length',gid,gd, F, gdfactors)
	// 		} else {
	// 			for (let i=0;i<units.length;i++) {
	// 				units[i][7]=units[i][7].replace('u'+F[i].toString(16), '');
	// 			}
	// 			// console.log('before',gd,'after',serializeGlyphUnit(units))
	// 			packedgd=packGD(serializeGlyphUnit(units));

	// 		}
	// 	}
	// }
	