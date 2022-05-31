import {bsearch} from 'pitaka/utils'

export let gw= typeof window!=='undefined' && window.BMP;

export const prepreNodejs=lines=>{
	let at=lines[0].indexOf('`');
	lines[0]=lines[0].slice(at);
	at=lines[lines.length-1].indexOf('`');
	lines[lines.length-1]=lines[lines.length-1].slice(at);
	gw=lines;
}
const getGlyph_js=gid=>{
	if (typeof gid=='number') gid=ch2gid(gid);
	else if (gid.charCodeAt(0)>0x2000) {
		gid='u'+gid.charCodeAt(0).toString(16);
	}
	const at=bsearch(gw,gid+'=',true);
	if (at<1)return '';
	if (gw[at].slice(0,gid.length)!==gid) return '';
	return gw[at].slice( gid.length+1);
}
export let getGlyph=getGlyph_js;

export const setGlyphDB=_gw=>{
	gw=_gw;
	getGlyph=getGlyph_wiki;
}
export const getGlyph_wiki=gid=>{
	if (gid[0]!==' ') gid=' '+gid;//first char is always ' '
	const at=bsearch(gw,gid,true);
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
export const componentsOf=d=>{
	const comps={};
	// const d=getGlyph(uni);
	loadComponents(d,comps,true);
	return Object.keys(comps).map( gid2ch );
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

export const ch2gid=ch=>'u'+(typeof ch=='number'?ch:ch.charCodeAt(0)).toString(16);
export const gid2ch=gid=> String.fromCodePoint(parseInt(gid.slice(1) ,16));