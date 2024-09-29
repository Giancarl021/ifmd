# Property Flags

Property flags are used to set key-value pairs that can be used as variables in templates. They are set using the `--prop:<name>` or `p:<name>` flags followed by the value to be set.

Commands that support property flags are:
- [`compile`](./ifmd-compile.md)
- [`generate`](./ifmd-generate.md)
- [`preview`](./ifmd-preview.md)
- [`template preview`](./ifmd-template-preview.md)

## Syntax

The syntax for setting a property flag is as follows:

```bash
ifmd <command> [options] --prop:<name> <value>
# or
ifmd <command> [options] --p:<name> <value>
```