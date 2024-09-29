# ifmd

![](../src/templates/Document/assets/img/favicon.svg)

Markdown-to-PDF renderer for my college assignments that allows custom templates.

> **Info:** This package is not meant to be used in production environments.

## Installation

```bash
npm install --global @giancarl021/ifmd
```

## Usage

```bash
ifmd <command> [options]
```

## Concepts

- [Macros](docs/concepts/macros.md)

## Commands
[//]: # (Insert any custom documentation ABOVE this line)
[//]: # (DOCS_START)

* [generate](commands/ifmd-generate.md): Generate a PDF file from a Markdown file;
* [preview](commands/ifmd-preview.md): Create a web preview of the rendered document with live reload on changes;
* [compile](commands/ifmd-compile.md): Compile multiple Markdown files into a single PDF file;
* [set-prop](commands/ifmd-set-prop.md): Set global properties to be used as variables in templates;
* [template](commands/ifmd-template.md): Manage custom templates.

[//]: # (DOCS_END)
[//]: # (Insert any custom documentation BELOW this line)
