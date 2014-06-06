qrcode
======

a javascript qrcode

### Intro
```js
    $('#qrcode').qrcode({
        render: 'auto', // 默认auto，可选auto、canvas、svg、vml
        text: utf16to8('qrcode'), // utf16to8是对中文的编码，如果不想支持中文去除utf16to8的调用即可
        width: 300, // 默认256
        height: 300, // 默认256
        typeNumber: -1, // 二维码复杂程度，-1为自动，可选40以下数字（包括40），小于零等同于-1
        correctLevel: 'H', // 纠错级别，默认H，可选H、Q、M、L（区分大小写）
        background: '#ffffff', // 背景色，默认白色，可选任何颜色
        foreground: '#000000' // 前景色，默认黑色，可选任何颜色
    });
```
