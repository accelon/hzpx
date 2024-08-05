<script>
import {drawGlyph,gid2ch,derivedOf} from 'hzpx-engine/web.ts'
import {downloadSvg} from './svg2png.js'
export let gid;
export let derivable=false, fontface;
export let size=48 * (derivable?1.5:1) ;
let msg=''
const batchsize=30;
export let onclick=null;
let batch=0;
const svg=drawGlyph(gid , {size,fontface});

let derived=[];

const genDerived=()=>{
	if(!derivable) return;
	if (derived.length) {
		batch=0;
	} else {
		msg='⌛...';
		setTimeout(()=>{
			derived=derivedOf(gid);
			batch=1;
			msg='';
		},1);			
	}
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

<span aria-hidden="true" on:click={e=>onclick?onclick(e):toPNG(e)} title={gid}>{@html svg}</span>
<rt>
{#if derivable}
<span aria-hidden="true" class:derivable>{gid2ch(gid)}</span>
<span aria-hidden="true" on:click={genDerived} class="clickable" class:derivable>{gid}</span>
{:else}
<span class:derivable>{gid}</span>
{/if}
</rt>
</ruby>
<span class="msg">{msg}</span>
{#key batch}
{#each partialDerived(batch) as d} 
	<svelte:self gid={d} {fontface} />
{/each}
{/key}
{#if batch*batchsize<derived.length}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<span class="clickable" on:click={morebatch}>…{derived.length-batch*batchsize}…</span>
{/if}
