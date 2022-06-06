<script>
const StorageKey='hzpx-favorite'
import {splitUTF32} from 'pitaka/utils'
import {favorites} from './store.js'


export let value=''
let timer=0;
const dofavor=()=>{
	if (~$favorites.indexOf(value)) {
		$favorites=$favorites.filter(it=>it!==value);
	} else if (value.trim()){
		$favorites.unshift(value);
	}
	$favorites=$favorites;
}
const getCodepoints=str=>{
	const codepoints=splitUTF32(str);
	return codepoints.map(it=>it.toString(16)).join(' ');
}
</script>

<span class=clickable title="Favorite 最爱" on:click={dofavor}>{~$favorites.indexOf(value)?'❌':'❤'}</span>
{#each $favorites as f}
<span class=clickable title={getCodepoints(f)} class:selected={value==f} on:click={()=>value=f}>{f}</span> 
{/each}
