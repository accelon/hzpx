<script>
import {onMount} from 'svelte'
import CharMap from './charmap.svelte'
import {loadScript} from 'pitaka/utils'
import {drawPinx,drawGlyph} from './drawglyph.js'
import {getGlyph} from './gwformat.js'
import {reBase,baseCandidate} from './pinx.js'
let basew='',comptofind='';
export let fontface;
let glyph='20000';
let activeBase='';
/*
最愛構件
最愛基字

構件序  glyphwiki 觀點 , hanziyin 觀點
孳乳    glyphwiki 觀點 , hanziyin 觀點

基字：以此為基的字...

狸 ：狗 
*/
const resetActiveBase=candidates=>{
	if (candidates && ~candidates.indexOf(activeBase)) return;
	if (candidates && candidates.length) {
		activeBase=candidates[0];
	} else {
		activeBase='';//no activebase
	}
}
const setActiveBase=base=>{
	if (activeBase==base) activeBase='';
	else activeBase=base;
}
$: svg=drawPinx(glyph,{size:200,fontface,frame:true})
$: glyphdata=getGlyph(glyph).split('$');
$: candidates=[];//baseCandidate(glyph); 
// $: resetActiveBase(candidates,glyph);
//$: ire=reBase(glyph, activeBase ); console.log(ire)
//$: iresvg=drawPinx(ire,{size:200,fontface,frame:true});
</script>
<a class="homepage" href="https://github.com/accelon/hzpx/">🏠</a>
<!--基字<input class="input" bind:value={basew} maxlength=2 size=2 />
構件<input class="input" bind:value={comptofind} maxlength=2 size=2/>//-->
<table><tr><td>
<CharMap bind:glyph {fontface}/>
</td>
<td>
{@html svg}
<br>
{#each glyphdata as unit}
<div class=glyphdata>{unit}</div>
{/each}
{#each candidates as base}
<span class=clickable on:click={setActiveBase(base)} class:selected={activeBase==base}>{base}</span>
{/each}
<!-- <div>{@html iresvg}</div> -->
</td>
</tr></table>

<style>
	td {vertical-align:top}
	.glyphdata {font-size: 75% }
</style>