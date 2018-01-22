
/*
 *  =================================================================
 *
 *    10.11.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/tasks/common.tasks.parrot.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Parrot Task Class
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

function TaskFreeRFlag()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type   = 'TaskFreeRFlag';
  this.name    = 'free R-flag';
  this.oname   = 'freeRflag';  // default output file name template
  this.title   = 'Free R-flag';
  this.helpURL = './html/jscofe_task_freerflag.html';

  this.input_dtypes = [  // input data types
    {
      data_type   : {'DataHKL':[]}, // data type(s) and subtype(s)
      label       : 'Free R-flag',  // label for input dialog
      inputId     : 'freer',        // input Id for referencing input fields
      cast        : 'free R-flag',  // will replace data type names in comboboxes
      version     : 1,              // minimum data version allowed
      min         : 0,              // minimum acceptable number of data instances
      max         : 1               // maximum acceptable number of data instances
    },{
      data_type   : {'DataHKL':[]}, // data type(s) and subtype(s)
      label       : 'Reflections',  // label for input dialog
      inputId     : 'hkl',          // input Id for referencing input fields
      version     : 0,              // minimum data version allowed
      min         : 1,              // minimum acceptable number of data instances
      max         : 200             // maximum acceptable number of data instances
    }
  ];


  this.parameters = { // input parameters
    sec1 :  { type     : 'section',
              title    : 'Parameters',
              open     : true,  // true for the section to be initially open
              position : [0,0,1,5],
              contains : {
                FREERFRAC : {
                        type      : 'real_',
                        keyword   : 'FREERFRAC',
                        label     : 'Fraction of reflections in freeR set',
                        tooltip   : 'Choose a value less than 1',
                        range     : [0.001,0.999],
                        value     : '',
                        default   : '0.05',
                        position  : [0,0,1,1],
                        showon    : {freer:[-1,0]}
                      },
                SEED_CBX : {
                        type      : 'checkbox',
                        keyword   : 'SEED',
                        label     : 'Use random seed',
                        tooltip   : 'Check to randomise the freeR seed',
                        value     : true,
                        position  : [1,0,1,2]
                      }
              }
            }
  };

}


if (__template)
      TaskFreeRFlag.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskFreeRFlag.prototype = Object.create ( TaskTemplate.prototype );
TaskFreeRFlag.prototype.constructor = TaskFreeRFlag;


// ===========================================================================
// export such that it could be used in both node and a browser

TaskFreeRFlag.prototype.icon_small = function()  { return './images/task_freerflag_20x20.svg'; }
TaskFreeRFlag.prototype.icon_large = function()  { return './images/task_freerflag.svg';       }

TaskFreeRFlag.prototype.currentVersion = function()  { return 0; }

if (!__template)  {
  //  for client side

  TaskFreeRFlag.prototype.inputChanged = function ( inpParamRef,emitterId,emitterValue )  {

    function makeSuffix ( title,suffix )  {
      return title.split(' (')[0] + ' (' + suffix + ')';
    }

    if (emitterId=='freer')  {
      var inpDataRef = inpParamRef.grid.inpDataRef;
      var dataState  = this.getDataState ( inpDataRef );
      var nFreeR     = dataState['freer'];

      var name = this.name;
      if (nFreeR<=0)  {
        this.title = makeSuffix ( this.title,'Regenerate' );
        this.name  = makeSuffix ( this.name ,'regenerate' );
      } else  {
        this.title = makeSuffix ( this.title,'Extend' );
        this.name  = makeSuffix ( this.name ,'extend' );
      }

      if (this.name!=name)  {
        var inputPanel = inpParamRef.grid.parent.parent;
        inputPanel.header.title.setText ( '<b>' + this.title + '</b>' );
        inputPanel.header.uname_inp.setStyle ( 'text','',
                              this.name.replace(/<(?:.|\n)*?>/gm, '') );
        this.updateInputPanel ( inputPanel );
        inputPanel.emitSignal ( cofe_signals.jobDlgSignal,
                                job_dialog_reason.rename_node );
      }

    }

    TaskTemplate.prototype.inputChanged.call ( this,inpParamRef,emitterId,emitterValue );

  }

} else  {
  //  for server side

  var conf = require('../../js-server/server.configuration');

  TaskFreeRFlag.prototype.makeInputData = function ( jobDir )  {

    // put hkl and structure data in input databox for copying their files in
    // job's 'input' directory

    if ('freer' in this.input_data.data)  {
      var freer = this.input_data.data['freer'][0];
      if (freer.freeRds)
        this.input_data.data['freer0'] = [freer.freeRds];
    }

    __template.TaskTemplate.prototype.makeInputData.call ( this,jobDir );

  }

  TaskFreeRFlag.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.freerflag', exeType, jobDir, this.id];
  }

  // -------------------------------------------------------------------------

  module.exports.TaskFreeRFlag = TaskFreeRFlag;

}
