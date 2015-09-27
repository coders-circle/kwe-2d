$(function () {
    var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';
    var drawingContent = '<canvas id="c"  width="800" height="500"></canvas>';
    $('#homepage').w2layout({
        name: 'layout',
        panels: [
            { type: 'top',  size: 50, resizable: true, style: pstyle, content: 'top' },
            { type: 'left', size: 200, resizable: true, style: pstyle, content: 'left' },
            { type: 'main', style: pstyle, content: drawingContent },
            { type: 'preview', size: '50%', resizable: true, style: pstyle, content: 'preview' },
            { type: 'right', size: 200, resizable: true, style: pstyle, content: 'right' },
            { type: 'bottom', size: 50, resizable: true, style: pstyle, content: 'bottom' }
        ]
    });
});



$(function() {
  var canvas = this.__canvas = new fabric.Canvas('c', {
    hoverCursor: 'pointer',
    selection: false
  });

  canvas.on({
    'object:moving': function(e) {
      e.target.opacity = 0.5;
    },
    'object:modified': function(e) {
      e.target.opacity = 1;
    }
  });

  for (var i = 0, len = 15; i < len; i++) {
    fabric.Image.fromURL('assets/katana.png', function(img) {
      img.set({
        left: fabric.util.getRandomInt(0, 600),
        top: fabric.util.getRandomInt(0, 500),
        angle: fabric.util.getRandomInt(0, 90)
      });

      img.perPixelTargetFind = true;
      img.targetFindTolerance = 4;
      img.hasControls = img.hasBorders = true;

      img.scale(fabric.util.getRandomInt(50, 100) / 100);

      canvas.add(img);
    });
  }
});
