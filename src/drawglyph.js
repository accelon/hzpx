import {getGlyph,loadComponents,ch2gid, gid2ch} from './gwformat.js'
import {splitIRE,validIRE} from './pinx.js'
import {Kage,Polygons} from "./kage.js" 
import {splitUTF32,codePointLength,alphabetically,unique} from "pitaka/utils"

const  kage = new Kage();
kage.kUseCurve = true;
let renderedComponents=[];
export const getRenderComps=()=>{
	return unique((renderedComponents||[]).sort(alphabetically));
}

const resizeSVG=(svg,size=64)=>svg.replace(/(width|height)=\"\d+\"/g,(m,m1,m2)=>m1+'='+size);

export const drawGlyph=(unicode,size=64)=>{
	const components={};
	let gid;
	let polygons = new Polygons();

	if (typeof unicode=='number') {
		gid='u'+unicode.toString(16);
	} else {
		if (unicode.charCodeAt(0)<0x2000) { 
			gid=unicode;
		} else {
			gid='u'+unicode.charCodeAt(0).toString(16);
		}
	}
	const d=getGlyph(gid);
	loadComponents(d,components);
	for (let comp in components) {
		kage.kBuhin.set(comp,components[comp]);
	}
	kage.kBuhin.set(gid,d);

	kage.makeGlyph(polygons, gid);
	renderedComponents.push(...Object.keys(components));
	return resizeSVG( polygons.generateSVG(true) ,size);
}

export const drawGlyphs=(str,size=64)=>{
	renderedComponents=[];
	const chars=splitUTF32(str);
	return chars.map( ch=>drawGlyph(ch,size));
}

export const drawPinxChar=(ire,size=64)=>{
	const chars=splitUTF32(ire);
	if (!validIRE(ire)) return drawGlyphs(ire);
	let i=0,polygons = new Polygons();
	
	while (i<chars.length-2) {
		const components={};	
		const d=getGlyph(chars[i]);
		kage.kBuhin.set(ch2gid(chars[i]),d);

		loadComponents(d,components);
		const from = ch2gid(chars[i+1]||'');
		const to   = ch2gid(chars[i+2]||'');
		for (let c in components) {
			if (c.slice(0,from.length)==from) { 
				let repl=getGlyph(to+c.slice(from.length));//same variant
				if (!repl) repl=getGlyph(to); 
				kage.kBuhin.set(c, repl ) ; //替換，但框不變，  	
				const comps={};
				loadComponents(repl,comps);
				for (let c2 in comps) kage.kBuhin.set(c2, comps[c2]);
			} else {
				kage.kBuhin.set(c, components[c]);
			}
		}
		renderedComponents.push(...Object.keys(components));
		i+=2;
	}
	
	kage.kBuhin.set(ire,getGlyph(chars[0])); 
	kage.makeGlyph(polygons, ire);
	return resizeSVG( polygons.generateSVG(true),size);
}
export const drawPinx=(str,size)=>{
	renderedComponents=[];
    const units=splitIRE(str);
    const out=[]
    for (let i=0;i<units.length;i++) {
    	const u=units[i];
    	out.push( (codePointLength(u)==1? drawGlyph(u,size): drawPinxChar(u,size) ) )
    }
	return out;
}