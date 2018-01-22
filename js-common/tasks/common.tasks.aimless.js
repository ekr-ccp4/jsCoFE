
/*
 *  =================================================================
 *
 *    06.01.18   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/tasks/common.tasks.aimless.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Aimless Task Class
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

function TaskAimless()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type   = 'TaskAimless';
  this.name    = 'aimless';
  this.oname   = 'aimless';  // default output file name template
  this.title   = 'Data Reduction with Aimless';
  this.helpURL = './html/jscofe_task_aimless.html';

  this.input_dtypes = [{      // input data types
     data_type   : {'DataHKL':[],'DataUnmerged':[]}, // data type(s) and subtype(s)
     cast        : 'symmetry',     // will replace data type names in comboboxes
     label       : 'Crystal<br>Symmetry', // label for input dialog
     inputId     : 'ds0',          // input Id for referencing input fields
     customInput : 'unmerged-ref', // lay custom fields next to the selection
                                   // dropdown for unmerged reference data
     min         : 1,              // minimum acceptable number of data instances
     max         : 1               // maximum acceptable number of data instances
   },{
     data_type   : {'DataUnmerged':[]}, // data type(s) and subtype(s)
     label       : 'Unmerged<br>reflections',       // label for input dialog
     inputId     : 'unmerged',   // input Id for referencing input fields
     customInput : 'unmerged',   // lay custom fields next to the selection
                                 // dropdown for unmerged data
     min         : 1,            // minimum acceptable number of data instances
     max         : 50            // maximum acceptable number of data instances
   }/*
   ,{ // DO NOT DELETE THIS MAY BE USED AS DOCUMENTATION
     // This entry is void and provided only to ensure that at least one unmerged
     // dataset is provided. Note that this condition does not follow from the
     // actual entries above, which will be satisfied with just a single HKL
     // dataset
     data_type   : {'DataUnmerged':[]}, // data type required
     label       : '',           // empty label for void entry
     inputId     : 'void1',      // input Id must be unique and start with 'void'
     min         : 1,            // minimum acceptable number of datasets
     max         : 1             // maximum acceptable number of datasets
   }
   */
  ];

  this.parameters = { // input parameters
    sec1 : { type     : 'section',
             title    : 'Parameters',
             open     : true,  // true for the section to be initially open
             position : [0,0,1,5],
             contains : {
               RESMIN : { type  : 'real_',
                       keyword  : 'RESMIN',
                       label    : 'Resolution range (&Aring;)',
                       //lwidth   : 40,      // label width in px
                       reportas : 'Low resolution cut-off', // to use in error reports
                                                             // instead of 'label'
                       tooltip  : 'Low resolution limit to cut reflection data. ' +
                                  'Choose a value between 0 and 200 angstrom, ' +
                                  'or leave blank for automatic choice',
                       range    : [0,200],
                       value    : '',
                       position : [0,0,1,1]
                     },
               RESMAX : { type  : 'real_',
                       keyword  : 'RESMAX',
                       label    : 'to',
                       //lwidth   : 40,      // label width in px
                       reportas : 'High resolution cut-off', // to use in error reports
                                                             // instead of 'label'
                       tooltip  : 'High resolution limit to cut reflection data. ' +
                                  'Choose a value between 0 and 10 angstrom, ' +
                                  'or leave blank for automatic choice',
                       range    : [0,10],
                       value    : '',
                       label2   : '&nbsp;',
                       lwidth2  : 180,
                       position : [0,3,1,1]
                     },
               RES_CBX : { type : 'checkbox',
                       label    : 'use explicit resolution range in symmetry ' +
                                  'determination as well as in scaling',
                       tooltip  : 'Check for using resolution cut-off in symmetry ' +
                                  'determination',
                       value    : true,
                       position : [1,0,1,8]
                     },
               SCA_CBX : { type : 'checkbox',
                       label    : 'scale all datasets together but merge ' +
                                  'separately',
                       tooltip  : 'Uncheck for scaling and merging all ' +
                                  'datasets together',
                       value    : true,
                       position : [2,0,1,8]
                     }
             }
           }
  };

}


if (__template)
      TaskAimless.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskAimless.prototype = Object.create ( TaskTemplate.prototype );
TaskAimless.prototype.constructor = TaskAimless;


// ===========================================================================
// export such that it could be used in both node and a browser

TaskAimless.prototype.icon_small = function()  { return './images/task_aimless_20x20.svg'; }
TaskAimless.prototype.icon_large = function()  { return './images/task_aimless.svg';       }

TaskAimless.prototype.currentVersion = function()  { return 0; }

if (!__template)  {
  //  for client side

  TaskAimless.prototype.collectInput = function ( inputPanel )  {

    var input_msg = TaskTemplate.prototype.collectInput.call ( this,inputPanel );

    function addMessage ( label,message )  {
      if (input_msg.length>0)
        input_msg += '<br>';
      input_msg += '<b>' + label + ':</b> ' + message;
    }

    var unmerged = this.input_data.getData ( 'unmerged' );

    for (var i=0;i<unmerged.length;i++)  {
      for (var j=i+1;j<unmerged.length;j++)
        if (unmerged[i].dataId==unmerged[j].dataId)
          addMessage ( 'Reflection data','dataset ' + unmerged[i].dname + '<br>is ' +
                       'used in more than one input positions, which is not ' +
                       'allowed' );
    }

    return input_msg;

  }

} else  {
  //  for server side

  var conf = require('../../js-server/server.configuration');

  TaskAimless.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.aimless', exeType, jobDir, this.id];
  }

  // -------------------------------------------------------------------------

  module.exports.TaskAimless = TaskAimless;

}
