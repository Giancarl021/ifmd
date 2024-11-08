# Macros

Macros allow the template creators and documentation writers to define variable values that can be used in the template or the document. The macros are replaced by their respective values when the template is rendered.

This can be used to communicate information between the document and the template, or to create dynamic content in the template.

## Escaping

Any of the macros can be escaped by adding a backslash (`\`) after the `@@` sequence. This will prevent the macro from being replaced by its value, and will be rendered as is.

Also any macro-like sequence that does not match against this regex will not be considered a macro and will be rendered as is: `@@[\\a-zA-Z-_]+[0-9]*(\(.*?\))?`.

Example:

```
@@​title -> Document Title
@@​\title -> @@​title
@@123 --> @@123
```

## `@@​title`

This macro is used to set the Document Title. This value is **always** the first `h1` element on the Markdown verbatim, so no nested macros are allowed.

This is the only flag that cannot be altered by any other means.

## `@@<name>`

This macro is used to insert a value that was set by [property flags](./property-flags.md) or by the [`@@​set`](#set) macro. The macro is replaced by the value when the template is rendered.

If the value was not set by any of the methods mentioned above, the macro will not be replaced and will be rendered as is.

These values can be used anywhere in the `index.html` of the template or in the documentation files that are being processed.

> **Important:** Imported files are not processed by the macros, so the macros will not be replaced in the imported files. Only the `index.html` file is processed by the macros.

For example:

```html
<!DOCTYPE html>
<html>
<head>
    <title>@@​title</title>
    <script>
        window.myVar = '@@myVar';
    </script>
    <style>
        body {
            background-color: @@​backgroundColor;
        }
    </style>
</head>
<body>
    <h1>@@​title</h1>
    <p>@@​description</p>
    @@content
</body>
```

```markdown
# My documentation

Made by @@​name
```

<h2 id="set"><code>@@​set(name, value)</code></h2>

This macro allows the user to set a value to a name. This value can be used later in the template using the `@@​<name>` macro.

The priority order (from most to least) of the chosen value to replace this macro is as follows:
- The value set by [property flags](./property-flags.md);
- The value set by the `@@​set` macro inside the documentation file;
- The value set by the `@@​set` macro inside a template file.

> **Important:** This macro is always executed first in the template rendering process, so it is not possible to use a value then set another value to the same name. The value will be overwritten by the last instruction or ignored if the preceding instruction has higher priority.

## `@@content`

> **ONLY RENDERS ON TEMPLATE FILES**

This macro is used to render the content of the document that is being processed. It is used to insert the content of the document in the template.

For example, with the following template:

```html
<!DOCTYPE html>
<html>
<head>
    <title>@@​title</title>
</head>
<body>
    <!-- I WANT THE RENDERED DOCUMENT TO BE PUT HERE -->    
</body>
```

To render the content of the document being processed in the desired location, the `@@​content` macro is used:

```html
<!DOCTYPE html>
<html>
<head>
    <title>@@​title</title>
</head>
<body>
    @@content
</body>
```

## `@@​date`

This macro is used to insert a date in the document. By default, if omitted in the [property flags](./property-flags.md), the date is equal to the current date in this format:

```javascript
new Date().toLocaleDateString()
```

It is possible to put any string in this field, and it will be rendered as is.

## `@@​date(displacement)`

This macro is used to insert a date in the document with a displacement. The displacement is a [timestring](https://www.npmjs.com/package/timestring#keywords) input, and it is used to calculate the date to be inserted.

Examples (considering `@@​date` to be 2024-09-01):

```
@@​date --> 2024-09-01
@@​date(-1d) --> 2024-08-31
@@​date(+1d) --> 2024-09-02
@@​date(-1w) --> 2024-08-25
@@​date(+1w) --> 2024-09-08
```
