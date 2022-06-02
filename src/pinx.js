import {getGlyph,loadComponents,componentsOf, ch2gid, gid2ch} from './gwformat.js'
import {splitUTF32Char,codePointLength} from "pitaka/utils"
export const splitIRE=str=>{
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
					out.push( chars[i])
				}
			}
		}
		i++;
	}
	ire&&out.push(ire)
	return out;
}

export const validIRE=ire=>codePointLength(ire)>1 && splitIRE(ire).length==1;