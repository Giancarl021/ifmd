# compile

Compile multiple Markdown files into a single PDF file

## Usage

```bash
ifmd compile <path/to/directory> <flags>
```

## Flags

* `-g` | `--generate-manifest`: Generate or update a manifest file for later compilation;
* `-i` | `--ignore`: Path to a .ignore file, like .gitignore, to filter out unwanted markdown files. Value: `<path/to/file>`;
* `-m` | `--margin`: Margin value for all sides of the rendered PDF. Values: `<value>` | `<value>px` | `<value>cm`;
* `--mt` | `--margin-top`: Margin top of the rendered PDF. Overwrites the `--margin` flag. Values: `<value>` | `<value>px` | `<value>cm`;
* `-d` | `--date`: Sets the date of the documents, defaults to `Date.now()`. Value: `<date verbatim>`;
* `--mb` | `--margin-bottom`: Margin bottom of the rendered PDF. Overwrites the `--margin` flag. Values: `<value>` | `<value>px` | `<value>cm`;
* `--ml` | `--margin-left`: Margin left of the rendered PDF. Overwrites the `--margin` flag. Values: `<value>` | `<value>px` | `<value>cm`;
* `--mr` | `--margin-right`: Margin right of the rendered PDF. Overwrites the `--margin` flag. Values: `<value>` | `<value>px` | `<value>cm`;
* `-t` | `--template`: The template to be used for the PDF. Defaults to `Document`. Value: `<template-name>`;
* `-o` | `--out` | `--output`: The path to the output file. Defaults to the same as the input file but with the `.pdf` extension. Value: `<path/to/file>`;
* `--p:<prop-name>` | `--prop:<prop-name>`: Command-scoped props to be used in the document generation. Value: `<prop-value>`;
* `--web-server-port`: The port for the web server to listen to. Defaults to `3000`. Value: `<number>`.

