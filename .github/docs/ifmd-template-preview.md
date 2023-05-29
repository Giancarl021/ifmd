# template preview

Create a web preview of the specified template with a sample document and live reload on changes

## Usage

```bash
ifmd template preview <template-name> <flags>
```

## Flags

* `-p` | `--port`: The port for the web server to listen to. Defaults to `3000`. Value: `<number>`;
* `-d` | `--date`: Sets the date of the documents, defaults to `Date.now()`. Value: `<date verbatim>`;
* `-f` | `--base-file`: The sample Markdown file used for the preview. If not set a internal sample will be used. Value: `<path/to/file>`.

