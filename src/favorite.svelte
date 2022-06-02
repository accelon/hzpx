<script>
const stock=['初衤礻','颰犮电','冧林新','腦囟同','寶缶充','衚胡舞','鵝鳥烏','痛甬炱台肝','髜昇厏乍电','超召狸里美','国玉囡女书']
const StorageKey='hzpx-favorite'
import {splitUTF32} from 'pitaka/utils'
let users=localStorage.getItem(StorageKey);
$: favorites=users?users.split('$'):stock;

export let value=''
let timer=0;
const dofavor=()=>{
	if (~favorites.indexOf(value)) {
		favorites=favorites.filter(it=>it!==value);
	} else if (value.trim()){
		favorites.unshift(value);
	}
	favorites=favorites;
	clearTimeout(timer);
	timer=setTimeout(()=>{
		localStorage.setItem(StorageKey,favorites.join('$'))
	},5000)
}
const getCodepoints=str=>{
	const codepoints=splitUTF32(str);
	return codepoints.map(it=>it.toString(16)).join(' ');
}
</script>

<span class=clickable title="Favorite 最爱" on:click={dofavor}>{~favorites.indexOf(value)?'❌':'❤'}</span>
{#each favorites as f}
<span class=clickable title={getCodepoints(f)} class:selected={value==f} on:click={()=>value=f}>{f}</span> 
{/each}
