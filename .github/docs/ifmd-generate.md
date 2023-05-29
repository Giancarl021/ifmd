# generate

Generate a PDF file from a Markdown file

## Usage

```bash
ifmd generate <path/to/file> <flags>
```

## Flags

* `-m` | `--margin`: Margin value for all sides of the rendered PDF. Values: `<value>` | `<value>px` | `<value>cm`;
* `--mt` | `--margin-top`: Margin top of the rendered PDF. Overwrites the `--margin` flag. Values: `<value>` | `<value>px` | `<value>cm`;
* `-d` | `--date`: Sets the date of the documents, defaults to `Date.now()`. Value: `<date verbatim>`;
* `--mb` | `--margin-bottom`: Margin bottom of the rendered PDF. Overwrites the `--margin` flag. Values: `<value>` | `<value>px` | `<value>cm`;
* `--ml` | `--margin-left`: Margin left of the rendered PDF. Overwrites the `--margin` flag. Values: `<value>` | `<value>px` | `<value>cm`;
* `--mr` | `--margin-right`: Margin right of the rendered PDF. Overwrites the `--margin` flag. Values: `<value>` | `<value>px` | `<value>cm`;
* `-t` | `--template`: The template to be used for the PDF. Defaults to `Document`. Value: `<template-name>`;
* `-o` | `--out` | `--output`: The path to the output file. Defaults to the same as the input file but with the `.pdf` extension. Value: `<path/to/file>`;
* `-p` | `--port`: The port for the web server to listen to. Defaults to `3000`. Value: `<number>`.

