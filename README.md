# 汉字拼形

* [汉字拼形芻议](proposal.md)
* [2017 年概念演示版](https://github.com/accelon/hzpx/releases/download/legacy2017/hzpx-2017.zip)

## prerequisite

* download glyphwiki [dump](https://glyphwiki.org/dump.tar.gz)
* extract `dump_newest_only.txt` to glyphwiki subfolder

## build steps

    node dump-glyphwiki   // dump 兩萬字及其部件

    npm run build

    open public/index.html

