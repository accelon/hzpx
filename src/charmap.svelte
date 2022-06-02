<script>
import CharMapRow from './charmaprow.svelte'
import {CJKRangeName,enumCJKRangeNames,getCJKRange,string2codePoint} from 'pitaka/utils'
export let value='4e00';
let rows=[];

const updatePage=()=>{
	let n=string2codePoint(value,true);
	rows.length=0;
	for (let i=0;i<8;i++) {
		rows.push(n+16*i);
	}
}
const nextpage=()=>{
	let n=string2codePoint(value,true)+128;
	value=n.toString(16);
	updatePage();
}
const prevpage=()=>{
	let n=string2codePoint(value,true) ;
	if (n-128>=0x0) {
		value=(n-128).toString(16);
		updatePage();		
	}
}
$: updatePage(value);
</script>
<span class=clickable on:click={prevpage}>⏪</span>
<input bind:value size=4/>
<span class=clickable on:click={nextpage}>⏩</span>
<br/>
{#key value}
{#each enumCJKRangeNames() as name}
<span class='clickable' class:selected={CJKRangeName(value)==name} on:click={()=>value=(getCJKRange(name)[0]).toString(16)}>{name}</span>
{/each}
{/key}

{#key rows}
{#each rows as rowstart }
<div><CharMapRow {rowstart} glyph={value}/></div>
{/each}
{/key}