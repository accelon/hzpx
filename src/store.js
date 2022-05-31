import { get,writable } from "svelte/store";
export let minStroke=writable(0);
export let maxStroke=writable(1);
export let firstStrokeType=writable(0);
export let secondStrokeType=writable(0);
export let HZStack=writable([]);
export const MaxStrokeCount=30;
import {splitUTF32} from "hanziyin"

export let message=writable('');

export let tofind=writable('')

export const notifyUser=(msg,stayfor=4000)=>{
    setTimeout(()=>{
        message.set('');
    },stayfor);
    message.set(msg);
}

export const addHZ=(tf,from,pos)=>{
    if (typeof tf=='string') tf=splitUTF32(tf);
    else if (typeof tf=='number') tf=[tf];

    const stack=get(HZStack);
    const obj={tf,from}
    for (let card in stack){
        if (stack[card].from==obj.from ||
            stack[card].tf.join()==obj.tf.join() ) {
            stack.splice(card,1);
            break;
        }
    }
    if (pos==-1) {
        stack.unshift(obj);
    } else {
        stack.splice(pos,0,obj);
    }
    HZStack.set(stack)
}
export const removeHZ=tf=>{
    const stack=get(HZStack).filter(item=>item.tf.join()!==tf.join());
    HZStack.set(stack)
}