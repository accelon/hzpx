import {splitUTF32Char} from 'pitaka/utils'
import {factorsOf} from 'hanziyin'
//const candidates="嚬瀯仲筯驕嶁熅蟧暰講懚瑽瞃躎達種疾彅聘趘厤禰雝勵艚勲蠱";
//const candidates='幥匾寵斣屢餥麜黸齷敟甂瓫竬糣繩羫臘膐讃鎼顢鬚鬫魖'

const candidates='殽斵劓歡斀旟竬戭'//講//鼳'//孲屘扄斣皸'剕
//繩犑蓮臘禰金戈乙攴欠欠牛弊殽見 覵飗
const fitForBasing={};
splitUTF32Char(candidates).map( it=> fitForBasing[it]=factorsOf(it));
export {fitForBasing};