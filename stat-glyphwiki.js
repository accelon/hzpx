import {nodefs,readTextLines} from 'pitaka/cli'
await nodefs;
import {eachGlyph,prepreNodejs,getGlyph} from './src/gwformat.js'
const lines=readTextLines('./public/bmp.js');
prepreNodejs(lines);

let min=0,max=0;
eachGlyph( (gid,data)=>{
	const entries=data.split('$');
	entries.forEach(entry=>{
		const fields=entry.split(':');
		let i=3;
		if (fields[0]=='99') i=2;
		for (;i<fields.length;i++) {
			const n=parseInt(fields[i]);
			if (n.toString()==fields[i]) {
				if (n>max) max=n;
				if (n<min) min=n;
				// if (n>250) console.log(n,i,entry,gid)
			}
		}
	})
})

console.log('max',max,'min',min)

