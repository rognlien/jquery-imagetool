(function($) {
	$.widget("ui.imagetool", {

		update: function(args) {
			var image = this.element;
			var o = this.options;
			
			if(args.src) {
				image.attr("src", args.src);
				console.log("updating src: " + args.src);
			}
			if(args.imageWidth) {
				image.attr("width", args.imageWidth);
				o.imageWidth = args.imageWidth;
				o._width = args.imageWidth;
				console.log("updating width: " + args.imageWidth);
			}
			if(args.imageHeight) {
				image.attr("height", args.imageHeight);
				o.imageHeight = args.imageHeight;
				o._height = args.imageHeight;
				console.log("updating height: " + args.imageHeight);
			}
			this._resize();
		}

		,_setData: function(key, value) {
			var image = this.element;
			var o = this.options;
			var self = this;
			if(key == 'src') {
				console.log("Setting src: " + value);
				image.attr("src", value);
			}
			else if(key == 'imageWidth') {
				console.log("Setting imageWidth: " + value);
				o.imageWidth = value;
				o._width = value;
				image.attr("width", value);
			}
			else if(key == 'imageHeight') {
				console.log("Setting imageHeight: " + value);
				o.imageHeight = value;
				o._height = value;
				image.attr("height", value);
			}
			else if(key == 'x') {
				o._absx = -o._width * value;
				console.log("Setting absx: " + o._absx);
				self._move();
			}
			else if(key == 'y') {
				o._absy = -o._height * value;
				console.log("Setting absy: " + o._absy);
				self._move();
			}
			
			$.widget.prototype._setData.apply(this, arguments);
		}
	
		,dimensions: function() {
			var o = this.options;
			return this._getRelativeValues(o);
		}
		
		,_getRelativeValues: function(o) {
			var scale = o._width/o.imageWidth;
			absX = -o._absx/scale;
			console.log("Absolute x: " + absX);
			return {
				width: o.viewportWidth
				,height: o.viewportHeight
				,x: (-o._absx/scale)/o.imageWidth
				,y: (-o._absy/scale)/o.imageHeight
				,w: (o.viewportWidth) / (o.imageWidth * scale)
				,h: (o.viewportHeight) / (o.imageHeight * scale)
			};
		}
		,_absolute: function() {
			var o = this.options;
			var scale = o._width/o.imageWidth;
			return {
				x: (-o._absx/scale)
				,y: (-o._absy/scale)
				,w: (o.viewportWidth) * (o.imageWidth / scale)
				,h: (o.viewportHeight) * (o.imageHeight / scale)
			}
		}
		
		
		
		,resize: function(width, height) {
			if(width) {
				image.attr("width", args._width);
				o.imageWidth = args._width;
				o._width = args._width;
				console.log("updating width: " + args._width);
			}
			if(args._height) {
				image.attr("height", args._height);
				o.imageHeight = args._height;
				o._height = args._height;
				console.log("updating height: " + args._height);
			}
		}

		
		,_init: function() {
			console.log("imagetool init");
			var self = this;
			var o = this.options;
			var image = this.element;
			image.css("display", "none");


			// Set up the viewport        
			var viewportCss = {
				backgroundColor: "#fff"
				,position: "relative"
				,overflow: "hidden"
				,width: o.viewportWidth + "px"
				,height: o.viewportHeight + "px"
			};
			
			//var viewport = $("");
			image.wrap("<div/>");
			
			var viewport = image.closest("div");
			
			viewport.css(viewportCss);

			
			
			o._width = o.imageWidth;
			o._height = o.imageHeight;


			viewport = image.parent();

			// If no coordinates are set, make sure the image size is not smaller than the viewport
			if(o.topX < 0) {
				o.topX = 0;
				o.topY = 0;

				if((o.imageWidth/o.viewportWidth) > (o.imageHeight/o.viewportHeight)) {
					o.bottomY = o.imageHeight;
					o.bottomX = o.viewportWidth * (o.imageHeight/o.viewportHeight);
				}
				else {
					o.bottomX = o.imageWidth;
					o.bottomY = o.viewportHeight * (o.imageWidth/o.viewportWidth);
				}
			}

			var scaleX = o.viewportWidth/(o.bottomX - o.topX);
			var scaleY = o.viewportHeight/(o.bottomY - o.topY);

			o._width = o._width * scaleX;
			o._height = o._height * scaleY;

			o.oldWidth = o._width;
			o.oldHeight = o._height;

			o._absx = -(o.topX * scaleX);
			o._absy = -(o.topY * scaleY);
			
			self._resize();

			image.css({
				position: "relative"
				,display: "block"
			});
			
			if(o.allowPan || o.allowZoom) {
	    	viewport.mousedown(function(e) {self._handleMouseDown(e);});
	    	viewport.mouseover(function(e) {self._handleMouseOver(e);});
	    	viewport.mouseout(function(e) {self._handleMouseOut(e);});
	    }
	    else {
	    	image.css("cursor", o.disabledCursor);
	    	viewport.mousedown(function(e) {
	    		e.preventDefault();
	    	});
	    }
		}
	
	/**
	 * Find the edge n, e, s, w, 
	 */
	,_getEdge: function(o, x, y) {
		var self = this;
		var image = this.element;
		
		var scale = o._width / o.imageWidth;
		
		var fromEdgdeE = o.viewportWidth - (x - (o.topX*scale));
		var fromEdgdeS = o.viewportHeight - (y - (o.topY*scale));


		// TODO: add edge sensitivity to options
		if(fromEdgdeE < 15 && fromEdgdeS < 15 && (o.allowResizeX || o.allowResizeY)) {
			return "se";
		}
		else if(fromEdgdeE < 15 && o.allowResizeX) {
			return "e";
		}
		else if(fromEdgdeS < 15 && o.allowResizeY) {
			return "s";
		}
	}
	
	,_handleMouseOver:	function(event) {
		var self = this;
		var o = this.options;
		var image = this.element;
		var viewport = image.parent();
		//image.css("cursor", o.cursor);
		
		viewport.css("cursor", o.cursor);		
		viewport.mousemove(function(e) {self._handleMouseMove(e);});
		
	}
	,_handleMouseOut: function(event) {
		var o = this.options;
		var image = this.element;
		image.css("cursor", o.cursor);
	}
	
	,_handleMouseMove: 	function(mmevt) {
		var self = this;
		var o = this.options;
		var image = this.element;
		var viewport = image.parent();

		var clickX = (mmevt.pageX - viewport.offset({scroll: false}).left);
		var clickY = (mmevt.pageY - viewport.offset({scroll: false}).top);

		var edge = self._getEdge(o, clickX, clickY);
		if(edge) {
			o.cursor = o["cursor-" + edge];
		}
		else {
			o.cursor = o.panCursor;
		}

		image.css("cursor", o.cursor);
	}
	
	,_handleMouseDown: function(mousedownEvent) {		
		mousedownEvent.preventDefault();
		
		var self = this;
		var o = this.options;
		var image = this.element;
		var viewport = image.parent();

		o.origoX = mousedownEvent.clientX;
		o.origoY = mousedownEvent.clientY;

		var clickX = (mousedownEvent.pageX - viewport.offset({scroll: false}).left);
		var clickY = (mousedownEvent.pageY - viewport.offset({scroll: false}).top);
		
		var edge = self._getEdge(o, clickX, clickY);
		
		if(edge) {
			$(document).mousemove(function(e) {
				self._handleViewPortResize(e, edge);
			});
		}
		else if(o.allowZoom && (mousedownEvent.shiftKey || mousedownEvent.ctrlKey) ) {
			o.cursor = o.zoomCursor;
			image.css("cursor", o.zoomCursor);
			$("body").css("cursor", o.zoomCursor);
			$(document).mousemove(function(e) {
				self._zoom(e);
			});
		}
		else if(o.allowPan) {
			o.cursor = o.panCursor;
			image.css("cursor", o.panCursor);
			$("body").css("cursor", o.panCursor);
			$(document).mousemove(function(e) {
				self._pan(e);
			});
		}

		$(document).mouseup(function() {
			o.cursor = o.panCursor;
			$("body").css("cursor", "default");
			image.css("cursor", o.cursor);
			viewport.unbind("mousemove").unbind("mouseup").unbind("mouseout");
			$(document).unbind("mousemove");
		});
		return false;
	}

	,_pan: function(e) {
		e.preventDefault();
		var self = this;
		var o = this.options;

		var deltaX = o.origoX - e.clientX;
		var deltaY = o.origoY - e.clientY;

		o.origoX = e.clientX;
		o.origoY = e.clientY;

		var targetX = o._absx - deltaX;
		var targetY = o._absy - deltaY;

		var minX = -o._width + o.viewportWidth;
		var minY = -o._height + o.viewportHeight;

		o._absx = targetX;
		o._absy = targetY;
		self._move();
		//o.relTopX =  
		//o.relTopX = 
		this._trigger("change", e, this._getRelativeValues(o));
	} // end pan
	


	,_move: function() {
		var o = this.options;
		console.log("Moving");
		console.dir(o);
		var image = this.element;
		
		var minX = -o._width + o.viewportWidth;
		var minY = -o._height + o.viewportHeight;

		if(o._absx > 0) {
			o._absx = 0;
		}
		else if(o._absx < minX) {
			o._absx = minX;
		}

		if(o._absy > 0) {
			o._absy = 0;
		}    
		else if(o._absy < minY) {
			o._absy = minY;
		}


		image.css({
			left: o._absx + "px"
			,top: o._absy + "px"
		});
	}
	
	,_zoom: function(e) {
		e.preventDefault();
		var o = this.options;
		var self = this;

		var factor = (o.origoY - e.clientY);

		o.oldWidth = o._width;
		o.oldHeight = o._height;

		o._width = ((factor/100) * o._width) + o._width;
		o._height = ((factor/100) * o._height) + o._height;

		if(self._resize()) {
			this._trigger("change", e, this._getRelativeValues(o));
			o.origoY = e.clientY;
		}
	}
	
	
	
	    ,_resize: function() {
	    	var self = this;
	    	var image = this.element;
	    	var o = this.options;
	    	
	    	var wasResized = true;
	  		if(o._width < o.viewportWidth) {
	  			o._height = parseInt(o.imageHeight * (o.viewportWidth/o.imageWidth));
	  			o._width = o.viewportWidth;
	  			wasResized = false;
	  		}

	  		if(o._height < o.viewportHeight) {
	  			o._width = parseInt(o.imageWidth * (o.viewportHeight/o.imageHeight));
	  			o._height = o.viewportHeight;
	  			wasResized = false;
	  		}


	  		if(o._width > o.imageMaxWidth) {
	  			o._height = parseInt(o._height * (o.imageMaxWidth/o._width));
	  			o._width = o.imageMaxWidth;
	  			wasResized = false;
	  		}


	  		image.css({
	  			width: o._width + "px"
	  			,height: o._height + "px"
	  		});


	  		// Scale at center of viewport
	  		var cx = o._width /(-o._absx + (o.viewportWidth/2));
	  		var cy = o._height /(-o._absy + (o.viewportHeight/2));


	  		o._absx = o._absx - ((o._width - o.oldWidth) / cx);
	  		o._absy = o._absy - ((o._height - o.oldHeight) / cy);

	  		self._move();
	  		return wasResized;
	  		
	  		
	  	}
	    
	    
			/**
			 * Handles resize of the viewport
			 */
		,_handleViewPortResize: function(e, edge) {
			e.preventDefault();
    	var self = this;
    	var image = this.element;
    	var o = this.options;
			
			var deltaX = o.origoX - e.clientX;
			var deltaY = o.origoY - e.clientY;

			o.origoX = e.clientX;
			o.origoY = e.clientY;

			var targetWidth = o.viewportWidth;
			var targetHeight = o.viewportHeight;

			if(edge == "e" || edge == "se") {
				targetWidth = o.viewportWidth - deltaX;
			}
			if(edge == "s" || edge == "se") {
				targetHeight = o.viewportHeight - deltaY;
			}
			
			if(targetWidth > o.viewportMaxWidth) {
				o.viewportWidth = o.viewportMaxWidth;
			}
			else if(targetWidth < o.viewportMinWidth) {
				o.viewportWidth = o.viewportMinWidth;
			}
			else if(o.allowResizeX) {
				o.viewportWidth = targetWidth;
			}
			
			if(targetHeight > o.viewportMaxHeight) {
				o.viewportHeight = o.viewportMaxHeight;
			}
			else if(targetHeight < o.viewportMinHeight) {
				o.viewportHeight = o.viewportMinHeight;
			}
			else if(o.allowResizeY) {
				o.viewportHeight = targetHeight;
			}
			

			image.parent().css({
				width: o.viewportWidth + "px"
				,height: o.viewportHeight + "px"
			});
			
			self._fit(e);
			this._trigger("change", e, this._getRelativeValues(o));
		}
		
		,_fit: function() {
    	var self = this;
    	var image = this.element;
    	var o = this.options;

			if(o.viewportWidth > o._width || o.viewportHeight > o._height) {
				var factor = o.viewportWidth / o._width;
				o._width = o.viewportWidth;
				o._height = o._height * factor;
				self._resize();
			}
			self._move();
		}
	    
	
	
	
	});

	$.ui.imagetool.getter = "dimensions";
	$.extend($.ui.imagetool, {
		version: "@VERSION",
		defaults: {
			src: null /* The image src is used */
			,allowZoom: true
			,allowPan: true
			,allowResizeX: true
			,allowResizeY: true
			,zoomCursor: "crosshair"
			,panCursor: "move"
			,disabledCursor: "not-allowed"
			,viewportWidth: 400
			,viewportHeight: 300
			,viewportMinWidth: 100
			,viewportMinHeight: 80
			,viewportMaxWidth: 800
			,viewportMaxHeight: 800
			,viewportResize: function(options) {
		
			}
			,"cursor-se":"se-resize"
			,"cursor-s":"s-resize"
			,"cursor-e":"e-resize"
			,"edgeSensitivity": 15
			,imageWidth: 200
      ,imageHeight: 200
			,imageMaxWidth: 2500
			,topX: -1
			,topY: -1
			,bottomX: -1 
			,bottomY: -1
		}
	});
})(jQuery);