# iBooks HTML Widget Boilerplate

This is a minimal project for an HTML Widget that can be embedded in an iBook with iBooks Author.

Created by the author of *[CoffeeScript: An Interactive Reference](http://click.linksynergy.com/fs-bin/stat?id=j5lGZbrn4Rg&offerid=243958&type=3&subid=0&tmpid=1826&RD_PARM1=http%253A%252F%252Fitunes.apple.com%252Fus%252Fbook%252Fcoffeescript%252Fid498532763%253Fmt%253D11%2526uo%253D4%2526partnerId%253D30)*, now available in the iBooks store.

# Why?

Because the recommended approach for creating an HTML widget for iBooks Author is currently to create a Dashboard widget in Dashcode. This adds a lot of distracting cruft, and things that work fine in Dashcode have a tendency to stop working in iBooks. In short, it's better to treat an iBooks widget as a web page rather than as a Dashboard widget.

# Usage

Clone this git repo as a directory with a `.wdgt` extension. Modify the HTML, CSS, and JavaScript with the tools of your choice, just as you would any other web page.

Click-and-drag the `.wdgt` file into iBooks Author. And that's it!

## Preview image

Notice, however, that when you drag the `.wdgt` into iBooks Author, you just get an image that says "Preview." iBooks doesn't load anything from your HTML widget other than `Default.png` until the user taps it.

If you just delete `Default.png`, iBooks Author will generate a preview automatically, but it probably won't have the proportions that you want, and some of the content may overflow. I recommend replacing `Default.png` with a nice screenshot of the widget, and cropped and scaled to the right dimensions. You should probably make this the last step in your book production process, and do without `Default.png` until then.

## Widget dimensions

Open up `Info.plist` to set the appropriate width and height for your widget. When opened on the iPad, the widget will be scaled to fit the screen but will maintain the correct width/height proportion. Also note that 1px in your markup refers to 1px according to the `Info.plist` dimensions, *not* the actual pixels on the device screen.

Currently, HTML widgets can only be viewed in landscape orientation, so you'll probably want a size of 1024x768 adjusted slightly for the title, caption, and background margin that you can customize from the Widget inspector in iBooks Author like so:

![Widget layout settings in iBooks Author](http://cl.ly/2t0u1A1o1N0Y1z2O3b44/Screen%20Shot%202012-01-30%20at%203.56.03%20PM.png)

# License

http://trevorburnham.mit-license.org/