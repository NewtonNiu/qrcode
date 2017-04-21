# jquery-qrcode

>a javascript qrcode

### Introduction
```js
$('#qrcode').qrcode({
  render: 'auto', // 默认auto，可选auto、canvas、svg、vml
  text: 'QRCode', // 编码内容
  width: 300, // 二维码宽度，默认256
  height: 300, // 二维码高度，默认256
  version: -1, // 二维码版本，-1为自动，可选1-40以下数字（包括1和40），小于零等同于-1
  ecLevel: 'H', // 纠错级别，默认H，可选H、Q、M、L（区分大小写）
  mode: 'EightBit', // 编码模式，默认EightBit，可选EightBit、AlphaNumeric、Numeric（区分大小写）
  background: '#ffffff', // 背景色，默认白色，可选任何颜色
  foreground: '#000000', // 前景色，默认黑色，可选任何颜色
  onError: function (e){
    alert(e.message);
  } // 编码错误回调函数
});
```
