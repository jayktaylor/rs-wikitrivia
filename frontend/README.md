# RuneScape Wiki Trivia

Source code for the RuneScape Wiki Trivia web app. Forked from the [Wikipedia Wiki Trivia](https://github.com/tom-james-watson/wikitrivia).
## Usage
### Prerequisites

```bash
yarn
```
### Development

```bash
yarn dev
```

Then visit http://localhost:3000/ to preview the website.

### Static build

To build a static version of the website to the `out` folder, run:

```bash
yarn build
```

Then run said build with:

```bash
yarn start
```

## FAQ
### Where does the data come from?

The data is all sourced from [wikidata](https://www.wikidata.org).