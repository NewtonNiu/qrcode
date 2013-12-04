(function ($, window, document){
    // detecting browser support
    var support = (function (support){
        var type = (window.SVGAngle
            || document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1')
            ? 'SVG' : 'VML');

        if (type === 'VML') {
            var shape,
                element = document.createElement('div');

            element.innerHTML = '<v:shape adj="1"/>';
            shape = element.firstChild;

            shape.style.behavior = 'url(#default#VML)';
            if (!(shape && typeof shape.adj == 'object')) {
                type = '';
            }
            element = null;
        }

        support.svg = !(support.vml = type === 'VML');
        support.canvas = !!document.createElement("canvas").getContext;
        return support;
    }({}));

    // draw qrcode by canvas
    function createCanvas(qrcode, options){
        // create canvas element
        var x, y, w, h,
            canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            moduleCount = qrcode.getModuleCount(), // qrcode count
            width = options.width / moduleCount.toPrecision(4), // compute width based on options.width
            height = options.height / moduleCount.toPrecision(4); // compute height based on options.height

        canvas.width = options.width;
        canvas.height = options.height;

        // draw in the canvas
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                x = Math.round(col * width);
                y = Math.round(row * height);
                w = Math.ceil((col + 1) * width) - Math.floor(col * width);
                h = Math.ceil((row + 1) * height) - Math.floor(row * height);

                context.fillStyle = qrcode.isDark(row, col) ? options.foreground : options.background;
                context.fillRect(x, y, w, h);
            }
        }
        
        // return just built canvas
        return canvas;
    }

    // draw qrcode by vml
    function createVML(qrcode, options){
        var x, y,
            moduleCount = qrcode.getModuleCount(),
            dx = dy = moduleCount * 16,
            vml = '<vml:group xmlns:vml="urn:schemas-microsoft-com:vml" '
                + 'style="behavior:url(#default#VML);position:relative;'
                + 'display:block;padding:0;margin:0;border:none;'
                + 'width:' + (options.width - 2) * moduleCount + 'px;'
                + 'height:' + (options.height - 2) * moduleCount + 'px;" '
                + 'coordorigin="0,0" coordsize="' + dx + ',' + dy + '">'
                + '<vml:shape style="behavior:url(#default#VML);width:16px;height:16px;padding:0;'
                + 'margin:0;border:none;" stroked="true" filled="true" strokeweight="0" '
                + 'strokecolor="' + options.background + '" fillcolor="' + options.background + '" '
                + 'path="M 0,0 L ' + dx + ',0 L ' + dx + ',' + dy + ' L 0,' + dy + ' X"></vml:shape>',
            rectHead = '<vml:shape style="behavior:url(#default#VML);width:16px;height:16px;padding:0;'
                + 'margin:0;border:none;" stroked="true" filled="true" strokeweight="0" '
                + 'strokecolor="' + options.foreground + '" fillcolor="' + options.foreground + '" ',
            rectFoot = '></vml:shape>';

        // draw in the vml
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                if (qrcode.isDark(row, col)) {
                    x = col * 16;
                    y = row * 16;
                    dx = (col + 1) * 16;
                    dy = (row + 1) * 16;

                    vml += rectHead + 'path="M ' + x + ',' + y
                        + ' L ' + dx + ',' + y
                        + ' L ' + dx + ',' + dy
                        + ' L ' + x + ',' + dy
                        + ' X"';

                    vml += rectFoot;
                }
            }
        }

        vml += '</vml:group>';
        vml = '<div style="overflow:hidden;width:' + options.width + 'px;height:'
            + options.height + 'px;margin:0px;padding:0;">' + vml + '</div>';

        // return just built vml
        return $(vml)[0];
    }

    // draw qrcode by svg
    function createSVG(qrcode, options){
        var x, y,
            moduleCount = qrcode.getModuleCount(),
            scale = options.height / options.width,
            dx = moduleCount * 16,
            dy = moduleCount * 16 * scale,
            svg = '<svg xmlns="http://www.w3.org/2000/svg" '
                + 'width="' + options.width + 'px" height="' + options.height + 'px" '
                + 'style="padding:0;margin:0;border:none;background:' + options.background + ';" '
                + 'viewbox="0 0 ' + dx + ' ' + dy + '">',
            rectHead = '<path style="padding:0;margin:0;border:none;stroke-width:1;'
                + 'stroke:' + options.foreground + ';fill:' + options.foreground + ';" ',
            rectFoot = '></path>';

        // draw in the svg
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                if (qrcode.isDark(row, col)) {
                    x = col * 16;
                    y = row * 16 * scale;
                    dx = (col + 1) * 16;
                    dy = (row + 1) * 16 * scale;

                    svg += rectHead + 'd="M ' + x + ',' + y
                        + ' L ' + dx + ',' + y
                        + ' L ' + dx + ',' + dy
                        + ' L ' + x + ',' + dy
                        + ' Z"';

                    svg += rectFoot;
                }
            }
        }

        svg += '</svg>';

        // return just built svg
        return $(svg)[0];
    }

    // draw qrcode by auto
    function createDefault(qrcode, options){
        if (support.canvas) return createCanvas(qrcode, options);
        if (support.svg) return createSVG(qrcode, options);
        if (support.vml) return createVML(qrcode, options);
        return document.createElement('div');
    }

    // jquery qrcode
    $.fn.qrcode = function (options){
        // if options is string,
        if (typeof options === 'string') {
            options = { text: options };
        }

        // set default values
        // typeNumber < 1 for automatic calculation
        options = $.extend({}, {
            render: "auto",
            width: 256,
            height: 256,
            typeNumber: -1,
            correctLevel: 'H',
            background: "#ffffff",
            foreground: "#000000"
        }, options);

        return this.each(function (){
            var element;
            var qrcode;

            qrcode = new QRCode(options.typeNumber, options.correctLevel);
            qrcode.addData(options.text);
            qrcode.make();

            switch (options.render) {
                case "canvas":
                    element = createCanvas(qrcode, options);
                    break;
                case "svg":
                    element = createSVG(qrcode, options);
                    break;
                case "vml":
                    element = createVML(qrcode, options);
                    break;
                default:
                    element = createDefault(qrcode, options);
                    break;
            }

            // render qrcode
            $(this).empty().append(element);
        });
    };
})(jQuery, this, document);
