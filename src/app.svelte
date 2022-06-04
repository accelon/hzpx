<script>
import Glyph from './glyph.svelte'
import TestBench from './testbench.svelte';
import {downloadSvg} from './svg2png.js'
import {glyphWikiCount} from './gwformat.js'
import Favorite from './favorite.svelte'
import {drawPinx, drawGlyph, getRenderComps,enumFontFace ,getLastComps } from './drawglyph.js'
import {getGlyph} from './gwformat.js'
import {splitPinx} from './pinx.js'
document.title="汉字拼形-预调"+glyphWikiCount();

let value='𠈐曳國' // //汉字拼形
let svgs=[], frame=false , showfont=false, showinfo=false , size=200, fontface='宋体' ;
let testbench=true;

$: svgs        = (getGlyph(value)?drawGlyph:drawPinx)(value,{size,fontface,frame}); //allow mix normal char and pinxing expression
$: if (!Array.isArray(typeof svgs[0]))  svgs=[svgs];
$: pinxUnits   = splitPinx(value,true);

$: components  = getRenderComps(value)||[];
$: fontfaces   = enumFontFace();
$: replacables = getLastComps(value);


const toPNG=evt=>downloadSvg(evt.target,value+".png",size);
const replaceComp=(comp)=>value+=comp+'卍';
//why 寶缶匋 cannot ?
//bug 盟月夕 cannot replace moon
/* to fix
//瑇 u248e9 wrong 
*/
</script>
<div class="container">
<span class=clickable on:click={()=>testbench=!testbench}>🧪</span>
{#if testbench}

<TestBench/>
{:else}
<input class="input" maxlength ="25" bind:value/>
<br/>
<Favorite bind:value/>
<span title="Frame 字框" class:selected={frame} on:click={()=>frame=!frame}>⿻</span>
<span title="Font 字型" class=clickable class:selected={showfont} on:click={()=>showfont=!showfont}>🗚</span>
{#if showfont}
{#each fontfaces as ff}
<span class=clickable class:selected={ff==fontface} on:click={()=>fontface=ff}>{ff} </span> 
{/each}
{/if}
<br/>
{#each svgs as svg,idx}
<span title={pinxUnits[idx]} on:click={toPNG}>{@html svg}</span>
{/each}
{#each replacables as comp}
<span class="replacecomp" on:click={()=>replaceComp(comp)}>{comp}</span>
{/each}
<br/>
<span title="Members and Derived 成员及孳乳" class:selected={showinfo} on:click={()=>showinfo=!showinfo}>👪</span>
{#key value}
{#if showinfo}
{#each components as gid}
<br/><Glyph {gid} derivable={true} {fontface}/>
{/each}
{/if}
{/key}
{/if}
</div>