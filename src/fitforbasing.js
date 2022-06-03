import {splitUTF32Char} from 'pitaka/utils'
import {factorsOf} from 'hanziyin'
//const candidates="嚬瀯梑鑚仲適娟朥撝狸筯驕嶁熅蟧暰講陚懚瑽瞃磱鯨續躎達種疾怠鷣鵟袵輙廚畩霓醒循窟罣敏闡鞃餓犧毜彅聘趘厤禰雝勵歡铏膝艚勲蠱";
//const candidates='掉幥乻劏匾埲寵斀斣欿屢戭餾餥麷麜黸齷敟殣犑璹甂瓫皒禧竬糣繩綤羫臘膐翿蓮讃貔鎼顢骽鬚鬫魖'
//糸月艹食火言羽大子少尾屮廾彡戈习戶斤斤斗斗方方止止殳气父片皮皿矛礻行見見角貝貝身身辟辶面韋音風高高鬲金戈乙攴斗欠欠牛鼠龍龜冫勹匚又囗
const fitForBasing={};
splitUTF32Char(candidates).map( it=> fitForBasing[it]=factorsOf(it));
export {fitForBasing};