//TODO , move duplicate code to hzpx-engine
export const alphabetically0=(a,b)=>a[0]>b[0]?1: ((a[0]<b[0])?-1:0);
import {bsearch,codePointLength} from 'ptk/nodebundle.cjs'


let gw= typeof window!=='undefined' && window.BMP; //weird naming
let _cjkbmp= typeof window!=='undefined' && window.CJKBMP;
let _cjkext= typeof window!=='undefined' && window.CJKEXT;
let _gwcomp= typeof window!=='undefined' && window.GWCOMP;

import {unpackGD,packGID} from './gwpacker.js'

// export let basing=typeof window!=='undefined' && window.BASING;
// const basingCache={};

let gidarr=[], gbody=[];
export const getGlyphWikiData=()=>gw;
export const prepareForNodejs=(lines)=>{
	let at=lines[0].indexOf('`');
	if (~at) lines[0]=lines[0].slice(at+1);
	at=lines[lines.length-1].indexOf('`');
	if (~at) bmp[lines.length-1]=lines[lines.length-1].slice(0,at);
	if (!lines[0]) lines.shift();
	if (!lines[lines.length-1]) lines.pop();

	const temp=[];
	for (let i=0;i<lines.length;i++) {
		const at2=lines[i].indexOf('\t');
		temp.push([lines[i].slice(0,at2),lines[i].slice(at2+1)])
	}
	temp.sort(alphabetically0);
	for (let i=0;i<temp.length;i++) {
		gidarr.push(temp[i][0])
		gbody.push(temp[i][1])
	}
	// if (_basing)basing=_basing.sort(alphabetically);
	// buildDerivedIndex();
	return gidarr;
}
export const getAllGlyph=()=>gbody;
const getGID=id=>{ //replace versioning , allow code point or unicode char
	let r='';
	if (typeof id=='number') id=ch2gid(id);
	else if (id.codePointAt(0)>0x2000) {
		id='u'+id.codePointAt(0).toString(16);
	}
	return id;//.replace(/@\d+$/,''); // no versioning (@) in the key
}
export const setGlyph_lexicon=(s,data)=>{ //replace the glyph data
	const gid=getGID(s);
	const at=bsearch(gw,gid+'\t',true);
	if (at>0) {
		let from=gw[at].indexOf('\t');
		gw[at]=gw[at].slice(0,from+1)+data;
	}
}

export const updateGlyphData=(s,data)=>{ //replace the glyph data
	const gid=getGID(s);
	const at=bsearch(gidarr,gid);
	if (~at) {
		gbody[at]=data;
	}
}
export const getGlyphData=s=>{
	const gid=getGID(s);
	const at=bsearch(gidarr,gid);
	return ~at?gbody[at]:'';
}
export const getGlyphDataByIndex=n=>{
	return gbody[n]
}
export const gidIsCJK=s=>s.match(/^u([\da-f]{4,5})$/);
let ggcalls=0;
const getGlyph_js=s=>{
	if (typeof s=='number') s=String.fromCodePoint(s)

	if (!s||( typeof s=='string' && s.codePointAt(0)>0xff && codePointLength(s)>1)) {
		return ''; //is an ire
	}
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
	const at=bsearch(lexicon,gid+'\t',true);
	let r='';
	if (at>=0  && (lexicon[at].slice(0,gid.length+1)==gid+'\t')) {
		const from=lexicon[at].indexOf('\t');
		r=lexicon[at].slice(from+1);
	}
	return r;
}
const getGlyph_default=(s)=>{
	const gid=getGID(s);
	const at=bsearch(gidarr,gid);
	if (at>0) {
		return gbody[at]
	}
	return '';
};
export let getGlyph=getGlyph_default;

export const setGlyph=(s,data)=>{
	const gid=getGID(s);
	const at=bsearch(gidarr,gid);
	if (at>0) {
		gbody[at]=data;
	}
}

export const setGlyphDB=_gw=>{ //use raw glyphwiki dump (assuming sorted)
	gw=_gw;
	getGlyph=getGlyph_wiki;
}
const findLatest=(at)=>{
	const prefix= gw[at].replace(/@.+/,'')+'@';
	let from=at-1, to=at;
	let latest=0;
	//@10 might come earlier than @9
	while (from>0 && gw[from].slice(0,prefix.length)===prefix) {
		const version= parseInt(gw[from].slice(prefix.length));
		if (version>latest) {
			at=from;
			latest=version;
		}
		from--;
	}

	while (to<gw.length && gw[to].slice(0,prefix.length)===prefix) {
		const version= parseInt(gw[to].slice(prefix.length));
		if (version>latest) {
			at=to;
			latest=version;
		}
		to++;
	}
	return at;
}
export const getLatestVersion=(gid,debug)=>{
	const prefix=gid.replace(/@\d+/,'')+'@';
	
	const at=bsearch(gw,prefix,true); //try to reuse getGlyph_js
	const newat=findLatest(at);
	const at2=gw[newat].indexOf('|');

	const r=gw[newat].slice(0,at2).trim();
	return r;
}
const getData=at=>{
	const at2=gw[at].indexOf('|');
	const at3=gw[at].indexOf('|',at2+1);
	let d=gw[at].slice(at3);
	if (d[0]=='|') d=d.slice(1).trim();
	return d;
}
export const getGlyph_wiki=(gid,debug)=>{ //get from raw wiki format
	if (gid.indexOf('@')==-1) gid=gid+'@';
	let at=bsearch(gw,gid,true); //try to reuse getGlyph_js

	if (at<1) return '';

	//gid didn't specified version number, use the latest
	if (gid[gid.length-1]=='@') at=findLatest(at);

	return getData(at);
}
export const eachGlyphUnit=cb=>{
	eachGlyph((gid,data)=>{
		const units=data.split('$');
		const arr=units.map(u=>u.split(':'));
		cb(gid,arr);
	})
}

export const serializeGlyphUnit=glyphunits=>glyphunits.map(it=>it.join(':')).join('$');
export const deserializeGlyphUnit=glyphdata=>glyphdata.split('$').filter(it=>it!=='0:0:0:0').map(item=>item.split(':'));

export const eachGlyph=cb=>{
	if (gidarr.length) {
		for (let i=0;i<gidarr.length;i++) {
			cb(gidarr[i],gbody[i]);
		}
	} else {
		if (_cjkbmp) {
			for (let i=0;i<_cjkbmp.length;i++) cb('u'+(i+0x3400).toString(16), unpackGD(_cjkbmp[i]));
			for (let i=0;i<_cjkext.length;i++) cb('u'+(i+0x20000).toString(16), unpackGD(_cjkext[i]));
		} else {
	
			for (let i=0;i<gw.length;i++) {
				if (getGlyph==getGlyph_wiki) { //allow remove excessive space
					const at=gw[i].indexOf('|');
					const gid=gw[i].slice(0,at).trim();
					const at2=gw[i].indexOf('|',at+1);
					const data=gw[i].slice(at2+1).trim();
					cb(gid,data);			
				} else {
					const at=gw[i].indexOf('\t');
					cb( gw[i].slice(0,at),gw[i].slice(at+1));
				}
			}		
		}	
	}
}
export const fillGlyphData=compObj=>{ 
	for (let comp in comps) {
		comps[comp]=getGlyph(comp);
	}
}
export const componentsOf=(ch,returnid=false)=>{
	const d=getGlyph(ch);
	return componentsOfGD(d,returnid).filter(it=>it!==ch);
	// return []
}
export const factorsOfGD=(gd,gid)=>{
	const units=deserializeGlyphUnit(gd);
	let factors=[];
	if (units.length==1 && units[0][0]==='99') { //full frame char , dig in 
		const compid=units[0][7];
		return factorsOfGD(getGlyph(compid),compid);
	}
	for (let i=0;i<units.length;i++) {
		if (units[i][0]==='99') {
			factors.push(units[i][7]);
		}
	}
	return gid?factors:factors.map(gid2ch).join('');
}
export const componentsOfGD=(d,returnid=false)=>{
	const comps={};
	loadComponents(d,comps);
	const out=Object.keys(comps);
	return returnid?out:out.map( gid2ch );
}
const depths=[];

export const loadComponents=(data,compObj,countrefer=false,mastergid,debug)=>{ //enumcomponents recursively
	const entries=data.split('$');
	depths.push(mastergid);
	
	if (depths.length>15) {
		console.log(depths)
		throw 'too deep fetching'; //this occur only when glyphwiki data is not in order.
		return;
	}
	for (let i=0;i<entries.length;i++) {
		if (entries[i].slice(0,3)=='99:') {
			let gid=entries[i].slice(entries[i].lastIndexOf(':')+1);
			if (parseInt(gid).toString()==gid) { //部件碼後面帶數字
				gid=(entries[i].split(':')[7]);//.replace(/@\d+$/,'');
			}
			if (!gid) continue; //some thing wrong in 

			if (gid.indexOf('@')==-1) {
				gid=getLatestVersion(gid);
			}
			const d=getGlyph(gid,debug);
			if (debug) console.log(gid,d)
			if (!d) {
				// console.log(data)
				console.log('glyph not found',gid);
			} else {
				if (countrefer) {
					if (!compObj[gid])compObj[gid]=0;
					compObj[gid]++;					
				} else {
					if (!compObj[gid])compObj[gid]= getGlyph(gid,debug)
				}
				loadComponents(d,compObj,countrefer,gid,debug);
			}
		}
	}
	depths.pop();
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

// export const baseOf=ch=>{
// 	if (!base) for (let i=0;i<basing.length;i++) {
// 		const at=basing[i].indexOf(ch ,1);
// 		if (at>1) { // omiting '='
// 			base=String.fromCodePoint(basing[i].codePointAt(0));
// 			basingCache[ch]=base;
// 			break;
// 		}
// 	}
// 	return base;
// }

export const prepareRawGW=(gw)=>{
	//assuming sorted alphabetically
	// console.log('reading',srcfn);
	if (!gw[0]) gw.shift(); //header

	//if (gw[gw.length][0]=='(') gw.pop();  // tail (xxx 行)

	// while (gw.length && gw[gw.length-1].slice(0,2)!=='z') gw.pop();
	setGlyphDB(gw);
}



export const glyphWikiCount=()=>gw?gw.length: (_gwcomp.length+_cjkbmp.length+_cjkext.length);
export const ch2gid=ch=>'u'+(typeof ch=='number'?ch:(ch.codePointAt(0)||' ')).toString(16);
export const gid2ch=gid=> {
	if (gid[0]!=='u') return ' ';
	let n=parseInt(gid.slice(1) ,16)
	if (n<0x20 ||isNaN(n)) n=0x20;
	return String.fromCodePoint(n);
}