# Taco Truck

## What is it?

A tool for designing your own fightstick layouts and testing them.

## How to use it

Go to https://cg-taco-truck.web.app/ and you can either go to designer and start using it.

### Tutorial

Coming Soon

### Importing SVG's for panels

In order for an SVG To be usable by Taco Truck, the main outline of the panel and it's mounting holes must be represented with <path> tags, they must be at the same level hierarchically, and they must have "id" tags like the following:

    cut_path
    mounting_path (optional)

The cut path must be the path that lays out the edge of the panel and the optional mounting path must represent the position of the mounting holes on the panel. This is done by adding the "id" attribute to the appropriate elements or by editting it in a tool like Inkscape.

In addition the user must either provide the height and width of the panel in the "height" and "width" attributes of the <svg> tag of the file, or they must enter it manually after they import the SVG. If you need help importing your SVG, please reach out to me.
