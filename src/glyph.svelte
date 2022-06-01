<script>
import {drawGlyph} from './drawglyph.js'
import {gid2ch,derivedOf} from './gwformat.js'
import {downloadSvg} from './svg2png.js'
export let gid;
export let derivable=false, fontface;
export let size=48 * (derivable?1.5:1);
let msg=''
const batchsize=30;
let batch=0;
const svg=drawGlyph(gid , {size,fontface});

export const copySelection=evt=>{
    const sel=getSelection();
    const range=document.createRange()
    range.setStart(evt.target,0);
    range.setEnd(evt.target,1);
    sel.removeAllRanges()
    sel.addRange(range);
    document.execCommand('copy')
    sel.removeAllRanges();
}
let derived=[];

const genDerived=()=>{
	if(!derivable) return;
	if (derived.length) {
		batch=0;
	} else {
		msg='产生孳乳...';
		setTimeout(()=>{
			derived=derivedOf(gid);
			batch=1;
			msg='';
		},1);			
	}
}
const copyToClipboard=evt=>{
	genDerived();
    copySelection(evt)
}
const partialDerived=()=>{
	const s=derived.slice(0,batchsize*batch);
	return s;
}

const morebatch=()=>{
	batch++;
}
const toPNG=evt=>{
	downloadSvg(evt.target,gid2ch(gid)+".png",size);
}
</script>
<ruby>
<span on:click={toPNG} title={gid}>{@html svg}</span>
<rt>
{#if derivable}
<span class="clickable" class:derivable on:click={copyToClipboard}>{gid2ch(gid)}</span>
{/if}
<span class="clickable" class:derivable on:click={copyToClipboard}>{gid}</span>
</rt>
</ruby>
<span class="msg">{msg}</span>
{#key batch}
{#each partialDerived(batch) as d} 
	<svelte:self gid={d} {fontface} />
{/each}
{/key}
{#if batch*batchsize<derived.length}
<span class="clickable" on:click={morebatch}>…{derived.length-batch*batchsize}…</span>
{/if}
<style>
	.clickable:hover{color: blue;cursor: pointer}
	.derivable {font-weight: bold;}
	.msg {color: green}
	ruby {ruby-position: under}
</style>
