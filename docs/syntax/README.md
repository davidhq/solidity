## Solidity & YUL syntax highlighting for official docs via StarryNight JS lib

1. Install node.js, preferrably v16.13.0 (LTS)

2. Clone this repo, then `cd docs/syntax && npm install`

3. Run `make html` from base `docs` directory as usual to create the docs in `docs/_build/html`

```bash
html:
	rm -rf _build # todo: check if we need this always
	$(SPHINXBUILD) -b html $(ALLSPHINXOPTS) $(BUILDDIR)/html
	node syntax/index.js
```

There will be some warnings like

```
WARNING: Pygments lexer name 'yul2' is not known
```

these can be ignored... the plan is to check how to avoid this.

This approach uses the [Starry Night](https://github.com/wooorm/starry-night) library which includes various language grammars [here](https://github.com/wooorm/starry-night/tree/main/lang). Solidity and Yul highlighters come directly from [SublimeEthereum linguist branch](https://github.com/davidhq/SublimeEthereum/tree/linguist).

### How it works

Since Sphinx is Python and Starry Night is JS we first "trick" Sphinx to leave relevant code blocks unchanged and easily identifiable in resulting .html files. Then we apply in-place replacement for these code blocks, passing the code through Starry Night cli run.

Current small disadvantage of this approach is that this

```
.. code-block:: solidity
```

has to be changed to:

```
.. code-block:: solidity2
```

everywhere in all `.rst` files. Similar for `yul`, `json` and `javascript`.
