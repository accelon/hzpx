<script>
import Glyph from './glyph.svelte'
import {drawGlyph} from './drawglyph.js'

export let codepoint;

let chars=[];
let selected='';
for (let i=0;i<16;i++) {
	chars.push( String.fromCodePoint(codepoint+i ));
}
const opts={size:48,alt:true}
</script>
{#each chars as ch}
<ruby>
<rb on:click={()=>selected= selected==ch?'':ch } class="charmap-glyph">{@html (selected==ch)?ch:drawGlyph(ch,opts)}</rb><rt class="charmap-codepoint">{ch.codePointAt(0).toString(16)}</rt>
</ruby>

{/each}

<style>

</style>
