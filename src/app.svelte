<script>
import {onMount} from 'svelte'
import Glyph from './glyph.svelte'
import {codePointLength} from 'pitaka/utils'
import TestBench from './testbench.svelte';
import {downloadSvg} from './svg2png.js'
import {glyphWikiCount,derivedOf, ch2gid,gid2ch} from './gwformat.js'
import Favorite from './favorite.svelte'
import {drawPinx, drawGlyph, getRenderComps,enumFontFace ,getLastComps } from './drawglyph.js'
import {getGlyph} from './gwformat.js'
import {splitPinx} from './pinx.js'
import {getPWADisplayMode,registerServiceWorker} from 'pitaka'
registerServiceWorker();

let value='邏羅寶貝𩀨從䞃致招'//' //𠈐曳國// //汉字拼形

document.title="汉字拼形-库存字形"+glyphWikiCount()

let svgs=[], frame=false , showfont=false, showinfo=false , size=200, fontface='宋体' ;
let testbench=false;

$: svgs        = (getGlyph(value)?drawGlyph:drawPinx)(value,{size,fontface,frame}); //allow mix normal char and pinxing expression
$: if (getGlyph(value)&&!Array.isArray(typeof svgs[0]))  svgs=[svgs]; //single glyph as svg array
$: pinxUnits   = splitPinx(value,true);

$: components  = getRenderComps(value)||[];
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
</script>
<div class="container">
<span class=clickable on:click={()=>testbench=!testbench}>🧪</span>
{#if testbench}

<TestBench {fontface}/>
{:else}
<input class="input" maxlength ="25" bind:value placeholder="基字或构件" />
<br/>
<Favorite bind:value/>
<span title="Frame 字框" class:selected={frame} on:click={()=>frame=!frame}>⿻</span>
<span title="Font 字型" class=clickable class:selected={showfont} on:click={()=>showfont=!showfont}>🗚</span>
{#if showfont}
{#each fontfaces as ff}
<span class=clickable class:selected={ff==fontface} on:click={()=>fontface=ff}>{ff} </span> 
{/each}
{/if}
<br/>
{#each svgs as svg,idx}
<span title={pinxUnits[idx]} on:click={toPNG}>{@html svg}</span>
{/each}
{#each replacables as comp}
<span class="replacecomp" on:click={()=>replaceComp(comp)}>{comp}</span>
{/each}
<br/>
<span title="Members and Derived 成员及孳乳" class:selected={showinfo} on:click={()=>showinfo=!showinfo}>👪</span>
{#key value}
{#if showinfo}
{#each derives as gid}
<Glyph {gid} {fontface} onclick={()=>setBase(gid)}/>
{/each}
{#each components as gid}
<br/><Glyph {gid} derivable={true} {fontface} />
{/each}
{:else}
<h3>画面说明</h3>
1行：字表, 输入区 (单字视为构件)
<br/>2行：加入/删除最爱 , 拼形式清单 , 显示字框 , 选择字体
<br/>3行：大字形(点一下存为PNG) 替代构件清单
<br/>4行：字族按钮
<br/>5行：构件之孳乳
<br/>6~：拼形所用到的构件，点字形存为PNG，点代码列出此构件之孳乳
<h3>使用说明</h3>
基字：做为构建字形的基础字。构件：构成字形的元素。
<br/>拼形式：拼出一个字形的式子。语法是："基字/构件/替字" ，替字也可以是拼形式。
<br/>输入一个单字，按字族，可得此字之孳乳，点一下将之作为基字。
<br/>选定基字之後，按一下要替换的构件，再输入替字。
<h3>技术说明</h3>
不依赖服务端，纯html+js 软件。智能识別拼形式和一般字。
<br/>本字库可生成包括Unicode A-G 的所有字形。数据量约为 4.5MB。
<br/>「汉字拼形」授权方式为ISC（可做商业用途），但目前基於以下两个GPL授权（可做商业用途但必须开源）之模块。
<br/>A. Glyphwiki.org 数据库   B. Kage(荫) 矢量笔划产生器 
<h3>已知问题</h3>
1.由於Glyphwiki造字时并没有考虑字形生成的需求，很多字的字框无法做基字，如「街圭舞」效果不理想。
<br/>2.为求字形美观，Glyphwiki 将部件拆散为笔划，这样的字无法做为基字。
<br/>3.glyphwiki是日本风格的字形库，某些细节不符合中国国家标准。
<br/>4.在稍微牺牲美观的条件下，许多字可替换成拼形式，每字可节约40B左右，理论上全CJK字库可以压缩到2.5MB~3MB，相於16x16点阵字模。
<br/>5.首次使用孳乳会花几秒钟产生反向索引。由於索引只在内存，网页重载之后必须重建。
<br/> <a target=_new href="https://github.com/accelon/hzpx/">hzpx 源代码</a>
{/if}
{/key}
{/if}
</div>