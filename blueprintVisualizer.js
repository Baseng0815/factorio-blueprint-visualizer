const pako = require('pako')
const readline = require('readline')
const fs = require('node:fs');

const EXAMPLE_SETTINGS = [
    ["how to use: https://github.com/piebro/factorio-blueprint-visualizer/blob/master/draw_setting_documentation.md"],
    ["default settings", { 'background': '#a2aebb', 'fill': 'none', 'fill-opacity': 1, 'stroke': 'none', 'stroke-linecap': 'round', 'stroke-width': 0.3, 'stroke-opacity': 1, 'scale': 0.85, 'rx': 0.1, 'ry': 0.1 }],
    ["tiles", { 'fill': '#420217', 'stroke': '#f3ffbd', 'stroke-width': 0.15, 'deny': [], 'scale': 0.65 }],

    ["pipes", { 'stroke': '#c84c09' }],
    ["underground-pipes", { 'stroke': '#c84c09' }],
    ["belts", { 'stroke': '#f3ffbd' }],
    ["underground-belts", { 'stroke': '#f3ffbd' }],
    ["inserters", { 'stroke': '#f3ffbd' }],

    ["bbox", { 'fill': '#247ba0', 'deny': ["pipe", "pipe-to-ground", "belts", "inserters", "solar-panel", "accumulator", "asteroid-collector", "cargo-bay", "space-platform-hub", "thruster", "rails"] }],
    ["bbox", { 'fill': '#ff1654', 'allow': ["solar-panel"] }],
    ["bbox", { 'fill': '#436436', 'allow': ["accumulator"] }],
    ["bbox", { 'fill': '#70c1b3', 'allow': ["cargo-bay"] }],
    ["bbox", { 'fill': '#b2dbbf', 'allow': ["asteroid-collector", "thruster"] }],
    ["bbox", { 'fill': '#b2dbbf', 'allow': ["space-platform-hub"], "scale": 0.95 }],

    ["rails", { 'stroke': '#b2dbbf' }],
    ["heat-pipes", { 'stroke': '#b2dbbf' }],

]

const PREDEFINED_COLOR_PALETTES = [
    [
        ['#2d7dd2', '#97cc04'],
        ['#6d213c', '#946846'],
        ['#54457f', '#ac7b84'],
        ['#0d3b66', '#faf0ca'],
        ['#1446a0', '#db3069'],
        ['#ff6666', '#ccff66'],
        ['#251605', '#c57b57'],
        ["#353535", "#ffffff"],
        ["#34344a", "#80475e"],
        ["#e9d758", "#297373"],
        ["#c2c1c2", "#42213d"],
        ["#333745", "#e63462"],
        ["#0d3b66", "#faf0ca"],
        ["#f55d3e", "#878e88"],
        ["#fe4a49", "#2ab7ca"],
        ["#444545", "#b5ffe9"],
        ["#89b6a5", "#4c3b4d"],
        ["#f05d5e", "#0f7173"],
        ["#50514f", "#b4adea"],
    ], [
        ['#ff4e00', '#8ea604', '#f5bb00'],
        ['#a54657', '#582630', '#f7ee7f'],
        ['#464d77', '#36827f', '#f9db6d'],
        ['#264653', '#2a9d8f', '#e9c46a'],
        ['#ef767a', '#456990', '#49beaa'],
        ['#eca400', '#eaf8bf', '#006992'],
        ['#ef946c', '#c4a77d', '#70877f'],
        ["#313715", "#d16014", "#939f5c"],
        ["#442b48", "#726e60", "#98b06f"],
        ["#002a32", "#c4a29e", "#eba6a9"],
        ["#51a3a3", "#75485e", "#cb904d"],
        ["#0d3b66", "#faf0ca", "#f4d35e"],
        ["#f2c57c", "#ddae7e", "#7fb685"],
        ["#28536b", "#c2948a", "#7ea8be"],
        ["#3a2e39", "#1e555c", "#f4d8cd"],
        ["#ffa69e", "#ff7e6b", "#8c5e58"],
        ["#f4d06f", "#ff8811", "#9dd9d2"],
        ["#fbfef9", "#191923", "#0e79b2"],
        ["#bf4e30", "#c6ccb2", "#093824"],
    ], [
        ['#ec0b43', '#58355e', '#7ae7c7', '#d6ffb7'],
        ['#bfae48', '#5fad41', '#2d936c', '#391463'],
        ['#c9cba3', '#ffe1a8', '#e26d5c', '#723d46'],
        ['#d7263d', '#02182b', '#0197f6', '#448fa3'],
        ['#042a2b', '#5eb1bf', '#cdedf6', '#ef7b45'],
        ['#540d6e', '#ee4266', '#ffd23f', '#f3fcf0'],
        ['#ffb997', '#f67e7d', '#843b62', '#0b032d'],
        ["#06070e", "#29524a", "#94a187", "#c5afa0"],
        ["#f1bf98", "#e1f4cb", "#bacba9", "#717568"],
        ["#ccd7c5", "#efd2cb", "#c7a27c", "#d65780"],
        ["#ecebe4", "#cc998d", "#16f4d0", "#429ea6"],
        ["#004777", "#a30000", "#ff7700", "#efd28d"],
        ["#aba9bf", "#beb7df", "#d4f2d2", "#34113f"],
    ], [
        ['#d6ffb7', '#f5ff90', '#ffc15e', '#ff9f1c', '#080357'],
        ['#52489c', '#4062bb', '#59c3c3', '#ebebeb', '#f45b69'],
        ['#ee6055', '#60d394', '#aaf683', '#ffd97d', '#ff9b85'],
        ['#55dde0', '#33658a', '#2f4858', '#f6ae2d', '#f26419'],
        ['#fcde9c', '#ffa552', '#ba5624', '#381d2a', '#c4d6b0'],
        ['#1c3144', '#d00000', '#ffba08', '#a2aebb', '#3f88c5'],
        ['#acf39d', '#e85f5c', '#9cfffa', '#773344', '#e3b5a4'],
    ], [
        ['#6dd3ce', '#c8e9a0', '#f7a278', '#a13d63', '#351e29', '#2e282a'],
        ['#74b3ce', '#508991', '#172a3a', '#004346', '#09bc8a', '#bda0bc'],
        ['#6f1d1b', '#bb9457', '#432818', '#99582a', '#ffe6a7', '#020887'],
        ['#6d213c', '#946846', '#baab68', '#e3c16f', '#faff70', '#ffa9e7'],
        ['#bfb48f', '#564e58', '#904e55', '#f2efe9', '#252627', '#97dffc'],
        ['#0fa3b1', '#d9e5d6', '#eddea4', '#f7a072', '#ff9b42', '#e08dac'],
        ['#52414c', '#596157', '#5b8c5a', '#cfd186', '#e3655b', '#d67ab1'],
    ], [
        ['#58355e', '#e03616', '#fff689', '#cfffb0', '#5998c5', '#8eb1c7', '#12eaea'],
        ['#abe188', '#f7ef99', '#f1bb87', '#f78e69', '#5d675b', '#13293d', '#006494'],
        ['#2f4b26', '#3e885b', '#85bda6', '#bedcfe', '#c0d7bb', '#62466b', '#45364b'],
        ['#212738', '#f97068', '#d1d646', '#edf2ef', '#57c4e5', '#8b85c1', '#d4cdf4'],
        ['#fcde9c', '#ffa552', '#ba5624', '#381d2a', '#c4d6b0', '#adaabf', '#020402'],
        ['#e3e7af', '#a2a77f', '#eff1c5', '#035e7b', '#002e2c', '#c9b1bd', '#2e0219'],
        ['#9cfffa', '#acf39d', '#b0c592', '#a97c73', '#af3e4d', '#4281a4', '#c1666b'],
    ], [
        ['#247ba0', '#70c1b3', '#b2dbbf', '#f3ffbd', '#ff1654', '#436436', '#c84c09', '#420217'],
        ['#f0b67f', '#fe5f55', '#d6d1b1', '#c7efcf', '#eef5db', '#9d44b5', '#525252', '#272727'],
        ['#c0caad', '#9da9a0', '#654c4f', '#b26e63', '#cec075', '#00120b', '#35605a', '#004346'],
        ['#f2c57c', '#ddae7e', '#7fb685', '#426a5a', '#ef6f6c', '#466365', '#c4c6e7', '#baa5ff'],
        ['#87b38d', '#22031f', '#cc76a1', '#dd9296', '#f2b7c6', '#d17b0f', '#247ba0', '#449dd1'],
        ['#a20021', '#f52f57', '#f79d5c', '#f3752b', '#ededf4', '#048a81', '#06d6a0', '#54c6eb'],
        ['#d9e5d6', '#00a7e1', '#eddea4', '#f7a072', '#ff9b42', '#426a5a', '#ef6f6c', '#e05263'],
    ], [
        ['#b2aa8e', '#0c1b33', '#7a306c', '#03b5aa', '#dbfe87', '#a44200', '#3a5743', '#226ce0', '#ff6b6b'],
        ['#bbbe64', '#eaf0ce', '#c0c5c1', '#7d8491', '#443850', '#655a7c', '#3e442b', '#f93943', '#445e93'],
        ['#272932', '#4d7ea8', '#828489', '#9e90a2', '#b6c2d9', '#f2d0a9', '#95f2d9', '#1cfeba', '#7cdedc'],
        ['#664c43', '#873d48', '#dc758f', '#e3d3e4', '#00ffcd', '#f3f9d2', '#bdc4a7', '#92b4a7', '#55d6be'],
        ['#c9f2c7', '#aceca1', '#96be8c', '#629460', '#243119', '#fa8334', '#388697', '#271033', '#30011e'],
        ['#808d8e', '#766c7f', '#947eb0', '#a3a5c3', '#a9d2d5', '#ff5a5f', '#f3a712', '#eec584', '#122c34'],
        ['#54457f', '#ac7b84', '#4c243b', '#b84a62', '#f5a6e6', '#638475', '#90e39a', '#ddf093', '#8b9556'],
    ], [
        ['#d6f8d6', '#7fc6a4', '#5d737e', '#55505c', '#faf33e', '#3b252c', '#d6bbc0', '#d0a3bf', '#a77464', '#88292f'],
        ['#ff4d80', '#ff3e41', '#df367c', '#883955', '#4c3549', '#dde8b9', '#e8d2ae', '#acbdba', '#2e2f2f', '#051014'],
        ['#c9daea', '#03f7eb', '#00b295', '#191516', '#ab2346', '#0b5d1e', '#053b06', '#000000', '#51344d', '#6f5060'],
        ['#ca2e55', '#ffe0b5', '#8a6552', '#462521', '#bdb246', '#69a197', '#000000', '#1b2d2a', '#104547', '#6cd4ff'],
        ['#010001', '#2b0504', '#874000', '#bc5f04', '#f4442e', '#acf39d', '#9cfffa', '#e3b5a4', '#87bcde', '#cff27e'],
        ['#faa275', '#ff8c61', '#ce6a85', '#985277', '#5c374c', '#0d3b66', '#4a2545', '#000001', '#90aa86', '#461220'],
        ['#c4b7cb', '#bbc7ce', '#bfedef', '#98e2c6', '#545c52', '#2e4052', '#ffc857', '#412234', '#07004d', '#564e58'],
    ]
];

function round(num) {
    return Math.round(num * 100) / 100;
}

function randomSettings(bbox = false) {
    let svgSettings = {};
    if (bbox) {
        if (Math.random() < 0.4) {
            svgSettings['fill'] = 'color'
        };
        if (Math.random() < 0.1) {
            svgSettings['fill-opacity'] = round(Math.random() * 0.6 + 0.4);
        };
        if (Math.random() < 0.3) {
            if (Math.random() < 0.1) {
                svgSettings['scale'] = round(Math.random() * 3 + 1);
            } else {
                svgSettings['scale'] = round(Math.random());
            }
        }
        if (Math.random() < 0.2) {
            svgSettings['rx'] = Math.round(Math.random() * 100) / 100;
            svgSettings['ry'] = Math.round(Math.random() * 100) / 100;
            if (Math.random() < 0.8) {
                svgSettings['ry'] = svgSettings['rx'];
            }
        }
    }
    if (Math.random() < 0.4) {
        svgSettings['stroke'] = 'color';
    }
    if (Math.random() < 0.1) {
        if (Math.random() < 0.5) {
            svgSettings['stroke-linecap'] = 'butt';
        } else {
            svgSettings['stroke-linecap'] = 'square';
        }
    }
    if (Math.random() < 0.4) {
        svgSettings['stroke-width'] = round(Math.random());
    }
    if (Math.random() < 0.4) {
        svgSettings['stroke-opacity'] = round(Math.random() * 0.6 + 0.4);
    }
    return svgSettings;
}

function getRandomSettings() {
    let settings = [];
    settings.push(["default settings",
        { 'background': 'color', 'fill': 'none', 'fill-opacity': 1, 'stroke': 'color', 'stroke-linecap': 'round', 'stroke-width': 0.3, 'stroke-opacity': 1, 'scale': 0.85, 'rx': 0.1, 'ry': 0.1 },
    ]);

    if (Math.random() < 0.8) {
        settings.push(["tiles", { 'fill': 'color', 'stroke': 'color', 'stroke-width': 0.15 }, { 'deny': [], 'scale': 0.7 }])
    }

    const SETTING_NAMES = ["belts", "underground-belts", "pipes", "underground-pipes", "heat-pipes", "inserters", "rails", "power-lines", "green-wire-lines", "red-wire-lines"];
    let temp_settings = [];

    const numSettings = Math.floor(Math.random() * 6);
    for (let i = 0; i < numSettings; i++) {
        const settingName = SETTING_NAMES[Math.floor(Math.random() * SETTING_NAMES.length)];
        const settings = randomSettings(false);
        temp_settings.push([settingName, settings]);
    }

    const bboxCount = Math.floor(Math.random() * 5);
    const genericBuildingTerms = Object.keys(buildingGenericTerms);
    const buildingTerms = Object.keys(entityNameToProperties);
    const allTerms = [...genericBuildingTerms, ...genericBuildingTerms, ...buildingTerms];

    for (let i = 0; i < bboxCount; i++) {
        const buildingTermCount = Math.floor(Math.random() * 5) + 1;
        const group = shuffleArray([...allTerms]).slice(0, buildingTermCount);
        const bboxGroupType = Math.random() < 0.8 ? "allow" : "deny";
        const settings = randomSettings(true);
        temp_settings.push(["bbox", { [bboxGroupType]: group, ...settings }]);
    }

    settings = [...settings, ...shuffleArray(temp_settings)];

    // Replace any "color" values with incrementing hex colors
    let noneColorCounter = 0;
    for (let s of settings) {
        if (typeof s[1] === 'object' && s[1] !== null) {
            for (let key of ['stroke', 'fill', 'background']) {
                if (key in s[1] && s[1][key] === 'color') {
                    const hexColor = '#' + noneColorCounter.toString(16).padStart(6, '0');
                    s[1][key] = hexColor;
                    noneColorCounter++;
                }
            }
        }
    }

    return settingsChangeColors(settings, 10, true);
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function settingsChangeColors(settings, colorCount = null, changeBackground = true) {
    settings = deepCopy(settings);
    const originalColors = {};
    let keysThatHaveAColor = ["stroke", "fill"];
    if (changeBackground) {
        keysThatHaveAColor.push("background");
    }

    for (let s of settings) {
        // Only check for stroke/fill if s[1] is an object and not null
        if (typeof s[1] === 'object' && s[1] !== null) {
            for (let key of keysThatHaveAColor) {
                if (key in s[1] && s[1][key] !== "none") {
                    if (!(s[1][key] in originalColors)) {
                        originalColors[s[1][key]] = [[s[1], key]];
                    } else {
                        originalColors[s[1][key]].push([s[1], key]);
                    }
                }
            }
        }
    }

    const originalColorsList = Object.keys(originalColors);
    shuffleArray(originalColorsList);

    if (colorCount === null) {
        colorCount = Math.min(10, originalColorsList.length);
    } else {
        colorCount = Math.min(colorCount, originalColorsList.length);
    }
    colorCount = Math.min(10, colorCount);

    const paletteIndex = colorCount - 2;
    const palettes = PREDEFINED_COLOR_PALETTES[paletteIndex];
    const colorPalette = [...palettes[Math.floor(Math.random() * palettes.length)]];
    shuffleArray(colorPalette);

    for (let i = 0; i < originalColorsList.length; i++) {
        const originalColor = originalColorsList[i];
        for (let [entry, key] of originalColors[originalColor]) {
            entry[key] = colorPalette[i % colorPalette.length];
        }
    }

    return settings;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// This file is generated by get_items.py

const entityNameToProperties = {

    // Group: Combat
    // Subgroup: defensive-structure
    "gate": { 'genericTerms': ['combat', 'defensive-structure'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.58, 0.58] },
    "land-mine": { 'genericTerms': ['combat', 'defensive-structure'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.8, 0.8] },
    "radar": { 'genericTerms': ['combat', 'defensive-structure'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "stone-wall": { 'genericTerms': ['combat', 'defensive-structure'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.58, 0.58] },
    // Subgroup: turret
    "artillery-turret": { 'genericTerms': ['combat', 'turret'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "flamethrower-turret": { 'genericTerms': ['combat', 'turret'], 'size': [2, 3], 'selection_size': [2, 3.0], 'collision_size': [1.4, 2.4] },
    "gun-turret": { 'genericTerms': ['combat', 'turret'], 'size': [2, 2], 'selection_size': [2, 2], 'collision_size': [1.4, 1.4] },
    "laser-turret": { 'genericTerms': ['combat', 'turret'], 'size': [2, 2], 'selection_size': [2, 2], 'collision_size': [1.4, 1.4] },
    "railgun-turret": { 'genericTerms': ['combat', 'turret'], 'size': [3, 4], 'selection_size': [3.0, 5.0], 'collision_size': [2.82, 4.0] },
    "rocket-turret": { 'genericTerms': ['combat', 'turret'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "tesla-turret": { 'genericTerms': ['combat', 'turret'], 'size': [4, 4], 'selection_size': [4, 4], 'collision_size': [3.4, 3.4] },

    // Group: Logistics
    // Subgroup: belt
    "express-loader": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 2], 'selection_size': [1.0, 2], 'collision_size': [0.8, 1.8] },
    "express-splitter": { 'genericTerms': ['logistics', 'belt'], 'size': [2, 1], 'selection_size': [1.8, 1.0], 'collision_size': [1.8, 0.8] },
    "express-transport-belt": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.8, 0.8] },
    "express-underground-belt": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.8, 0.8] },
    "fast-loader": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 2], 'selection_size': [1.0, 2], 'collision_size': [0.8, 1.8] },
    "fast-splitter": { 'genericTerms': ['logistics', 'belt'], 'size': [2, 1], 'selection_size': [1.8, 1.0], 'collision_size': [1.8, 0.8] },
    "fast-transport-belt": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.8, 0.8] },
    "fast-underground-belt": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.8, 0.8] },
    "loader": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 2], 'selection_size': [1.0, 2], 'collision_size': [0.8, 1.8] },
    "splitter": { 'genericTerms': ['logistics', 'belt'], 'size': [2, 1], 'selection_size': [1.8, 1.0], 'collision_size': [1.8, 0.8] },
    "transport-belt": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.8, 0.8] },
    "turbo-loader": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 2], 'selection_size': [1.0, 2], 'collision_size': [0.8, 1.8] },
    "turbo-splitter": { 'genericTerms': ['logistics', 'belt'], 'size': [2, 1], 'selection_size': [1.8, 1.0], 'collision_size': [1.8, 0.8] },
    "turbo-transport-belt": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.8, 0.8] },
    "turbo-underground-belt": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.8, 0.8] },
    "underground-belt": { 'genericTerms': ['logistics', 'belt'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.8, 0.8] },
    // Subgroup: circuit-network
    "arithmetic-combinator": { 'genericTerms': ['logistics', 'circuit-network'], 'size': [1, 2], 'selection_size': [1.0, 2], 'collision_size': [0.7, 1.3] },
    "constant-combinator": { 'genericTerms': ['logistics', 'circuit-network'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.7, 0.7] },
    "decider-combinator": { 'genericTerms': ['logistics', 'circuit-network'], 'size': [1, 2], 'selection_size': [1.0, 2], 'collision_size': [0.7, 1.3] },
    "display-panel": { 'genericTerms': ['logistics', 'circuit-network'], 'size': [1, 1], 'selection_size': [1.0, 1.15], 'collision_size': [0.58, 0.58] },
    "power-switch": { 'genericTerms': ['logistics', 'circuit-network'], 'size': [2, 2], 'selection_size': [2, 2], 'collision_size': [1.4, 1.4] },
    "programmable-speaker": { 'genericTerms': ['logistics', 'circuit-network'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.6, 0.6] },
    "selector-combinator": { 'genericTerms': ['logistics', 'circuit-network'], 'size': [1, 2], 'selection_size': [1.0, 2], 'collision_size': [0.7, 1.3] },
    "small-lamp": { 'genericTerms': ['logistics', 'circuit-network'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.3, 0.3] },
    // Subgroup: energy-pipe-distribution
    "big-electric-pole": { 'genericTerms': ['logistics', 'energy-pipe-distribution'], 'size': [2, 2], 'selection_size': [2, 2], 'collision_size': [1.3, 1.3] },
    "medium-electric-pole": { 'genericTerms': ['logistics', 'energy-pipe-distribution'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.3, 0.3] },
    "pipe": { 'genericTerms': ['logistics', 'energy-pipe-distribution'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.58, 0.58] },
    "pipe-to-ground": { 'genericTerms': ['logistics', 'energy-pipe-distribution'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.58, 0.49] },
    "pump": { 'genericTerms': ['logistics', 'energy-pipe-distribution'], 'size': [1, 2], 'selection_size': [1.0, 2], 'collision_size': [0.58, 1.8] },
    "small-electric-pole": { 'genericTerms': ['logistics', 'energy-pipe-distribution'], 'size': [1, 1], 'selection_size': [0.8, 0.8], 'collision_size': [0.3, 0.3] },
    "substation": { 'genericTerms': ['logistics', 'energy-pipe-distribution'], 'size': [2, 2], 'selection_size': [2, 2], 'collision_size': [1.4, 1.4] },
    // Subgroup: inserter
    "bulk-inserter": { 'genericTerms': ['logistics', 'inserter'], 'size': [1, 1], 'selection_size': [0.8, 0.8], 'collision_size': [0.3, 0.3] },
    "burner-inserter": { 'genericTerms': ['logistics', 'inserter'], 'size': [1, 1], 'selection_size': [0.8, 0.8], 'collision_size': [0.3, 0.3] },
    "fast-inserter": { 'genericTerms': ['logistics', 'inserter'], 'size': [1, 1], 'selection_size': [0.8, 0.8], 'collision_size': [0.3, 0.3] },
    "inserter": { 'genericTerms': ['logistics', 'inserter'], 'size': [1, 1], 'selection_size': [0.8, 0.8], 'collision_size': [0.3, 0.3] },
    "long-handed-inserter": { 'genericTerms': ['logistics', 'inserter'], 'size': [1, 1], 'selection_size': [0.8, 0.8], 'collision_size': [0.3, 0.3] },
    "stack-inserter": { 'genericTerms': ['logistics', 'inserter'], 'size': [1, 1], 'selection_size': [0.8, 0.8], 'collision_size': [0.3, 0.3] },
    // Subgroup: logistic-network
    "active-provider-chest": { 'genericTerms': ['logistics', 'logistic-network'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.7, 0.7] },
    "buffer-chest": { 'genericTerms': ['logistics', 'logistic-network'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.7, 0.7] },
    "construction-robot": { 'genericTerms': ['logistics', 'logistic-network'], 'size': [0, 0], 'selection_size': [1.0, 1.0], 'collision_size': [0, 0] },
    "logistic-robot": { 'genericTerms': ['logistics', 'logistic-network'], 'size': [0, 0], 'selection_size': [1.0, 1.0], 'collision_size': [0, 0] },
    "passive-provider-chest": { 'genericTerms': ['logistics', 'logistic-network'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.7, 0.7] },
    "requester-chest": { 'genericTerms': ['logistics', 'logistic-network'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.7, 0.7] },
    "roboport": { 'genericTerms': ['logistics', 'logistic-network'], 'size': [4, 4], 'selection_size': [4, 4], 'collision_size': [3.4, 3.4] },
    "storage-chest": { 'genericTerms': ['logistics', 'logistic-network'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.7, 0.7] },
    // Subgroup: storage
    "iron-chest": { 'genericTerms': ['logistics', 'storage'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.7, 0.7] },
    "steel-chest": { 'genericTerms': ['logistics', 'storage'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.7, 0.7] },
    "storage-tank": { 'genericTerms': ['logistics', 'storage'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.6, 2.6] },
    "wooden-chest": { 'genericTerms': ['logistics', 'storage'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.7, 0.7] },
    // Subgroup: train-transport
    "curved-rail-a": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [1, 1], 'collision_size': [1, 1] },
    "curved-rail-b": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [1, 1], 'collision_size': [1, 1] },
    "elevated-curved-rail-a": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [1, 1], 'collision_size': [1, 1] },
    "elevated-curved-rail-b": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [1, 1], 'collision_size': [1, 1] },
    "elevated-half-diagonal-rail": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [1, 1], 'collision_size': [1, 1] },
    "elevated-straight-rail": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [1, 1], 'collision_size': [1, 1] },
    "half-diagonal-rail": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [1, 1], 'collision_size': [1, 1] },
    "rail-chain-signal": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.4, 0.4] },
    "rail-ramp": { 'genericTerms': ['logistics', 'train-transport'], 'size': [4, 16], 'selection_size': [3.4, 1.6], 'collision_size': [3.6, 15.6] },
    "rail-signal": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [0.9, 1.3], 'collision_size': [0.4, 0.4] },
    "rail-support": { 'genericTerms': ['logistics', 'train-transport'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.78, 2.78] },
    "straight-rail": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [1, 1], 'collision_size': [1, 1] },
    "train-stop": { 'genericTerms': ['logistics', 'train-transport'], 'size': [1, 1], 'selection_size': [1.8, 1.8], 'collision_size': [1.0, 1.0] },

    // Group: Production
    // Subgroup: agriculture
    "agricultural-tower": { 'genericTerms': ['production', 'agriculture'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "biochamber": { 'genericTerms': ['production', 'agriculture'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "captive-biter-spawner": { 'genericTerms': ['production', 'agriculture'], 'size': [5, 5], 'selection_size': [5.0, 5.0], 'collision_size': [4.4, 4.4] },
    // Subgroup: energy
    "accumulator": { 'genericTerms': ['production', 'energy'], 'size': [2, 2], 'selection_size': [2, 2], 'collision_size': [1.8, 1.8] },
    "boiler": { 'genericTerms': ['production', 'energy'], 'size': [3, 2], 'selection_size': [3.0, 2], 'collision_size': [2.58, 1.58] },
    "fusion-generator": { 'genericTerms': ['production', 'energy'], 'size': [3, 5], 'selection_size': [3.0, 5.0], 'collision_size': [2.8, 4.8] },
    "fusion-reactor": { 'genericTerms': ['production', 'energy'], 'size': [6, 6], 'selection_size': [6, 6], 'collision_size': [5.8, 5.8] },
    "heat-exchanger": { 'genericTerms': ['production', 'energy'], 'size': [3, 2], 'selection_size': [3.0, 2], 'collision_size': [2.58, 1.58] },
    "heat-pipe": { 'genericTerms': ['production', 'energy'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.6, 0.6] },
    "nuclear-reactor": { 'genericTerms': ['production', 'energy'], 'size': [5, 5], 'selection_size': [5.0, 5.0], 'collision_size': [4.4, 4.4] },
    "solar-panel": { 'genericTerms': ['production', 'energy'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.8, 2.8] },
    "steam-engine": { 'genericTerms': ['production', 'energy'], 'size': [3, 5], 'selection_size': [3.0, 5.0], 'collision_size': [2.5, 4.7] },
    "steam-turbine": { 'genericTerms': ['production', 'energy'], 'size': [3, 5], 'selection_size': [3.0, 5.0], 'collision_size': [2.5, 4.7] },
    // Subgroup: environmental-protection
    "heating-tower": { 'genericTerms': ['production', 'environmental-protection'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.5, 2.5] },
    "lightning-collector": { 'genericTerms': ['production', 'environmental-protection'], 'size': [2, 2], 'selection_size': [2, 2], 'collision_size': [1.4, 1.4] },
    "lightning-rod": { 'genericTerms': ['production', 'environmental-protection'], 'size': [1, 1], 'selection_size': [1.0, 1.0], 'collision_size': [0.3, 0.3] },
    // Subgroup: extraction-machine
    "big-mining-drill": { 'genericTerms': ['production', 'extraction-machine'], 'size': [5, 5], 'selection_size': [5.0, 5.0], 'collision_size': [4.7, 4.7] },
    "burner-mining-drill": { 'genericTerms': ['production', 'extraction-machine'], 'size': [2, 2], 'selection_size': [2, 2], 'collision_size': [1.4, 1.4] },
    "electric-mining-drill": { 'genericTerms': ['production', 'extraction-machine'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.7, 2.7] },
    "offshore-pump": { 'genericTerms': ['production', 'extraction-machine'], 'size': [2, 2], 'selection_size': [1.2, 1.98], 'collision_size': [1.2, 1.35] },
    "pumpjack": { 'genericTerms': ['production', 'extraction-machine'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    // Subgroup: module
    "beacon": { 'genericTerms': ['production', 'module'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    // Subgroup: production-machine
    "assembling-machine-1": { 'genericTerms': ['production', 'production-machine'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "assembling-machine-2": { 'genericTerms': ['production', 'production-machine'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "assembling-machine-3": { 'genericTerms': ['production', 'production-machine'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "biolab": { 'genericTerms': ['production', 'production-machine'], 'size': [5, 5], 'selection_size': [5.0, 5.0], 'collision_size': [4.4, 4.4] },
    "centrifuge": { 'genericTerms': ['production', 'production-machine'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "chemical-plant": { 'genericTerms': ['production', 'production-machine'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "cryogenic-plant": { 'genericTerms': ['production', 'production-machine'], 'size': [5, 5], 'selection_size': [5.0, 5.0], 'collision_size': [4.8, 4.8] },
    "electromagnetic-plant": { 'genericTerms': ['production', 'production-machine'], 'size': [4, 4], 'selection_size': [4, 4], 'collision_size': [3.4, 3.4] },
    "lab": { 'genericTerms': ['production', 'production-machine'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "oil-refinery": { 'genericTerms': ['production', 'production-machine'], 'size': [5, 5], 'selection_size': [5.0, 5.0], 'collision_size': [4.8, 4.8] },
    // Subgroup: smelting-machine
    "electric-furnace": { 'genericTerms': ['production', 'smelting-machine'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "foundry": { 'genericTerms': ['production', 'smelting-machine'], 'size': [5, 5], 'selection_size': [5.0, 5.0], 'collision_size': [4.4, 4.4] },
    "recycler": { 'genericTerms': ['production', 'smelting-machine'], 'size': [2, 4], 'selection_size': [1.8, 3.7], 'collision_size': [1.4, 3.4] },
    "steel-furnace": { 'genericTerms': ['production', 'smelting-machine'], 'size': [2, 2], 'selection_size': [1.6, 2], 'collision_size': [1.4, 1.4] },
    "stone-furnace": { 'genericTerms': ['production', 'smelting-machine'], 'size': [2, 2], 'selection_size': [1.6, 2], 'collision_size': [1.4, 1.4] },

    // Group: Space
    // Subgroup: space-interactors
    "cargo-landing-pad": { 'genericTerms': ['space', 'space-interactors'], 'size': [8, 8], 'selection_size': [8, 8], 'collision_size': [7.8, 7.8] },
    "rocket-silo": { 'genericTerms': ['space', 'space-interactors'], 'size': [9, 9], 'selection_size': [9.0, 9.0], 'collision_size': [8.4, 8.4] },
    // Subgroup: space-platform
    "asteroid-collector": { 'genericTerms': ['space', 'space-platform'], 'size': [3, 3], 'selection_size': [3.0, 3.0], 'collision_size': [2.4, 2.4] },
    "cargo-bay": { 'genericTerms': ['space', 'space-platform'], 'size': [4, 4], 'selection_size': [4, 4], 'collision_size': [3.8, 3.8] },
    "crusher": { 'genericTerms': ['space', 'space-platform'], 'size': [2, 3], 'selection_size': [2, 3.0], 'collision_size': [1.4, 2.4] },
    "thruster": { 'genericTerms': ['space', 'space-platform'], 'size': [4, 5], 'selection_size': [4, 8.0], 'collision_size': [3.4, 4.4] },
    // Subgroup: space-related
    "space-platform-hub": { 'genericTerms': ['space', 'space-related'], 'size': [8, 8], 'selection_size': [8, 8], 'collision_size': [7.8, 7.8] },
}

const buildingGenericTerms = {
    "agriculture": ["agricultural-tower", "biochamber", "captive-biter-spawner"],
    "belts": ["express-loader", "express-splitter", "express-transport-belt", "express-underground-belt", "fast-loader", "fast-splitter", "fast-transport-belt", "fast-underground-belt", "loader", "splitter", "transport-belt", "turbo-loader", "turbo-splitter", "turbo-transport-belt", "turbo-underground-belt", "underground-belt"],
    "circuit-network": ["arithmetic-combinator", "constant-combinator", "decider-combinator", "display-panel", "power-switch", "programmable-speaker", "selector-combinator", "small-lamp"],
    "combat": ["artillery-turret", "flamethrower-turret", "gate", "gun-turret", "land-mine", "laser-turret", "radar", "railgun-turret", "rocket-turret", "stone-wall", "tesla-turret"],
    "defensive-structure": ["gate", "land-mine", "radar", "stone-wall"],
    "energy": ["accumulator", "boiler", "fusion-generator", "fusion-reactor", "heat-exchanger", "heat-pipe", "nuclear-reactor", "solar-panel", "steam-engine", "steam-turbine"],
    "energy-pipe-distribution": ["big-electric-pole", "medium-electric-pole", "pipe", "pipe-to-ground", "pump", "small-electric-pole", "substation"],
    "environmental-protection": ["heating-tower", "lightning-collector", "lightning-rod"],
    "extraction-machine": ["big-mining-drill", "burner-mining-drill", "electric-mining-drill", "offshore-pump", "pumpjack"],
    "inserters": ["bulk-inserter", "burner-inserter", "fast-inserter", "inserter", "long-handed-inserter", "stack-inserter"],
    "labs": ["lab", "biolab"],
    "logistic-network": ["active-provider-chest", "buffer-chest", "construction-robot", "logistic-robot", "passive-provider-chest", "requester-chest", "roboport", "storage-chest"],
    "logistics": ["active-provider-chest", "arithmetic-combinator", "big-electric-pole", "buffer-chest", "bulk-inserter", "burner-inserter", "constant-combinator", "construction-robot", "curved-rail-a", "curved-rail-b", "decider-combinator", "display-panel", "elevated-curved-rail-a", "elevated-curved-rail-b", "elevated-half-diagonal-rail", "elevated-straight-rail", "express-loader", "express-splitter", "express-transport-belt", "express-underground-belt", "fast-inserter", "fast-loader", "fast-splitter", "fast-transport-belt", "fast-underground-belt", "half-diagonal-rail", "inserter", "iron-chest", "loader", "logistic-robot", "long-handed-inserter", "medium-electric-pole", "passive-provider-chest", "pipe", "pipe-to-ground", "power-switch", "programmable-speaker", "pump", "rail-chain-signal", "rail-ramp", "rail-signal", "rail-support", "requester-chest", "roboport", "selector-combinator", "small-electric-pole", "small-lamp", "splitter", "stack-inserter", "steel-chest", "storage-chest", "storage-tank", "straight-rail", "substation", "train-stop", "transport-belt", "turbo-loader", "turbo-splitter", "turbo-transport-belt", "turbo-underground-belt", "underground-belt", "wooden-chest"],
    "module": ["beacon"],
    "pipes": ["pipe", "pipe-to-ground"],
    "power-distribution": ["big-electric-pole", "medium-electric-pole", "small-electric-pole", "substation", "power-switch"],
    "power-generation": ["boiler", "steam-engine", "solar-panel", "nuclear-reactor", "fusion-generator", "fusion-reactor", "steam-turbine"],
    "production": ["accumulator", "agricultural-tower", "assembling-machine-1", "assembling-machine-2", "assembling-machine-3", "beacon", "big-mining-drill", "biochamber", "biolab", "boiler", "burner-mining-drill", "captive-biter-spawner", "centrifuge", "chemical-plant", "cryogenic-plant", "electric-furnace", "electric-mining-drill", "electromagnetic-plant", "foundry", "fusion-generator", "fusion-reactor", "heat-exchanger", "heat-pipe", "heating-tower", "lab", "lightning-collector", "lightning-rod", "nuclear-reactor", "offshore-pump", "oil-refinery", "pumpjack", "recycler", "solar-panel", "steam-engine", "steam-turbine", "steel-furnace", "stone-furnace"],
    "production-machine": ["assembling-machine-1", "assembling-machine-2", "assembling-machine-3", "biolab", "centrifuge", "chemical-plant", "cryogenic-plant", "electromagnetic-plant", "lab", "oil-refinery"],
    "rails": ["curved-rail-a", "curved-rail-b", "elevated-curved-rail-a", "elevated-curved-rail-b", "elevated-half-diagonal-rail", "elevated-straight-rail", "half-diagonal-rail", "rail-chain-signal", "rail-ramp", "rail-signal", "rail-support", "straight-rail", "train-stop"],
    "robotic-logistics": ["roboport", "active-provider-chest", "buffer-chest", "passive-provider-chest", "requester-chest", "storage-chest"],
    "smelting-machine": ["electric-furnace", "foundry", "recycler", "steel-furnace", "stone-furnace"],
    "space": ["asteroid-collector", "cargo-bay", "cargo-landing-pad", "crusher", "rocket-silo", "space-platform-hub", "thruster"],
    "space-interactors": ["cargo-landing-pad", "rocket-silo"],
    "space-platform": ["asteroid-collector", "cargo-bay", "crusher", "thruster"],
    "space-related": ["space-platform-hub"],
    "storage": ["iron-chest", "steel-chest", "storage-tank", "wooden-chest"],
    "turret": ["artillery-turret", "flamethrower-turret", "gun-turret", "laser-turret", "railgun-turret", "rocket-turret", "tesla-turret"],
}

const itemToPipeTargetPositions = {
    "assembling-machine-2": [[[0, -1], [0, -2]], [[0, 1], [0, 2]]],
    "assembling-machine-3": [[[0, -1], [0, -2]], [[0, 1], [0, 2]]],
    "big-mining-drill": [[[-2, -1], [-3, -1]], [[2, -1], [3, -1]], [[1, 2], [1, 3]], [[-1, 2], [-1, 3]]],
    "biochamber": [[[-1, -1], [-1, -2]], [[1, -1], [1, -2]], [[1, 1], [1, 2]], [[-1, 1], [-1, 2]]],
    "boiler": [[[-1, 0.5], [-2, 0.5]], [[1, 0.5], [2, 0.5]], [[0, -0.5], [0, -1.5]]],
    "chemical-plant": [[[-1, -1], [-1, -2]], [[1, -1], [1, -2]], [[-1, 1], [-1, 2]], [[1, 1], [1, 2]]],
    "cryogenic-plant": [[[-2, 2], [-2, 3]], [[0, 2], [0, 3]], [[2, 2], [2, 3]], [[-2, -2], [-2, -3]], [[0, -2], [0, -3]], [[2, -2], [2, -3]]],
    "electric-mining-drill": [[[-1, 0], [-2, 0]], [[1, 0], [2, 0]], [[0, 1], [0, 2]]],
    "electromagnetic-plant": [[[-1.5, 0.5], [-2.5, 0.5]], [[1.5, -0.5], [2.5, -0.5]], [[0.5, 1.5], [0.5, 2.5]], [[-0.5, -1.5], [-0.5, -2.5]]],
    "flamethrower-turret": [[[-0.5, 1], [-1.5, 1]], [[0.5, 1], [1.5, 1]]],
    "foundry": [[[-1, 2], [-1, 3]], [[1, 2], [1, 3]], [[-1, -2], [-1, -3]], [[1, -2], [1, -3]]],
    "fusion-generator": [[[-1, 2], [-1, 3]], [[1, 2], [1, 3]], [[0, -2], [0, -3]], [[-1, 0], [-2, 0]], [[1, 0], [2, 0]], [[-1, -1], [-2, -1]], [[1, -1], [2, -1]], [[-1, -2], [-1, -3]], [[1, -2], [1, -3]]],
    "fusion-reactor": [[[-2.5, -1.5], [-3.5, -1.5]], [[-2.5, 1.5], [-3.5, 1.5]], [[2.5, -1.5], [3.5, -1.5]], [[2.5, 1.5], [3.5, 1.5]], [[-1.5, 2.5], [-1.5, 3.5]], [[1.5, 2.5], [1.5, 3.5]], [[-1.5, -2.5], [-1.5, -3.5]], [[1.5, -2.5], [1.5, -3.5]]],
    "heat-exchanger": [[[-1, 0.5], [-2, 0.5]], [[1, 0.5], [2, 0.5]], [[0, -0.5], [0, -1.5]]],
    "offshore-pump": [[[0, 0], [0, 1]]],
    "oil-refinery": [[[-1, 2], [-1, 3]], [[1, 2], [1, 3]], [[-2, -2], [-2, -3]], [[0, -2], [0, -3]], [[2, -2], [2, -3]]],
    "pipe": [[[0, 0], [0, -1]], [[0, 0], [1, 0]], [[0, 0], [0, 1]], [[0, 0], [-1, 0]]],
    "pipe-to-ground": [[[0, 0], [0, -1]], [[0, 0], [0, 1]]],
    "pump": [[[0, -0.5], [0, -1.5]], [[0, 0.5], [0, 1.5]]],
    "pumpjack": [[[1, -1], [1, -2]]],
    "steam-engine": [[[0, 2], [0, 3]], [[0, -2], [0, -3]]],
    "steam-turbine": [[[0, 2], [0, 3]], [[0, -2], [0, -3]]],
    "storage-tank": [[[-1, -1], [-1, -2]], [[1, 1], [2, 1]], [[1, 1], [1, 2]], [[-1, -1], [-2, -1]]],
    "thruster": [[[-1.5, -2], [-2.5, -2]], [[1.5, 0], [2.5, 0]], [[1.5, -2], [2.5, -2]], [[-1.5, 0], [-2.5, 0]]],
}

const itemToHeatTargetPositions = {
    "heat-exchanger": [[[0, 0.5], [0, 1.5]]],
    "heat-pipe": [[[0, 0], [0, -1]], [[0, 0], [1, 0]], [[0, 0], [0, 1]], [[0, 0], [-1, 0]]],
    "heating-tower": [[[0, -1], [0, -2]], [[1, 0], [2, 0]], [[0, 1], [0, 2]], [[-1, 0], [-2, 0]]],
    "nuclear-reactor": [[[-2, -2], [-2, -3]], [[0, -2], [0, -3]], [[2, -2], [2, -3]], [[2, -2], [3, -2]], [[2, 0], [3, 0]], [[2, 2], [3, 2]], [[2, 2], [2, 3]], [[0, 2], [0, 3]], [[-2, 2], [-2, 3]], [[-2, 2], [-3, 2]], [[-2, 0], [-3, 0]], [[-2, -2], [-3, -2]]],
}

const fluidRecipes = {
    "acid-neutralisation": true,
    "advanced-oil-processing": true,
    "advanced-thruster-fuel": true,
    "advanced-thruster-oxidizer": true,
    "ammonia-rocket-fuel": true,
    "ammoniacal-solution-separation": true,
    "basic-oil-processing": true,
    "battery": true,
    "big-mining-drill": true,
    "biolubricant": true,
    "captive-biter-spawner": true,
    "carbon": true,
    "casting-copper": true,
    "casting-copper-cable": true,
    "casting-iron": true,
    "casting-iron-gear-wheel": true,
    "casting-iron-stick": true,
    "casting-low-density-structure": true,
    "casting-pipe": true,
    "casting-pipe-to-ground": true,
    "casting-steel": true,
    "coal-liquefaction": true,
    "coal-synthesis": true,
    "concrete": true,
    "concrete-from-molten-iron": true,
    "crude-oil-barrel": true,
    "cryogenic-science-pack": true,
    "electric-engine-unit": true,
    "electrolyte": true,
    "electromagnetic-science-pack": true,
    "empty-crude-oil-barrel": true,
    "empty-fluoroketone-cold-barrel": true,
    "empty-fluoroketone-hot-barrel": true,
    "empty-heavy-oil-barrel": true,
    "empty-light-oil-barrel": true,
    "empty-lubricant-barrel": true,
    "empty-petroleum-gas-barrel": true,
    "empty-sulfuric-acid-barrel": true,
    "empty-water-barrel": true,
    "explosives": true,
    "express-splitter": true,
    "express-transport-belt": true,
    "express-underground-belt": true,
    "fish-breeding": true,
    "flamethrower-ammo": true,
    "fluoroketone": true,
    "fluoroketone-cold-barrel": true,
    "fluoroketone-cooling": true,
    "fluoroketone-hot-barrel": true,
    "foundation": true,
    "foundry": true,
    "fusion-power-cell": true,
    "heavy-oil-barrel": true,
    "heavy-oil-cracking": true,
    "holmium-plate": true,
    "holmium-solution": true,
    "ice-melting": true,
    "ice-platform": true,
    "light-oil-barrel": true,
    "light-oil-cracking": true,
    "lightning-collector": true,
    "lithium": true,
    "lubricant": true,
    "lubricant-barrel": true,
    "metallurgic-science-pack": true,
    "molten-copper": true,
    "molten-copper-from-lava": true,
    "molten-iron": true,
    "molten-iron-from-lava": true,
    "overgrowth-jellynut-soil": true,
    "overgrowth-yumako-soil": true,
    "pentapod-egg": true,
    "petroleum-gas-barrel": true,
    "plastic-bar": true,
    "processing-unit": true,
    "quantum-processor": true,
    "railgun": true,
    "railgun-turret": true,
    "refined-concrete": true,
    "rocket-fuel": true,
    "rocket-fuel-from-jelly": true,
    "simple-coal-liquefaction": true,
    "solid-fuel-from-ammonia": true,
    "solid-fuel-from-heavy-oil": true,
    "solid-fuel-from-light-oil": true,
    "solid-fuel-from-petroleum-gas": true,
    "steam-condensation": true,
    "sulfur": true,
    "sulfuric-acid": true,
    "sulfuric-acid-barrel": true,
    "supercapacitor": true,
    "superconductor": true,
    "tesla-ammo": true,
    "tesla-turret": true,
    "teslagun": true,
    "thruster-fuel": true,
    "thruster-oxidizer": true,
    "tungsten-carbide": true,
    "tungsten-plate": true,
    "turbo-splitter": true,
    "turbo-transport-belt": true,
    "turbo-underground-belt": true,
    "water-barrel": true,
}

const artificialTilesSortedByLayer = [
    "landfill",
    "foundation",
    "stone-path",
    "concrete",
    "frozen-concrete",
    "hazard-concrete-left",
    "hazard-concrete-right",
    "space-platform-foundation",
    "frozen-hazard-concrete-left",
    "frozen-hazard-concrete-right",
    "refined-concrete",
    "frozen-refined-concrete",
    "refined-hazard-concrete-left",
    "refined-hazard-concrete-right",
    "frozen-refined-hazard-concrete-left",
    "frozen-refined-hazard-concrete-right",
    "ice-platform",
    "artificial-yumako-soil",
    "artificial-jellynut-soil",
    "overgrowth-yumako-soil",
    "overgrowth-jellynut-soil",
]

const DIRECTION_4_TO_OFFSET = [[0, -1], [1, 0], [0, 1], [-1, 0]];

const WireType = { GREEN_WIRE: 1, RED_WIRE: 2, COPPER_WIRE: 5 };

function getBlueprintList(encodedBlueprintStr) {
    // Remove the initial "0" character from the blueprint string
    const strippedStr = encodedBlueprintStr.slice(1);

    // Decode base64 to bytes
    const decodedData = atob(strippedStr);

    // Convert decoded string to Uint8Array for decompression
    const byteArray = new Uint8Array(decodedData.length);
    for (let i = 0; i < decodedData.length; i++) {
        byteArray[i] = decodedData.charCodeAt(i);
    }

    // Decompress using pako (zlib implementation)
    const decompressedData = pako.inflate(byteArray, { to: 'string' });

    // Parse JSON
    const rawBlueprintJson = JSON.parse(decompressedData);

    const blueprintNames = [];
    const blueprintJsons = [];
    getLabelsAndBlueprints(blueprintNames, blueprintJsons, rawBlueprintJson);

    return [blueprintNames, blueprintJsons];
}

function getLabelsAndBlueprints(blueprintNames, blueprintJsons, rawBlueprintJson) {
    if ("blueprint" in rawBlueprintJson) {
        blueprintNames.push(
            rawBlueprintJson.blueprint.label || ""
        );
        blueprintJsons.push(rawBlueprintJson.blueprint);
    }
    else if ("blueprint_book" in rawBlueprintJson) {
        for (const rawBlueprint of rawBlueprintJson.blueprint_book.blueprints) {
            getLabelsAndBlueprints(blueprintNames, blueprintJsons, rawBlueprint);
        }
    }
}

function processBlueprint(blueprintJson, bboxBorderNWSE = [3, 3, 3, 3]) {
    const blueprintJsonStr = JSON.stringify({ blueprint: blueprintJson });
    const compressedData = pako.deflate(blueprintJsonStr, { level: 9 });
    const encodedBlueprintStr = btoa(String.fromCharCode.apply(null, compressedData));

    if (!("entities" in blueprintJson)) {
        blueprintJson.entities = []
    }
    if (!("wires" in blueprintJson)) {
        blueprintJson.wires = [];
    }
    if (!("tiles" in blueprintJson)) {
        blueprintJson.tiles = [];
    } else {
        for (const tile of blueprintJson.tiles) {
            tile.pos = [tile.position.x + 0.5, tile.position.y + 0.5];
        }
    }

    getSimplifiedEntities(blueprintJson.entities, blueprintJson.version);
    const [bboxWidth, bboxHeight, posOffset] = getSvgSizeAndPosOffset(blueprintJson.entities, blueprintJson.tiles, bboxBorderNWSE);

    return {
        entities: blueprintJson.entities,
        wires: blueprintJson.wires,
        tiles: blueprintJson.tiles,
        bboxWidth: bboxWidth,
        bboxHeight: bboxHeight,
        posOffset: posOffset,
        encodedBlueprintStr: encodedBlueprintStr,
        cache: {}
    };
}

function getSimplifiedEntities(blueprintJsonEntities, blueprintJsonVersion) {
    for (const e of blueprintJsonEntities) {
        if (!("direction" in e)) {
            e.direction = 0;
        } else {
            // I'm not sure how blueprint versioning works exactly, but this seems to work for the blueprints I've tested
            const factorio_version_1 = (blueprintJsonVersion <= 300000000000000);
            if (factorio_version_1) {
                e.direction = parseInt(e.direction) * 2;
            } else {
                e.direction = parseInt(e.direction);
            }
        }
        // Convert position to array format
        e.pos = [e.position.x, e.position.y];

        if (e.name in entityNameToProperties) {
            const properties = entityNameToProperties[e.name];
            for (const bboxType of ["size", "selection_size", "collision_size"]) {
                if (bboxType in properties) {
                    let [sizeX, sizeY] = properties[bboxType];
                    if ((e.direction / 4) % 2 === 1) {
                        [sizeX, sizeY] = [sizeY, sizeX];
                    }

                    e["bbox_" + bboxType] = [
                        [e.pos[0] - sizeX / 2, e.pos[1] - sizeY / 2],
                        [e.pos[0] + sizeX / 2, e.pos[1] - sizeY / 2],
                        [e.pos[0] + sizeX / 2, e.pos[1] + sizeY / 2],
                        [e.pos[0] - sizeX / 2, e.pos[1] + sizeY / 2]
                    ]
                }
            }
        }
    }
}

function getSvgSizeAndPosOffset(entities, tiles, bboxBorderNWSE) {
    if (entities.length === 0 && tiles.length === 0) {
        return [1, 1];
    }

    const entityBboxes = entities.filter(e => "bbox_size" in e).map(e => e.bbox_size);
    const tilePositions = tiles.map(t => t.pos);

    const xValues = [
        ...entityBboxes.flatMap(box_size => box_size.map(point => point[0])),
        ...tilePositions.map(pos => pos[0]),
    ];
    const yValues = [
        ...entityBboxes.flatMap(box_size => box_size.map(point => point[1])),
        ...tilePositions.map(pos => pos[1]),
    ];

    // Calculate bounding box from both entity bboxes and tile positions
    const bbox = [
        Math.floor(Math.min(...xValues)), // minX
        Math.floor(Math.min(...yValues)), // minY
        Math.ceil(Math.max(...xValues)), // maxX
        Math.ceil(Math.max(...yValues))  // maxY
    ];

    // Apply border
    bbox[0] -= bboxBorderNWSE[1];
    bbox[1] -= bboxBorderNWSE[0];
    bbox[2] += bboxBorderNWSE[3];
    bbox[3] += bboxBorderNWSE[2];

    const bboxWidth = bbox[2] - bbox[0];
    const bboxHeight = bbox[3] - bbox[1];
    const posOffset = [-bbox[0], -bbox[1]];
    return [bboxWidth, bboxHeight, posOffset];
}

function getCurrentBlueprintEntityCount(currentBlueprint) {
    const entityCount = {};
    for (const entity of currentBlueprint.entities) {
        entityCount[entity.name] = (entityCount[entity.name] || 0) + 1;
    }
    for (const tile of currentBlueprint.tiles || []) {
        entityCount[tile.name] = (entityCount[tile.name] || 0) + 1;
    }
    return Object.entries(entityCount).sort((a, b) => b[1] - a[1]);
}

function getSVG(bboxWidth, bboxHeight, backgroundColor = "#dddddd", metadataStr = null, svgWidthInMm = 300, aspectRatio = null) {
    if (aspectRatio !== null) {
        const realRatio = bboxWidth / bboxHeight;
        const targetRatio = aspectRatio[0] / aspectRatio[1];

        let newBboxWidth = bboxWidth;
        let newBboxHeight = bboxHeight;
        let translate;

        if (realRatio < targetRatio) {
            newBboxWidth = targetRatio * bboxHeight;
            translate = [(newBboxWidth - bboxWidth) / 2, 0];
        } else {
            newBboxHeight = (1 / targetRatio) * bboxWidth;
            translate = [0, (newBboxHeight - bboxHeight) / 2];
        }

        bboxWidth = newBboxWidth;
        bboxHeight = newBboxHeight;
    }

    const dwg = {
        groupsToClose: 0,
        parts: [`<svg baseProfile="tiny" height="${svgWidthInMm * bboxHeight / bboxWidth}mm" version="1.2" viewBox="0,0,${bboxWidth},${bboxHeight}" width="${svgWidthInMm}mm" xmlns="http://www.w3.org/2000/svg" xmlns:ev="http://www.w3.org/2001/xml-events" xmlns:xlink="http://www.w3.org/1999/xlink">`]
    };

    if (metadataStr !== null) {
        dwg.parts.push(metadataStr);
    }

    if (aspectRatio !== null) {
        appendGroup(dwg, { transform: `translate(${translate[0]} ${translate[1]})` });
    }

    if (backgroundColor !== null) {
        dwg.parts.push(`<rect fill="${backgroundColor}" height="10000" width="10000" x="-100" y="-100" />`);
    }

    return dwg;
}

function preProcessDrawingSettings(settings) {
    function resolveBuildingGenericNames(buildNameList) {
        const buildingNameListWithoutGenericTerms = [];
        for (const name of buildNameList) {
            if (name in buildingGenericTerms) {
                buildingNameListWithoutGenericTerms.push(...buildingGenericTerms[name]);
            } else {
                buildingNameListWithoutGenericTerms.push(name);
            }
        }
        return [...new Set(buildingNameListWithoutGenericTerms)];
    }

    settings = JSON.parse(JSON.stringify(settings)); // Deep copy
    const processed_settings = [];
    for (let [settingName, settingProps] of settings) {
        if (settingProps === undefined) {
            settingProps = {};
        }
        if ("allow" in settingProps) {
            settingProps.allow = resolveBuildingGenericNames(settingProps.allow);
        } else if ("deny" in settingProps) {
            settingProps.deny = resolveBuildingGenericNames(settingProps.deny);
        }
        processed_settings.push([settingName, settingProps]);
    }
    return processed_settings;
}

function drawBlueprint(blueprint, settings, svgWidthInMm = 300, aspectRatio = null) {
    const metadataStr = `<metadata generated_with="https://piebro.github.io/factorio-blueprint-visualizer"><settings>${JSON.stringify(settings)}</settings><blueprint>${blueprint.encodedBlueprintStr}</blueprint></metadata>`;

    settings = preProcessDrawingSettings(settings);
    let background = "none";
    for (const [i, [settingName, svgSettings]] of settings.entries()) {
        if (settingName === "default settings") {
            background = svgSettings.background || background;
            delete svgSettings.background;
            break;
        }
    }
    const dwg = getSVG(blueprint.bboxWidth, blueprint.bboxHeight, background, metadataStr, svgWidthInMm, aspectRatio);
    let currentDefaultSettingProps = {};

    for (let [settingName, settingProps] of settings) {
        settingProps = { ...currentDefaultSettingProps, ...settingProps };
        if (settingName === "default settings") {
            // appendGroup(dwg, settingProps);
            currentDefaultSettingProps = settingProps;
            continue;
        } else if (settingName === "bbox") {
            drawEntitiesBbox(dwg, blueprint.entities, blueprint.posOffset, settingProps, "bbox_size");
            continue;
        } else if (settingName === "bbox-selection") {
            drawEntitiesBbox(dwg, blueprint.entities, blueprint.posOffset, settingProps, "bbox_selection_size");
            continue;
        } else if (settingName === "bbox-collision") {
            drawEntitiesBbox(dwg, blueprint.entities, blueprint.posOffset, settingProps, "bbox_collision_size");
            continue;
        } else if (settingName === "tiles") {
            drawTiles(dwg, blueprint.tiles, blueprint.posOffset, settingProps);
            continue;
        }
        let lines = null;
        if (settingName === "belts") {
            lines = getLinesBelt(blueprint.entities);
        } else if (settingName === "underground-belts") {
            lines = getLinesUndergroundBelt(blueprint.entities);
        } else if (settingName === "pipes") {
            lines = getLinesPipesOrHeatPipes(blueprint.entities, itemToPipeTargetPositions);
        } else if (settingName === "underground-pipes") {
            lines = getLinesUndergroundPipes(blueprint.entities);
        } else if (settingName === "heat-pipes") {
            lines = getLinesPipesOrHeatPipes(blueprint.entities, itemToHeatTargetPositions);
        } else if (settingName === "inserters") {
            lines = getLinesInserter(blueprint.entities);
        } else if (settingName === "rails") {
            lines = getLinesRails(blueprint.entities);
        } else if (settingName === "power-lines") {
            lines = getLinesWire(blueprint.entities, blueprint.wires, WireType.COPPER_WIRE);
        } else if (settingName === "green-wire-lines") {
            lines = getLinesWire(blueprint.entities, blueprint.wires, WireType.GREEN_WIRE);
        } else if (settingName === "red-wire-lines") {
            lines = getLinesWire(blueprint.entities, blueprint.wires, WireType.RED_WIRE);
        } else {
            continue;
        }
        blueprint.cache[settingName] = lines;
        drawLines(dwg, blueprint.cache[settingName], blueprint.posOffset, settingProps);
    }

    for (let i = 0; i < dwg.groupsToClose; i++) {
        dwg.parts.push('</g>');
    }
    dwg.parts.push('</svg>');
    return dwg.parts.join('');
}

function appendGroup(dwg, svgSetting) {
    dwg.parts.push('<g');
    appendSvgSetting(dwg, svgSetting);
    dwg.parts.push('>');
    dwg.groupsToClose += 1;
}

function drawLines(dwg, lines, posOffset, svgSetting) {
    dwg.parts.push('<path');
    appendSvgSetting(dwg, svgSetting);
    dwg.parts.push(' d="');
    for (const [p1, p2] of lines) {
        dwg.parts.push(`M${p1[0] + posOffset[0]} ${p1[1] + posOffset[1]} ${p2[0] + posOffset[0]} ${p2[1] + posOffset[1]}`);
    }
    dwg.parts.push('"/>');
}

function appendSvgSetting(dwg, svgSetting) {
    for (const [key, value] of Object.entries(svgSetting)) {
        if (["allow", "deny", "scale", "rx", "ry"].includes(key)) {
            continue;
        }
        dwg.parts.push(` ${key}="${value}"`);
    }
}

function drawRect(dwg, bbox, posOffset, scale, rx, ry) {
    if (scale !== undefined) {
        // Calculate center point
        const centerX = bbox.reduce((sum, point) => sum + point[0], 0) / 4;
        const centerY = bbox.reduce((sum, point) => sum + point[1], 0) / 4;

        // Scale points around center
        bbox = bbox.map(point => [
            centerX + (point[0] - centerX) * scale,
            centerY + (point[1] - centerY) * scale
        ]);
    }

    const minX = Math.min(...bbox.map(point => point[0]));
    const minY = Math.min(...bbox.map(point => point[1]));
    const width = Math.abs(bbox[1][0] - bbox[0][0]);
    const height = Math.abs(bbox[2][1] - bbox[1][1]);

    dwg.parts.push(`<rect x="${minX + posOffset[0]}" y="${minY + posOffset[1]}" width="${width}" height="${height}"`);

    if (rx !== undefined) {
        dwg.parts.push(` rx="${rx}"`);
    }
    if (ry !== undefined) {
        dwg.parts.push(` ry="${ry}"`);
    }

    dwg.parts.push('/>');
}

function drawEntitiesBbox(dwg, entities, posOffset, settingProps, bboxType) {
    let bboxEntities;
    if ("allow" in settingProps) {
        bboxEntities = entities.filter(e => settingProps.allow.includes(e.name));
    } else if ("deny" in settingProps) {
        bboxEntities = entities.filter(e => !settingProps.deny.includes(e.name));
    } else {
        bboxEntities = entities;
    }

    appendGroup(dwg, settingProps);
    for (const e of bboxEntities) {
        if (bboxType in e) {
            drawRect(dwg, e[bboxType], posOffset, settingProps.scale, settingProps.rx, settingProps.ry);
        }
    }
    dwg.groupsToClose -= 1;
    dwg.parts.push('</g>');
}

function getLinesBelt(entities) {
    function isOppositeDirection(dir1, dir2) {
        return (dir1 + 2) % 4 === dir2;
    }

    const entityNodes = {}
    const beltEntityNames = ["transport-belt", "fast-transport-belt", "express-transport-belt", "turbo-transport-belt"];
    const undergroundBeltEntityNames = ["underground-belt", "fast-underground-belt", "express-underground-belt", "turbo-underground-belt"];
    const splitterEntityNames = ["splitter", "fast-splitter", "express-splitter", "turbo-splitter"];
    const combinedEntityNames = [...beltEntityNames, ...undergroundBeltEntityNames, ...splitterEntityNames];

    const lines = []

    // Collect all nodes (belts, underground belts, and splitters)
    for (const e of entities) {
        if (!combinedEntityNames.includes(e.name)) {
            continue;
        }
        const dir = Math.floor(e.direction / 4);
        const offset = DIRECTION_4_TO_OFFSET[dir];

        if (splitterEntityNames.includes(e.name)) {
            // Handle splitter (create two nodes)
            const offset90 = DIRECTION_4_TO_OFFSET[(dir + 1) % 4];
            const offset270 = DIRECTION_4_TO_OFFSET[(dir + 3) % 4];

            // Create left and right positions
            const pos1 = [e.pos[0] + offset90[0] / 2, e.pos[1] + offset90[1] / 2];
            const pos2 = [e.pos[0] + offset270[0] / 2, e.pos[1] + offset270[1] / 2];
            const pos1Key = `${pos1[0]},${pos1[1]}`;
            const pos2Key = `${pos2[0]},${pos2[1]}`;

            const targetPos1 = [pos1[0] + offset[0], pos1[1] + offset[1]];
            const targetPos2 = [pos2[0] + offset[0], pos2[1] + offset[1]];

            entityNodes[pos1Key] = {
                pos: pos1,
                dir: dir,
                targetPos: targetPos1,
                targetPosKey: `${targetPos1[0]},${targetPos1[1]}`,
                is_underground_input: false
            };
            entityNodes[pos2Key] = {
                pos: pos2,
                dir: dir,
                targetPos: targetPos2,
                targetPosKey: `${targetPos2[0]},${targetPos2[1]}`,
                is_underground_input: false
            };
            lines.push([pos1, pos2]); // Connect splitter halves
        } else {
            // Handle belts and underground belts
            const posKey = `${e.pos[0]},${e.pos[1]}`;
            const targetPos = [e.pos[0] + offset[0], e.pos[1] + offset[1]];

            let is_underground_input = false;
            if (undergroundBeltEntityNames.includes(e.name)) {
                is_underground_input = (e.type === "input");
            }

            entityNodes[posKey] = {
                pos: e.pos,
                dir: dir,
                targetPos: targetPos,
                targetPosKey: `${targetPos[0]},${targetPos[1]}`,
                is_underground_input: is_underground_input
            };
        }
    }

    // Create connections between nodes
    for (const sourceNode of Object.values(entityNodes)) {
        if (sourceNode.targetPosKey in entityNodes) {
            const targetNode = entityNodes[sourceNode.targetPosKey];

            // Skip if source is underground input
            if (sourceNode.is_underground_input) {
                continue;
            }

            // Skip if directions are opposite
            if (isOppositeDirection(sourceNode.dir, targetNode.dir)) {
                continue;
            }

            lines.push([sourceNode.pos, targetNode.pos]);
        }
    }

    return lines;
}

function getLinesUndergroundBelt(entities) {
    const nodesInput = {};
    const nodesOutput = {};
    const beltTypes = {
        "underground-belt": 6,
        "fast-underground-belt": 8,
        "express-underground-belt": 10,
        "turbo-underground-belt": 12
    };

    for (const entityName of Object.keys(beltTypes)) {
        nodesInput[entityName] = {};
        nodesOutput[entityName] = {};
    }

    for (const e of entities) {
        if (e.name in beltTypes) {
            const posKey = `${e.pos[0]},${e.pos[1]}`;
            if (e.type === "input") {
                nodesInput[e.name][posKey] = [e.pos, Math.floor(e.direction / 4)];
            } else {
                nodesOutput[e.name][posKey] = [e.pos, Math.floor(e.direction / 4)];
            }
        }
    }

    const lines = [];
    for (const [entityName, maxLength] of Object.entries(beltTypes)) {
        for (const [pos, dir] of Object.values(nodesInput[entityName])) {
            const offset = DIRECTION_4_TO_OFFSET[dir];
            for (let i = 1; i < maxLength; i++) {
                const targetPos = [
                    pos[0] + i * offset[0],
                    pos[1] + i * offset[1]
                ];
                const targetPosKey = `${targetPos[0]},${targetPos[1]}`;
                if (targetPosKey in nodesOutput[entityName] && nodesOutput[entityName][targetPosKey][1] === dir) {
                    lines.push([pos, targetPos]);
                    break;
                }
            }
        }
    }
    return lines;
}

function getLinesPipesOrHeatPipes(entities, targetPositionsMap) {
    function rotate(angle, pos) {
        if (angle === 0) {
            return pos;
        } else if (angle === 1) {
            return [-pos[1], pos[0]];
        } else if (angle === 2) {
            return [-pos[0], -pos[1]];
        } else if (angle === 3) {
            return [pos[1], -pos[0]];
        }
    }

    function orderPoints(pos1, pos2) {
        // Sort the positions by comparing first x then y
        if (pos1[0] < pos2[0]) {
            return [pos1, pos2];
        } else if (pos1[0] > pos2[0]) {
            return [pos2, pos1];
        } else {
            // x coordinates are equal, compare y
            return pos1[1] <= pos2[1] ? [pos1, pos2] : [pos2, pos1];
        }
    }

    const nodes = {};

    for (const e of entities) {
        if (!(e.name in targetPositionsMap)) {
            continue;
        }
        for (let [connectionPos, targetPos] of targetPositionsMap[e.name]) {

            // Special check for assembling machines with fluid recipes
            if (e.name === "assembling-machine-2" || e.name === "assembling-machine-3" || e.name === "biochamber") {
                if (!(e.recipe in fluidRecipes)) {
                    continue;
                }
            }
            const dir = Math.floor(e.direction / 4)
            connectionPos = rotate(dir, connectionPos);
            targetPos = rotate(dir, targetPos);

            connectionPos = [
                e.pos[0] + connectionPos[0],
                e.pos[1] + connectionPos[1]
            ];
            targetPos = [
                e.pos[0] + targetPos[0],
                e.pos[1] + targetPos[1]
            ];

            const connectionPosKey = `${connectionPos[0]},${connectionPos[1]}`;
            if (!(connectionPosKey in nodes)) {
                nodes[connectionPosKey] = [connectionPos, [targetPos]];
            } else {
                nodes[connectionPosKey][1].push(targetPos);
            }
        }
    }

    // create lines
    const lines = [];
    const linesCache = {};
    for (const [pos, targetPosList] of Object.values(nodes)) {
        if (targetPosList === null) continue;
        for (const targetPos of targetPosList) {
            // Use the new orderPoints function
            const [p1, p2] = orderPoints(pos, targetPos);

            // Create a unique key for the line 
            const lineKey = `${p1[0]},${p1[1]}-${p2[0]},${p2[1]}`;
            const targetPosKey = `${targetPos[0]},${targetPos[1]}`;

            if (targetPosKey in nodes && !(lineKey in linesCache)) {
                linesCache[lineKey] = true;
                lines.push([p1, p2]);
            }
        }
    }

    return lines;
}

function getLinesUndergroundPipes(entities, maxLength = 11) {
    const nodes = {};
    for (const e of entities) {
        if (e.name === "pipe-to-ground") {
            const dirOpposite = (Math.floor(e.direction / 4) + 2) % 4
            const posKey = `${e.pos[0]},${e.pos[1]}`;
            nodes[posKey] = [e.pos, dirOpposite]
        }
    }

    const lines = [];
    for (const [pos, dirOpposite] of Object.values(nodes)) {
        const offset = DIRECTION_4_TO_OFFSET[dirOpposite];
        for (let i = 1; i < maxLength; i++) {
            const targetPos = [
                pos[0] + i * offset[0],
                pos[1] + i * offset[1]
            ];
            const targetPosKey = `${targetPos[0]},${targetPos[1]}`;
            if (targetPosKey in nodes && nodes[targetPosKey][1] === (dirOpposite + 2) % 4) {
                lines.push([pos, targetPos]);
                break;
            }
        }
    }
    return lines;
}

function getLinesInserter(entities) {
    const lines = [];
    for (const e of entities) {
        if (["bulk-inserter", "burner-inserter", "fast-inserter", "inserter", "long-handed-inserter", "stack-inserter"].includes(e.name)) {
            const dir = Math.floor(e.direction / 4);
            const offset = DIRECTION_4_TO_OFFSET[dir];
            const inserterLength = (e.name === "long-handed-inserter" ? 2 : 1);
            lines.push([
                [e.pos[0] + inserterLength * offset[0], e.pos[1] + inserterLength * offset[1]],
                [e.pos[0] + inserterLength * -offset[0], e.pos[1] + inserterLength * -offset[1]]
            ]);
        }
    }
    return lines;
}

function getLinesRails(entities) {
    function mirrorOffsetsVertical(offsets) {
        return [[-offsets[0][0], offsets[0][1]], [-offsets[1][0], offsets[1][1]]];
    }

    function rotateOffsets90Degrees(offsets, numTimes = 1) {
        for (let i = 0; i < numTimes; i++) {
            offsets = [[-offsets[0][1], offsets[0][0]], [-offsets[1][1], offsets[1][0]]];
        }
        return offsets;
    }

    const lines = [];
    for (const e of entities) {
        if (e.name === "straight-rail" || e.name === "elevated-straight-rail") {
            const dir = e.direction;
            let offsets = [[0, 1], [0, -1]];
            if (dir === 2) {
                offsets = [[-1, 1], [1, -1]];
            }
            else if (dir === 4) {
                offsets = [[1, 0], [-1, 0]];
            }
            else if (dir === 6) {
                offsets = [[1, 1], [-1, -1]];
            }
            lines.push([
                [e.pos[0] + offsets[0][0], e.pos[1] + offsets[0][1]],
                [e.pos[0] + offsets[1][0], e.pos[1] + offsets[1][1]]
            ]);
        } else if (e.name === "curved-rail-a" || e.name === "curved-rail-b" || e.name === "half-diagonal-rail" || e.name === "elevated-curved-rail-a" || e.name === "elevated-curved-rail-b" || e.name === "elevated-half-diagonal-rail") {
            const dir = e.direction;
            let offsets;
            if (e.name === "curved-rail-a" || e.name === "elevated-curved-rail-a") {
                offsets = [[0, 3], [-1, -3]];
            } else if (e.name === "curved-rail-b" || e.name === "elevated-curved-rail-b") {
                offsets = [[1, 2], [-2, -2]];
            } else if (e.name === "half-diagonal-rail" || e.name === "elevated-half-diagonal-rail") {
                offsets = [[1, 2], [-1, -2]];
            }

            let offsetsMirrorVertical = mirrorOffsetsVertical(offsets);
            if (dir === 2) {
                offsets = offsetsMirrorVertical;
            }
            else if (dir === 4) {
                offsets = rotateOffsets90Degrees(offsets, 1);
            }
            else if (dir === 6) {
                offsets = rotateOffsets90Degrees(offsetsMirrorVertical, 1);
            }
            else if (dir === 8) {
                offsets = rotateOffsets90Degrees(offsets, 2);
            }
            else if (dir === 10) {
                offsets = rotateOffsets90Degrees(offsetsMirrorVertical, 2);
            }
            else if (dir === 12) {
                offsets = rotateOffsets90Degrees(offsets, 3);
            }
            else if (dir === 14) {
                offsets = rotateOffsets90Degrees(offsetsMirrorVertical, 3);
            }
            lines.push([
                [e.pos[0] + offsets[0][0], e.pos[1] + offsets[0][1]],
                e.pos
            ]);
            lines.push([
                e.pos,
                [e.pos[0] + offsets[1][0], e.pos[1] + offsets[1][1]]
            ]);
        }
        else if (e.name === "rail-ramp") {
            const dir = e.direction;
            let offsets = [[-8, 0], [8, 0]];
            if (dir % 8 === 0) {
                offsets = [[0, -8], [0, 8]];
            }
            lines.push([
                [e.pos[0] + offsets[0][0], e.pos[1] + offsets[0][1]],
                [e.pos[0] + offsets[1][0], e.pos[1] + offsets[1][1]]
            ]);
        }
    }
    return lines;
}

function getLinesWire(entities, wires, wireType) {
    const lines = [];
    for (const [w1, w2, w3, w4] of wires) {
        if (w2 === wireType || w4 === wireType) {
            lines.push([entities[w1 - 1].pos, entities[w3 - 1].pos]);
        }
    }
    return lines;
}

function drawTiles(dwg, tiles, posOffset, settingProps) {
    function createTileGrid(tiles) {
        const tileNameToGrid = {};
        const minMaxPos = {}
        for (const tile of tiles) {
            if (!(tile.name in tileNameToGrid)) {
                tileNameToGrid[tile.name] = {};
                minMaxPos[tile.name] = {
                    min: [tile.pos[0], tile.pos[1]],
                    max: [tile.pos[0], tile.pos[1]]
                }
            }
            const key = `${tile.pos[0]},${tile.pos[1]}`;
            tileNameToGrid[tile.name][key] = tile.pos;
            minMaxPos[tile.name].min = [Math.min(minMaxPos[tile.name].min[0], tile.pos[0]), Math.min(minMaxPos[tile.name].min[1], tile.pos[1])];
            minMaxPos[tile.name].max = [Math.max(minMaxPos[tile.name].max[0], tile.pos[0]), Math.max(minMaxPos[tile.name].max[1], tile.pos[1])];
        }

        const tileNameToGridArrayAndOffset = {};
        for (const [tileName, gridObject] of Object.entries(tileNameToGrid)) {
            const minPos = minMaxPos[tileName].min;
            const maxPos = minMaxPos[tileName].max;
            const width = (maxPos[0] - minPos[0]) + 1 + 4; // +4 for border
            const height = (maxPos[1] - minPos[1]) + 1 + 4

            // Create 2D array initialized with false
            const gridArray = []
            for (let x = 0; x < width; x++) {
                gridArray[x] = new Array(height).fill(false);
            }

            // Fill in true values for existing tiles
            for (const tile of Object.values(gridObject)) {
                const x = tile[0] - minPos[0];
                const y = tile[1] - minPos[1];
                gridArray[x + 2][y + 2] = true;
            }

            const offset = [minPos[0] - 2, minPos[1] - 2];
            tileNameToGridArrayAndOffset[tileName] = [gridArray, offset];
        }

        return tileNameToGridArrayAndOffset;
    }

    function findBorderSegments(gridArray, offset, size) {
        const d = 0.5 - size / 2
        // 1 => 0 and 0 => 0.5 
        const h = 0.5
        const lines = [];

        // Iterate through grid array, skipping border cells
        for (let x = 1; x < gridArray.length - 1; x++) {
            for (let y = 1; y < gridArray[x].length - 1; y++) {
                if (gridArray[x][y]) {
                    continue
                }

                const top_middle = gridArray[x][y - 1]
                const middle_left = gridArray[x - 1][y]
                const middle_right = gridArray[x + 1][y]
                const bottom_middle = gridArray[x][y + 1]

                if (top_middle) {
                    if (middle_right) {
                        if (bottom_middle) {
                            if (middle_left) {
                                // top_middle, middle_right, bottom_middle, middle_left
                                lines.push([[x - d, y - d], [x + d, y - d], [x + d, y + d], [x - d, y + d], [x - d, y - d]]);
                            } else {
                                // top_middle, middle_right, bottom_middle
                                lines.push([[x - h, y + d], [x + d, y + d]]);
                                lines.push([[x + d, y + d], [x + d, y - d]]);
                                lines.push([[x + d, y - d], [x - h, y - d]]);
                            }
                        } else {
                            if (middle_left) {
                                // top_middle, middle_right, middle_left
                                lines.push([[x - d, y + h], [x - d, y - d]]);
                                lines.push([[x - d, y - d], [x + d, y - d]]);
                                lines.push([[x + d, y - d], [x + d, y + h]]);
                            } else {
                                // top_middle, middle_right
                                lines.push([[x - h, y - d], [x + d, y + h]]);
                            }
                        }
                    } else {
                        if (bottom_middle) {
                            if (middle_left) {
                                // top_middle, bottom_middle, middle_left
                                lines.push([[x + h, y + d], [x - d, y + d]]);
                                lines.push([[x - d, y + d], [x - d, y - d]]);
                                lines.push([[x - d, y - d], [x + h, y - d]]);
                            } else {
                                // top_middle, bottom_middle
                                lines.push([[x - h, y - d], [x + h, y - d]]);
                                lines.push([[x - h, y + d], [x + h, y + d]]);
                            }
                        } else {
                            if (middle_left) {
                                // top_middle, middle_left
                                lines.push([[x - d, y + h], [x + h, y - d]]);
                            } else {
                                // top_middle
                                lines.push([[x - h, y - d], [x + h, y - d]]);

                            }
                        }
                    }
                } else {
                    if (middle_right) {
                        if (bottom_middle) {
                            if (middle_left) {
                                // middle_right, bottom_middle, middle_left
                                lines.push([[x - d, y - h], [x - d, y + d]]);
                                lines.push([[x - d, y + d], [x + d, y + d]]);
                                lines.push([[x + d, y + d], [x + d, y - h]]);
                            } else {
                                // middle_right, bottom_middle
                                lines.push([[x - h, y + d], [x + d, y - h]]);
                            }
                        } else {
                            if (middle_left) {
                                // middle_right, middle_left
                                lines.push([[x - d, y - h], [x - d, y + h]]);
                                lines.push([[x + d, y - h], [x + d, y + h]]);
                            } else {
                                // middle_right
                                lines.push([[x + d, y - h], [x + d, y + h]]);
                            }
                        }
                    } else {
                        if (bottom_middle) {
                            if (middle_left) {
                                // bottom_middle, middle_left
                                lines.push([[x - d, y - h], [x + h, y + d]]);
                            } else {
                                // bottom_middle
                                lines.push([[x + h, y + d], [x - h, y + d]]);
                            }
                        } else {
                            if (middle_left) {
                                // middle_left
                                lines.push([[x - d, y - h], [x - d, y + h]]);
                            } else {
                                // -
                            }
                        }
                    }
                }

                // look at the corners now
                const top_left = gridArray[x - 1][y - 1]
                const top_right = gridArray[x + 1][y - 1]
                const bottom_left = gridArray[x - 1][y + 1]
                const bottom_right = gridArray[x + 1][y + 1]

                if (top_left && !top_middle && !middle_left) {
                    lines.push([[x - h, y - d], [x - d, y - h]]);
                }
                if (top_right && !top_middle && !middle_right) {
                    lines.push([[x + d, y - h], [x + h, y - d]]);
                }
                if (bottom_left && !bottom_middle && !middle_left) {
                    lines.push([[x - h, y + d], [x - d, y + h]]);
                }
                if (bottom_right && !bottom_middle && !middle_right) {
                    lines.push([[x + h, y + d], [x + d, y + h]]);
                }
            }
        }

        lines.forEach(line => line.forEach(point => { point[0] += offset[0]; point[1] += offset[1]; }));

        return lines;
    }

    function extractPolygons(lines) {
        const rawPolygons = [];
        const connections = new Map();

        // Build the connection map (storing all possible connections for each point)
        lines.forEach(line => {
            const [x1, y1] = line[0];
            const [x2, y2] = line[1];
            const point1 = `${x1},${y1}`;
            const point2 = `${x2},${y2}`;

            // Add both directions for each connection
            if (!connections.has(point1)) connections.set(point1, new Set());
            if (!connections.has(point2)) connections.set(point2, new Set());
            connections.get(point1).add(point2);
            connections.get(point2).add(point1);
        });

        const usedConnections = new Set();

        // Process each point that has connections
        for (const startPoint of connections.keys()) {
            // Skip if all connections from this point have been used
            if ([...connections.get(startPoint)].every(endPoint =>
                usedConnections.has(`${startPoint}-${endPoint}`))) continue;

            // Start a new polygon
            const polygon = [];
            let currentPoint = startPoint;
            let firstPoint = startPoint;

            while (true) {
                // Add the current point to the polygon
                const [x, y] = currentPoint.split(',').map(Number);
                polygon.push([x, y]);

                // Find an unused connection from the current point
                const possibleConnections = connections.get(currentPoint);
                const nextPoint = [...possibleConnections].find(endPoint =>
                    !usedConnections.has(`${currentPoint}-${endPoint}`));

                if (!nextPoint || (nextPoint === firstPoint && polygon.length > 1)) {
                    // If we've reached the starting point or a dead end
                    if (nextPoint === firstPoint && polygon.length > 2) {
                        rawPolygons.push(polygon);
                    }
                    break;
                }

                // Mark this connection as used (in both directions)
                usedConnections.add(`${currentPoint}-${nextPoint}`);
                usedConnections.add(`${nextPoint}-${currentPoint}`);

                // Move to the next point
                currentPoint = nextPoint;
            }
        }
        return rawPolygons;
    }

    function organizePolygonHierarchy(rawPolygons) {
        function isPointInPolygon(point, polygon) {
            let inside = false;
            for (let i = 0, j = polygon.length - 2; i < polygon.length - 1; j = i++) {
                const xi = polygon[i][0], yi = polygon[i][1];
                const xj = polygon[j][0], yj = polygon[j][1];

                const intersect = ((yi > point[1]) !== (yj > point[1]))
                    && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }

        function containsPolygon(polyA, polyB) {
            // Use any point from B to test if it's inside A
            const testPoint = polyB[0];
            return isPointInPolygon(testPoint, polyA);
        }

        const result = [];
        const used = new Set();

        for (let i = 0; i < rawPolygons.length; i++) {
            if (used.has(i)) continue;

            const currentPoly = rawPolygons[i];
            const holes = [];

            // Find all polygons that are directly contained by this polygon
            for (let j = 0; j < rawPolygons.length; j++) {
                if (i === j || used.has(j)) continue;

                if (containsPolygon(currentPoly, rawPolygons[j])) {
                    // Check if this is a direct hole (not contained by any other hole)
                    let isDirectHole = true;
                    for (let k = 0; k < rawPolygons.length; k++) {
                        if (k === i || k === j) continue;
                        if (containsPolygon(rawPolygons[k], rawPolygons[j]) &&
                            containsPolygon(currentPoly, rawPolygons[k])) {
                            isDirectHole = false;
                            break;
                        }
                    }
                    if (isDirectHole) {
                        holes.push(rawPolygons[j]);
                        used.add(j);
                    }
                }
            }

            result.push({
                outer: currentPoly,
                holes: holes
            });
            used.add(i);
        }
        return result;
    }

    function drawPolygonWithHoles(dwg, polygonHierarchies, posOffset, settingProps) {
        dwg.parts.push('<g');
        appendSvgSetting(dwg, settingProps);
        dwg.parts.push('>');

        // For each polygon with its holes
        for (const { outer, holes } of polygonHierarchies) {
            dwg.parts.push('<path fill-rule="evenodd"');

            // Start with the outer polygon
            let pathData = 'M ' + outer.map(point =>
                `${point[0] + posOffset[0]},${point[1] + posOffset[1]}`
            ).join(' L ');
            pathData += ' Z';

            // Add each hole
            for (const hole of holes) {
                pathData += ' M ' + hole.map(point =>
                    `${point[0] + posOffset[0]},${point[1] + posOffset[1]}`
                ).join(' L ');
                pathData += ' Z';
            }

            dwg.parts.push(` d="${pathData}"`);
            dwg.parts.push('/>');
        }

        dwg.parts.push('</g>');
    }

    const tileNameToGridArrayAndOffset = createTileGrid(tiles);

    for (const tileName of artificialTilesSortedByLayer) {
        if (!(tileName in tileNameToGridArrayAndOffset)) {
            continue;
        }
        if ("allow" in settingProps && !settingProps.allow.includes(tileName)) {
            continue;
        }
        if ("deny" in settingProps && settingProps.deny.includes(tileName)) {
            continue;
        }
        const [gridArray, offset] = tileNameToGridArrayAndOffset[tileName];
        const scale = "scale" in settingProps ? settingProps.scale : 0.6;
        const lines = findBorderSegments(gridArray, offset, scale);
        const rawPolygons = extractPolygons(lines);
        const result = organizePolygonHierarchy(rawPolygons);
        drawPolygonWithHoles(dwg, result, posOffset, settingProps);
        // debugginDrawLines(dwg, lines, posOffset, { "fill": "none", "stroke": "#ff0000", "stroke-width": 0.1 });
    }
}

function debugginDrawLines(dwg, lines, posOffset, svgSettings) {
    for (const line of lines) {
        dwg.parts.push('<path');
        appendSvgSetting(dwg, svgSettings);
        dwg.parts.push(` d="M${line[0][0] + posOffset[0]} ${line[0][1] + posOffset[1]}`);
        for (const p of line.slice(1)) {
            dwg.parts.push(` L${p[0] + posOffset[0]} ${p[1] + posOffset[1]}`);
        }
        dwg.parts.push('"/>');
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

rl.question('enter blueprint string: ', (blueprintString) => {
    list = getBlueprintList(blueprintString);
    names = list[0]
    jsons = list[1]
    currentBlueprint = processBlueprint(jsons[0])
    svg = drawBlueprint(currentBlueprint, EXAMPLE_SETTINGS)
    fs.writeFile('/tmp/factorio-rendered.svg', svg, err => {
        if (err) {
            console.log(err);
        } else {

        }
    });
    rl.close()
})
