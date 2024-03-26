# ddu-filter-matcher\_multi\_regex

A ddu.vim matcher that treats the user input as space-separated list of regexes and filters items with the regexes.

## Requirements

### denops.vim

https://github.com/vim-denops/denops.vim

### ddu.vim

https://github.com/Shougo/ddu.vim

## Configuration

- Enable this matcher:

```vim
call ddu#custom#patch_global('sourceOptions', #{
  \   _: #{
  \     matchers: ['matcher_multi_regex'],
  \   }
  \ })
```

- Enable matched text highlights:

```vim
call ddu#custom#patch_global('filterParams', #{
  \   matcher_multi_regex: #{
  \     highlightMatched: 'Search',
  \   }
  \ })
```

**NOTE** This makes the filtering a bit slower due to the overhead of extraction of matched texts.


- Enable greedy matched text highlights:

```vim
call ddu#custom#patch_global('filterParams', #{
  \   matcher_multi_regex: #{
  \     highlightGreedy: v:true,
  \   }
  \ })
```

**NOTE** This also makes the filtering slower due to the overhead of extraction of all the matched texts.

## Similar projects

- [kamecha/ddu-filter-matcher\_regex](https://github.com/kamecha/ddu-filter-matcher_regex/)
