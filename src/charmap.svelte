<script>
import CharMapRow from './charmaprow.svelte'
import {CJKRangeName,enumCJKRangeNames,getCJKRange,string2codePoint} from 'ptk/nodebundle.cjs'
export let glyph;
export let fontface;

let rows=[];

const updatePage=()=>{
	let n=string2codePoint(glyph,true);
	rows.length=0;
	for (let i=0;i<8;i++) {
		rows.push(n+16*i);
	}
}
const nextpage=()=>{
	let n=string2codePoint(glyph,true)+128;
	glyph=n.toString(16);
	updatePage();
}
const prevpage=()=>{
	let n=string2codePoint(glyph,true) ;
	if (n-128>=0x0) {
		glyph=(n-128).toString(16);
		updatePage();		
	}
}
$: updatePage(glyph);
</script>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<span class=clickable on:click={prevpage}>⏪</span>
<input bind:value={glyph} size=4/>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<span class=clickable on:click={nextpage}>⏩</span>
<br/>
{#key glyph}
{#each enumCJKRangeNames() as name}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<span class='clickable' class:selected={CJKRangeName(glyph)==name} on:click={()=>glyph=(getCJKRange(name)[0]).toString(16)}>{name}</span>
{/each}
{/key}

{#key rows}
{#each rows as rowstart }
<div><CharMapRow {rowstart} {fontface} bind:glyph/></div>
{/each}
{/key}