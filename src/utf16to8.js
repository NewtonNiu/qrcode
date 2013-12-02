// 编码转换
function utf16to8(str){
    var code,
        out = '';

    for (var i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if ((code >= 0x0001) && (code <= 0x007F)) {
            out += str.charAt(i);
        } else if (code > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((code >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((code >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((code >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((code >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((code >> 0) & 0x3F));
        }
    }

    return out;
}
