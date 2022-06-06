import { get,writable } from "svelte/store";
import {splitUTF32Char} from 'pitaka/utils'
const stockfavorites=['初衤礻','颰犮电','峰夆電雨水','冧林新','开腦囟同','寶缶充','衚胡舞','鵝鳥烏戰口火','痛甬炱台肝','髜昇厏乍电','超召狸里美','国玉囡女书']//鵝鳥烏
const stockbases="㫖仲凒勲匔匰厤吾哪圞埲奛奨娟嬰孲寵屘屢岱峉嶁幥廚彅彨循怠懚戓戭掉敟旟显晔晷暰朥梑歡殣毜毷氇氳泉泴泵瀯炱煴爺牆牕犋犧犧犨狊狸珃瑽璹瓪甂畠畧畩疾皒皸盪睯瞃矞矠矪砠硰磱禧種窟竬竽筯籼粜粪糣緈縆罣羫翇翞翿聘聳聾肿膐艚艚蚦蜰蟧袂袵裂裔觶觺訣諬譵貔賌贎贜趘躎躰軇軸輙達適邁邷鄲酾醒鈝銴鑚钂钰铏闡陚雝霓靟鞃韟韷顢颪飅餥餬馽驕驚骽體髜鬚鬫鬸鬻鮤鯨鵟鷣鸔麜麣黖黸鼊齉齷齾";
export let favorites=writable( ((localStorage.getItem('hzpx-favorites')||'').split('$'))|| stockfavorites  );
export let bases=writable( splitUTF32Char(localStorage.getItem('hzpx-bases')||stockbases))

let updateTimer;
const settingsToBeSave={};

export const saveSettings=()=>{ //immediate save
    for (let key in settingsToBeSave) {
        localStorage.setItem(key, settingsToBeSave[key]);
        delete settingsToBeSave[key]
    }
    clearTimeout(updateTimer);
    console.log('settings autosaved on',new Date())
}

const updateStorage=items=>{
    clearTimeout(updateTimer);
    for (let key in items) {
        settingsToBeSave['hzpx-'+key]=items[key];    
    }
    updateTimer=setTimeout(saveSettings,5000); //autosave in 5 seconds
}

bases.subscribe(b=>updateStorage({bases :b.join('')}));
favorites.subscribe(f=>updateStorage({favorites :f.join('$')}));
