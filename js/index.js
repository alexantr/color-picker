if (typeof alexantr === "undefined" || !alexantr) {
    var alexantr = {};
}

alexantr.colorPicker = {
    _input: null,
    _container: null,
    _updateInput: false,
    init: function (inputId, containerId) {
        var _this = this;

        _this._input = document.getElementById(inputId);
        _this._container = document.getElementById(containerId);

        var hslValues = [0, 100, 50];

        var inputHex = _this._input.value;
        if (inputHex) {
            var inputRGB = _this._hex2rgb(inputHex);
            if (inputRGB !== false) {
                hslValues = _this._rgb2hsl(inputRGB[0], inputRGB[1], inputRGB[2]);
            }
        }

        _this._container.innerHTML = _this._tpl();

        var $hue = _this._container.getElementsByClassName('acp-hue')[0];
        noUiSlider.create($hue, {
            start: [hslValues[0]],
            step: 1,
            range: {
                'min': [0],
                'max': [360]
            }
        });

        var $saturation = _this._container.getElementsByClassName('acp-saturation')[0];
        noUiSlider.create($saturation, {
            start: [hslValues[1]],
            step: 1,
            range: {
                'min': [0],
                'max': [100]
            }
        });

        var $lightness = _this._container.getElementsByClassName('acp-lightness')[0];
        noUiSlider.create($lightness, {
            start: [hslValues[2]],
            step: 1,
            range: {
                'min': [0],
                'max': [100]
            }
        });

        $hue.noUiSlider.on('update', function () {
            _this._refreshColor(true);
        });
        $saturation.noUiSlider.on('update', function () {
            _this._refreshColor(true);
        });
        $lightness.noUiSlider.on('update', function () {
            _this._refreshColor(true);
        });

        _this._updateInput = true;
        _this._refreshColor();
    },
    _tpl: function () {
        return '<div class="acp-slider acp-hue"></div>' +
            '<div class="acp-slider acp-saturation"></div>' +
            '<div class="acp-slider acp-lightness"></div>' +
            '<div class="acp-info"><div class="acp-preview"></div><div class="acp-hsl"></div><div class="acp-rgb"></div></div>';
    },
    _refreshColor: function (toInput) {
        toInput = toInput || false;

        var $h = this._container.getElementsByClassName('acp-hue')[0];
        var $s = this._container.getElementsByClassName('acp-saturation')[0];
        var $l = this._container.getElementsByClassName('acp-lightness')[0];

        var $preview = this._container.getElementsByClassName('acp-preview')[0];
        var $hsl = this._container.getElementsByClassName('acp-hsl')[0];
        var $rgb = this._container.getElementsByClassName('acp-rgb')[0];

        var h = $h.noUiSlider.get();
        var s = $s.noUiSlider.get();
        var l = $l.noUiSlider.get();

        h = parseInt(h) || 0;
        s = parseInt(s) || 0;
        l = parseInt(l) || 0;

        $hsl.innerHTML = 'H: <strong>' + h + '</strong>, S: <strong>' + s + '</strong>, L: <strong>' + l + '</strong>';

        var hexMinS = this._hsl2rgb(h, 0, l, true);
        var hexMaxS = this._hsl2rgb(h, 100, l, true);
        $s.getElementsByClassName('noUi-connects')[0].style.background = 'linear-gradient(to right, ' + hexMinS + ', ' + hexMaxS + ')';

        var hexL = this._hsl2rgb(h, s, 50, true);
        $l.getElementsByClassName('noUi-connects')[0].style.background = 'linear-gradient(to right, #000, ' + hexL + ', #fff)';

        var hex = this._hsl2rgb(h, s, l, true);

        if (toInput && this._updateInput) {
            this._input.value = hex;
        }

        $preview.style.backgroundColor = hex;

        var rgb = this._hsl2rgb(h, s, l);
        $rgb.innerHTML = 'R: <strong>' + rgb[0] + '</strong>, G: <strong>' + rgb[1] + '</strong>, B: <strong>' + rgb[2] + '</strong>';
    },
    _hsl2rgb: function (h, s, l, toHex) {
        toHex = !!toHex;

        // resolve degrees to 0 - 359 range
        h = this._cycle(h);

        // enforce constraints
        s = this._min(this._max(s, 100), 0);
        l = this._min(this._max(l, 100), 0);

        // convert to 0 to 1
        h /= 360;
        s /= 100;
        l /= 100;

        // hsl -> rgb

        var r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;

            r = this._hue2rgb(p, q, h + 1 / 3);
            g = this._hue2rgb(p, q, h);
            b = this._hue2rgb(p, q, h - 1 / 3);
        }

        var rgb = [
            this._min(this._max(Math.round(r * 255), 255), 0),
            this._min(this._max(Math.round(g * 255), 255), 0),
            this._min(this._max(Math.round(b * 255), 255), 0)
        ];

        if (!toHex) {
            return rgb;
        }

        return '#' + rgb.map(function (n) {
            return (256 + n).toString(16).substr(-2)
        }).join('');
    },
    _rgb2hsl: function (r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        var max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h *= 60;
        }

        return [
            this._min(this._max(Math.round(h), 360), 0),
            this._min(this._max(Math.round(s * 100), 100), 0),
            this._min(this._max(Math.round(l * 100), 100), 0)
        ];
    },
    _hue2rgb: function (p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    },
    _hex2rgb: function (hex) {
        hex = hex.replace(/^#/, '');
        if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
            return false;
        }
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var num = parseInt(hex, 16);
        var r = num >> 16;
        var g = (num >> 8) & 255;
        var b = num & 255;
        return [
            this._min(this._max(Math.round(r), 255), 0),
            this._min(this._max(Math.round(g), 255), 0),
            this._min(this._max(Math.round(b), 255), 0)
        ]
    },
    _max: function (val, n) {
        return (val > n) ? n : val;
    },
    _min: function (val, n) {
        return (val < n) ? n : val;
    },
    _cycle: function (val) {
        // for safety:
        val = this._max(val, 1e7);
        val = this._min(val, -1e7);
        // cycle value:
        while (val < 0) {
            val += 360;
        }
        while (val > 359) {
            val -= 360;
        }
        return val;
    }
};
