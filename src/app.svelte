<script>
import Glyph from './glyph.svelte'
import {drawGlyphs,drawGlyph, drawPinx , getRenderComps} from './drawglyph.js'
let value='汉字拼形' 
let svgs=[] , showinfo=true ;
const stocks=['初衤礻','颰犮电','冧林新','腦囟同','寶缶充','衚胡舞','鵝鳥烏','疢火肝','髜昇厏乍电','超召狸里美','国玉囡女书'] 
//why 寶缶匋 cannot ?
//bug 盟月夕 cannot replace moon
$: svgs=value.charCodeAt(0)<0x2000?[drawGlyph(value,256)]:drawPinx(value,256);
$: components=getRenderComps(value)||[];
//瑇 u248e9 wrong 
</script>

<input class="ire" bind:value/> <input type="checkbox" bind:checked={showinfo}/><a href="https://github.com/accelon/hzpx/">🏠</a>
<br/>{#each stocks as stock}
<button on:click={()=>value=stock}>{stock}</button>
{/each}
<div class="main">
<div>
	{#each svgs as svg}
	<span>{@html svg}</span>
	{/each}
</div>
{#key value}
{#if showinfo}
{#each components as gid}
<br/><Glyph {gid} />
{/each}
{/if}
{/key}
</div>

<style>
	.ire {font-size: 150%}
</style>