import {nodefs,readTextLines} from 'pitaka/cli'
import {fromObj} from 'pitaka/utils'
await nodefs;
import {eachGlyph,prepreNodejs,getGlyph} from './src/gwformat.js'
const lines=readTextLines('./public/bmp.js');
prepreNodejs(lines);

let min=0,max=0;
const numbers={},strokeType={};

let maxnamelength=0;
eachGlyph( (gid,data)=>{
	const entries=data.split('$');
	entries.forEach(entry=>{
		const fields=entry.split(':');
		let i=3;
		//if (fields[0]=='99') i=2;
		for (i=0;i<fields.length;i++) {
			const n=parseInt(fields[i]);
			if (n.toString()==fields[i]) {
				if (!numbers[n] ) numbers[n]=0;
				numbers[n]++;
			}
		}
		if (fields[0]==='99' && fields[7].length>maxnamelength) {
			if (fields[7].length>15) console.log(fields[7])
			maxnamelength=fields[7].length;
		} else {
			if (!strokeType[fields[0]]) strokeType[fields[0]]=0;
			strokeType[fields[0]]++;
		}
	})
})

const arr=fromObj(numbers,true);
arr.sort((a,b)=>a[0]-b[0])
console.log('numbers ',arr.join('\n'))
console.log('maxnamelength',maxnamelength)
console.log(strokeType);
