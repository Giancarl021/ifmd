# preview

Create a web preview of the rendered document with live reload on changes

## Usage

```bash
ifmd preview <path/to/file> <flags>
```

## Flags

* `--p:<prop-name>` | `--prop:<prop-name>`: Command-scoped props to be used in the document generation. Value: `<prop-value>`;
* `--web-server-port`: The port for the web server to listen to. Defaults to `3000`. Value: `<number>`;
* `-d` | `--date`: Sets the date of the documents, defaults to `Date.now()`. Value: `<date verbatim>`;
* `-t` | `--template`: The template to be used for the PDF. Defaults to `Document`. Value: `<template-name>`.

