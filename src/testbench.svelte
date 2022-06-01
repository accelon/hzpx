<script>
import Kage from "./kage.js" 

const kage=new Kage()


// let data='1:0:0:14:101:186:101';

let value=''
const data='99:0:0:17:9:178:117:gt-k00049$99:0:0:1:84:195:192:u4eba-j'
kage.kBuhin.set('gt-k00049','2:0:7:107:12:107:129:11:188$2:7:8:93:91:154:126:184:179');
kage.kBuhin.set('u4eba-j','2:0:7:100:19:100:148:16:184$2:7:0:105:20:104:140:180:178');

let polygons = new Kage.Polygons();
const gid='u4ecc'
kage.kBuhin.set(gid,data);

kage.makeGlyph(polygons, gid);
console.log(JSON.stringify(polygons,'',' '))
</script>
<input class="stkdata" bind:value/>
test bench