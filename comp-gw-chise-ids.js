/* 找出 glyphwiki 和 chise 相同IDS 的字 */
import {nodefs,readTextLines,writeChanged } from 'pitaka/cli'
import {codePointLength} from 'pitaka/utils'
await nodefs;
import {factorsOf}  from "hanziyin"
// run gw2ids.js first
const gw=readTextLines('./gw-ids.txt');
let same=[], unsame=[];
for (let i=0;i<gw.length;i++) {
	const ch=String.fromCodePoint(gw[i].codePointAt(0));
	const at=gw[i].indexOf('=');
	const gwfactors=gw[i].slice(at+1);
	if (i%1000==0) console.log(i)
	const factors=factorsOf(ch).map(it=>String.fromCodePoint(it));
	if (codePointLength(gwfactors)==factors.length){
		if (factors.join('')==gwfactors) {
			same.push(ch);
		} else {
			unsame.push(gw[i]+'$'+factors.join(''));
		}
	}
}
if (writeChanged('same-ids.txt',same.join('\n'))) console.log('same-ids',same.length)
if (writeChanged('unsame-ids.txt',unsame.join('\n'))) console.log('unsame-ids',unsame.length)

