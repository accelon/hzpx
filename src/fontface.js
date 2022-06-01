const fontfacedef={}

export const addFontFace=(name,settings)=>{
	fontfacedef[name]=settings;
}

export const getFontFace=name=>{
	return fontfacedef[name];
}
export const enumFontFace=()=>{
	return Object.keys(fontfacedef);
}

addFontFace('宋体', { kMinWidthY:2, kMinWidthU:2, kMinWidthT:4.5, kWidth:5})
addFontFace('细宋体',{ kMinWidthY:2, kMinWidthU:1, kMinWidthT:3, kWidth:5})
addFontFace('中宋体',{ kMinWidthY:2, kMinWidthU:2, kMinWidthT:6, kWidth:5 })
addFontFace('粗宋体',{ kMinWidthY:2.5, kMinWidthU:2, kMinWidthT:7, kWidth:5 })
addFontFace('特宋体',{ kMinWidthY:3, kMinWidthU:2, kMinWidthT:8, kWidth:5})

addFontFace('黑体',{  hei:true, kWidth:2 })
addFontFace('细黑体',{ hei:true, kWidth:1 })
addFontFace('中黑体',{ hei:true, kWidth:3  })
addFontFace('粗黑体',{ hei:true, kWidth:5})
addFontFace('特黑体',{ hei:true, kWidth:7})

export default {getFontFace,enumFontFace,addFontFace}