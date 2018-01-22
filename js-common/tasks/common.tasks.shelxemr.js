
/*
 *  =================================================================
 *
 *    05.12.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/cofe.tasks.shelxemr.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  ShelxE-MR Task Class
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

function TaskShelxEMR()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type   = 'TaskShelxEMR';
  this.name    = 'shelxe-MR';
  this.oname   = 'shelxe_mr';  // default output file name template
  this.title   = 'C&alpha;-tracing with ShelxE';
  this.helpURL = './html/jscofe_task_shelxemr.html';

  this.input_dtypes = [{  // input data types
      data_type   : {'DataRevision':['!protein','!phases']}, // data type(s) and subtype(s)
      label       : 'Structure revision',        // label for input dialog
      inputId     : 'revision', // input Id for referencing input fields
      version     : 0,          // minimum data version allowed
      min         : 1,          // minimum acceptable number of data instances
      max         : 1           // maximum acceptable number of data instances
    }
  ];

  this.parameters = { // input parameters
    SEP0_LABEL : {
          type     : 'label',  // just a separator
          label    : '&nbsp;',
          position : [0,0,1,5]
          },
    sec1: { type     : 'section',
            title    : 'Main options',
            open     : true,  // true for the section to be initially open
            position : [1,0,1,5],
            contains : {
              /*
              SOLVENT_CONTENT : {
                    type     : 'real',    // '_' means blank value is allowed
                    keyword  : '-s',      // parameter keyword
                    label    : 'Solvent content (%)',
                    align    : 'left',
                    iwidth   : 50,
                    default  : '50',      // to be displayed in grey
                    tooltip  : 'Choose a value between 1 and 99 (run Cell ' +
                               'Content Estimation task if unknown)',
                    range    : [1,99],    // may be absent (no limits) or must
                                          // be one of the following:
                                          //   ['*',max]  : limited from top
                                          //   [min,'*']  : limited from bottom
                                          //   [min,max]  : limited from top and bottom
                    value    : '50',      // value to be paired with the keyword
                    position : [0,0,1,1]  // [row,col,rowSpan,colSpan]
                  },
              */
              TRACING_CYCLES : {
                    type     : 'integer',  // '_' means blank value is allowed
                    keyword  : '-a',       //  parameter keyword
                    label    : 'Number of autotracing cycles',
                    align    : 'left',
                    iwidth   : 50,
                    default  : '15',      // to be displayed in grey
                    tooltip  : 'The total number of global autotracing cycles',
                    range    : [1,'*'],  // may be absent (no limits) or must
                                          // be one of the following:
                                          //   ['*',max]  : limited from top
                                          //   [min,'*']  : limited from bottom
                                          //   [min,max]  : limited from top and bottom
                    value    : '15',      // value to be paired with the keyword
                    position : [0,0,1,1]  // [row,col,rowSpan,colSpan]
                  },
              DM_CYCLES : {
                    type     : 'integer',  // '_' means blank value is allowed
                    keyword  : '-m',       //  parameter keyword
                    label    : 'Number of density modification cycles',
                    align    : 'left',
                    iwidth   : 50,
                    default  : '20',      // to be displayed in grey
                    tooltip  : 'The total number of global autotracing cycles',
                    range    : [1,'*'],  // may be absent (no limits) or must
                                          // be one of the following:
                                          //   ['*',max]  : limited from top
                                          //   [min,'*']  : limited from bottom
                                          //   [min,max]  : limited from top and bottom
                    value    : '20',      // value to be paired with the keyword
                    position : [1,0,1,1]  // [row,col,rowSpan,colSpan]
                  },
              AH_SEARCH_CBX : {
                    type     : 'checkbox',
                    keyword  : '-q',       //  parameter keyword
                    label    : 'Perform Alpha-Helix search',
                    tooltip  : 'Check to perform alpha-helix search.',
                    //iwidth    : 150,
                    value    : true,
                    position : [2,0,1,3]
                  },
              NCS_CBX : {
                    type     : 'checkbox',
                    keyword  : '-n',       //  parameter keyword
                    label    : 'Apply NCS in autotracing',
                    tooltip  : 'Check to apply NCS in autotracing.',
                    //iwidth    : 150,
                    value    : true,
                    position : [3,0,1,3]
                  },
              OMIT_RES_CBX : {
                    type     : 'checkbox',
                    keyword  : '-o',       //  parameter keyword
                    label    : 'Omit residues from fragment to optimize CC',
                    tooltip  : 'Check to omit residues from fragment to ' +
                               'optimize CC.',
                    //iwidth    : 150,
                    value    : true,
                    position : [4,0,1,3]
                  }
            }
          },
    sec2: { type     : 'section',
            title    : 'Extra options',
            open     : false,  // true for the section to be initially open
            position : [2,0,1,5],
            contains : {
              TIME_FACTOR : {
                    type     : 'real',  // '_' means blank value is allowed
                    keyword  : '-m',       //  parameter keyword
                    label    : 'Time factor for peptide searches',
                    align    : 'left',
                    iwidth   : 50,
                    default  : '4',      // to be displayed in grey
                    tooltip  : 'Time factor for peptides searches (increase if ' +
                               'difficult)',
                    range    : [1,'*'],  // may be absent (no limits) or must
                                          // be one of the following:
                                          //   ['*',max]  : limited from top
                                          //   [min,'*']  : limited from bottom
                                          //   [min,max]  : limited from top and bottom
                    value    : '4',      // value to be paired with the keyword
                    position : [2,0,1,1]  // [row,col,rowSpan,colSpan]
                  }
            }
          }
  };

/*
  -a    15  global autotracing cycles
  -b   5.0  extra B for revised heavy atom sites
  -c 0.400  fraction of pixels in crossover region
  -d 0.000  high resolution limit to be applied to input data
  -e unset  fill in missing data up to maximum resolution + 0.2 Ang.
  -f unset  read intensity not F from native .hkl file
  -F 0.800  fractional weight for phases from previous global cycle
  -g 1.100  solvent gamma flipping factor
  -i unset  no structure inversion
  -k   4.5  minimum height/sigma for revised heavy atom sites
  -l     2  space for  2000000 reflections
  -L     6  minimum number of residues per chain (if more than 3 chains)
  -m    20  cycles of density modification
  -G 0.700  FOM threshold for initial tripeptides and chain extension
  -n unset  do not apply NCS in autotracing
  -o        omit residues from fragment to optimize CC
  -q        alpha-helix search
  -r  3.00  map resolution (multiplies maximum indices)
  -s 0.450  solvent fraction
  -t  4.00  time factor for peptide searches (increase if difficult)
  -u   500  MB allocatable memory for fragment optimization
  -U  0.00  abort if less than this % of fragment CA retained within 0.7A
  -v 0.000  density sharpening factor
  -w 0.200  weight for experimental phases after cycle 1
  -x unset  no phase and trace diagnostics
  -y  1.80  highest resolution in Ang. for starting phases from model
  -z unset  do not optimize heavy atoms
*/


}


if (__template)
      TaskShelxEMR.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskShelxEMR.prototype = Object.create ( TaskTemplate.prototype );
TaskShelxEMR.prototype.constructor = TaskShelxEMR;


// ===========================================================================
// export such that it could be used in both node and a browser

TaskShelxEMR.prototype.icon_small = function()  { return './images/task_shelxemr_20x20.svg'; }
TaskShelxEMR.prototype.icon_large = function()  { return './images/task_shelxemr.svg';       }

TaskShelxEMR.prototype.currentVersion = function()  { return 0; }

if (!__template)  {
  //  for client side

/*
  TaskShelxEMR.prototype.inputChanged = function ( inpParamRef,emitterId,emitterValue )  {

    if ((emitterId=='substructure') || (emitterId=='xmodel')) {
      var inpDataRef = inpParamRef.grid.inpDataRef;
      var substr     = this.getInputItem ( inpDataRef,'substructure' );
      var xmodel     = this.getInputItem ( inpDataRef,'xmodel'       );

      if (!xmodel)  {
        substr = substr.dropdown[0];
        if (substr.getItemByPosition(0).value==-1)  {
          substr.deleteItemByPosition(0);  // remove '[do not use]' option
          substr.click();
        }
      } else if (!substr)  {
        xmodel = xmodel.dropdown[0];
        if (xmodel.getItemByPosition(0).value==-1)  {
          xmodel.deleteItemByPosition(0);  // remove '[do not use]' option
          xmodel.click();
        }
      } else  {
        xmodel = xmodel.dropdown[0];
        substr = substr.dropdown[0];
        xmodel_value = xmodel.getValue();
        substr_value = substr.getValue();
        if ((xmodel_value==substr_value) && (xmodel_value==-1))  {
          // select some valid option
          substr.selectItemByPosition ( 1 );
          substr.click();
          substr_value = substr.getItemByPosition(1).value;
        }
        // disable '[do not use]' options as necessary
        substr.disableItemByPosition ( 0,(xmodel_value<0) );
        xmodel.disableItemByPosition ( 0,(substr_value<0) );
      }

    }

    TaskTemplate.prototype.inputChanged.call ( this,inpParamRef,emitterId,emitterValue );

  }
*/

/*
  TaskShelxEMR.prototype.collectInput = function ( inputPanel )  {

    var input_msg = TaskTemplate.prototype.collectInput.call ( this,inputPanel );

    function addMessage ( label,message )  {
      if (input_msg.length>0)
        input_msg += '<br>';
      input_msg += '<b>' + label + ':</b> ' + message;
    }


    return input_msg;

  }
*/


} else  {
  //  for server side

  var conf = require('../../js-server/server.configuration');

  TaskShelxEMR.prototype.makeInputData = function ( jobDir )  {

    // put hkl and structure data in input databox for copying their files in
    // job's 'input' directory

    if ('revision' in this.input_data.data)  {
      var revision = this.input_data.data['revision'][0];
      //this.input_data.data['hkl']     = [revision.HKL];
      this.input_data.data['istruct'] = [revision.Structure];
    }

    __template.TaskTemplate.prototype.makeInputData.call ( this,jobDir );

  }

  TaskShelxEMR.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.shelxemr', exeType, jobDir, this.id];
  }

  // -------------------------------------------------------------------------

  module.exports.TaskShelxEMR = TaskShelxEMR;

}
