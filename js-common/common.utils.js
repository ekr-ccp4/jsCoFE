
/*
 *  =================================================================
 *
 *    28.04.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/common.utils.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Common Utils
 *       ~~~~~~~~~
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2017
 *
 *  =================================================================
 *
 */


function mapExcludeKey ( map,exclKey )  {
  var m = {};
  for (var key in map)
    if (key!=exclKey)
      m[key] = map[key];
  return m;
}

function mapMaskIn ( map,mask_map )  {
  var m = {};
  for (var key in map)
    if (key in mask_maps)
      m[key] = map[key];
  return m;
}

function mapMaskOut ( map,mask_map )  {
  var m = {};
  for (var key in map)
    if (!(key in mask_map))
      m[key] = map[key];
  return m;
}

function padDigits ( number,digits ) {
  return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function round ( number,digits ) {
  return Number(number.toFixed(digits));
}

function padStringLeft ( S,char,n ) {
var L = S;
  while (L.length<n)
    L = char + L;
  return L;
}

function padStringRight ( S,char,n ) {
var L = S;
  while (L.length<n)
    L += char;
  return L;
}

var __regexp_int   = /^(-?[0-9]+\d*)$|^0$/;
var __regexp_float = /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/;

function isInteger ( value_str ) {
  return __regexp_int.test(value_str);
//  return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

function isFloat ( value_str ) {
  return __regexp_float.test(value_str);
//  return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
}

// ===========================================================================

// export such that it could be used in both node and a browser
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')  {
  module.exports.mapExcludeKey  = mapExcludeKey;
  module.exports.mapMaskIn      = mapMaskIn;
  module.exports.mapMaskOut     = mapMaskOut;
  module.exports.padDigits      = padDigits;
  module.exports.padStringLeft  = padStringLeft;
  module.exports.padStringRight = padStringRight;
  module.exports.isInteger      = isInteger;
  module.exports.isFloat        = isFloat;
}
