import {bsearch} from 'pitaka/utils'
let gw= typeof window!=='undefined' && window.BMP;
let _cjkbmp= typeof window!=='undefined' && window.CJKBMP;
let _cjkext= typeof window!=='undefined' && window.CJKEXT;
let _gwcomp= typeof window!=='undefined' && window.GWCOMP;
import {unpackGD,packGID} from './gwpacker.js'

export let basing=typeof window!=='undefined' && window.BASING;
const basingCache={};


export const getGlyphWikiData=()=>gw;
export const prepreNodejs=(bmp,_basing)=>{
	let at=bmp[0].indexOf('`');
	if (~at) bmp[0]=bmp[0].slice(at+1);
	at=bmp[bmp.length-1].indexOf('`');
	if (~at) bmp[bmp.length-1]=bmp[bmp.length-1].slice(0,at);
	if (!bmp[0]) bmp.shift();
	if (!bmp[bmp.length-1]) bmp.pop();
	gw=bmp;
	if (_basing)basing=_basing.sort(alphabetically);
	// buildDerivedIndex();
}

const getGID=id=>{ //replace versioning , allow code point or unicode char
	let r='';
	if (typeof id=='number') gid=ch2gid(id);
	else if (id.codePointAt(0)>0x2000) {
		id='u'+id.codePointAt(0).toString(16);
	}
	return id.replace(/@\d+$/,''); // no versioning (@) in the key
}
export const setGlyph_lexicon=(s,data)=>{ //replace the glyph data
	const gid=getGID(s);
	const at=bsearch(gw,gid+'=',true);
	if (at>0) {
		let from=gw[at].indexOf('=');
		gw[at]=gw[at].slice(0,from+1)+data;
	}
}
export const gidIsCJK=s=>s.match(/^u([\da-f]{4,5})$/);
const getGlyph_js=s=>{
	const gid=getGID(s);
	const m=gid.match(/^u([\da-f]{4,5})$/);
	if (m) {
		const cp=parseInt(m[1],16);
		if (cp>=0x20000) {
			const gd=_cjkext[cp-0x20000];
			return unpackGD(gd);
		} else if (cp>=0x3400 && cp<0x9FFF) {
			const gd=_cjkbmp[cp-0x3400];
			// console.log(gid,gd)
			return unpackGD(gd);
		}
	}
	const gd=getGlyph_lexicon(gid, _gwcomp);
	return unpackGD(gd);
}
export const getGlyph_lexicon=(s,lexicon=gw)=>{
	const gid=getGID(s);
	const at=bsearch(lexicon,gid+'=',true);
	let r='';
	if (at>=0  && (lexicon[at].slice(0,gid.length+1)==gid+'=')) {
		const from=lexicon[at].indexOf('=');
		r=lexicon[at].slice(from+1);
	}
	return r;
}
export let getGlyph=getGlyph_js;

export const setGlyphDB=_gw=>{ //use raw glyphwiki dump (assuming sorted)
	gw=_gw;
	getGlyph=getGlyph_wiki;
}
export const getGlyph_wiki=gid=>{ //get from raw wiki format
	if (gid[0]!==' ') gid=' '+gid;//first char is always ' '
	if (~gid.indexOf('@')) {
		gid=gid.replace(/@\d+$/,'');
	}
	const at=bsearch(gw,gid,true); //try to reuse getGlyph_js

	if (at<1) {
		// console.log('not found',gid)
		return '';
	}
	if (gw[at].slice(0,gid.length+1)!==gid+' ') {
		// console.log('not found2',gid,gw[at])
		return '';
	}
	return gw[at].slice(84);
}
export const eachGlyphUnit=cb=>{
	eachGlyph((gid,data)=>{
		const units=data.split('$');
		const arr=units.map(u=>u.split(':'));
		cb(gid,arr);
	})
}

export const serializeGlyphUnit=glyphunits=>glyphunits.map(it=>it.join(':')).join('$');
export const derializeGlyphUnit=glyphdata=>glyphdata.split('$').filter(it=>it!=='0:0:0:0').map(item=>item.split(':'));

export const eachGlyph=cb=>{
	for (let i=0;i<gw.length;i++) {
		if (getGlyph==getGlyph_wiki) {
			const gid=gw[i].slice(0,72).trim();
			const data=gw[i].slice(84);
			cb(gid,data);			
		} else {
			const at=gw[i].indexOf('=');
			cb( gw[i].slice(0,at),gw[i].slice(at+1));
		}
	}
}
export const fillGlyphData=compObj=>{ 
	for (let comp in comps) {
		comps[comp]=getGlyph(comp);
	}
}
export const componentsOf=ch=>{
	const d=getGlyph(ch);
	return componentsOfGD(d).filter(it=>it!==ch);
	// return []
}
export const factorsOfGD=gd=>{
	const units=derializeGlyphUnit(gd);
	let factors='';
	for (let i=0;i<units.length;i++) {
		if (units[i][0]=='99') {
			factors+= gid2ch(units[i][7]);
		}
	}
	return factors;
}
export const componentsOfGD=(d,returnid=false)=>{
	const comps={};
	loadComponents(d,comps);
	const out=Object.keys(comps);
	return returnid?out:out.map( gid2ch );
}
let depth=0;
export const loadComponents=(data,compObj,countrefer=false)=>{ //enumcomponents recursively
	const entries=data.split('$');
	depth++;
	if (depth>10) {
		console.log('too deep fetching',data); //this occur only when glyphwiki data is not in order.
		return;
	}
	for (let i=0;i<entries.length;i++) {
		if (entries[i].slice(0,3)=='99:') {
			let gid=entries[i].slice(entries[i].lastIndexOf(':')+1);
			if (parseInt(gid).toString()==gid) { //部件碼後面帶數字
				gid=(entries[i].split(':')[7]).replace(/@\d+$/,'');
			}
			const d=getGlyph(gid);
			if (!d) {
				console.log('glyph not found',gid);
			} else {
				if (countrefer) {
					if (!compObj[gid])compObj[gid]=0;
					compObj[gid]++;					
				} else {
					if (!compObj[gid])compObj[gid]= getGlyph(gid)
				}
				loadComponents(d,compObj,countrefer);
			}
		}
	}
	depth--;
}
let derived=null;

export const derivedOf=gid=>{
	if (!derived) buildDerivedIndex();
	if (typeof gid=='number') gid=ch2gid(gid);
	else if (gid.charCodeAt(0)>0x2000) {
		gid='u'+gid.charCodeAt(0).toString(16);
	}
	return derived[gid];
}

export const buildDerivedIndex=()=>{
	if (!derived) derived={};
	console.time('buildDerivedIndex')
	eachGlyph((gid,data)=>{
		const comps=componentsOfGD(data,true);
		for (let i=0;i<comps.length;i++) {
			if (!derived[comps[i]]) derived[comps[i]]=[];
			derived[comps[i]].push(gid);
		}
	})
	console.timeEnd('buildDerivedIndex');
}
export const frameOf=(gd, rawframe)=>{
	const entries=gd.split('$');
	let frames=[];
	let gid='';
	for (let i=0;i<entries.length;i++) {
		if (entries[i].slice(0,3)==='99:') {
			const [m,a1,a2,x1,y1,x2,y2,id]=entries[i].split(':');
			frames.push([x1,y1,x2,y2]);
			gid=id;
		}
	}
	if (!rawframe && frames.length==1) { //自動全框展開
		frames=frameOf(getGlyph(gid));
	}
	return frames
}

export const baseOf=ch=>{
	let base=basingCache[ch]||'';
	if (!base) for (let i=0;i<basing.length;i++) {
		const at=basing[i].indexOf(ch ,1);
		if (at>1) { // omiting '='
			base=String.fromCodePoint(basing[i].codePointAt(0));
			basingCache[ch]=base;
			break;
		}
	}
	return base;
}

export const prepareRawGW=(gw)=>{
	const srcfn='glyphwiki/dump_newest_only.txt'; //assuming sorted alphabetically
	// console.log('reading',srcfn);
	gw.shift();gw.shift();//drop heading
	// while (gw.length && gw[gw.length-1].slice(0,2)!==' z') gw.pop();
	setGlyphDB(gw);
}



export const glyphWikiCount=()=>gw?gw.length: (_gwcomp.length+_cjkbmp.length+_cjkext.length);
export const ch2gid=ch=>'u'+(typeof ch=='number'?ch:ch.codePointAtAt(0)).toString(16);
export const gid2ch=gid=> {
	if (gid[0]!=='u') return ' ';
	let n=parseInt(gid.slice(1) ,16)
	if (n<0x20 ||isNaN(n)) n=0x20;
	return String.fromCodePoint(n);
}