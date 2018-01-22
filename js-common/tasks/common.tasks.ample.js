
/*
 *  =================================================================
 *
 *    26.04.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/tasks/common.tasks.ample.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Ample Task Class
 *       ~~~~~~~~~
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2017
 *
 *  =================================================================
 *
 */

var __template = null;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  __template = require ( './common.tasks.template' );

// ===========================================================================

function TaskAmple()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type      = 'TaskAmple';
  this.name       = 'ample';
  this.oname      = 'ample';  // default output file name template
  this.title      = 'Ab-Initio Molecular Replacement with Ample';
  //this.icon_small = './images/task_ample_20x20.svg';
  //this.icon_large = './images/task_ample.svg';

  this.input_dtypes = [{  // input data types
      data_type   : {'DataHKL':[]},  // data type(s) and subtype(s)
      label       : 'Reflections',   // label for input dialog
      inputId     : 'hkl',      // input Id for referencing input fields
      min         : 1,          // minimum acceptable number of data instances
      max         : 1           // maximum acceptable number of data instances
    },{
      data_type   : {'DataSequence':[]}, // data type(s) and subtype(s)
      label       : 'Sequence',          // label for input dialog
      inputId     : 'seq',      // input Id for referencing input fields
      min         : 1,          // minimum acceptable number of data instances
      max         : 1           // maximum acceptable number of data instances
    },{
      data_type : {'DataEnsemble':[]},  // data type(s) and subtype(s)
      label       : 'Model',            // label for input dialog
      inputId     : 'model',  // input Id for referencing input fields
      customInput : 'model',  // lay custom fields below the dropdown
      min         : 0,        // minimum acceptable number of data instances
      max         : 10000000  // maximum acceptable number of data instances
    /*
    },{
      data_type   : {'DataStructure':[]}, // data type(s) and subtype(s)
      label       : 'Fixed model',        // label for input dialog
      inputId     : 'xmodel',   // input Id for referencing input fields
      force       : 1,          // meaning choose, by default, 1 structure if
                                // available; otherwise, 0 (do not use) will
                                // be selected
      min         : 0,          // minimum acceptable number of data instances
      max         : 1           // maximum acceptable number of data instances
    */
    }
  ];

}


if (__template)
      TaskAmple.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskAmple.prototype = Object.create ( TaskTemplate.prototype );
TaskAmple.prototype.constructor = TaskAmple;


// ===========================================================================
// export such that it could be used in both node and a browser

TaskAmple.prototype.icon_small = function()  { return './images/task_ample_20x20.svg'; }
TaskAmple.prototype.icon_large = function()  { return './images/task_ample.svg';       }

TaskAmple.prototype.currentVersion = function()  { return 0; }

if (__template)  {
  //  for server side

  var conf = require('../../js-server/server.configuration');

  TaskAmple.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.ample', exeType, jobDir, this.id];
  }

  // -------------------------------------------------------------------------

  module.exports.TaskAmple = TaskAmple;

}
