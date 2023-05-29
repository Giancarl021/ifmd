The title
============

Credits: [rt2zz](https://gist.github.com/rt2zz/e0a1d6ab2682d2c47746950b84c0b6ee)

Paragraphs are separated by a blank line.

2nd paragraph. *Italic*, **bold**, and `monospace`. Itemized lists
look like:

  * this one
  * that one
  * the other one

Note that --- not considering the asterisk --- the actual text
content starts at 4-columns in.

> Block quotes are
> written like so.
>
> They can span multiple paragraphs,
> if you like.

Use 3 dashes for an em-dash. Use 2 dashes for ranges (ex., "it's all
in chapters 12--14"). Three dots ... will be converted to an ellipsis.
Unicode is supported. ☺



An h2 header
------------

Here's a numbered list:

 1. first item
 2. second item
 3. third item

Note again how the actual text starts at 4 columns in (4 characters
from the left side). Here's a code sample:

    # Let me re-iterate ...
    for i in 1 .. 10 { do-something(i) }

As you probably guessed, indented 4 spaces. By the way, instead of
indenting the block, you can use delimited blocks, if you like:

~~~
define foobar() {
    print "Welcome to flavor country!";
}
~~~

(which makes copying & pasting easier). You can optionally mark the
delimited block for Pandoc to syntax highlight it:

~~~python
import time
# Quick, count to ten!
for i in range(10):
    # (but not *too* quick)
    time.sleep(0.5)
    print i
~~~



### An h3 header ###

Now a nested list:

 1. First, get these ingredients:

      * carrots
      * celery
      * lentils

 2. Boil some water.

 3. Dump everything in the pot and follow
    this algorithm:

        find wooden spoon
        uncover pot
        stir
        cover pot
        balance wooden spoon precariously on pot handle
        wait 10 minutes
        goto first step (or shut off burner when done)

    Do not bump wooden spoon or it will fall.

Notice again how text always lines up on 4-space indents (including
that last line which continues item 3 above).

Here's a link to [a website](http://foo.bar), to a [local doc](local-doc.html), and to a [section heading in the current doc](#an-h2-header).

Tables can look like this:

size  material      color
----  ------------  ------------
9     leather       brown
10    hemp canvas   natural
11    glass         transparent

Table: Shoes, their sizes, and what they're made of

(The above is the caption for the table.) Pandoc also supports
multi-line tables:

--------  -----------------------
keyword   text
--------  -----------------------
red       Sunsets, apples, and
          other red or reddish
          things.

green     Leaves, grass, frogs
          and other things it's
          not easy being.
--------  -----------------------

A horizontal rule follows.

***

Here's a definition list:

apples
  : Good for making applesauce.
oranges
  : Citrus!
tomatoes
  : There's no "e" in tomatoe.

Again, text is indented 4 spaces. (Put a blank line between each
term/definition pair to spread things out more.)

Here's a "line block":

| Line one
|   Line too
| Line tree

and images can be specified like so:

![example image](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAACqFJREFUeJztm4dzFMkVxu8vMo5l+8oul0UUiHgYTA4+4DAIOEDgOg5wSUAR7kqnOxOUUDKUjnBwKIAQQijnhFZptZJQllarHFartP5m2xpmZ2evjDzap/C+mqJ6XvfM9Lxf93vdq+EjO4tUH1F3YLGLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLARCLAfxXOTk5paWlnn8uA5A0NTXl5eW1d+9ezz+aAUgSAPbs2eP5RzMASQyAWAyAWALA7t27Pf9onQEMDg6GhYWdOnXqM4eam5s7OztROHv2rLJZSEgIjNnZ2bLFaDRev379uEM3btyoq6tzvXlGRsbFixePHj2K+wcHB3d3d8NosVhu37598uRJX19ff3///Px8d31LSko6f/48Lj99+vTdu3fRVbnKHYDGxsaAgICtW7euWLFizZo16HNcXBwaz8w5mtITAF5+w4YNXgrBj6Ojo0uXLl22bJnVapVbHjt2DLUyAHhz+fLlygvRPjQ0VH5Vs9kMx3k5a9WqVZcvX169erXKDi8rnwX19PQcPnxY1Wz9+vV5eXmigSaAhIQEb29v0Xjjxo0+Pj6ijIfqyEA3ACaTCWMEvsYMKC8vb2pqwtgfHx9H1f79+9Hv9PR00RJjFi8GF/f29uI0IiICtbA8ffoUMwYXxsbGwrkwRkdHi0twLU537NiBSdDR0VFdXX3p0iXZlUBVX1/f3t6emZm5fft2WM6dOyf7CH0QHdi3bx8W+7i8qqoK4xqWlStXomyfBrBr1y75dcrKyjDqYQwKCgJ+0aayshKzAUZMJr38phsAhA70DKPGtSoxMRFVGEEFBQWtra3IdTjFqEcVvAYvwN2qmIP3hx2QgMQ+DQCOVrZBHINx27ZtyvHY398PTrDLozsmJganhw4dGhoaUl5+584d2A8cOGDXAiDmKCKV6l1KSkrEQz/cQ9rSBwDmOJyFN5+cnNRsgDCNfmN+iEl95swZhCbYIyMjlSNd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 "An exemplary image")

Inline math equations go in like so: $\omega = d\phi / dt$. Display
math should get its own line and be put in in double-dollarsigns:

$$I = \int \rho R^{2} dV$$

And note that you can backslash-escape any punctuation characters
which you wish to be displayed literally, ex.: \`foo\`, \*bar\*, etc.