import {getGlyph,loadComponents,componentsOf, ch2gid, gid2ch,factorsOfGD} from './gwformat.js'
import {splitUTF32Char,codePointLength,alphabetically,intersect} from "pitaka/utils"
import {factorsOf} from 'hanziyin';
import {UnifiedComps_UTF32} from './gw-chise-unified.js';


export const autoIRE=(ch,bases)=>{
	if (!bases || !bases.length || !ch) return '';
	if (Array.isArray(bases)) {
		for (let base of bases) {
			const ire=_autoIRE(ch,base);
			if (ire) return ire;
		}
	}
}

export const _autoIRE=(ch,base)=>{
	if (ch==base) return ''
	const f1=factorsOf(ch);
	const f2=factorsOf(base).map(it=> UnifiedComps_UTF32[it]||it );
	// if (ch==='䭙') console.log(f1,f2.map(it=>String.fromCodePoint(it)),ch,base)
	const commonpart=intersect(f1,f2);
	const from=f2.filter(it=>commonpart.indexOf(it)==-1);
	const to=f1.filter(it=>commonpart.indexOf(it)==-1);

	if (from.length===1 && to.length===1) {
		return base+String.fromCodePoint(from)+String.fromCodePoint(to);
	}
	return ''
}
export const Instructions={};
export const registerInstruction=(inst , func)=>{ //register IRE 
	Instructions[inst]=func;
}
const replaceUncommon=chars=>{//using the base to draw thechar by replacing uncommon char
	const [base  , op , thechar]=chars; 
	const comps1=factorsOfGD( getGlyph(base) ,true );
	const comps2=factorsOfGD( getGlyph(thechar) ,true);
	if (comps1.length!==comps2.length) return ['',''];
	for (let i=0;i<comps1.length;i++) {
		const ch1=gid2ch(comps1[i])
		const ch2=gid2ch(comps2[i])
		if (ch1!==ch2) return [comps1[i],comps2[i]];
	}
	return ['','']
}
const addPaliCase=chars=>{
	let casstyle='' ;
	const cas=String.fromCodePoint(chars[2]);
	if (cas=='M') {
		casstyle='<rect x=180 y=180 width=15 height=15 style="fill:blue"></rect>'
	} else if (cas=='L') {
		casstyle='<rect x=180 y=180 width=15 height=15 style="fill:brown"></rect>'
	}
	return ['','',casstyle]
}
registerInstruction('ⓡ',replaceUncommon);
registerInstruction('ⓒ',addPaliCase);
export const splitPinx=(str, auto)=>{
	const out=[];
	const chars=splitUTF32Char(str);
	let i=0;
	let nesting=0 ,ire='';  
	while (i<chars.length) {
		const gid=str;
		nesting&&nesting--;
		const comps=componentsOf(chars[i]);
		if (~comps.indexOf( chars[i+1] ) || Instructions[chars[i+1]]) {
			ire += chars[i]+chars[i+1];
			nesting++;
			i++;
		} else {
			if (nesting) {
				ire+=chars[i];
			} else {
				if (ire) {
					out.push(ire+chars[i]);	
					ire='';
				} else {
					let ch=chars[i];
					if (auto&&!getGlyph(ch)) { //not found, try to replace with ire
						ch=autoIRE(ch) || ch;
					}
					out.push(ch)
				}
			}
		}
		i++;
	}
	ire&&out.push(ire)
	return out;
}


export const validIRE=ire=>codePointLength(ire)>1 && splitPinx(ire).length==1;
