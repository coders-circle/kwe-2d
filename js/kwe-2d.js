$(function () {
    var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';
    var toolbar = '<div id="toolbar"></div>'
    var drawingContent = '<canvas id="c"  width="800" height="250"></canvas>';
    $('#homepage').w2layout({
        name: 'layout',
        panels: [
            { type: 'top',  size: 50, resizable: true, content: toolbar },
            { type: 'left', size: 200, resizable: true, style: pstyle, content: 'left' },
            { type: 'main', style: pstyle, content: drawingContent },
            { type: 'preview', size: '50%', resizable: true, style: pstyle, content: 'preview' },
            { type: 'right', size: 200, resizable: true, style: pstyle, content: 'right' },
            { type: 'bottom', size: 50, resizable: true, style: pstyle, content: 'bottom' }
        ]
    });

    $('#toolbar').w2toolbar({
	name: 'toolbar',
	items: [
		{ type: 'menu',   id: 'menu-file', caption: 'File', img: 'icon-folder', items: [
			{ text: 'New Project', icon: 'icon-page' },
			{ text: 'Open Project', icon: 'icon-page' },
			{ text: 'Close Project', icon: 'icon-page' }
		]}
	]
});

    w2ui['layout'].content('left', $().w2sidebar({
    	name: 'sidebar-left',
    	img: null,
    	nodes: [
    		{ id: 'world-1', text: 'World-1', img: 'icon-folder', expanded: true, group: true,
                nodes: [
                    { id: 'world-1-entities', text: 'Entities', img: 'icon-folder',
                        nodes: [
                            { id: 'world-1-player', text: 'Player', img: 'icon-page' },
                            { id: 'world-1-ground', text: 'Ground', img: 'icon-page' },
                            { id: 'world-1-obstacle', text: 'Obstacle', img: 'icon-page' }
                       ]}
                ]
    		},
            { id: 'world-2', text: 'World-2', img: 'icon-folder', expanded: true, group: true,
                nodes: [
                    { id: 'world-2-entities', text: 'Entities', img: 'icon-folder',
                        nodes: [
                            { id: 'world-2-player', text: 'Player', img: 'icon-page' },
                            { id: 'world-2-ground', text: 'Ground', img: 'icon-page' },
                            { id: 'world-2-obstacle', text: 'Obstacle', img: 'icon-page' }
                       ]}
                ]
    		}
    	],
    	onClick: function (event) {
    		w2ui['layout'].content('preview', 'id: ' + event.target);
    	}
    }));


    w2ui['layout'].content('right', $().w2sidebar({
    	name: 'sidebar-right',
    	img: null,
    	nodes: [
    		{ id: 'resources', text: 'Resources', img: 'icon-folder', expanded: true, group: true,
                nodes: [
                    { id: 'resource-sprites', text: 'Sprites', img: 'icon-folder',
                        nodes: [
                            { id: 'world-1-player', text: 'Player', img: 'icon-page' },
                            { id: 'world-1-ground', text: 'Ground', img: 'icon-page' },
                            { id: 'world-1-obstacle', text: 'Obstacle', img: 'icon-page' }
                        ]
                    }
                ]
    		}
    	],
    	onClick: function (event) {
    		w2ui['layout'].content('preview', 'id: ' + event.target);
    	}
    }));

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
