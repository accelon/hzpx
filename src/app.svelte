
<script>
import {onMount} from 'svelte'
import {codePointLength} from 'ptk/utils/unicode.ts'
import Hzpx,{splitPinx,drawPinx, derivedOf, enumFontFace ,getLastComps,gid2ch,isDataReady} from 'hzpx-engine';
import Glyph from './glyph.svelte'
import TestBench from './testbench.svelte';
import {downloadSvg} from './svg2png.js'
import Favorite from './favorite.svelte'
//if (window.location.protocol==='https:') registerServiceWorker();

Window.Hzpx=Hzpx;
let value='' //𠀁';//邏羅寶貝𩀨從䞃致招'//' //𠈐曳國// //汉字拼形
let ready=false;
let showhelp=false;
let message='';
// document.title="汉字拼形-库存字形"+glyphWikiCount();
let timer;
onMount(async ()=>{
	timer=setInterval(function(){
		if (isDataReady()) {
			setTimeout(function(){
				value='邏羅寶貝𩀨從䞃致招';
				ready=true;
			},2000);//wait for data ready
			clearInterval(timer);
		}
	},1000);
})
let svgs=[], frame=false , showfont=false, showinfo=false , size=200, fontface='宋体' ;
let testbench=false;

$: svgs        = ready?drawPinx(value,{size,fontface,frame}):[]; //allow mix normal char and pinxing expression
$: pinxUnits   = splitPinx(value,true);

$: components  = [];//getRenderComps(value)||[];
$: fontfaces   = enumFontFace();
$: replacables = getLastComps(value);
$: derives = (showinfo && codePointLength(value)==1 && derivedOf(value,200) ) ||[];
const toPNG=e=>downloadSvg(e.target,value+".png",size);
const focusInput=()=>{
	const input=document.querySelector('.input');
	input.focus();
	input.selLength=value.length;
}
const replaceComp=(comp)=>{ value+=comp+'卍'; focusInput()};
const setBase=gid=>value=gid2ch(gid);
//why 寶缶匋 cannot ?
//bug 盟月夕 cannot replace moon
/* to fix
//瑇 u248e9 wrong 
*/
const copylink=(rep)=>{
	let text="https://nissaya.cn/hzpx?g="+value;
	if (rep) text=rep.replace('$$',text);
	navigator.clipboard.writeText(text);
	message='已复制到剪贴薄'
	setTimeout(()=>{
		message='';
	},2000)
}
</script>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="container">
<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if ready}<span class=clickable on:click={()=>testbench=!testbench}>🧪</span>{/if}
{#if testbench}
<TestBench {fontface}/>
{:else}

{#if ready}
<input class="input" maxlength ="25" size="14" bind:value placeholder="基字或构件" />
<button on:click={copylink}>📋</button>
<button on:click={()=>copylink('=IMAGE("$$")')}>📅</button>
<br/>
{#if message}{message}
{:else}
<Favorite bind:value/>
{/if}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<span title="Frame 字框" class:selected={frame} on:click={()=>frame=!frame}>⿻</span>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<span title="Font 字型" class=clickable class:selected={showfont} on:click={()=>showfont=!showfont}>🗚</span>
{#if showfont}
{#each fontfaces as ff}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<span class=clickable class:selected={ff==fontface} on:click={()=>fontface=ff}>{ff} </span> 
{/each}
{/if}
<br/>
{#each svgs as svg,idx}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<span title={pinxUnits[idx]} on:click={toPNG}>{@html svg}</span>
{/each}
{#each replacables as comp}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<span class="replacecomp" on:click={()=>replaceComp(comp)}>{comp}</span>
{/each}
<br/>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if value&&value.length<2}
<span title="Members and Derived 成员及孳乳" class:selected={showinfo} on:click={()=>showinfo=!showinfo}>👪</span>
{/if}
{#key value}
{#if showinfo}
{#each derives as gid}
<Glyph {gid} {fontface} onclick={()=>setBase(gid)}/>
{/each}
{#each components as gid}
<br/><Glyph {gid} derivable={true} {fontface} />
{/each}


寶缶充
𡖟它并
{:else}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-missing-attribute -->
<a on:click={()=>showhelp=!showhelp} >❓</a>
{#if showhelp}
<h3>画面说明</h3>
1行：字表, 输入区 (单字视为构件) 📋复制网址 📅 复制储存格指令
<br/>2行：❤加入/❌删除最爱 , 库存拼形式 , ⿻显示字框 , 🗚选择字体
<br/>3行：大字形(点一下存为PNG) 替代构件清单
<br/>4行：👪字族
<br/>5行：孳乳

<h3>使用说明</h3>
基字：做为构建字形的基础字。构件：构成字形的元素。
<br/>拼形式：拼出一个字形的式子。语法是："基字/构件/替字" ，替字也可以是拼形式。
<br/>输入一个单字，按字族，可得此字之孳乳，点一下将之作为基字。
<br/>选定基字之後，按一下要替换的构件，再输入替字。
<br/>复制网址，一般使用。
<br/>复制储存格指令，到Office 365 或 Google SpreadSheet 貼上。
<h3>技术说明</h3>
不依赖服务端，纯html+js 软件。智能识別拼形式和一般字。
<br/>本字库可生成包括Unicode A-G 的所有字形。
<br/>「汉字拼形」授权方式为ISC（可做商业用途），但目前基於以下两个GPL授权（可做商业用途但必须开源）之模块。
<br/>A. Glyphwiki.org 数据库   B. Kage(荫) 矢量笔划产生器 
<h3>已知问题</h3>
1.由於Glyphwiki造字时并没有考虑字形生成的需求，很多字的字框无法做基字，如「街圭舞」效果不理想。
<br/>2.为求字形美观，Glyphwiki 将部件拆散为笔划，这样的字无法做为基字。
<br/>3.glyphwiki是日本风格的字形库，某些细节不符合中国国家标准。
<br/>4.在稍微牺牲美观的条件下，许多字可替换成拼形式，每字可节约40B左右，理论上全CJK字库可以压缩到2.5MB~3MB，相於16x16点阵字模。
<br/>5.首次使用孳乳会花几秒钟产生反向索引。由於索引只在内存，网页重载之后必须重建。
<br/>微信： Sukhanika ,  Gmail : yapcheahshen
{/if}
{/if}
{/key}
{:else}
<img src="hzpx.png" alt="招財進寶"/>
<br/>汉字拼形载入中(十秒左右)
<br/>System Loading……in 10 seconds
{/if}
{/if}
</div>