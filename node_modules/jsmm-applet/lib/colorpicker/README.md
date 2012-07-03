jQuery UI Color Picker Widget
=============================

I've tried many color pickers during the years, but none that I really liked. This color picker is made using modern web technologies like HTML5 Canvas and CSS3.

The color wheel is drawn in canvas when the page loads, which means it can be scaled to almost any size, and still look good. Great for when you just need a tiny picker, or one that fills the entire screen.

The color picker is based on the HSLA color system, but the output can be changed with the format option. Valid formats are *HSLA, HSL, RGBA, RGB and Hex*.

It also supports pasting colors directly into the text field below the color wheel. The input colors can be any of the formats mentioned above.

The widget was made by [Olav Andreas Lindekleiv][1], and is available on [BitBucket][2] under the BSD License. A demo is available [here][3].

How to use it
-------------

The widget is pretty easy to use. You can simply do

    $('input#myColorPicker').colorPicker();

and a color picker with a 250 pixel diameter will be created. You can also tell it to use a specific output format, or a custom diameter like this:

    $('input#myColorPicker').colorPicker({
          format: 'hex',
          size: 100
    });

To set the color programmatically, you would do something like this:

    $('input#myColorPicker').colorPicker('setColor', 40, 80, 60, 0.9);

The values are hue, saturation, lightness and alpha.

Alternatively, you can set the color with a string (HSLA, HSL, RGBA, RGB and Hex):

    $('input#myColorPicker').colorPicker('setColor', 'rgba(200, 30, 150, 0.8)');

  [1]: http://lindekleiv.com
  [2]: http://bitbucket.org/lindekleiv/jquery-ui-colorpicker
  [3]: http://lindekleiv.bitbucket.org/colorpicker/