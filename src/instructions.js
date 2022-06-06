import {factorsOfGD,getGlyph,gid2ch} from './gwformat.js'
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
export const INST_REBASE='ⓡ'
const paliCase=chars=>{
	let casstyle='' ;
	const cas=String.fromCodePoint(chars[2]);
	casstyle= '<text x="170" y="30" style="font-size:16pt ;fill:brown">'+cas+'</text>'
	return ['','',casstyle]
}
const punctuations=chars=>{
	let casstyle='' ;
	const cas=String.fromCodePoint(chars[2]);
	casstyle= '<text x="175" y="180" font-size=64px fill=red>'+cas+'</text>'

	return ['','',casstyle]	
}
registerInstruction(INST_REBASE,replaceUncommon);
registerInstruction('ⓒ',paliCase);
registerInstruction('ⓟ',punctuations);