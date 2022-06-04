import {nodefs,readTextContent,writeChanged } from 'pitaka/cli'
await nodefs;
import {alphabetically,splitUTF32Char,bsearch} from 'pitaka/utils'
/* 將 public/basing.js 基字排序，後面帶的的字也按Unicode 排序，去重，同時是基字也去除 */

const content=readTextContent('./public/basing.js');
const at1=content.indexOf('`');
const at2=content.lastIndexOf('`');
const lines=content.slice(at1+1,at2).trim().split(/\r?\n/).filter(it=>!!it);

for (let i=0;i<lines.length;i++) {
	const at=lines[i].indexOf('=');
	if (at==-1) {
		console.log('error line',i,lines[i].slice(0,16))
	} else {
		const bas=lines[i].slice(0,at);
		let chars=splitUTF32Char(lines[i].slice(at+1));
		chars.sort(alphabetically);
		const hasbas=bsearch(chars,bas);
		if (~hasbas) {
			chars.splice(hasbas,1);
			// console.log('has basing in product',bas)
		}
		lines[i]=bas+'='+chars.join('');
	}
}
lines.sort(alphabetically)
if (writeChanged('basing.js.gen','window.BASING=`'+lines.join('\n')+'\n`.trim().split(/\\r?\\n/)')) {
	console.log('writing basing.js',lines.length)
}
