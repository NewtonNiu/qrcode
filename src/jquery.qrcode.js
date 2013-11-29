(function ($){
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

    function createCanvas(qrcode, options){
        // create canvas element
        var canvas = document.createElement("canvas"),
            context = canvas.getContext("2d"),
            moduleCount = qrcode.getModuleCount(), // qrcode count
            width = options.width / moduleCount.toPrecision(4), // compute width based on options.width
            height = options.height / moduleCount.toPrecision(4); // compute height based on options.height

        canvas.width = options.width;
        canvas.height = options.height;

        // draw in the canvas
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                context.fillStyle = qrcode.isDark(row, col) ? options.foreground : options.background;
                var w = (Math.ceil((col + 1) * width) - Math.floor(col * width)),
                    h = (Math.ceil((row + 1) * width) - Math.floor(row * width));

                context.fillRect(Math.round(col * width), Math.round(row * height), w, h);
            }
        }
        // return just built canvas
        return canvas;
    }

    function createVML(qrcode, options){
        var moduleCount = qrcode.getModuleCount(),
            vml = '<vml:group xmlns:vml="urn:schemas-microsoft-com:vml" style="width:' + (options.width - 2) * moduleCount
                + 'px;height:' + (options.height - 2) * moduleCount + 'px;behavior:url(#default#VML);'
                + 'position:relative;top:0;left:0;display:inline-block;padding:0;margin:0;border:none;" '
                + 'coordorigin="0,0" coordsize="' + moduleCount * 10 + ',' + moduleCount * 10 + '">',
            rectHead = '<vml:shape style="width:10px;height:10px;behavior:url(#default#VML);padding:0;' +
                'margin:0;border:none;display:inline-block;" filled="true" stroked="true" strokeweight="0"',
            foreRect = ' strokecolor="' + options.foreground + '" fillcolor="' + options.foreground + '"></vml:shape>',
            backRect = ' strokecolor="' + options.background + '" fillcolor="' + options.background + '"></vml:shape>';

        //绘制二维码
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                vml += rectHead + 'path="M ' + col * 10 + ',' + row * 10
                    + ' L ' + (col + 1) * 10 + ',' + row * 10
                    + ' L ' + (col + 1) * 10 + ',' + (row + 1) * 10
                    + ' L ' + col * 10 + ',' + (row + 1) * 10
                    + ' X"';
                vml += qrcode.isDark(row, col) ? foreRect : backRect;
            }
        }

        vml += '</vml:group>';
        vml = '<div style="width:' + options.width + 'px;height:'
            + options.height + 'px;margin:0px;padding:0;">' + vml + '</div>';

        //返回vml节点
        return $(vml)[0];
    }

    function createSVG(qrcode, options){
        var moduleCount = qrcode.getModuleCount(),
            svg = '<svg xmlns="http://www.w3.org/2000/svg" height="'
                + options.height + '" width="' + options.width
                + '" viewbox="0 0 ' + moduleCount * 10 + ' ' + moduleCount * 10 + '">',
            rectHead = '<path ',
            foreRect = ' style="stroke-width:1;stroke:' + options.foreground
                + ';fill:' + options.foreground + ';"></path>',
            backRect = ' style="stroke-width:1;stroke:' + options.background
                + ';fill:' + options.background + ';"></path>';

        //绘制二维码
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                svg += rectHead + 'd="M ' + col * 10 + ' ' + row * 10
                    + ' L ' + (col + 1) * 10 + ' ' + row * 10
                    + ' L ' + (col + 1) * 10 + ' ' + (row + 1) * 10
                    + ' L ' + col * 10 + ' ' + (row + 1) * 10
                    + ' Z"';
                svg += qrcode.isDark(row, col) ? foreRect : backRect;
            }
        }

        svg += '</svg>';

        //返回svg节点
        return $(svg)[0];
    }

    function createDefault(qrcode, options){
        if (support.canvas) return createCanvas(qrcode, options);
        if (support.svg) return createSVG(qrcode, options);
        if (support.vml) return createVML(qrcode, options);
        return document.createElement('div');
    }

    // jquery qrcode
    $.fn.qrcode = function (options){
        // if options is string,
        if (typeof options === "string") {
            options = { text: options };
        }

        // set default values
        // typeNumber < 1 for automatic calculation
        options = $.extend({}, {
            render: "auto",
            width: 256,
            height: 256,
            typeNumber: -1,
            correctLevel: QRErrorCorrectLevel.H,
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
})(jQuery);
