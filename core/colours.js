/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

goog.provide("Blockly.Colours");

Blockly.Colours = {
  // SVG colours: these must be specificed in #RRGGBB style
  // To add an opacity, this must be specified as a separate property (for SVG fill-opacity)
  motion: {
    primary: "#4C97FF",
    secondary: "#4280D7",
    tertiary: "#3373CC"
  },
  looks: {
    primary: "#9966FF",
    secondary: "#855CD6",
    tertiary: "#774DCB"
  },
  sounds: {
    primary: "#CF63CF",
    secondary: "#C94FC9",
    tertiary: "#BD42BD"
  },
  control: {
    primary: "#98AFC9",
    secondary: "#98AFC9",
    tertiary: "#5D6C7A"
  },
  texts_extensions: {
    primary: "#00316B",
    secondary: "#00316B",
    tertiary: "#001B35"
  },
  event: {
    primary: "#FFBF00",
    secondary: "#E6AC00",
    tertiary: "#CC9900"
  },
  sensing: {
    primary: "#5CB1D6",
    secondary: "#47A8D1",
    tertiary: "#2E8EB8"
  },
  func: {
    primary: "#3194FF",
    secondary: "#3194FF",
    tertiary: "#226CAF"
  },
  operators: {
    primary: "#7C6AC0",
    secondary: "#7C6AC0",
    tertiary: "#544C84"
  },
  data: {
    primary: "#a6b6fe",
    secondary: "#a6b6fe",
    tertiary: "#8E9BD9"
  },
  // This is not a new category, but rather for differentiation
  // between lists and scalar variables.
  data_lists: {
    primary: "#a6b6fe",
    secondary: "#a6b6fe",
    tertiary: "#8E9BD9"
  },
  more: {
    primary: "#5eacff",
    secondary: "#5eacff",
    tertiary: "#4D8FD5"
  },
  text: "#575E75",
  workspace: "#F9F9F9",
  toolboxHover: "#4C97FF",
  toolboxSelected: "#e9eef2",
  toolboxText: "#575E75",
  toolbox: "#FFFFFF",
  flyout: "#F9F9F9",
  scrollbar: "#CECDCE",
  scrollbarHover: "#CECDCE",
  textField: "#FFFFFF",
  insertionMarker: "#000000",
  insertionMarkerOpacity: 0.2,
  dragShadowOpacity: 0.3,
  stackGlow: "#FFF200",
  stackGlowSize: 4,
  stackGlowOpacity: 1,
  replacementGlow: "#FFFFFF",
  replacementGlowSize: 2,
  replacementGlowOpacity: 1,
  colourPickerStroke: "#FFFFFF",
  // CSS colours: support RGBA
  fieldShadow: "rgba(0,0,0,0.1)",
  dropDownShadow: "rgba(0, 0, 0, .3)",
  numPadBackground: "#547AB2",
  numPadBorder: "#435F91",
  numPadActiveBackground: "#435F91",
  numPadText: "#FFFFFF",
  valueReportBackground: "#FFFFFF",
  valueReportBorder: "#AAAAAA"
};
