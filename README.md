# ISSA Web Application Backend Services

The [ISSA project](https://issa.cirad.fr/) focuses on the semantic indexing of scientific publications in an open archive.

This repository is the backend part of a web application meant to demonstrate the interest and use of such a semantic index for researchers and librarians. The frontend application is available in the [visualization repository](https://github.com/issa-project/visualization).


## Installation

Pre-requisite: [node.js](https://nodejs.org/) and yarn

Install the dependencies with:
```bash
yarn build
```


## Run

Run the application with:
```bash
yarn start
```

By default the node.js server listens on port 3000. This can be changed in file [.env](.env).

Make sure the server is properly started by pointing your browser to:
```
http://localhost:3000/getArticleMetadata?uri=http://data-issa.cirad.fr/article/592919
```
(this is an example article URI that may no longer be valid at some point).


### Logging

By default, log traces are printed out in file `log/application.log`.

This can be changed by customizing file [config/log4js.json](config/log4js.json).
Refer to the [Log4JS documentation](https://stritti.github.io/log4js/).


## Run the linter

```bash
npm run lint
```

## License

See the [LICENSE file](LICENSE).


## Cite this work

Youssef MEKOUAR, Franck MICHEL, ISSA Project (2022). ISSA visualization backend application. https://github.com/issa-project/web-visualization/.
