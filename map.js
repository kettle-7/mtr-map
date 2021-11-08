 /************************************************************************
 * Copyright 2021 Ben Keppel                                             *
 *                                                                       *
 * This program is free software: you can redistribute it and/or modify  *
 * it under the terms of the GNU General Public License as published by  *
 * the Free Software Foundation, either version 3 of the License, or     *
 * (at your option) any later version.                                   *
 *                                                                       *
 * This program is distributed in the hope that it will be useful,       *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
 * GNU General Public License for more details.                          *
 *                                                                       *
 * You might have received a copy of the GNU General Public License      *
 * along with this program.  If not, see <http://www.gnu.org/licenses/>. *
 ************************************************************************/

// sudo apt install node-static

var fs = require('fs');
const http = require('http');
var nstatic = require('/usr/share/nodejs/node-static');
var file = new(nstatic.Server)(__dirname);

const hostname = '0.0.0.0';
const port = 3000;

var top = `<!DOCTYPE HTML>
<html>
    <head>
        <title>Kingsburgh Metro Map</title>
        <meta charset='utf-8'/>
        <!--<link rel="stylesheet" type="text/css" href="/style.css">-->
        <style>
            .station {
                border-radius: 20px;
                border: 10px solid black;
                background-color: white;
            }
            p {
                font-family: sans-serif;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <input type="button" value="+" onclick="zoom = zoom * 2; draw()"/>
        <input type="button" value="-" onclick="zoom = zoom / 2; draw()"/>
        <div id="bod"></div>
        <script>
        var zoom = 1;
        var parent = document.getElementById("bod");
        function getTextWidth(text, size) {
            // re-use canvas object for better performance
            const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
            const context = canvas.getContext("2d");
            context.font = 'sans-serif '+size+'px';
            const metrics = context.measureText(text);
            return metrics.width;
        }
        function draw() {
            while (parent.firstChild) {
                parent.removeChild(parent.firstChild);
            }
            var stations = [];
            var lines = [];
            var panX = window.innerWidth / 2;
            var panY = window.innerHeight / 2;
            function drawStation(s) {
                var name = s[0];
                var x = s[1];
                var y = s[2];
                var w = s[3];
                var h = s[4];
                var url = s[5];
                var p = document.createElement("div");
                p.style.height = 10 * h + 'px';
                p.style.width = 10 * w + 'px';
                p.style.position = "absolute";
                p.style.left = ((x * 100 * zoom) + panX - (5 * w)) + "px";
                p.style.top = ((y * 100 * zoom) + panY - (5 * h)) + "px";
                //p.style.borderRadius = Math.min(h * 10, w * 10) + 'px';
                //p.style.borderRadius = "20px";
                p.className = "station";
                var l = document.createElement("p");
                l.style.height = (18 * zoom) + 'px';
                //l.style.width = (getTextWidth(name, 18 * zoom) * 2) + 'px';
                l.style.position = "absolute";
                //l.style.left = ((x * 100 * zoom) + panX - Math.floor(getTextWidth(name) / 2)) + "px";
                l.style.left = ((x * 100 * zoom) + panX - (50 * zoom) + (5 * w)) + "px";
                l.style.width = (100 * zoom) + "px";
                l.style.top = ((y * 100 * zoom) + panY + (5 * h)) + 10 + "px";
                l.innerHTML = name;
                l.style.fontSize = (18 * zoom) + "px";
                document.getElementById("bod").appendChild(l);
                document.getElementById("bod").appendChild(p);
            }
`
var bottom = `
            for (var c = 0; c < stations.length; c++) {
                drawStation(stations[c]);
            }
        }
        document.addEventListener('DOMContentLoaded', draw, false);
        </script>
    </body>
</html>`

function station(name, x, y, w, h, url=null) {
    console.log(name)
    return `stations.push(["${name}", ${x}, ${y}, ${w}, ${h}${function(url) {if (url != null) { return ', "' + url + '"'} else {return ", null"}}()}]);\n`
}

const server = http.createServer((req, res) => {
    var middle = ""
    var data = fs.readFileSync("./stations");
    stations = JSON.parse(data);
    for (var c = 0; c < stations.length; c++) {
        let s = stations[c];
        middle += station(s[0], s[1], s[2], s[3], s[4], s[5]);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', "text/html");
    res.end(top + middle + bottom);
    return;
})

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/, press Ctrl+C to stop.`);
});
