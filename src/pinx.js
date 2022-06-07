import {getGlyph,loadComponents,componentsOf, ch2gid, gid2ch,factorsOfGD} from './gwformat.js'
import {splitUTF32Char,codePointLength,alphabetically,intersect} from "pitaka/utils"
//import {factorsOf} from 'hanziyin';
import {UnifiedComps_UTF32} from './gw-chise-unified.js';
import {Instructions, INST_REBASE} from './instructions.js'
import {bases} from './store';
import {get }from 'svelte/store'

export const autoIRE=(ch,bases)=>{
	if (!bases || !bases.length || !ch) return '';
	if (Array.isArray(bases)) {
		for (let base of bases) {
			const ire=_autoIRE(ch,base);
			if (ire) return ire;
		}
	} else return _autoIRE(ch,bases)
}

export const _autoIRE=(ch,base)=>{
	if (ch==base) return ''
	const f1=factorsOfGD( getGlyph(ch), true);
	const f2=factorsOfGD( gettGlyph(base)).map(it=> UnifiedComps_UTF32[it]||it );
	// if (ch==='䭙') console.log(f1,f2.map(it=>String.fromCodePoint(it)),ch,base)
	const commonpart=intersect(f1,f2);
	const from=f2.filter(it=>commonpart.indexOf(it)==-1);
	const to=f1.filter(it=>commonpart.indexOf(it)==-1);

	if (from.length===1 && to.length===1) {
		return base+String.fromCodePoint(from)+String.fromCodePoint(to);
	}
	return ''
}
export const reBase=(ch,bases)=>{
	const ire=autoIRE(ch,bases);
	if (ire) {
		const base=String.fromCodePoint(ire.codePointAt(0));
		return base+INST_REBASE+ch; //this syntax will preserve the variants
	}
}
export const baseCandidate=ch=>{
    const B=get(bases);
    const out=[];
    for (let i=0;i<B.length;i++) {
        const ire=_autoIRE(ch,B[i]);
        if (ire) out.push(B[i])
    }
	return out;
}
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
