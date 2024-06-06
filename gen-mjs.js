/* 產生 nodejs 需要的 module js 檔，不壓縮 */

import {nodefs,readTextLines,writeChanged,LEMMA_DELIMITER,
alphabetically,escapeTemplateString,fromObj,writePitaka} from 'ptk/nodebundle.cjs'
import {hotfix,tidyGlyphData} from './src/hotfix.js'
await nodefs;

import {prepareForNodejs,getGlyphDataByIndex,eachGlyphUnit,getGlyph_lexicon,setGlyph_lexicon,serializeGlyphUnit,
	loadComponents,frameOf,getGlyphWikiData,factorsOfGD ,gidIsCJK} from './src/gwformat.js'

console.log('generating dist/*.mjs glyphwiki-dump.txt');
const lines=readTextLines('glyphwiki-dump.txt');
const gidarr=prepareForNodejs(lines);
let split=false,es6=true;
hotfix();
const {compFreq}=tidyGlyphData();

let cjkbmp=new Array(0x66F5) ,cjkext=new Array(0xfa10+0x23AF) 
const gwcomp=[];
for (let i=0;i<gidarr.length;i++) {
    const gid=gidarr[i];
    const m=gid.match(/^u([\da-f]{4,5})$/);
    let done=false;
    const body=getGlyphDataByIndex(i);
    //let packedgd=packGD(gd);
    if (m) { //基本字
        let cp=parseInt(m[1],16);
        if (cp>=0x3400 && cp<=0x9fff) {
            cjkbmp[ cp-0x3400] = body;done=true;
        } else if (cp>=0x20000 && cp<=0x3ffff){
            cjkext[ cp-0x20000] = body;done=true;
        }
        if (!done ) {
            gwcomp.push( [gid,body] ); //don not pack the gid 
        }
    } else {
        if (compFreq[gid]>1) {
            console.log(gid)
        }
    }
}

const writePureJS=()=>{
	const wrapmod=(name,content)=>(es6?`export const ${name} =\``:`Hzpx.addFontData('${name.toLowerCase()}',\``)
		+escapeTemplateString(content.join('\n'))+(split?'`.split(/\\r?\\n/)':'') + (es6?'`':'`)');

	if (es6) console.log('output es6 *.mjs in public')
	if (writeChanged('dist/cjkbmp.'+(es6?'mjs':'js'),wrapmod('CJKBMP',cjkbmp))) {
		console.log('cjkbmp',cjkbmp.length);
	}
	if (writeChanged('dist/cjkext.'+(es6?'mjs':'js'),wrapmod('CJKEXT',cjkext))) {
		console.log('cjkext',cjkext.length);
	}
	// gwcomp.sort(alphabetically);

	if (writeChanged('dist/gwcomp.'+(es6?'mjs':'js'),wrapmod('GWCOMP',gwcomp.map(it=>it.join('\t'))))) {
		console.log('gwcomp',gwcomp.length);
	}

	// if (writeChanged('dist/cjkebag.'+(es6?'mjs':'js'),wrapmod('CJKEBAG',cjkebag))) {
	// 	console.log('cjkebag',cjkebag.length);
	// }
}
writePureJS();