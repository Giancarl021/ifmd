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

- [Terminology](docs/concepts/terminology.md)
- [Macros](docs/concepts/macros.md)
- [Property Flags](docs/concepts/property-flags.md)

## Commands
[//]: # (Insert any custom documentation ABOVE this line)
[//]: # (DOCS_START)

* [generate](docs\commands\ifmd-generate.md): Generate a PDF file from a Markdown file;
* [preview](docs\commands\ifmd-preview.md): Create a web preview of the rendered document with live reload on changes;
* [compile](docs\commands\ifmd-compile.md): Compile multiple Markdown files into a single PDF file;
* [set-prop](docs\commands\ifmd-set-prop.md): Set global properties to be used as variables in templates;
* [template](docs\commands\ifmd-template.md): Manage custom templates.

[//]: # (DOCS_END)
[//]: # (Insert any custom documentation BELOW this line)
