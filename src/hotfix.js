import {updateGlyphData,eachGlyphUnit,getGlyphData,serializeGlyphUnit,gidIsCJK} from './gwformat.js'
import {fromObj} from 'ptk/nodebundle.cjs'
//u65e5=99:0:0:0:0:200:200:u65e5-j
//所有用到 u65e5-j 都改為 u65e5
// "u65e5-j":"u65e5"
// u65e5 替換為 u65e5-j 的glyphdata
// u65e5-j 刪除 
// 這個步驟可省 1,619,589 bytes

// only one comp less than 0x7f 
// 1:0:2:33:37:149:37$1:22:23:149:37:149:152$1:0:0:15:96:188:96$1:0:2:34:152:149:152$99:0:0:40:-95:240:105:u002e$99:0:0:40:-35:240:165:u002e
// replace with basic stroke, taken from 母
export const hotfix=(updateGlyphData)=>{
    updateGlyphData('u200e0-jv','1:0:2:33:37:149:37$1:22:23:149:37:149:152$1:0:0:15:96:188:96$1:0:2:34:152:149:152$2:7:8:84:43:104:52:111:73$2:7:8:76:100:98:109:107:132');
    updateGlyphData('u002e','');
    //hot fix for 寶,inorder to make 邏羅寶貝𩀨從䞃致招  look nice
    updateGlyphData('u5bf6-j','99:0:0:0:0:200:200:u21a67-03:0:0:0$99:0:0:0:100:200:195:u8c9d:0:0:0');
    updateGlyphData('u5348@1','99:0:0:0:0:200:200:u5348-j') ;//結尾有$ 是錯的
    //'u5bf6-j=99:0:0:0:0:200:200:u21a67-03:0:0:0$99:0:0:0:50:200:195:u8c9d-04:0:0:0'
}
export const tidyGlyphData=()=>{
    const compFreq={},unboxComp={}    
    eachGlyphUnit((gid,units)=>{ //先找出所有 boxed glyph, 只有一個部件的字
        if (units.length==1 && units[0][0]=='99') {
            unboxComp[ units[0][7] ]=gid;		
        }
        for (let i=0;i<units.length;i++) {
            if (units[i][0]==='99') {
                const comp=units[i][7];
                if (!compFreq[comp])  compFreq[comp]=0;
                compFreq[comp]++;
            }
        }
    })    
    
        
    //remove unneeded entry
    eachGlyphUnit((gid,units)=>{ //先找出所有 boxed glyph
        let touched=false , newgid='' , oldgid;
        for (let i=0;i<units.length;i++) {
            if (units[i][0]=='99') {
                oldgid=units[i][7];
                newgid=unboxComp[oldgid];
                if (newgid && compFreq[oldgid]==1) {
                    units[i][7]=newgid;
                    touched=true;
                }
            }
        }
        if (touched) {
            if (gid===newgid) { //
                updateGlyphData(gid, getGlyphData(oldgid));//replace with the comp glyphdata
                if (compFreq[oldgid]==1 && !gidIsCJK(oldgid) )  {
                    updateGlyphData(oldgid,''); //delete comp with sole reference
                }
            } else {
                updateGlyphData(gid, serializeGlyphUnit(units))
            }
        }
    })

    const unboxed=fromObj(unboxComp);
    return {unboxed,compFreq};
}


