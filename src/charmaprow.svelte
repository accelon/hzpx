<script>
import Glyph from './glyph.svelte'
import {drawPinx,splitPinx} from 'hzpx-engine/web.ts'
import {string2codePoint} from 'ptk/utils/cjk.ts'
export let rowstart=0x4e00;
export let fontface;
export let glyph='';
export let base='';
let ire=false;
let chars=[];
let selected=String.fromCodePoint(string2codePoint(glyph));
for (let i=0;i<16;i++) {
	chars.push( String.fromCodePoint(rowstart+i ));
}
const copyToClipboard=async ch=>{
	await navigator.clipboard.writeText(ch);
}

const onClick=async ch=>{
	if (glyph==ch) {
		ire=!ire;
	} else {
		glyph=ch		
	}
	await copyToClipboard();
}
const todraw=ch=>ch;//(ire && base && glyph==ch)?reBase(ch,base):ch;


const draw=(ch,glyph)=>drawPinx(todraw(ch,ire), {size:48,alt:true,fontface, color: todraw(ch)!==ch?'green':'black'} )
</script>
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
{#each chars as ch}
<!-- svelte-ignore a11y-click-events-have-key-events -->
<ruby on:click={()=>onClick(ch)}>
<rb  class="charmap-glyph"><span title={todraw(ch)}>{@html draw(ch,ire)}</span></rb><rt class:selected={glyph==ch} class="charmap-codepoint">{ch.codePointAt(0).toString(16)}</rt>
</ruby>
{/each}
