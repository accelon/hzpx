import {getGlyph,loadComponents,ch2gid, gid2ch, frameOf,componentsOf} from './gwformat.js'
import {getFontFace,enumFontFace } from './fontface.js'
import {splitPinx,validIRE} from './pinx.js'
import Kage from './kage.js' 
export * from './fontface.js';
import {splitUTF32,splitUTF32Char,codePointLength,alphabetically,unique} from "pitaka/utils"
import {Instructions} from './instructions.js'
import {debugmessage} from './store.js'
const FontEngine=Kage;//Kage;
let pxe = new FontEngine();
pxe.kUseCurve=true;

let renderedComponents=[];
export const getRenderComps=()=>{
	return unique((renderedComponents||[]).sort(alphabetically));
}
export const getLastComps=(value)=>{
	if (!value) return [];
	const chars=splitUTF32Char(value);
	if (!chars.length) return [];
	return componentsOf(chars[chars.length-1]);
}
const resizeSVG=(svg,size=64)=>svg.replace(/(width|height)=\"\d+\"/g,(m,m1,m2)=>m1+'='+size);
const patchSVG=(svg,patch)=>svg.replace(/<svg /,'<svg '+patch+' ');
const patchColor=(svg,color)=>svg.replace(/fill="black"/g,'fill="'+color+'"');
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
const appendToSVG=(append,svg)=>{
	if (!append) return svg;
	if (typeof append=='string') {
		return svg.replace('</svg>',append)+'</svg>';	
	} else if (typeof append=='function') {
		return append(svg);
	}
	return svg;
}
const addFrameToSVG=(gd,svg)=>{
	const frames=frameOf(gd); 
	let framesvg='';
	for (let i=0;i<frames.length;i++) {
		const [x,y,x2,y2]=frames[i]
		const w=x2-x, h=y2-y;
		const color='hsl('+((i+1)*60) +' ,50%,30%)';		
		framesvg+=`<rect x=${x} y=${y} width=${w} height=${h} 
		 style="fill:none;stroke: ${color} ; stroke-width:${i+1}" ></rect>`;
	}
	return appendToSVG(framesvg,svg);

}
export const drawGlyph=(unicode,opts={})=>{
	if (!unicode) return '';
	const components={};
	const size=opts.size||64;
	let gid;
	let polygons = new FontEngine.Polygons();

	if (typeof unicode=='number') {
		gid='u'+unicode.toString(16);
	} else {
		if (unicode.codePointAt(0)<0x2000) { 
			gid=unicode;
		} else {
			gid='u'+unicode.codePointAt(0).toString(16);
		}
	}
	const d=getGlyph(gid);

	// debugmessage.set('char' +unicode+' =='+d)
	if (!d) return opts.alt?unicode:''
	
	loadComponents(d,components);
	for (let comp in components) {
		pxe.kBuhin.push(comp,components[comp]);
	}
	pxe.kBuhin.push(gid,d);
	// console.log(pxe.kBuhin.hash)
	renderedComponents.push(...Object.keys(components));
	setFontEngineOption(opts,pxe);
	
	pxe.makeGlyph(polygons, gid);
	let svg=polygons.generateSVG(true);
	svg = opts.frame?addFrameToSVG(d,svg):svg;
	svg = patchSVG(svg, 'gid='+gid+ ' ch='+unicode);
	if (opts.color!=='black' && opts.color) svg = patchColor(svg, opts.color);
	return resizeSVG( svg,size);
}

const drawGlyphs=async (str,opts={})=>{
	renderedComponents=[];
	const chars=splitUTF32(str);
	return chars.map( async ch=>await drawGlyph(ch,opts));
}

export const drawPinxChar=async (ire,opts={})=>{
	const chars=splitUTF32(ire);

	if (!validIRE(ire)) return await drawGlyphs(ire);
	let i=0,polygons = new FontEngine.Polygons();
	const size=opts.size||64;
	let appends=[];
	while (i<chars.length-2) {
		const components={};	
		const d=getGlyph(chars[i]);
		pxe.kBuhin.push(ch2gid(chars[i]),d);
		await loadComponents(d,components);

		const func=Instructions[String.fromCodePoint(chars[i+1])];
		let from,to,append;
		if (func) {
			[from,to,append]=func(chars.slice(i));
			appends.push(append);
		} else {
			from = ch2gid(chars[i+1]||'');
			to   = ch2gid(chars[i+2]||'');
		}
		for (let c in components) {
			if (c.slice(0,from.length)==from) { 
				let repl=getGlyph(to+c.slice(from.length));//same variant
				if (!repl) repl=getGlyph(to); 
				pxe.kBuhin.push(c, repl ) ; //替換，但框不變，  	
				const comps={};
				await loadComponents(repl,comps);
				for (let c2 in comps) pxe.kBuhin.push(c2, comps[c2]);
			} else {
				pxe.kBuhin.push(c, components[c]);
			}
		}
		renderedComponents.push(...Object.keys(components));			
		i+=2;
	}
	const d=getGlyph(chars[0]);
	pxe.kBuhin.push(ire,d);
	setFontEngineOption(opts,pxe)
	pxe.makeGlyph(polygons, ire);
	let svg=polygons.generateSVG(true);
	appends.forEach(append=>svg=appendToSVG(append,svg));
	svg = opts.frame?addFrameToSVG(d,svg):svg;
	svg = patchSVG(svg, 'ire='+ire);
	if (opts.color!=='black' && opts.color) svg = patchColor(svg, opts.color);
	svg = resizeSVG(svg,size);
	return svg;
}
export const drawPinx=(str,opts)=>{
	pxe = new FontEngine();
	pxe.kUseCurve = true;
	renderedComponents=[];
    const units=splitPinx(str,true); // char not in glyph database will be expanded automatically
    const out=[]
    for (let i=0;i<units.length;i++) {
    	const u=units[i];
    	out.push( (codePointLength(u)==1? await drawGlyph(u,opts): await drawPinxChar(u,opts)))
    }
	return out;
}