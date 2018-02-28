
// temporary solution to keep existing projects alive
// TO BE DELETED

/*
 *  =================================================================
 *
 *    19.02.18   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/cofe.tasks.phasermr.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  CCP4ez Task Class
 *       ~~~~~~~~~
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2018
 *
 *  =================================================================
 *
 */


var __template = null;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  __template = require ( './common.tasks.ccp4go' );


// ===========================================================================

function TaskCCP4ez()  {

  if (__template)  __template.TaskCCP4go.call ( this );
             else  TaskCCP4go.call ( this );

  this._type   = 'TaskCCP4go';
  this.name    = 'ccp4go';
  this.oname   = 'ccp4go';  // default output file name template
  this.title   = 'CCP4go "Don\'t make me think!" (experimental)';
  this.helpURL = './html/jscofe_task_ccp4go.html';

}

if (__template)
      TaskCCP4ez.prototype = Object.create ( __template.TaskCCP4go.prototype );
else  TaskCCP4ez.prototype = Object.create ( TaskCCP4go.prototype );
TaskCCP4ez.prototype.constructor = TaskCCP4ez;


// ===========================================================================

// export such that it could be used in both node and a browser
if (__template)  {
// for server side
  module.exports.TaskCCP4ez = TaskCCP4ez;
}
