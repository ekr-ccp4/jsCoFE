
/*
 *  =================================================================
 *
 *    06.01.18   <--  Date of Last Modification.
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
 *  (C) E. Krissinel, A. Lebedev 2016-2018
 *
 *  =================================================================
 *
 */

var __template = null;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  __template = require ( './common.tasks.template' );

// ===========================================================================

function TaskParrot()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type   = 'TaskParrot';
  this.name    = 'parrot DM';
  this.oname   = 'parrot';  // default output file name template
  this.title   = 'Density Modification with Parrot';
  this.helpURL = './html/jscofe_task_parrot.html';

  this.input_dtypes = [  // input data types
    {
      data_type   : {'DataRevision':['phases']}, // data type(s) and subtype(s)
      label       : 'Structure revision',        // label for input dialog
      inputId     : 'revision', // input Id for referencing input fields
      customInput : 'parrot',   // lay custom fields below the dropdown
      version     : 0,          // minimum data version allowed
      min         : 1,          // minimum acceptable number of data instances
      max         : 1           // maximum acceptable number of data instances
      /*
    {
      data_type   : {'DataStructure':['~substructure-am']},  // data type(s) and subtype(s)
      label       : 'Structure', // label for input dialog
      inputId     : 'istruct',   // input Id for referencing input fields
      customInput : 'parrot',    // lay custom fields below the dropdown
      min         : 1,           // minimum acceptable number of data instances
      max         : 1            // maximum acceptable number of data instances
    },{
      data_type   : {'DataSequence':[]}, // data type(s) and subtype(s)
      label       : 'Sequence',    // label for input dialog
      inputId     : 'seq',         // input Id for referencing input fields
      customInput : 'asu-content', // lay custom fields below the dropdown
      min         : 0,             // minimum acceptable number of data instances
      max         : 100000         // maximum acceptable number of data instances
      */
    },{
      data_type   : {'DataStructure':['~substructure','~substructure-am']},  // data type(s) and subtype(s)
      label       : 'Model for NCS<br>detection', // label for input dialog
      inputId     : 'ncs_struct', // input Id for referencing input fields
      min         : 0,            // minimum acceptable number of data instances
      max         : 1             // maximum acceptable number of data instances
    },{
      data_type   : {'DataStructure':['substructure']},  // data type(s) and subtype(s)
      label       : 'Model for NCS<br>detection', // label for input dialog
      inputId     : 'ncs_substr', // input Id for referencing input fields
      min         : 0,            // minimum acceptable number of data instances
      max         : 1             // maximum acceptable number of data instances
    }
  ];

  this.parameters = { // input parameters
    sec1 : { type     : 'section',
             title    : 'Parameters',
             open     : true,  // true for the section to be initially open
             position : [0,0,1,5],
             contains : {
                SOLVCONT : {
                        type      : 'real',
                        keyword   : 'solvent-content',
                        label     : 'Solvent content as a fraction of unit cell',
                        tooltip   : 'This parameter must be given if sequence(s) ' +
                                    'are not specified',
                        range     : [0.0,1.0],
                        value     : '0.0',
                        position  : [0,0,1,1],
                        showon    : {'seq':[0]}
                     },
                NCYCLES : {
                        type      : 'integer',
                        keyword   : 'cycles',
                        label     : 'Number of cycles of phase improvement',
                        tooltip   : 'Choose a value between 1 and 50',
                        range     : [1,50],
                        value     : '3',
                        position  : [1,0,1,1]
                      },
                /*
                NCS_CBX : {
                        type      : 'checkbox',
                        label     : 'Detect NCS',
                        tooltip   : 'Check to automatically detect NCS',
                        value     : true,
                        position  : [2,0,1,2]
                      },
                */
                SOLVENT_CBX : {
                        type      : 'checkbox',
                        keyword   : 'solvent-flatten',
                        label     : 'Solvent flattening',
                        tooltip   : 'Check to use solvent flattening',
                        value     : true,
                        position  : [3,0,1,2]
                      },
                HISTOGRAM_CBX : {
                        type      : 'checkbox',
                        keyword   : 'histogram-match',
                        label     : 'Histogram matching',
                        tooltip   : 'Check to use histogram matching',
                        value     : true,
                        position  : [4,0,1,2]
                      },
                /*
                NCSAVER_CBX : {
                        type      : 'checkbox',
                        keyword   : 'ncs-average',
                        label     : 'NCS averaging',
                        tooltip   : 'Check to use NCS averaging',
                        value     : true,
                        position  : [5,0,1,2]
                      },
                */
                ANISO_CBX : {
                        type      : 'checkbox',
                        keyword   : 'anisotropy-correction',
                        label     : 'Anisotropy correction',
                        tooltip   : 'Check to apply anisotropy correction',
                        value     : true,
                        position  : [6,0,1,2]
                      },
                RESMIN : {
                        type      : 'real',
                        keyword   : 'resolution',
                        label     : 'Truncate data beyond resolution limit [&Aring;]',
                        tooltip   : 'Truncate resolution limit, in angstroms',
                        range     : [0.1,'*'],
                        value     : '1.0',
                        position  : [7,0,1,1]
                      },
                NCSRAD : {
                        type      : 'real',
                        keyword   : 'ncs-mask-filter-radius',
                        label     : 'Radius for NCS mask determination [&Aring;]',
                        tooltip   : 'Radius for NCS mask determination, in angstroms',
                        range     : [0.1,'*'],
                        value     : '6.0',
                        position  : [8,0,1,1]
                      },
                TITLE1 : {
                        type      : 'label',  // just a separator
                        label     : '<h3><i>Reference structure data</i></h3>',
                        position  : [9,0,1,4]
                      },
                REFMDL_SEL : {
                        type      : 'combobox',
                        keyword   : 'REFMDL',
                        label     : 'Library reference structure to use:',
                        tooltip   : 'Choose library reference structure',
                        range     : ['1tqw|1tqw','1ajr|1ajr'],
                        value     : '1tqw',
                        position  : [10,0,1,1]
                     }
             }
           }
  };

  /*
  this.doPackSuffixes = [ '.mtz_diff.map', // when comes from shelx-substructure
                          '.diff.map'      // when comes from MR
                        ];
  */

}


if (__template)
      TaskParrot.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskParrot.prototype = Object.create ( TaskTemplate.prototype );
TaskParrot.prototype.constructor = TaskParrot;


// ===========================================================================
// export such that it could be used in both node and a browser

TaskParrot.prototype.icon_small = function()  { return './images/task_parrot_20x20.svg'; }
TaskParrot.prototype.icon_large = function()  { return './images/task_parrot.svg';       }

TaskParrot.prototype.doPackSuffixes = function()  {
  return [ '.mtz_diff.map', // when comes from shelx-substructure
           '.diff.map'      // when comes from MR
         ];
}

TaskParrot.prototype.currentVersion = function()  { return 0; }

if (!__template)  {
  //  for client side

  TaskParrot.prototype.inputChanged = function ( inpParamRef,emitterId,emitterValue )  {

    if (emitterId=='istruct')  {
      var inpDataRef = inpParamRef.grid.inpDataRef;
      var istruct    = this.getInputData ( inpDataRef,'istruct'    );
      var ncs_struct = this.getInputItem ( inpDataRef,'ncs_struct' );
      var ncs_substr = this.getInputItem ( inpDataRef,'ncs_substr' );

      if (istruct.length>0)  {
        isMMol = (istruct[0].subtype.indexOf('MR')>=0) ||
                 (istruct[0].subtype.indexOf('EP')>=0);
        inpParamRef.grid.setRowVisible ( ncs_struct.dropdown[0].row,!isMMol );
        inpParamRef.grid.setRowVisible ( ncs_substr.dropdown[0].row,isMMol  );
      }

    }

    TaskTemplate.prototype.inputChanged.call ( this,inpParamRef,emitterId,emitterValue );

  }

} else  {
  //  for server side

  var conf = require('../../js-server/server.configuration');

  TaskParrot.prototype.makeInputData = function ( jobDir )  {

    // put hkl and structure data in input databox for copying their files in
    // job's 'input' directory

    if ('revision' in this.input_data.data)  {
      var revision = this.input_data.data['revision'][0];
      this.input_data.data['istruct'] = [revision.Structure];
      this.input_data.data['seq']     = revision.ASU.seq;
    }

    __template.TaskTemplate.prototype.makeInputData.call ( this,jobDir );

  }

  TaskParrot.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.parrot', exeType, jobDir, this.id];
  }

  // -------------------------------------------------------------------------

  module.exports.TaskParrot = TaskParrot;

}
