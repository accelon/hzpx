<script>
import {onMount} from 'svelte'
import {loadScript} from 'pitaka/utils'
let ready=false;
onMount(async ()=>{
	await loadScript("/hanziyin.js", () => typeof hanziyin  !== 'undefined');	
	ready=true;
})

</script>
{#if ready}
TEST READY
{/if}