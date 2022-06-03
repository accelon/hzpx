import {getGlyph,loadComponents,componentsOf, ch2gid, gid2ch,baseOf} from './gwformat.js'
import {splitUTF32Char,codePointLength,alphabetically,intersect} from "pitaka/utils"
import {factorsOf} from 'hanziyin';


export const autoIRE=(ch,base)=>{
	if (ch==base) return ''
	if (!base) base=baseOf(ch);
	if (!base || !ch) return '';

	const f1=factorsOf(ch);
	const f2=factorsOf(base);

	const commonpart=intersect(f1,f2);
	const from=f2.filter(it=>commonpart.indexOf(it)==-1);
	const to=f1.filter(it=>commonpart.indexOf(it)==-1);

	if (from.length===1 && to.length===1) {
		return base+String.fromCodePoint(from)+String.fromCodePoint(to);
	}
	return ''
}

export const splitPinx=(str, auto)=>{
	const out=[];
	const chars=splitUTF32Char(str);
	let i=0;
	let nesting=0 ,ire='';  
	while (i<chars.length) {
		const gid=str;
		const comps=componentsOf(chars[i]);
		nesting&&nesting--;
		if (~comps.indexOf( chars[i+1] )) {
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
