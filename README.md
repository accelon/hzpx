# 汉字拼形

* [線上演示](https://hanziku.github.io/hzpx/)
* [汉字拼形芻议](proposal.md)
* [编辑器  2017](https://github.com/accelon/hzpx/releases/download/legacy2017/hzpx-2017.zip)
* [基本概念](concepts.md)

## prerequisite

* download glyphwiki [dump](https://glyphwiki.org/dump.tar.gz)
* extract `dump_all_versions.txt` to glyphwiki subfolder
* ptk nodebundle.cjs  ( ptk/build-cjs)
## build steps
    remove blanks and save as dump_all_versions_small.txt, sort alphbetically

    node dump-glyphwiki   //dump 八萬字及其部件，得 glyphwiki-dump.tsv

    
    node gen-mjs   //產生 es6 module js 資料js
    node gen   //壓縮 glyphwiki-dump.txt 產生 bmp.js , cjkext.js , cjkcomp.js

    npm run build

    open dist/index.html

## for es6 module
    node pack-glyphwiki es6

## 授權方式 ISC

## 第三方
*  [Kage](github.com/kurgm/kage-engine)
*  [cjkiv](https://github.com/cjkvi) 
*  [glyphwiki](https://glyphwiki.org)


## 