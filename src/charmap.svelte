<script>
import CharMapRow from './charmaprow.svelte'
export let codepoint=0x4e00;
let page=0;
let rows=[];
const updatePage=()=>{
	rows.length=0;
	for (let i=0;i<8;i++) {
		rows.push(codepoint+16*i + page*128);
	}
}
const nextpage=()=>{
	page++;
	updatePage();
}
const prevpage=()=>{
	if (page>0) {
		page--;
		updatePage();
	}
}
updatePage();
</script>
<span class=clickable on:click={prevpage}>⏪</span>
<span class=clickable on:click={nextpage}>⏩</span>
{#key rows}
{#each rows as codepoint }
<div><CharMapRow {codepoint}/></div>
{/each}
{/key}