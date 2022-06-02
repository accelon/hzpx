<script>
import {onMount} from 'svelte'
import {loadScript} from 'pitaka/utils'
let ready=false;
onMount(async ()=>{
	await loadScript("hanziyin.js", () => typeof hanziyin  !== 'undefined');	
	ready=true;
})

</script>
{#if ready}
<a class="homepage" href="https://github.com/accelon/hzpx/">🏠</a>
TEST READY
{/if}