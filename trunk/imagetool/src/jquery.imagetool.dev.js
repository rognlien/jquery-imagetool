/**
 * $Date$
 * 
 * Revision: $Revision$
 * 
 * 
 * Imagetool
 * 
 * Imagetool is a simple plugin for jQuery providing basic cropping and scaling capabilities for images.
 *
 * It works by wrapping the selected image in a <div> (the viewport) and manipulates css properties based on user input.
 *
 * Tested in Safari 3, Firefox 2, MSIE 6, MSIE 7
 * 
 * Version 1.0
 * August 8, 2008
 *
 * Copyright (c) 2008 Bendik Rognlien Johansen
 * 
 * @desc Adds editing capabilities to image (<img>) elements
 * @author Bendik Rognlien Johansen
 * @version 1.0
 *
 * @name Imagetools
 * @type jQuery
 *
 * @cat plugins/Media
 * 
 * @example $('img').imagetool({options});
 * @desc Add editing capabilities to image (<img>) elements
 * @options
 *
 *   allowZoom:  (boolean) If true, the image is zoomable.
 *               default: true
 *
 *   allowPan:   (boolean) If true, the image can be panned.
 *               default: true
 *
 *
 *
 *   imageWidth: (number) The actual width (pixels) of the image used.
 *               required: yes
 *
 *   imageHeight: (number) The actual height (pixels) of the image used.
 *               required: yes
 *
 *
 *
 *   viewportWidth: (number) The width (pixels) of the viewport.
 *                  required: yes
 *
 *   viewportHeight: (number) The height (pixels) of the viewport.
 *                   required: yes
 *
 *
 *
 *   topX: (number)
 *         required: no
 *         default: 0
 *
 *   topY: (number)
 *         required: no
 *         default: 0
 *
 *   bottomX: (number)
 *            required: no
 *            default: 0
 *
 *   bottomY: (number)
 *            required: no
 *            default: 0
 *
 *   
 *   callback: (function) A function that is called after the image has been panned or zoomed. 
 *             arguments: topX, topY, bottomX, bottomY
 *             required: no
 *
**/


;(function($) {

  /*
  Default settings 
  */
  var defaultSettings = {
    allowZoom: true
   ,allowPan: true
   ,viewportWidth: 320
   ,viewportHeight: 180
   ,imageMaxWidth: 2000
   ,topX: -1
   ,topY: -1
   ,bottomX: -1 
   ,bottomY: -1
   ,callback: function(topX, topY, bottomX, bottomY) {}
  };



  $.fn.extend({
    
    
    store: function() {
      var image = $(this);
      var dim = image.data("dim");
      var scale = dim.width / dim.imageWidth;      

      dim.topX = (-dim.x) / scale;
      dim.topY = (-dim.y)  / scale;
        
      dim.bottomX = dim.topX + (dim.viewportWidth / scale);
      dim.bottomY = dim.topY + (dim.viewportHeight / scale);

      if(typeof dim.callback == 'function') {
        dim.callback(parseInt(dim.topX), parseInt(dim.topY), parseInt(dim.bottomX), parseInt(dim.bottomY));
      }      
    }
    
    
    
    
   ,move: function(settings) {
     var image = $(this);
      var dim = image.data("dim");
     console.log($(this).data("dim"));
      var minX = -dim.width + dim.viewportWidth;
      var minY = -dim.height + dim.viewportHeight;
      
      if(dim.x > 0) {
        dim.x = 0;
      }
      else if(dim.x < minX) {
         dim.x = minX;
      }
          
       if(dim.y > 0) {
         dim.y = 0;
       }    
       else if(dim.y < minY) {
         dim.y = minY;
       }
      
       
       $(this).css({
         left: dim.x + "px"
        ,top: dim.y + "px"
       });
     }
    
    
    
    
    
    ,resize: function() {
      var image = $(this);
      var dim = image.data("dim");
       // When attempting to scale the image below the minimum, set the size to minimum
       var wasResized = true;
       if(dim.width < dim.viewportWidth) {
         dim.height = parseInt(dim.imageHeight * (dim.viewportWidth/dim.imageWidth));
         dim.width = dim.viewportWidth;
         wasResized = false;
         
       }
       
       if(dim.height < dim.viewportHeight) {
         dim.width = parseInt(dim.imageWidth * (dim.viewportHeight/dim.imageHeight));
         dim.height = dim.viewportHeight;
         wasResized = false;
       }
       
       
      if(dim.width > dim.imageMaxWidth) {
         dim.height = parseInt(dim.height * (dim.imageMaxWidth/dim.width));
         dim.width = dim.imageMaxWidth;
         wasResized = false;
       }
      
       
       $(this).css({
         width: dim.width + "px"
        ,height: dim.height + "px"
       });
       
       
       // Scale at center of viewport
       var cx = dim.width /(-dim.x + (dim.viewportWidth/2));
       var cy = dim.height /(-dim.y + (dim.viewportHeight/2));
       
     
       dim.x = dim.x - ((dim.width - dim.oldWidth) / cx);
       dim.y = dim.y - ((dim.height - dim.oldHeight) / cy);

       $(this).move();
       return wasResized;
     }
    
    ,setup: function() {
      
    }
    
    ,imagetool: function(settings) {
      return this.each(function() {
        var image = $(this);
        
        // Add settings to each image object
        var dim = $.extend({}, defaultSettings, settings);
        image.data("dim", dim);
        
                
        dim.width = dim.imageWidth;
        dim.height = dim.imageHeight;
        
       
       // If no coordinates are set, make sure the image size is not smaller than the viewport
       if(dim.topX < 0) {
         dim.topX = 0;
         dim.topY = 0;
         
         if((dim.imageWidth/dim.viewportWidth) > (dim.imageHeight/dim.viewportHeight)) {
           dim.bottomY = dim.imageHeight;
           dim.bottomX = dim.viewportWidth * (dim.imageHeight/dim.viewportHeight);
         }
         else {
           dim.bottomX = dim.imageWidth;
           dim.bottomY = dim.viewportHeight * (dim.imageWidth/dim.viewportWidth);
         }
       }
       
       
       
       
       var scaleX = dim.viewportWidth/(dim.bottomX - dim.topX);
       var scaleY = dim.viewportHeight/(dim.bottomY - dim.topY);
        
       dim.width = dim.width * scaleX;
       dim.height = dim.height * scaleY;
       
       dim.oldWidth = dim.width;
       dim.oldHeight = dim.height;
        
       dim.x = -(dim.topX * scaleX);
       dim.y = -(dim.topY * scaleY);
        

        
       
        

        // Set up the viewport        
        var viewportCss = {
          backgroundColor: "#fff"
         ,position: "relative"
         ,overflow: "hidden"
         ,width: dim.viewportWidth + "px"
         ,height: dim.viewportHeight + "px"
         ,border: "1px solid #333"
        };
        var viewportElement = $("<div><\/div>");
        viewportElement.css(viewportCss);

        image.wrap(viewportElement);

        
                
        
        image.resize();
        image.store();
        
        image.css({
          position: "relative"
         ,cursor: "move"
         ,display: "block"
        });
        
        
        
        
        image.mouseup(function() {
          $(this).unbind( "mousemove" );
          $(this).store();
        });
        
        
        // When leaving the the element, cancel pan/scale
        image.mouseout(function() {
          $(this).unbind( "mousemove" );
          $(this).store();
        });
      
      
      
      image.mousedown(function(mousedownEvent) {
        mousedownEvent.preventDefault();
        dim.origoX = mousedownEvent.clientX;
        dim.origoY = mousedownEvent.clientY;
        
        var clickX = (mousedownEvent.pageX - $(this).offset({scroll: false}).left);
        var clickY = (mousedownEvent.pageY - $(this).offset({scroll: false}).top);
        
        
        if(dim.allowZoom && (mousedownEvent.shiftKey || mousedownEvent.ctrlKey) ) {
          image.mousemove(zoom);
        }
        else if(dim.allowPan) {
          image.mousemove(pan);
        }


        function zoom(e) {
          e.preventDefault();
          var image = $(this);
          
          var factor = ( dim.origoY - e.clientY);
          
          dim.oldWidth = dim.width;
          dim.oldHeight = dim.height;
          
          dim.width = ((factor/100) * dim.width) + dim.width;
          dim.height = ((factor/100) * dim.height) + dim.height;
          
          if($(this).resize()) {
            dim.origoY = e.clientY;
          }
        } // end scale
           
              
              
        
        
        
        
        function pan(e) {
          e.preventDefault();
          var deltaX = dim.origoX - e.clientX;
          var deltaY = dim.origoY - e.clientY;
            
          dim.origoX = e.clientX;
          dim.origoY = e.clientY;
          
          var targetX = dim.x - deltaX;
          var targetY = dim.y - deltaY;
          
          var minX = -dim.width + dim.viewportWidth;
          var minY = -dim.height + dim.viewportHeight;
          
          dim.x = targetX;
          dim.y = targetY;
          image.move();
        } // end pan

        
        
        return false;
      });

      }); // end this.each
    }

  });
})(jQuery); 