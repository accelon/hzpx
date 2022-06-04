import {bsearch} from 'pitaka/utils'
export let gw= typeof window!=='undefined' && window.BMP;

export let basing=typeof window!=='undefined' && window.BASING;
const basingCache={};

export const prepreNodejs=(bmp,_basing)=>{
	let at=bmp[0].indexOf('`');
	if (at>0) bmp[0]=bmp[0].slice(at);
	at=bmp[bmp.length-1].indexOf('`');
	if (at>0) bmp[bmp.length-1]=bmp[bmp.length-1].slice(at);
	gw=bmp;
	if (_basing)basing=_basing.sort(alphabetically);
	buildDerivedIndex();
}

const getGID=id=>{ //replace versioning , allow code point or unicode char
	let r='';
	if (typeof id=='number') gid=ch2gid(gid);
	else if (id.codePointAt(0)>0x2000) {
		id='u'+gid.codePointAt(0).toString(16);
	}
	return id.replace(/@\d+$/,''); // no versioning (@) in the key
}
export const setGlyph_js=(s,data)=>{ //replace the glyph data
	const gid=getGID(s);
	const at=bsearch(gw,gid+'=',true);
	if (at>0) {
		let from=gw[at].indexOf('=');
		gw[at]=gw[at].slice(0,from+1)+data;
	}
}
const getGlyph_js=s=>{
	const gid=getGID(s);
	const at=bsearch(gw,gid+'=',true);
	let r='';
	if (at>0  && (gw[at].slice(0,gid.length)==gid)) {
		const from=gw[at].indexOf('=');
		r=gw[at].slice(from+1);
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
	return getGlyph_js(gid).slice(84);

	const at=bsearch(gw,gid,true); //try to reuse getGlyph_js
	if (at<1)return '';
	if (gw[at].slice(0,gid.length)!==gid) return '';
	return gw[at].slice(84);
}
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
				gid=entries[i].split(':')[7];
			}
			const d=getGlyph(gid);
			if (!d) {
				console.log('data of glyph not found gid',gid, 'entry',entries[i]);
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
	while (gw.length && gw[gw.length-1].slice(0,2)!==' z') gw.pop();
	setGlyphDB(gw);
}



export const glyphWikiCount=()=>gw.length;
export const ch2gid=ch=>'u'+(typeof ch=='number'?ch:ch.codePointAtAt(0)).toString(16);
export const gid2ch=gid=> {
	let n=parseInt(gid.slice(1) ,16)
	if (n<0x20 ||isNaN(n)) n=0x20;
	return String.fromCodePoint(n);
}