<script>
import {drawGlyph} from './drawglyph.js'
import {gid2ch} from './gwformat.js'
export let gid;
export let size=64;
const svg=drawGlyph(gid ,size );

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
const copyToClipboard=evt=>{
    copySelection(evt)
}

</script>
<span title={gid}>{@html svg}</span>
<span class="clickable" on:click={copyToClipboard}>{gid}</span>
<span class="clickable" on:click={copyToClipboard}>{gid2ch(gid)}</span>
<style>
	.clickable:hover{color: blue;cursor: pointer}
</style>
