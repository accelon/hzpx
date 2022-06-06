<script>
import {onMount} from 'svelte'
import CharMap from './charmap.svelte'
import {loadScript} from 'pitaka/utils'
import {drawPinx,drawGlyph} from './drawglyph.js'
import {getGlyph} from './gwformat.js'
import {autoIRE} from './pinx.js'
import {bases} from './store.js'
let ready=false;
let basew='',comptofind='';
export let fontface;
let glyph='20200';

/*
最愛構件
最愛基字

構件序  glyphwiki 觀點 , hanziyin 觀點
孳乳    glyphwiki 觀點 , hanziyin 觀點

基字：以此為基的字...

狸 ：狗 
*/
$: svg=drawPinx(glyph,{size:200,fontface,frame:true})
$: glyphdata=getGlyph(glyph).split('$');
$: ire=autoIRE(glyph,$bases)
$: iresvg=drawPinx(ire,{size:200,fontface,frame:true});
onMount(async ()=>{
	if (typeof hanziyin=='undefined') {
		await loadScript("hanziyin.js", () => typeof hanziyin  !== 'undefined');
	}
	ready=true;
})
</script>
{#if ready}
<a class="homepage" href="https://github.com/accelon/hzpx/">🏠</a>
基字<input class="input" bind:value={basew} maxlength=2 size=2 />
構件<input class="input" bind:value={comptofind} maxlength=2 size=2/>
<table><tr><td>
<CharMap bind:glyph {fontface} bases={$bases}/>
</td>
<td>
{@html svg}
<br>
{#each glyphdata as unit}
<div class=glyphdata>{unit}</div>
{/each}
<div>{@html iresvg}</div>
</td>
</tr></table>

{/if}
<style>
	td {vertical-align:top}
	.glyphdata {font-size: 75% }
</style>