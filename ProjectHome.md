## About ##
**Imagetool** is a simple plugin for jQuery providing basic panning and zooming capabilities for images.

It works by wrapping the selected image in a <div> (the viewport) and manipulates css properties based on user input.<br>
<br>
<br>
Try the <a href='http://homepage.mac.com/bendik/imagetool/demo/index.html'>demo</a>

<h2>Usage</h2>

<pre><code>$("img").imagetool(options);<br>
<br>
</code></pre>

<h2>Options</h2>
<table><thead><th> <b>name</b>   </th><th> <b>type</b>  </th><th> <b>required</b> </th><th> <b>default</b> </th><th> <b>description</b> </th></thead><tbody>
<tr><td> allowZoom</td><td> boolean </td><td> no</td><td> true </td><td> If true, the image is zoomable. </td></tr>
<tr><td> allowPan </td><td> boolean </td><td> no</td><td> true </td><td> If true, the image can be panned. </td></tr>
<tr><td> maxWidth </td><td> number  </td><td> no</td><td> 2000 </td><td> The maximum width of the zoomed image in pixels. </td></tr>
<tr><td> viewportWidth </td><td> number </td><td> no</td><td> 320 </td><td> The width (pixels) of the viewport. </td></tr>
<tr><td> viewportHeight </td><td> number </td><td> no</td><td> 180 </td><td> The height (pixels) of the viewport. </td></tr>
<tr><td> callback </td><td> function </td><td> no</td><td> none </td><td> A function that is called after the image has been panned or zoomed. </td></tr>
<tr><td> loading </td><td> string </td><td> no</td><td> none </td><td> Path to an image that is shown while the main image loads. </td></tr>
<tr><td> topX </td><td> number </td><td> no</td><td> none </td><td> Top left corner of the initial visible area. </td></tr>
<tr><td> topY </td><td> number </td><td> no</td><td> none </td><td> Top left corner of the initial visible area.  </td></tr>
<tr><td> bottomX </td><td> number </td><td> no</td><td> none </td><td> Bottom right corner of the initial visible area. </td></tr>
<tr><td> bottomY </td><td> number </td><td> no</td><td> none </td><td> Bottom right corner of the initial visible area. </td></tr></tbody></table>
