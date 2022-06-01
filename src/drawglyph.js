import {getGlyph,loadComponents,ch2gid, gid2ch} from './gwformat.js'
import {getFontFace,enumFontFace } from './fontface.js'
import {splitIRE,validIRE} from './pinx.js'
import Kage from './kage.js' 
export * from './fontface.js';
import {splitUTF32,codePointLength,alphabetically,unique} from "pitaka/utils"
const FontEngine=Kage;//Kage;
let pxe = new FontEngine();
pxe.kUseCurve=true;


let renderedComponents=[];
export const getRenderComps=()=>{
	return unique((renderedComponents||[]).sort(alphabetically));
}

const resizeSVG=(svg,size=64)=>svg.replace(/(width|height)=\"\d+\"/g,(m,m1,m2)=>m1+'='+size);
const setFontEngineOption=(opts,engine)=>{
	engine=engine||pxe;
	const fontface=getFontFace(opts.fontface);
	if (fontface) {
		engine.kShotai=fontface.hei?1:0;
		for (let key in fontface) engine.kFont[key]=fontface[key];
	} else {
		engine.kShotai=opts.hei?1:0;
		engine.kFont.kWidth=opts.width||5;		
	}
}
export const drawGlyph=(unicode,opts={})=>{
	const components={};
	const size=opts.size||64;
	let gid;
	let polygons = new FontEngine.Polygons();

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
		pxe.kBuhin.push(comp,components[comp]);
	}
	pxe.kBuhin.push(gid,d);

	renderedComponents.push(...Object.keys(components));
	setFontEngineOption(opts,pxe);
	pxe.makeGlyph(polygons, gid);
	return resizeSVG( polygons.generateSVG(true) ,size);
}

export const drawGlyphs=(str,opts={})=>{
	renderedComponents=[];
	const chars=splitUTF32(str);
	return chars.map( ch=>drawGlyph(ch,opts));
}

export const drawPinxChar=(ire,opts={})=>{
	const chars=splitUTF32(ire);

	if (!validIRE(ire)) return drawGlyphs(ire);
	let i=0,polygons = new FontEngine.Polygons();
	const size=opts.size||64;
	while (i<chars.length-2) {
		const components={};	
		const d=getGlyph(chars[i]);
		pxe.kBuhin.push(ch2gid(chars[i]),d);

		loadComponents(d,components);
		const from = ch2gid(chars[i+1]||'');
		const to   = ch2gid(chars[i+2]||'');
		for (let c in components) {
			if (c.slice(0,from.length)==from) { 
				let repl=getGlyph(to+c.slice(from.length));//same variant
				if (!repl) repl=getGlyph(to); 
				pxe.kBuhin.push(c, repl ) ; //替換，但框不變，  	
				const comps={};
				loadComponents(repl,comps);
				for (let c2 in comps) pxe.kBuhin.push(c2, comps[c2]);
			} else {
				pxe.kBuhin.push(c, components[c]);
			}
		}
		renderedComponents.push(...Object.keys(components));
		i+=2;
	}
	
	pxe.kBuhin.push(ire,getGlyph(chars[0])); 
	setFontEngineOption(opts,pxe)
	pxe.makeGlyph(polygons, ire);
	return resizeSVG( polygons.generateSVG(true),size);
}
export const drawPinx=(str,opts)=>{
	pxe = new FontEngine();
	pxe.kUseCurve = true;
	renderedComponents=[];
    const units=splitIRE(str);
    const out=[]
    for (let i=0;i<units.length;i++) {
    	const u=units[i];
    	out.push( (codePointLength(u)==1? drawGlyph(u,opts): drawPinxChar(u,opts) ) )
    }
	return out;
}