import {bsearch} from 'pitaka/utils'
import {setBasing} from './pinx.js'
export let gw= typeof window!=='undefined' && window.BMP;

export const prepreNodejs=(bmp,basing)=>{
	let at=bmp[0].indexOf('`');
	bmp[0]=bmp[0].slice(at);
	at=lines[bmp.length-1].indexOf('`');
	lines[bmp.length-1]=bmp[bmp.length-1].slice(at);
	gw=bmp;
	setBasing(basing)
	buildDerivedIndex();
}

const getGlyph_js=gid=>{
	let r='';
	if (typeof gid=='number') gid=ch2gid(gid);
	else if (gid.codePointAt(0)>0x2000) {
		gid='u'+gid.codePointAt(0).toString(16);
	}
	const at=bsearch(gw,gid,true);
	if (at>0  && (gw[at].slice(0,gid.length)==gid)) {
		let from=gw[at].indexOf('=');
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
export const loadComponents=(data,compObj,countrefer=false)=>{ //enumcomponents recursively
	const entries=data.split('$');
	for (let i=0;i<entries.length;i++) {
		if (entries[i].slice(0,3)=='99:') {
			let gid=entries[i].slice(entries[i].lastIndexOf(':')+1);
			if (parseInt(gid).toString()==gid) { //部件碼後面帶數字
				gid=entries[i].split(':')[7];
			}
			gid=gid.replace(/@\d+$/,'')
			const d=getGlyph(gid);
			if (!d) {
				console.log('data of glyph not found gid',gid, 'entry',entries[i]);
			} else {
				if (countrefer) {
					if (!compObj[gid])compObj[gid]= getGlyph(gid);
					compObj[gid]++;					
				} else {
					if (!compObj[gid])compObj[gid]= getGlyph(gid)
				}
				loadComponents(d,compObj,countrefer);
			}
		}
	}
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
export const frameOf=gd=>{
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
	if (frames.length==1) { //全框展開
		frames=frameOf(getGlyph(gid));
	}
	return frames
}
export const glyphWikiCount=()=>gw.length;
export const ch2gid=ch=>'u'+(typeof ch=='number'?ch:ch.charCodeAt(0)).toString(16);
export const gid2ch=gid=> String.fromCodePoint(parseInt(gid.slice(1) ,16) || 0x20);