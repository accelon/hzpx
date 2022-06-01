<script>
import Glyph from './glyph.svelte'
import TestBench from './testbench.svelte';
import {downloadSvg} from './svg2png.js'
import {drawGlyphs,drawGlyph, drawPinx , getRenderComps,enumFontFace} from './drawglyph.js'
let value='汉字拼形' //字拼形
let svgs=[] , showinfo=true , fontface='宋体';
const stocks=['初衤礻','颰犮电','冧林新','腦囟同','寶缶充','衚胡舞','鵝鳥烏','疢火肝','髜昇厏乍电','超召狸里美','国玉囡女书'] 
//why 寶缶匋 cannot ?
//bug 盟月夕 cannot replace moon
//save as png, see codemirror kage
let size=256;
$: svgs=value.charCodeAt(0)<0x2000?[drawGlyph(value,{size,fontface})]:drawPinx(value,{size,fontface});


$: components=getRenderComps(value)||[];
$: fontfaces=enumFontFace();
//瑇 u248e9 wrong 
let testbench=false;
const opentestbench=()=>{
	testbench=!testbench;
}
const toPNG=evt=>{
	downloadSvg(evt.target,value+".png",size);
}
</script>
<input class="ire" bind:value/> <a href="https://github.com/accelon/hzpx/">🏠</a>

<br/>{#each stocks as stock}
<span class=fontbtn class:selected={value==stock} on:click={()=>value=stock}>{stock+" "}</span> 

{/each}
<br/>{#each fontfaces as ff}
<span class=fontbtn class:selected={ff==fontface} on:click={()=>fontface=ff}>{ff+" "} </span> 
{/each}
<br/>

{#each svgs as svg}
<span on:click={toPNG}>{@html svg}</span>
{/each}
<br/>
<label>構件及孳乳<input type="checkbox" bind:checked={showinfo}/></label>
{#key value}
{#if showinfo}
{#each components as gid}
<br/><Glyph {gid} derivable={true} {fontface}/>
{/each}
{/if}
{/key}

<style> 
	.fontbtn:hover {border-bottom: 1px blue solid;cursor: pointer}
	.ire {font-size: 150%}
	.selected {color: blue}
</style>