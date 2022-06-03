<script>
import Glyph from './glyph.svelte'
import {drawPinx} from './drawglyph.js'
import {splitPinx} from './pinx.js'
import {string2codePoint,copySelection} from 'pitaka/utils'
export let rowstart=0x4e00;
export let glyph='';
let chars=[];
let showsystemfont='';
let selected=String.fromCodePoint(string2codePoint(glyph));
for (let i=0;i<16;i++) {
	chars.push( String.fromCodePoint(rowstart+i ));
}
const copyToClipboard=async ch=>{
	await navigator.clipboard.writeText(ch);
}
const opts={size:48,alt:true}
</script>
{#each chars as ch}
<ruby >
<rb on:click={()=>showsystemfont=showsystemfont==ch?'':ch} class="charmap-glyph" on:click={()=>copyToClipboard(ch)}><span title={splitPinx(ch,true)[0]}>{@html (showsystemfont==ch)?ch:drawPinx(ch,opts)}</span></rb><rt class:selected={selected==ch} class="charmap-codepoint">{ch.codePointAt(0).toString(16)}</rt>
</ruby>
{/each}
