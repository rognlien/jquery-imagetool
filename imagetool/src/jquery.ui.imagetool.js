(function($) {
	$.widget("ui.imagetool", {
		/**
		 * Public methods
		 */
		update: function(args) {
			var image = this.element;
			var o = this.options;
			if(args.src) {
				image.attr("src", args.src);
				console.log("updating src: " + args.src);
			}
			if(args.width) {
				image.attr("width", args.width);
				o.imageWidth = args.width;
				console.log("updating width: " + args.width);
			}
			if(args.height) {
				image.attr("height", args.height);
				o.imageHeight = args.height;
				console.log("updating height: " + args.height);
			}
			
		}
	
	
	
	/*
		,setData: function(key, value) {
			console.log("Setting option: " + key);
			var image = this.element;
			if(key == 'src') {
				
				image.attr("src", value);
			}
			else {
				self._setData(key, value);
			}
	  }
	*/
		
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
			
			var viewport = $("<div class=\"notinuseviewport\"><\/div>");
			viewport.css(viewportCss);

			image.wrap(viewport);
			
			o.width = o.imageWidth;
			o.height = o.imageHeight;


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

			o.width = o.width * scaleX;
			o.height = o.height * scaleY;

			o.oldWidth = o.width;
			o.oldHeight = o.height;

			o.x = -(o.topX * scaleX);
			o.y = -(o.topY * scaleY);
			
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
			
			/*
	    if(o.allowPan || o.allowZoom) {
	    	image.mousedown(function(e) {self._handleMouseDown(e);});
	    	image.mouseover(function(e) {self._handleMouseOver(e);});
	    	image.mouseout(function(e) {self._handleMouseOut(e);});
	    }
	    else {
	    	image.css("cursor", dim.disabledCursor);
	    	image.mousedown(function(e) {
	    		e.preventDefault();
	    	});
	    }
	    */
		}
	
	/**
	 * Find the edge n, e, s, w, 
	 */
	,_getEdge: function(o, x, y) {
		var self = this;
		var image = this.element;
		
		var scale = o.width / o.imageWidth;
		
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

		var targetX = o.x - deltaX;
		var targetY = o.y - deltaY;

		var minX = -o.width + o.viewportWidth;
		var minY = -o.height + o.viewportHeight;

		o.x = targetX;
		o.y = targetY;
		self._move();
		o.relTopX =  
		o.relTopX = 
		this._trigger("pan", e, this._getRelativeValues(o));
	} // end pan
	
	,_getRelativeValues: function(o) {
		var scale = o.width/o.imageWidth;
		//console.log(o.bottomX + " "+ o.bottomY);
		return {
			width: o.viewportWidth
			,height: o.viewportHeight
			,cropX: -o.x / o.imageWidth
			,cropY: -o.y / o.imageHeight
			
			,cropW: (o.viewportWidth) / o.imageWidth
			,cropH: (o.viewportHeight) / o.imageHeight
			/*
	    ,cropW: (o.bottomX - o.x) / o.imageWidth
			,cropH: (o.bottomY - o.y) / o.imageHeight
			*/
		};
		
	}

	,_move: function() {
		var o = this.options;
		var image = this.element;
		
		var minX = -o.width + o.viewportWidth;
		var minY = -o.height + o.viewportHeight;

		if(o.x > 0) {
			o.x = 0;
		}
		else if(o.x < minX) {
			o.x = minX;
		}

		if(o.y > 0) {
			o.y = 0;
		}    
		else if(o.y < minY) {
			o.y = minY;
		}


		image.css({
			left: o.x + "px"
			,top: o.y + "px"
		});
	}
	
	,_zoom: function(e) {
		e.preventDefault();
		var o = this.options;
		var self = this;

		var factor = (o.origoY - e.clientY);

		o.oldWidth = o.width;
		o.oldHeight = o.height;

		o.width = ((factor/100) * o.width) + o.width;
		o.height = ((factor/100) * o.height) + o.height;

		if(self._resize()) {
			this._trigger("zoom", e, this._getRelativeValues(o));
			o.origoY = e.clientY;
		}
	}
	
	
	
	    ,_resize: function() {
	    	var self = this;
	    	var image = this.element;
	    	var dim = this.options;
	    	
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


	  		image.css({
	  			width: dim.width + "px"
	  			,height: dim.height + "px"
	  		});


	  		// Scale at center of viewport
	  		var cx = dim.width /(-dim.x + (dim.viewportWidth/2));
	  		var cy = dim.height /(-dim.y + (dim.viewportHeight/2));


	  		dim.x = dim.x - ((dim.width - dim.oldWidth) / cx);
	  		dim.y = dim.y - ((dim.height - dim.oldHeight) / cy);

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
			this._trigger("resize", e, this._getRelativeValues(o));
		}
		
		,_fit: function() {
    	var self = this;
    	var image = this.element;
    	var o = this.options;

			if(o.viewportWidth > o.width || o.viewportHeight > o.height) {
				var factor = o.viewportWidth / o.width;
				o.width = o.viewportWidth;
				o.height = o.height * factor;
				self._resize();
			}
			self._move();
		}
	    
	
	
	
	});

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
			,callback: function(topX, topY, bottomX, bottomY) {}
		}
	});
})(jQuery);