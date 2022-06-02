<script>
import {onMount} from 'svelte'
import CharMap from './charmap.svelte'
import {loadScript} from 'pitaka/utils'
let ready=false;
let basew='',comptofind='';
/*
最愛構件
最愛基字

構件序  glyphwiki 觀點 , hanziyin 觀點
孳乳    glyphwiki 觀點 , hanziyin 觀點

基字：以此為基的字...

狸 ：狗 

選一個基字，找出所有以此為基的字 
如狸，先用犭  找所有 extension A, extension B 含 犭  或含 里的字
產生新的效果
如  㹠 ，與 狸的構形序 diff 得 屯 。產生  狸里屯 ，送給 pinx
換基字

先處理一批 容易組成的。
儲存格式為 
基字=字字字字
網友以某基，選出所有合適的
認養


*/
onMount(async ()=>{
	if (typeof hanziyin=='undefined') {
		await loadScript("hanziyin.js", () => typeof hanziyin  !== 'undefined');
	}
	ready=true;
})
</script>
{#if ready}
<a class="homepage" href="https://github.com/accelon/hzpx/">🏠</a>
基字<input class="input" bind:value={basew} maxlength=2 size=2 />
構件<input class="input" bind:value={comptofind} maxlength=2 size=2/>
<CharMap/>

{/if}