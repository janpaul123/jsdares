console.log('Hello!');
window.$ = require('jquery');
var $ = require('jquery');
$(function() {
  $('<div>')
    .appendTo('body')
    .css({
      display: 'none',
      position: 'absolute',
      top: '50px',
      left: '50px',
      width: '500px',
      height: '100px',
      background: '#bfb',
      fontSize: '36pt',
      lineHeight: '90px',
      textAlign: 'center'
    })
    .text('Hello, World')
    .fadeIn(5000);
})
