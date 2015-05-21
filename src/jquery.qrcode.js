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
    var i, j, x, y, w, h,
      canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      moduleCount = qrcode.length, // qrcode count
      width = options.width / moduleCount.toPrecision(4), // compute width based on options.width
      height = options.height / moduleCount.toPrecision(4); // compute height based on options.height

    canvas.width = options.width;
    canvas.height = options.height;

    // draw in the canvas
    for (i = 0; i < moduleCount; i++) {
      for (j = 0; j < moduleCount; j++) {
        x = Math.round(i * width);
        y = Math.round(j * height);
        w = Math.ceil((i + 1) * width) - Math.floor(i * width);
        h = Math.ceil((j + 1) * height) - Math.floor(j * height);

        context.fillStyle = qrcode[i][j] ? options.foreground : options.background;
        context.fillRect(x, y, w, h);
      }
    }

    // return just built canvas
    return canvas;
  }

  // draw qrcode by vml
  function createVML(qrcode, options){
    var i, j, x, y, dy,
      moduleCount = qrcode.length,
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
    for (i = 0; i < moduleCount; i++) {
      for (j = 0; j < moduleCount; j++) {
        if (qrcode[i][j]) {
          x = i * 16;
          y = j * 16;
          dx = (i + 1) * 16;
          dy = (j + 1) * 16;

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
    var i, j, x, y,
      moduleCount = qrcode.length,
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
    for (i = 0; i < moduleCount; i++) {
      for (j = 0; j < moduleCount; j++) {
        if (qrcode[i][j]) {
          x = i * 16;
          y = j * 16 * scale;
          dx = (i + 1) * 16;
          dy = (j + 1) * 16 * scale;

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
      render: "auto", // 默认auto，可选auto、canvas、svg、vml
      width: 256, // 二维码宽度，默认256
      height: 256, // 二维码高度，默认256
      version: -1, // 二维码版本，-1为自动，可选1-40以下数字（包括1和40），小于零等同于-1
      ecLevel: 'H', // 纠错级别，默认H，可选H、Q、M、L（区分大小写）
      mode: 'EightBit', // 编码模式，默认EightBit，可选EightBit、AlphaNumeric、Numeric（区分大小写）
      background: "#ffffff", // 背景色，默认白色，可选任何颜色
      foreground: "#000000", // 前景色，默认黑色，可选任何颜色
      onError: $.noop // 编码错误回调函数
    }, options);

    return this.each(function (){
      var element, QRCode, Version, PixArr, ECLevel, Mode;

      QRCode = new QREncode();
      ECLevel = QRBase.ERROR_CORRECTION_LEVEL[options.ecLevel] || QRBase.ERROR_CORRECTION_LEVEL.H;
      Mode = QRBase.MODE[options.mode] || QRCode.MODE.EightBit;

      try {
        Version = (options.version >= 1 && options.version <= 40)
          ? options.version
          : QRCode.getVersionFromLength(ECLevel, Mode, options.text);
        PixArr = QRCode.encodeToPix(Mode, options.text, Version, ECLevel);
      } catch (e) {
        $.isFunction(options.onError) && options.onError.call(this, e);
      }

      switch (options.render) {
        case "canvas":
          element = createCanvas(PixArr, options);
          break;
        case "svg":
          element = createSVG(PixArr, options);
          break;
        case "vml":
          element = createVML(PixArr, options);
          break;
        default:
          element = createDefault(PixArr, options);
          break;
      }

      // render qrcode
      $(this).empty().append(element);
    });
  };
})(jQuery, this, document);
