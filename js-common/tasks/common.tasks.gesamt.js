
/*
 *  =================================================================
 *
 *    02.03.18   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/tasks/common.tasks.gesamt.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  GESAMT Task Class
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

function TaskGesamt()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type   = 'TaskGesamt';
  this.name    = 'gesamt';
  this.oname   = 'gesamt';      // default output file name template
  this.title   = 'Structure Alignment with Gesamt';
  this.helpURL = './html/jscofe_task_gesamt.html';

  this.input_dtypes = [{      // input data types
     data_type   : {'DataStructure':['protein'],
                    'DataXYZ':['protein'] },  // data type(s) and subtype(s)
     label       : 'Structure',    // label for input dialog
     inputId     : 'xyz',          // input Id for referencing input fields
     customInput : 'chain-sel-protein', // lay custom fields next to the selection
     force       : 2,           // meaning choose, by default, 1 xyz sets if
                                // available; otherwise, the minimum (1) will
                                // be selected
     min         : 1,           // minimum acceptable number of data instances
     max         : 10           // maximum acceptable number of data instances
   }
  ];

  this.parameters = { // input parameters
    sec1 : { type     : 'section',
             title    : 'Parameters',
             open     : false,  // true for the section to be initially open
             position : [0,0,1,5],
             contains : {
               TITLE1 : {  type  : 'label',  // just a separator
                        label    : '<h3>PDB scanning parameters</h3>',
                        position : [0,0,1,4],
                        showon   : {'xyz':[1]} // from input data section
                      },
               MIN1 : { type     : 'real',
                        keyword  : 'MIN1',
                        label    : 'Report hits where at least',
                        tooltip  : 'Sets the minimum fraction of given structure ' +
                                   'that should be mapped on a PDB structure ' +
                                   '(0.7 by default). The lower the threshold, ' +
                                   'the higher number of hits is reported.',
                        range    : [0,1],
                        value    : '0.7',
                        label2   : 'of all residues of given structure',
                        position : [1,0,1,1],
                        showon   : {'xyz':[1]} // from input data section
                      },
               MIN2 : { type     : 'real',
                        keyword  : 'MIN2',
                        label    : 'is mapped on at least&nbsp;',
                        align    : 'right',
                        tooltip  : 'Sets the minimum fraction of PDB structure ' +
                                   'that should be mapped on given structure ' +
                                   '(0.7 by default). The lower the threshold, ' +
                                   'the higher number of hits is reported.',
                        range    : [0,1],
                        value    : '0.7',
                        label2   : 'of all residues of matched PDB structure',
                        position : [2,0,1,1],
                        showon   : {'xyz':[1]} // from input data section
                      },
              QSCORE : { type    : 'real',
                        keyword  : 'QSCORE',
                        label    : 'Minimum Q-score to report',
                        tooltip  : 'Sets the minimum Q-score (0.1 by default) ' +
                                   'to consider worth of reporting. Hits with ' +
                                   'lower Q-score are merely ignored. Q-score ' +
                                   'ranges from 0 (no alignment) to 1 (identical ' +
                                   'structures).',
                        range    : [0,1],
                        value    : '0.1',
                        position : [3,0,1,1],
                        showon   : {'xyz':[1]} // from input data section
                      },
              MAXHITS : { type   : 'integer',
                        keyword  : 'MAXHITS',
                        label    : 'Maximum number of hits to report',
                        tooltip  : 'Sets the maximum nuber of hits to report ' +
                                   '(1000 by default). Use this parameter ' +
                                   'responsibly as excessive number of hits ' +
                                   'is usually not infomative but can slow down ' +
                                   'your computer significantly',
                        range    : [10,10000],
                        value    : '1000',
                        position : [4,0,1,1],
                        showon   : {'xyz':[1]} // from input data section
                      },
               TITLE2 : { type   : 'label',  // just a separator
                        label    : '<h3>Alignment parameters</h3>',
                        position : [5,0,1,4]
                      },
               MODE : { type     : 'combobox',
                        keyword  : 'MODE',
                        label    : 'Alignment mode',
                        tooltip  : '"Balanced" mode provides a reasonable balance ' +
                                   'between alignment quality and efficiency, ' +
                                   'while "Quality" mode achieves extra alignment ' +
                                   'quality at the expense of significantly higher ' +
                                   'CPU time',
                        range    : ['-normal|Balance quality and efficiency',
                                    '-high|Prefer higher aligment quality'],
                                   // for comboboxes, 'range' lists all available
                                   // items encoded as 'value|text', where 'value'
                                   // is a valid value for the associated keyword,
                                   // and 'text' is displayed as an option in the
                                   // combobox.
                        value    : '-nortmal',
                        position : [6,0,1,3]
                      },
                R0  : { type     : 'real_',
                        keyword  : 'R0',
                        label    : 'Q-score balancing (R<sub>0</sub> [&Aring;])',
                        tooltip  : 'sets R0 parameter of Q-score (default is ' +
                                   '3 angstrom). This parameter balances the ' +
                                   'alignment length (the number of aligned ' +
                                   'residue pairs) and r.m.s.d. The higher R0, ' +
                                   'the longer alignments are produced.',
                        range    : [0.01,10],
                        value    : '',
                        position : [7,0,1,1]
                      },
                SIGMA : { type   : 'real_',
                        keyword  : 'SIGMA',
                        label    : 'Weighting parameter &sigma; [&Aring;]',
                        tooltip  : 'sets Sigma parameter (in angstrom) used for ' +
                                   'weighted superposition. The lower Sigma, ' +
                                   'the more the superposition algorithm is ' +
                                   'focused on short atom contacts. If Sigma is ' +
                                   'not set, weighted superposition is not used.',
                        range    : [0.01,10],
                        value    : '',
                        position : [8,0,1,1]
                      }
             }
           }
  };

}


if (__template)
      TaskGesamt.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskGesamt.prototype = Object.create ( TaskTemplate.prototype );
TaskGesamt.prototype.constructor = TaskGesamt;


// ===========================================================================
// export such that it could be used in both node and a browser

TaskGesamt.prototype.icon_small = function()  { return './images/task_gesamt_20x20.svg'; }
TaskGesamt.prototype.icon_large = function()  { return './images/task_gesamt.svg';       }

TaskGesamt.prototype.currentVersion = function()  { return 0; }


if (!__template)  {
  //  for client side

  TaskGesamt.prototype.inputChanged = function ( inpParamRef,emitterId,emitterValue )  {

    TaskTemplate.prototype.inputChanged.call ( this,inpParamRef,emitterId,emitterValue );

    if ((emitterId=='xyz') && (this.state==job_code.new))  {

      if (emitterValue<2)  {
        this.name  = 'gesamt (scan)';
        this.title = 'PDB Scanning with GESAMT';
      } else if (emitterValue==2)  {
        this.name  = 'gesamt (pairwise)';
        this.title = 'Pairwise Structural Alignment with GESAMT';
      } else if (emitterValue>2)  {
        this.name  = 'gesamt (multiple)';
        this.title = 'Multiple Structural Alignment with GESAMT';
      }
      var inputPanel = inpParamRef.grid.parent.parent;
      inputPanel.header.title.setText ( '<b>' + this.title + '</b>' );
      this.updateInputPanel ( inputPanel );

    }

  }


  TaskGesamt.prototype.updateInputPanel = function ( inputPanel )  {
    if (this.state==job_code.new)  {
      var event = new CustomEvent ( cofe_signals.jobDlgSignal,{
         'detail' : job_dialog_reason.rename_node
      });
      inputPanel.element.dispatchEvent(event);
    }
  }


} else  {
  //  for server side

  var conf = require('../../js-server/server.configuration');

  TaskGesamt.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.gesamt', exeType, jobDir, this.id];
  }

  // -------------------------------------------------------------------------

  module.exports.TaskGesamt = TaskGesamt;

}
