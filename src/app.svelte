<script>
import Glyph from './glyph.svelte'
import TestBench from './testbench.svelte';
import {downloadSvg} from './svg2png.js'
import {glyphCount} from './gwformat.js'
import {drawPinx, getRenderComps,enumFontFace ,getLastComps} from './drawglyph.js'
let value='汉字拼形' //汉字拼形
let svgs=[] , showinfo=false , fontface='宋体';
const stocks=['初衤礻','颰犮电','冧林新','腦囟同','寶缶充','衚胡舞','鵝鳥烏','疢火肝','髜昇厏乍电','超召狸里美','国玉囡女书'] 
let size=200;
let frame=false , showfont=false , showstock=true;
$: svgs        = drawPinx(value,{size,fontface,frame}); //allow mix normal char and pinxing expression
$: components  = getRenderComps(value)||[];
$: fontfaces   = enumFontFace();
$: replacables = getLastComps(value);
document.title="汉字拼形-库存"+glyphCount();
const toPNG=evt=>downloadSvg(evt.target,value+".png",size);
const replaceComp=(comp)=>value+=comp+'卍';
let testbench=false;
//why 寶缶匋 cannot ?
//bug 盟月夕 cannot replace moon
/* to fix
//瑇 u248e9 wrong 
*/
</script>
<div class="container">
<span class=clickable on:click={()=>testbench=!testbench}>🧪</span>
{#if testbench}

<TestBench/>
{:else}
<input class="ire" maxlength ="25" bind:value/>

<br/>

<span class=clickable class:selected={showstock}  on:click={()=>showstock=!showstock}>🗠</span>
{#if showstock}
{#each stocks as stock}
<span class=clickable class:selected={value==stock} on:click={()=>value=stock}>{stock}</span> 
{/each}
{/if}

<span class:selected={frame} on:click={()=>frame=!frame}>⿻</span>
<span class=clickable class:selected={showfont} on:click={()=>showfont=!showfont}>🗚</span>

{#if showfont}
{#each fontfaces as ff}
<span class=clickable class:selected={ff==fontface} on:click={()=>fontface=ff}>{ff} </span> 
{/each}
<br/>

{/if}

<br/>

{#each svgs as svg}
<span on:click={toPNG}>{@html svg}</span>
{/each}
{#each replacables as comp}
<span class="replacecomp" on:click={()=>replaceComp(comp)}>{comp}</span>
{/each}
<br/>
<span class:selected={showinfo} on:click={()=>showinfo=!showinfo}>构件及孳乳</span>
{#key value}
{#if showinfo}
{#each components as gid}
<br/><Glyph {gid} derivable={true} {fontface}/>
{/each}
{/if}
{/key}
{/if}
</div>
<style> 
	.container {user-select: none;}
	.clickable{padding-left: 0.25em;padding-right: 0.25em}
	.clickable:hover {border-bottom: 1px blue solid;cursor: pointer}
	.ire {font-size: 150%}
	.selected { background: silver;border-radius: 5px;}
	.replacecomp {font-size: 2em ;border:1px dotted silver }
	.replacecomp:hover {text-decoration: line-through; cursor: pointer}
</style>