/* compression of glyphwiki format */

import {splitUTF32Char,SEPARATOR2D,packInt,unpackInt,pack1,unpack1} from 'ptk/nodebundle.cjs' //~ serve as comp seperator

//stroke
// const gd2='2:7:8:86:92:100:97:110:111$1:0:0:17:115:185:115$2:32:7:100:115:71:140:12:163$1:32:0:58:144:58:180$2:0:7:53:184:75:174:107:159$2:0:7:165:127:148:138:114:156$2:7:0:129:148:154:172:179:180'
//comp
// const gd1='99:0:0:0:0:200:200:u79be-01$99:0:0:70:0:193:200:cdp-8dc9';
// const gd3='99:0:0:0:5:200:132:u4ea0-g:0:0:0$2:0:7:99:109:65:144:14:163$1:32:413:66:140:66:178$2:32:7:66:178:79:172:115:156$2:0:7:159:120:148:127:121:143$2:7:8:98:133:150:156:169:184';

/*rare stroke type ,  '101': 11,  '103': 3,  '106': 1,  '107': 2, */

const NUMOFFSET=10;//must more than stroke type
const NEGATIVE=4000;//some stroke deco 
export const unpackGD=str=>{
	if (!str) return '';
	const units=str.split(SEPARATOR2D);
	const arr=[];
	for (let i=0;i<units.length;i++) {
		const s=units[i];
		const unit=[];

		const len=unpack1(s[0]);
		if (len >NUMOFFSET) {
			const len=unpack1(s[0])-NUMOFFSET;
			const name=unpackGID(s.slice(1,len+1));
			const [x1,y1,x2,y2,sx,sy,sx2,sy2]=unpackInt(s.slice(len+1)).map(UN);

			unit.push('99');
			unit.push( sx||'0',sy||'0', x1||'0',y1||'0',x2||'0',y2||'0' , name);
			unit.push('0',sx2||'0',sy2||'0');
		} else {
			const st=len[0];
			const nums=Array.from(unpackInt(s.slice(1)).map(UN));
			unit.push(st,...nums);
		}
		arr.push(unit.join(':'));
	}
	return arr.join('$');
}

/* rare numbers -156,1  -107,1          1000,6 2005,3 2032,1 3000,2 3012,1 3022,1*/
const N=n=>{
	if (n<0) n= NEGATIVE + (-n);
	else n+=NUMOFFSET;
	return n;
}
const UN=n=>{
	if (n>NEGATIVE) return -n+NEGATIVE;
	else n-=NUMOFFSET;
	return n;
}
export const packGID=gid=>{
	const m=gid.match(/^u([\da-f]{4,5})/);
	if (m) {
		const suffix=gid.slice(m[1].length+1);
		if (suffix && suffix[0]!=='@' && suffix[0]!=='-') {
			console.log('must be @ or -',gid,suffix)
		}
		gid=String.fromCodePoint(parseInt(m[1],16))+(suffix[0]=='-'?suffix.slice(1):suffix);
	}
	return gid;
}
export const unpackGID=gid=>{
	const cp=gid.codePointAt(0);
	let s='';
	if (cp>0xff) {
		const chars=splitUTF32Char(gid);
		s= 'u'+cp.toString(16);
		if (chars.length>1) s+=(chars[1]!=='@'?'-':'')+gid.slice( chars[0].length);
	} else {
		return gid;
	}
	return s;
}
export const packGD=str=>{
	const units=str.split('$');
	let s='';
	for (let i=0;i<units.length;i++) {
		if (i) s+=SEPARATOR2D;
		if (units[i].slice(0,3)=='99:') {
			let [header,sx,sy,x1, y1, x2, y2, compname,unused,sx2,sy2]  = units[i].split(':');

			if (typeof unused=='undefined') unused='0';
			if (typeof sx2=='undefined') sx2='0';
			if (typeof sy2=='undefined') sy2='0';
			//if sx, sy is zero, sx2, sy2 is not used , stroke-strech
			sx=parseInt(sx);sy=parseInt(sy);sx2=parseInt(sx2);sy2=parseInt(sy2);
			x1=parseInt(x1);x2=parseInt(x2);y1=parseInt(y1);y2=parseInt(y2);
			if (isNaN(x1+x2+y1+y2+sx+sy+sx2+sy2)) {
				console.log('dataerror at comp', i, units[i]);
			}
			//frequent numbers are
			//0,221529 1,22166 2,28767 3,5005 4,3047   7,14056 200,69353

			//first number is length of compname +10 // so that it it not a stroke
			//followed by x1,y1,x2,y2, or x1,y1,x2,y3,sx,sy  or x1,y1,x2,y3,sx,sy,sx2,sy2
			const gid=packGID(compname);
			s+=pack1([ N(gid.length)]); //
			s+=gid;
			const nums=[N(x1),N(y1),N(x2),N(y2)];
			if (sx||sy) {
				nums.push(N(sx),N(sy));
				if (sx2||sy2) nums.push(N(sx2),N(sy2));
			}
			s+=packInt(nums)
		} else { //total 0~7 stroke type
			//minimum to y2
			let [st,head,tail,x1,y1,x2,y2,x3,y3,x4,y4]  = units[i].split(':'); 

			head=parseInt(head);tail=parseInt(tail)
			x1=parseInt(x1)||0;y1=parseInt(y1)||0;x2=parseInt(x2)||0;y2=parseInt(y2)||0;
			x3=parseInt(x3)||0;y3=parseInt(y3)||0;x4=parseInt(x4)||0;y4=parseInt(y4)||0;

			if (st.length==3) st=st.slice(2);//rare stroke type, same as basic type
			st=parseInt(st);
			s+=pack1([st]);
			const arr=[N(head), N(tail),N(x1),N(y1),N(x2),N(y2) ] ;
			if (st===0) {
				//no data, always return 0:0:0
			} else if (st==1) {

			} else if (st==2) {
				arr.push(N(x3),N(y3) );
			} else {
				arr.push(N(x3),N(y3),N(x4),N(y4) );
			}
			s+=packInt(arr);
		}
	}
	return s;
}
// console.log(packGD(gd3).length,gd3.length)
// console.log(unpackGD(packGD(gd3))==gd3);
