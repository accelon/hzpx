import {nodefs,readTextLines,writeChanged } from 'pitaka/cli'
await nodefs;
import {breedOf,factorsOf}  from "hanziyin"
import {autoIRE} from './src/pinx.js'
const ch='𪖚';
const factors=factorsOf(ch);
const breed=factors.map(comp=>breedOf(comp).map(cp=>String.fromCodePoint(cp)))
breed.sort((a,b)=>a[0]-b[0]);
console.log(breed)
for (let i=0;i<breed.length;i++) {
	for (let base of breed[i]) {
		const basecp=base.codePointAt(0);
		if (basecp>=0x4000&& basecp<=0x9fa5) {
			const ire=autoIRE(ch , base)
			if (ire) console.log(ire,ch,base)			
		}
	}
}