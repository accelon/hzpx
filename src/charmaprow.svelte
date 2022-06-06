<script>
import Glyph from './glyph.svelte'
import {drawPinx} from './drawglyph.js'
import {splitPinx,autoIRE} from './pinx.js'
import {string2codePoint,copySelection} from 'pitaka/utils'
export let rowstart=0x4e00;
export let fontface;
export let glyph='';
export let bases=[];
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
const todraw=ch=>(ire && glyph==ch)?autoIRE(ch,bases):ch;


const draw=(ch,glyph)=>drawPinx(todraw(ch,ire), {size:48,alt:true,fontface, color: todraw(ch)!==ch?'green':'black'} )
</script>
{#each chars as ch}
<ruby on:click={()=>onClick(ch)}>
<rb  class="charmap-glyph"><span title={todraw(ch)}>{@html draw(ch,ire)}</span></rb><rt class:selected={glyph==ch} class="charmap-codepoint">{ch.codePointAt(0).toString(16)}</rt>
</ruby>
{/each}
