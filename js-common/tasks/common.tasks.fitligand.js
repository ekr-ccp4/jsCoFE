
/*
 *  =================================================================
 *
 *    05.12.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/tasks/common.tasks.fitligand.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Find Ligand Task Class
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

function TaskFitLigand()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type   = 'TaskFitLigand';
  this.name    = 'fit ligand';
  this.oname   = 'fit_ligand';  // default output file name template
  this.title   = 'Find and Fit Ligand with Coot';
  this.helpURL = './html/jscofe_task_fitligand.html';

  this.input_dtypes = [{  // input data types
      data_type : {'DataRevision':['phases']}, // data type(s) and subtype(s)
      label     : 'Structure revision',        // label for input dialog
      inputId   : 'revision', // input Id for referencing input fields
      version   : 0,          // minimum data version allowed
      min       : 1,          // minimum acceptable number of data instances
      max       : 1           // maximum acceptable number of data instances
    },{
      data_type   : {'DataLigand':[]},  // data type(s) and subtype(s)
      label       : 'Ligand data', // label for input dialog
      inputId     : 'ligand',      // input Id for referencing input fields
      min         : 1,             // minimum acceptable number of data instances
      max         : 1              // maximum acceptable number of data instances
    }
  ];


  this.parameters = { // input parameters
    sec1  : { type     : 'section',
              title    : 'Parameters',
              open     : true,  // true for the section to be initially open
              position : [0,0,1,5],
              contains : {
                NCLUST : {
                        type      : 'integer',
                        keyword   : '--clusters',
                        label     : 'Number of clusters to fit',
                        tooltip   : 'Specify the number of clusters to fit ' +
                                    'between 1 and 50',
                        range     : [1,50],
                        value     : '10',
                        default   : '10',
                        position  : [0,0,1,1]
                      },
                LEVEL_SEL : {
                        type      : 'combobox',
                        keyword   : 'LEVEL_SEL',
                        label     : 'Search level:',
                        tooltip   : 'Specify search level reference',
                        iwidth    : 140,
                        range     : ['sigma|sigma','absolute|absolute'],
                        value     : 'sigma',
                        position  : [1,0,1,1]
                      },
                SIGMA : {
                        type      : 'real',
                        keyword   : '--sigma',
                        label     : 'value',
                        tooltip   : 'Specify map level for ligand search',
                        range     : [0.0,10.0],
                        value     : '2.0',
                        default   : '2.0',
                        position  : [1,4,1,1],
                        label2    : '&sigma;\'s',
                        showon    : {LEVEL_SEL:['sigma']}
                      },
                ABSOLUTE : {
                        type      : 'real',
                        keyword   : '--absolute',
                        label     : 'value',
                        tooltip   : 'Specify map level for ligand search',
                        range     : [0.0,10.0],
                        value     : '2.0',
                        default   : '2.0',
                        position  : [1,4,1,1],
                        label2    : 'e/&Aring;<sup>3</sup>',
                        showon    : {LEVEL_SEL:['absolute']}
                      },
                FIT_FRACTION : {
                        type      : 'real',
                        keyword   : '--fit-fraction',
                        label     : 'Fit fraction',
                        tooltip   : 'the minimum fraction of atoms in density ' +
                                    'allowed after fit (0-1)',
                        range     : [0.0,1.0],
                        value     : '0.75',
                        default   : '0.75',
                        position  : [2,0,1,1]
                      },
                FLEXIBLE_CBX : {
                        type      : 'checkbox',
                        keyword   : '--flexible',
                        label     : 'Flexible fit',
                        tooltip   : 'Check in order to use torsional ' +
                                    'conformation ligand search',
                        iwidth    : 140,
                        value     : true,
                        position  : [3,0,1,1]
                      },
                SAMPLES : {
                        type      : 'integer',
                        keyword   : '--samples',
                        label     : 'number of samples',
                        tooltip   : 'Specify the number of flexible ' +
                                    'conformation samples',
                        range     : [1,10000],
                        value     : '30',
                        default   : '30',
                        position  : [3,2,1,4],
                        showon    : {FLEXIBLE_CBX:[true]}
                      }
              }
            }
  };

}


if (__template)
      TaskFitLigand.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskFitLigand.prototype = Object.create ( TaskTemplate.prototype );
TaskFitLigand.prototype.constructor = TaskFitLigand;


// ===========================================================================
// export such that it could be used in both node and a browser

TaskFitLigand.prototype.icon_small = function()  { return './images/task_fitligand_20x20.svg'; }
TaskFitLigand.prototype.icon_large = function()  { return './images/task_fitligand.svg';       }

TaskFitLigand.prototype.currentVersion = function()  { return 0; }

if (__template)  {
  //  for server side

  var conf = require('../../js-server/server.configuration');

  TaskFitLigand.prototype.makeInputData = function ( jobDir )  {

    // put hkl and structure data in input databox for copying their files in
    // job's 'input' directory

    if ('revision' in this.input_data.data)  {
      var revision = this.input_data.data['revision'][0];
      //this.input_data.data['hkl']     = [revision.HKL];
      this.input_data.data['istruct'] = [revision.Structure];
    }

    __template.TaskTemplate.prototype.makeInputData.call ( this,jobDir );

  }

  TaskFitLigand.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.fitligand', exeType, jobDir, this.id];
  }

  // -------------------------------------------------------------------------

  module.exports.TaskFitLigand = TaskFitLigand;

}
