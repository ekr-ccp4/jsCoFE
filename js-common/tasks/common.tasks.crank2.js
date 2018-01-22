
/*
 *  =================================================================
 *
 *    05.12.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/common.tasks.crank2.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Crank-2 Task Class
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

function TaskCrank2()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type   = 'TaskCrank2';
  this.name    = 'EP with Crank2';
  this.oname   = 'crank2';  // default output file name template
  this.title   = 'Crank-2 Automated Experimental Phasing';
  this.helpURL = './html/jscofe_task_crank2.html';

  this.input_dtypes = [{    // input data types
      data_type   : {'DataRevision':['!protein','asu']}, // data type(s) and subtype(s)
      label       : 'Structure revision',     // label for input dialog
      inputId     : 'revision', // input Id for referencing input fields
      customInput : 'crank2',   // lay custom fields next to the selection
                                // dropdown for 'native' dataset
      version     : 0,          // minimum data version allowed
      min         : 1,          // minimum acceptable number of data instances
      max         : 1           // maximum acceptable number of data instances
    },{
      data_type   : {'DataHKL':['anomalous']}, // data type(s) and subtype(s)
      label       : 'Anomalous reflection<br>data',             // label for input dialog
      inputId     : 'hkl',       // input Id for referencing input fields
      customInput : 'anomData',  // lay custom fields next to the selection
                                 // dropdown for anomalous data
      tooltip     : 'Only anomalous reflection datasets from all imported ' +
                    'may be chosen here. Note that neither of reflection '  +
                    'datasets may coincide with the native dataset, if one is ' +
                    'specified above.',
      min         : 1,           // minimum acceptable number of data instances
      max         : 4            // maximum acceptable number of data instances
    },{
      data_type   : {'DataHKL':[]},   // data type(s) and subtype(s)
      label       : 'Native dataset', // label for input dialog
      inputId     : 'native',     // input Id for referencing input fields
      customInput : 'native',     // lay custom fields next to the selection
                                  // dropdown for 'native' dataset
      tooltip     : 'Native dataset is optional and may be chosen from both ' +
                    'non-anomalous (typical case) and anomalous diffraction ' +
                    'datasets. Native dataset must not coincide with any of ' +
                    'the reflection datasets chosen above.',
      min         : 0,            // minimum acceptable number of data instances
      max         : 1             // maximum acceptable number of data instances
    }
  ];

  this.parameters = { // input parameters
    sec1: { type     : 'section',
            title    : 'Main Parameters',
            open     : true,  // true for the section to be initially open
            position : [0,0,1,5],
            value    : 'crank2', // used to hide elements in SHELX pipeline
            contains : {
              /*
              NRES : {
                    type      : 'integer',  // blank value is not allowed
                    keyword   : 'residues_mon=', // the real keyword for job input stream
                    label     : 'Number of residues in a monomer',
                    tooltip   : 'This value must be given if target sequence is ' +
                                'not specified',
                    iwidth    : 80,
                    range     : [1,'*'],    // may be absent (no limits) or must
                                            // be one of the following:
                                            //   ['*',max]  : limited from top
                                            //   [min,'*']  : limited from bottom
                                            //   [min,max]  : limited from top and bottom
                    value     : '100',      // value to be paired with the keyword
                    position  : [0,0,1,1],  // [row,col,rowSpan,colSpan]
                    showon    : {seq:[0]},  // from input data section
                    hideon    : {sec1:['shelx-substr']}
                  },
                */
              HATOM : {
                    type      : 'string',   // empty string not allowed
                    keyword   : 'atomtype=',
                    label     : 'Substructure atom',
                    tooltip   : 'Substructure atom giving anomalous scattering',
                    iwidth    : 80,
                    value     : 'Se',
                    emitting  : true,    // will emit 'onchange' signal
                    maxlength : 2,       // maximum input length
                    position  : [0,0,1,1]
                  },
              NDSULF : {
                    type      : 'integer_',   // '_' means blank value is allowed
                    keyword   : 'num_dsul::', // the real keyword for job input stream
                    label     : '&nbsp;&nbsp;&nbsp;No. of disulphides to ' +
                                'be treated as S-S pairs',
                    tooltip   : 'Optional number of disulphides to be treated ' +
                                'as S-S pairs. Ignored if left blank (default).',
                    iwidth    : 50,
                    range     : [0,'*'],  // may be absent (no limits) or must
                                          // be one of the following:
                                          //   ['*',max]  : limited from top
                                          //   [min,'*']  : limited from bottom
                                          //   [min,max]  : limited from top and bottom
                    value     : '',       // value to be paired with the keyword
                    position  : [0,4,1,1], // [row,col,rowSpan,colSpan]
                    showon    : {HATOM:['S']}
                  },
              NATOMS : {
                    type      : 'integer_',       // '_' means blank value is allowed
                    keyword   : 'exp_num_atoms=', // the real keyword for job input stream
                    label     : 'No. of substructure atoms in a.s.u.',
                    tooltip   : 'Optional number of substructure atoms in ' +
                                'asymmetric unit. Leave blank for automatic ' +
                                'choice.',
                    lwidth    : 230,
                    iwidth    : 80,
                    range     : [1,'*'],  // may be absent (no limits) or must
                                          // be one of the following:
                                          //   ['*',max]  : limited from top
                                          //   [min,'*']  : limited from bottom
                                          //   [min,max]  : limited from top and bottom
                    value     : '',       // value to be paired with the keyword
                    //label2    : ' ',
                    //lwidth2   : 100,
                    position  : [1,0,1,1] // [row,col,rowSpan,colSpan]
                  },
              PARTIAL_AS_SUBSTR : {
                    type      : 'checkbox',
                    label     : 'Remove all non-anomalous atoms before rebuilding',
                    tooltip   : 'Check to rebuild solely from maps phased from ' +
                                'the anomalous signal. This removes any potential ' +
                                'initial model bias but may not work or be slower ' +
                                'in some cases.',
                    iwidth    : 400,
                    value     : false,
                    position  : [2,0,1,5],
                    hideon    : {_:'||','revision.xyz':[0,-1],sec1:['shelx-substr']}    // from this and input data section
                  },
              /*
              MONOMERS_ASYM : {
                    type      : 'integer_', // blank value is allowed
                    keyword   : 'monomers_asym=', // the real keyword for job input stream
                    label     : 'Number of NCS copies',
                    tooltip   : 'Number of monomers in the asymmetric unit.',
                    iwidth    : 80,
                    range     : [1,'*'],    // may be absent (no limits) or must
                                            // be one of the following:
                                            //   ['*',max]  : limited from top
                                            //   [min,'*']  : limited from bottom
                                            //   [min,max]  : limited from top and bottom
                    value     : '',         // value to be paired with the keyword
                    position  : [4,0,1,1],  // [row,col,rowSpan,colSpan]
                    hideon    : {sec1:['shelx-substr']} // from this and input data section
                  }
              */
              /*
                  },
              SOLVENT_CONTENT : {
                    type      : 'real_', // blank value is allowed
                    keyword   : 'solvent_content=', // the real keyword for job input stream
                    label     : 'Solvent content',
                    tooltip   : 'Fraction of the solvent in the crystal (must ' +
                                'be between 0.1 and 0.9).',
                    iwidth    : 80,
                    range     : [0.1,0.9],  // may be absent (no limits) or must
                                            // be one of the following:
                                            //   ['*',max]  : limited from top
                                            //   [min,'*']  : limited from bottom
                                            //   [min,max]  : limited from top and bottom
                    value     : '',         // value to be paired with the keyword
                    position  : [5,0,1,1],  // [row,col,rowSpan,colSpan]
                    hideon    : {sec1:['shelx-substr']} // from this and input data section
                  }
              */
            }
    },
    sec2: { type     : 'section',
            title    : 'Advanced options for substructure detection',
            open     : false,  // true for the section to be initially open
            showon   : {_:'||','revision.xyz':[0,-1],sec1:['shelx-substr']}, // from this and input data section
            position : [1,0,1,5],
            contains : {
              SUBSTRDET_PROGRAM : {
                    type     : 'combobox',
                    keyword  : 'SUBSTRDET_PROGRAM',
                    label    : 'Substructure determination program',
                    tooltip  : 'The program that will be used for ' +
                               'substructure determination',
                    range    : ['_blank_|Auto',
                                'shelxd|ShelXD',
                                'prasa|Prasa'
                               ],
                    value    : '_blank_',
                    position : [0,0,1,1],
                    showon   : {sec1:['crank2']}
                  },
              FAEST_PROGRAM : {
                    type     : 'combobox',
                    keyword  : 'FAEST_PROGRAM',
                    label    : 'FA values estimation program',
                    tooltip  : 'The program that will be used for estimation ' +
                               'of FA respective E values, inputted to ' +
                               'substructure determination program',
                    range    : ['_blank_|Auto',
                                'shelxc|ShelXC',
                                'ecalc|ECalc',
                                'afro|Afro'
                               ],
                    value    : '_blank_',
                    position : [1,0,1,1],
                    showon   : {sec1:['crank2']},
                    hideon   : {SUBSTRDET_PROGRAM:['shelxd']}
                  },
              SUBSTRDET_NUM_TRIALS : {
                    type      : 'integer_',     // blank value is allowed
                    keyword   : 'num_trials::', // the real keyword for job input stream
                    label     : 'Number of trials',
                    tooltip   : 'The number of substructure determination ' +
                                'trials performed if the specified CFOM or ' +
                                'CC threshold is not reached.',
                    range     : [1,'*'],   // may be absent (no limits) or must
                                           // be one of the following:
                                           //   ['*',max]  : limited from top
                                           //   [min,'*']  : limited from bottom
                                           //   [min,max]  : limited from top and bottom
                    value     : '',        // value to be paired with the keyword
                    position  : [2,0,1,1]  // [row,col,rowSpan,colSpan]
                  },
              SUBSTRDET_THRESHOLD_STOP_SHELXD : {
                    type      : 'real_',     // blank value is allowed
                    keyword   : 'threshold_stop::', // the real keyword for job input stream
                    label     : 'CFOM threshold for early stop',
                    tooltip   : 'If the threshold is reached, the substructure ' +
                                'detection will stop, assuming a solution was ' +
                                'obtained that will be used for phasing. Saves ' +
                                'time for the "easy" datasets.',
                    range     : [0.0,'*'],   // may be absent (no limits) or must
                                           // be one of the following:
                                           //   ['*',max]  : limited from top
                                           //   [min,'*']  : limited from bottom
                                           //   [min,max]  : limited from top and bottom
                    value     : '',        // value to be paired with the keyword
                    position  : [3,0,1,1], // [row,col,rowSpan,colSpan]
                    showon    : {_:'||',sec1:['shelx-substr'],SUBSTRDET_PROGRAM:['shelxd']}
                  },
              SUBSTRDET_THRESHOLD_STOP : {
                    type      : 'real_',     // blank value is allowed
                    keyword   : 'threshold_stop::', // the real keyword for job input stream
                    label     : 'CC threshold for early stop',
                    tooltip   : 'If the threshold is reached, the substructure ' +
                                'detection will stop, assuming a solution was ' +
                                'obtained that will be used for phasing. Saves ' +
                                'time for the "easy" datasets.',
                    range     : [0.0,'*'],   // may be absent (no limits) or must
                                           // be one of the following:
                                           //   ['*',max]  : limited from top
                                           //   [min,'*']  : limited from bottom
                                           //   [min,max]  : limited from top and bottom
                    value     : '',        // value to be paired with the keyword
                    position  : [3,0,1,1], // [row,col,rowSpan,colSpan]
                    hideon    : {_:'||',sec1:['shelx-substr'],SUBSTRDET_PROGRAM:['shelxd']}
                  },
              SUBSTRDET_HIGH_RES_CUTOFF_SHELXD : {
                    type      : 'real_',     // blank value is allowed
                    keyword   : 'high_res_cutoff::', // the real keyword for job input stream
                    label     : 'High resolution cutoff [&Aring]',
                    tooltip   : 'The high resolution cutoff for substructure ' +
                                'determination.',
                    range     : [0.01,'*'], // may be absent (no limits) or must
                                            // be one of the following:
                                            //   ['*',max]  : limited from top
                                            //   [min,'*']  : limited from bottom
                                            //   [min,max]  : limited from top and bottom
                    value     : '',         // value to be paired with the keyword
                    position  : [4,0,1,1],  // [row,col,rowSpan,colSpan]
                    showon    : {_:'||',sec1:['shelx-substr'],SUBSTRDET_PROGRAM:['shelxd']}
                  },
              SUBSTRDET_HIGH_RES_CUTOFF : {
                    type      : 'real_',     // blank value is allowed
                    keyword   : 'high_res_cutoff::', // the real keyword for job input stream
                    label     : 'Initial high resolution cutoff [&Aring]',
                    tooltip   : 'The initially tested high resolution cutoff ' +
                                'for substructure determination.',
                    range     : [0.01,'*'], // may be absent (no limits) or must
                                            // be one of the following:
                                            //   ['*',max]  : limited from top
                                            //   [min,'*']  : limited from bottom
                                            //   [min,max]  : limited from top and bottom
                    value     : '',         // value to be paired with the keyword
                    position  : [4,0,1,1],  // [row,col,rowSpan,colSpan]
                    hideon    : {_:'||',sec1:['shelx-substr'],SUBSTRDET_PROGRAM:['shelxd']}
                  },
              SUBSTRDET_HIGH_RES_CUTOFF_RADIUS : {
                    type      : 'real_',     // blank value is allowed
                    keyword   : 'high_res_cutoff_radius::', // the real keyword for job input stream
                    label     : 'Radius of tested cutoffs [&Aring]',
                    tooltip   : 'High resolution cutoffs will be tested in ' +
                                'this radius around the specified initial ' +
                                'cutoff. A radius of +-0.5Å - thus scanning ' +
                                'over 1Å range - is typically sufficient.',
                    range     : [0.01,'*'], // may be absent (no limits) or must
                                            // be one of the following:
                                            //   ['*',max]  : limited from top
                                            //   [min,'*']  : limited from bottom
                                            //   [min,max]  : limited from top and bottom
                    value     : '',         // value to be paired with the keyword
                    position  : [5,0,1,1],  // [row,col,rowSpan,colSpan]
                    showon    : {_:'&&',SUBSTRDET_PROGRAM:['prasa'],sec1:['crank2']}
                  },
              SUBSTRDET_HIGH_RES_CUTOFF_STEP : {
                    type      : 'real_',     // blank value is allowed
                    keyword   : 'high_res_cutoff_step::', // the real keyword for job input stream
                    label     : 'Incremental step for cutoff testing [&Aring]',
                    tooltip   : 'The slicing of the cutoff testing: the lower ' +
                                'the value, the more cutoffs will be tested in ' +
                                'the chosen resolution cutoff range.',
                    range     : [0.001,'*'], // may be absent (no limits) or must
                                             // be one of the following:
                                             //   ['*',max]  : limited from top
                                             //   [min,'*']  : limited from bottom
                                             //   [min,max]  : limited from top and bottom
                    value     : '',          // value to be paired with the keyword
                    position  : [6,0,1,1],   // [row,col,rowSpan,colSpan]
                    showon    : {_:'&&',SUBSTRDET_PROGRAM:['prasa'],sec1:['crank2']}
                  },
              SUBSTRDET_MIN_DIST_SYMM_ATOMS : {
                    type     : 'combobox',
                    keyword  : 'min_dist_symm_atoms::',
                    label     : 'Atoms in special positions allowed',
                    tooltip   : 'Select this option if (part of) the anomalous ' +
                                'substructure atoms can be in special positions: ' +
                                'positions related by more than one space group ' +
                                'symmetry operator.',
                    range    : ['_blank_|Auto',
                                '-0.1|Yes',
                                '3|No',
                               ],
                    value    : '_blank_',
                    position : [7,0,1,2]
                  },
              SUBSTRDET_MIN_DIST_ATOMS : {
                    type      : 'real_',     // blank value is allowed
                    keyword   : 'min_dist_atoms::', // the real keyword for job input stream
                    label     : 'Minimal distance between atoms [&Aring]',
                    tooltip   : 'The (expected) minimal distance between ' +
                                'anomalous substructure atoms.',
                    range     : [0.001,'*'], // may be absent (no limits) or must
                                             // be one of the following:
                                             //   ['*',max]  : limited from top
                                             //   [min,'*']  : limited from bottom
                                             //   [min,max]  : limited from top and bottom
                    value     : '',          // value to be paired with the keyword
                    position  : [8,0,1,1]    // [row,col,rowSpan,colSpan]
                  },
              SUBSTRDET_NUM_ATOMS : {
                    type      : 'integer_',    // blank value is allowed
                    keyword   : 'num_atoms::', // the real keyword for job input stream
                    label     : 'Number of searched peaks in the ASU',
                    tooltip   : 'The number of searched peaks typically '     +
                                'corresponds to the expected number of '      +
                                'substructure atoms in the asymmetric unit. ' +
                                'A value of 0 for program PRASA specifies '   +
                                'that this restraint will not be used in '    +
                                'substructure detection',
                    range     : [0,'*'], // may be absent (no limits) or must
                                             // be one of the following:
                                             //   ['*',max]  : limited from top
                                             //   [min,'*']  : limited from bottom
                                             //   [min,max]  : limited from top and bottom
                    value     : '',          // value to be paired with the keyword
                    position  : [9,0,1,1]    // [row,col,rowSpan,colSpan]
                  }
            }
    },
    sec3: { type     : 'section',
            title    : 'Advanced options for substructure improvement',
            open     : false,  // true for the section to be initially open
            showon   : {_:'||',sec1:['crank2'],sec1:['shelx-substr']}, // from this and input data section
//            showon   : {sec1:['crank2']},
            position : [2,0,1,5],
            contains : {
              REFATOMPICK_NUM_ITER : {
                    type      : 'integer_',   // blank value is allowed
                    keyword   : 'num_iter::', // the real keyword for job input stream
                    label     : 'Number of iterations',
                    tooltip   : 'Picking of new substructure atoms from ' +
                                'anomalous maps and refinement will be ' +
                                'iterated for the selected number of cycles. ' +
                                'Leave blank for automatic choice.',
                    range     : [0,'*'],   // may be absent (no limits) or must
                                           // be one of the following:
                                           //   ['*',max]  : limited from top
                                           //   [min,'*']  : limited from bottom
                                           //   [min,max]  : limited from top and bottom
                    value     : '',        // value to be paired with the keyword
                    position  : [0,0,1,1]  // [row,col,rowSpan,colSpan]
                  },
              REFATOMPICK_REFCYC : {
                    type      : 'integer_',  // blank value is allowed
                    keyword   : 'refcyc::',  // the real keyword for job input stream
                    label     : 'Number of refinement cycles per iteration',
                    tooltip   : 'Number of refinement cycles in each iteration ' +
                                'of substructure atom picking. Leave blank for ' +
                                'automatic choice.',
                    range     : [0,'*'],   // may be absent (no limits) or must
                                           // be one of the following:
                                           //   ['*',max]  : limited from top
                                           //   [min,'*']  : limited from bottom
                                           //   [min,max]  : limited from top and bottom
                    value     : '',        // value to be paired with the keyword
                    position  : [1,0,1,1]  // [row,col,rowSpan,colSpan]
                  },
              REFATOMPICK_RMS_THRESHOLD : {
                    type      : 'real_',  // blank value is allowed
                    keyword   : 'rms_threshold::', // the real keyword for job input stream
                    label     : 'RMS threshold for addition of new atoms',
                    tooltip   : 'Peaks above the specified RMS threshold in ' +
                                'the anomalous difference map will be added ' +
                                'to the anomalous substructure. Leave blank ' +
                                'for automatic choice.',
                    range     : [1,'*'],   // may be absent (no limits) or must
                                           // be one of the following:
                                           //   ['*',max]  : limited from top
                                           //   [min,'*']  : limited from bottom
                                           //   [min,max]  : limited from top and bottom
                    value     : '',        // value to be paired with the keyword
                    position  : [2,0,1,1]  // [row,col,rowSpan,colSpan]
                  }
            }
    },
    sec4: { type     : 'section',
            title    : 'Advanced options for hand determination',
            open     : false,  // true for the section to be initially open
            position : [3,0,1,5],
            showon   : {'revision.xyz':[0,-1]}, // from this and input data section
            contains : {
              HANDDET_DO : {
                    type     : 'checkbox',
                    label    : 'Perform hand determination',
                    tooltip  : 'Unselect if you wish to skip the hand ' +
                               'determination and directly proceed with the ' +
                               'current hand',
                    value    : true,
                    position : [0,0,1,1],
                    showon   : {'revision.xyz':[0,-1]} // from this and input data section
                  }
            }
    },
    sec5: { type     : 'section',
            title    : 'Advanced options for density modification',
            open     : false,  // true for the section to be initially open
            position : [4,0,1,5],
            showon   : {sec1:['crank2']},
            hideon   : {_:'&&','revision.xyz':[1],PARTIAL_AS_SUBSTR:[false]},
            contains : {
              DMFULL_DM_PROGRAM : {
                    type     : 'combobox',
                    keyword  : 'dm',
                    label    : 'Density modification program',
                    tooltip  : 'The program that will be used for the real ' +
                               'space density modification.',
                    range    : ['_blank_|Auto',
                                'parrot|Parrot',
                                'solomon|Solomon'
                               ],
                    value    : '_blank_',
                    position : [0,0,1,1],
                    showon   : {sec1:['crank2']}
                  },
              DMFULL_PHCOMB_PROGRAM : {
                    type     : 'combobox',
                    keyword  : 'phcomb',
                    label    : 'Phase combination program',
                    tooltip  : 'The program that will be used for the real ' +
                               'space density modification.',
                    range    : ['_blank_|Auto',
                                'refmac|Refmac',
                                'multicomb|MultiComb'
                               ],
                    value    : '_blank_',
                    position : [1,0,1,1],
                    showon   : {sec1:['crank2'],hkl:[1]}
                  },
              DMFULL_DMCYC : {
                    type      : 'integer_', // blank value is allowed
                    keyword   : 'dmcyc::',  // the real keyword for job input stream
                    label     : 'Number of cycles',
                    tooltip   : 'Number of density modification iterations.',
                    range     : [1,'*'],    // may be absent (no limits) or must
                                            // be one of the following:
                                            //   ['*',max]  : limited from top
                                            //   [min,'*']  : limited from bottom
                                            //   [min,max]  : limited from top and bottom
                    value     : '',         // value to be paired with the keyword
                    position  : [2,0,1,1],  // [row,col,rowSpan,colSpan]
                    showon   : {sec1:['crank2']}
                  },
              DMFULL_THRESHOLD_STOP : {
                    type      : 'real_', // blank value is allowed
                    keyword   : 'threshold_stop::',  // the real keyword for job input stream
                    label     : 'FOM threshold for early stop',
                    tooltip   : 'If this figure of merit is reached, density ' +
                                'modification will stop early, assuming a well ' +
                                'phased map suitable for model building. Saves ' +
                                'some time for the "easy" datasets.',
                    range     : [0.001,'*'], // may be absent (no limits) or must
                                             // be one of the following:
                                             //   ['*',max]  : limited from top
                                             //   [min,'*']  : limited from bottom
                                             //   [min,max]  : limited from top and bottom
                    value     : '',          // value to be paired with the keyword
                    position  : [3,0,1,1],   // [row,col,rowSpan,colSpan]
                    showon   : {sec1:['crank2']}
                  }
            }
    },
    sec6: { type     : 'section',
            title    : 'Advanced options for model building',
            open     : false,  // true for the section to be initially open
            showon   : {sec1:['crank2']},
            position : [5,0,1,5],
            contains : {
              COMB_PHDMMB_DO : {
                    type      : 'checkbox',
                    label     : 'Use the "combined" algorithm',
                    iwidth    : 300,
                    tooltip   : 'Unclick the option if you do not wish to use ' +
                                'the "combined" Crank2 algorithm. For example, ' +
                                'it may rarely happen that density modification ' +
                                'makes the phases worse.',
                    value     : true,
                    position  : [0,0,1,3],
                    showon    : {sec1:['crank2']},
                    hideon    : { _:'||',     // apply logical 'or' to all items
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },

              //  =========== PARAMETERS FOR ITERATIVE MODEL BUILDING =========

              TITLE1 : {
                    type      : 'label',  // just a separator
                    label     : '<h3>Parameters for iterative model building</h3>',
                    position  : [1,0,1,4],
                    showon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },
              MBREF_MB_PROGRAM : {
                    type      : 'combobox',
                    keyword   : 'mb',
                    label     : 'Model building program',
                    lwidth    : 250,
                    tooltip   : 'The program that will be used for building of ' +
                                'the protein model.',
                    range     : ['_blank_|Auto',
                                 'buccaneer|Buccaneer',
                                 'arpwarp|Arp/wArp',
                                 'shelxe|ShelXE'
                                ],
                    value     : '_blank_',
                    position  : [3,0,1,1],
                    showon    : { _:'&&',sec1:['crank2'],
                                  comb: { _:'||',
                                          COMB_PHDMMB_DO:[false],
                                          native:[1],
                                          hkl   :[2,3,4]
                                        }
                                }
                  },
              MBREF_BIGCYC : {
                    type      : 'integer_', // blank value is allowed
                    keyword   : 'bigcyc::', // the real keyword for job input stream
                    label     : 'Number of building cycles',
                    lwidth    : 250,
                    tooltip   : 'Number of the model building iterations.',
                    range     : [1,'*'],    // may be absent (no limits) or must
                                            // be one of the following:
                                            //   ['*',max]  : limited from top
                                            //   [min,'*']  : limited from bottom
                                            //   [min,max]  : limited from top and bottom
                    value     : '',         // value to be paired with the keyword
                    position  : [5,0,1,1],  // [row,col,rowSpan,colSpan]
                    showon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },
              MBREF_EXCLUDE_FREE : {
                    type      : 'combobox',
                    keyword   : '',
                    label     : 'Exclude free reflections in building',
                    tooltip   : 'Specify whether the free reflections should ' +
                                'be excluded.',
                    range     : ['_blank_|Auto',
                                 'True|Yes',
                                 'False|No',
                                ],
                    value     : '_blank_',
                    position  : [7,0,1,1],
                    showon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },


              //  =========== PARAMETERS FOR ITERATIVE MODEL BUILDING =========

              TITLE2 : {
                    type      : 'label',  // just a separator
                    label     : '<h3>Parameters for combined model building</h3>',
                    position  : [2,0,1,4],
                    hideon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },
              COMB_PHDMMB_DMFULL_DM_PROGRAM : {
                    type      : 'combobox',
                    keyword   : 'dmfull dm',
                    label     : 'Density modification program',
                    tooltip   : 'The program that will be used for crystal ' +
                                'space density modification.',
                    range     : ['_blank_|Auto',
                                 'parrot|Parrot',
                                 'solomon|Solomon'
                                ],
                    value     : '_blank_',
                    position  : [4,0,1,1],
                    showon    : {sec1:['crank2']},
                    hideon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },
              COMB_PHDMMB_START_SHELXE : {
                    type      : 'combobox',
                    keyword   : 'start_shelxe::',
                    label     : 'Start with a few SHELXE tracing cycles',
                    tooltip   : 'If "yes" is chosen then a few initial model tracing ' +
                                'cycles will be performed by ShelxE\'s backbone ' +
                                'tracing algorithm, followed by the usual ' +
                                'Buccaneer model building cycles. The "combined" ' +
                                'algorithm will be still used throughout. This ' +
                                'option is sometimes useful at higher resolutions.',
                    range     : ['_blank_|Auto',
                                 'True|Yes',
                                 'False|No',
                                ],
                    value     : '_blank_',
                    position  : [6,0,1,1],
                    showon    : {sec1:['crank2']},
                    hideon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },
              COMB_PHDMMB_MINBIGCYC : {
                    type      : 'integer_', // blank value is allowed
                    keyword   : 'minbigcyc::',  // the real keyword for job input stream
                    label     : 'Minimal number of building cycles',
                    tooltip   : 'The minimal number of building cycles will be ' +
                                'performed in case of "easy" tracing. For a ' +
                                'more difficult tracing, more cycles will be ' +
                                'performed, up to the specified maximal number ' +
                                'of building cycles.',
                    range     : [1,'*'],    // may be absent (no limits) or must
                                            // be one of the following:
                                            //   ['*',max]  : limited from top
                                            //   [min,'*']  : limited from bottom
                                            //   [min,max]  : limited from top and bottom
                    value     : '',         // value to be paired with the keyword
                    position  : [8,0,1,1],  // [row,col,rowSpan,colSpan]
                    showon    : {sec1:['crank2']},
                    hideon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },
              COMB_PHDMMB_MAXBIGCYC : {
                    type      : 'integer_', // blank value is allowed
                    keyword   : 'maxbigcyc::',  // the real keyword for job input stream
                    label     : 'Maximal number of building cycles',
                    tooltip   : 'The model building will stop after the ' +
                                'specified number of building cycles, even ' +
                                'if the model is not built yet.',
                    range     : [1,'*'],    // may be absent (no limits) or must
                                            // be one of the following:
                                            //   ['*',max]  : limited from top
                                            //   [min,'*']  : limited from bottom
                                            //   [min,max]  : limited from top and bottom
                    value     : '',         // value to be paired with the keyword
                    position  : [10,0,1,1],  // [row,col,rowSpan,colSpan]
                    showon    : {sec1:['crank2']},
                    hideon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },
              COMB_PHDMMB_SKIP_INITIAL_BUILD : {
                    type      : 'combobox',
                    keyword   : 'skip_initial_build::',
                    label     : 'Skip the first model building cycle',
                    tooltip   : 'Use this option to skip the initial (re)' +
                                'building, thus starting with phase restrained ' +
                                'refinement. If not skipped then the model is ' +
                                'first (re)built and then subjected to phase ' +
                                'restrained refinement.',
                    range     : ['_blank_|Auto',
                                 'True|Yes',
                                 'False|No',
                                ],
                    value     : '_blank_',
                    position  : [12,0,1,1],
                    showon    : {sec1:['crank2']},
                    hideon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },
              COMB_PHDMMB_REBUILD_ONLY : {
                    type      : 'combobox',
                    keyword   : 'rebuild_only::',
                    label     : 'Soft rebuilding',
                    tooltip   : 'In case of soft rebuilding, the actual model ' +
                                'is inputted to each model building cycle. If ' +
                                'soft building is not used then Crank2 alternates ' +
                                'cycles of rebuilding inputting and not inputting ' +
                                'the model. Soft rebuilding may be useful when ' +
                                'rebuilding an already good model where model ' +
                                'bias is not a major concern.',
                    range     : ['_blank_|Auto',
                                 'True|Yes',
                                 'False|No',
                                ],
                    value     : '_blank_',
                    position  : [14,0,1,1],
                    showon    : {sec1:['crank2']},
                    hideon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },
              COMB_PHDMMB_ALWAYS_EXCLUDE_FREE : {
                    type      : 'combobox',
                    keyword   : 'always_exclude_free::',
                    label     : 'Exclude free reflections',
                    tooltip   : 'Specify when the free reflections should be excluded.',
                    range     : ['_blank_|Auto',
                                 'True|always',
                                 'False|in last cycles',
                                 'never|never'
                                ],
                    value     : '_blank_',
                    position  : [16,0,1,1],
                    showon    : {sec1:['crank2']},
                    hideon    : { _:'||',
                                  COMB_PHDMMB_DO:[false],
                                  native:[1],
                                  hkl   :[2,3,4]
                                }
                  },
              COMB_PHDMMB_NCS_DET : {
                    type      : 'combobox',
                    keyword   : 'ncs_det::',
                    label     : 'Try to determine NCS',
                    tooltip   : 'Option to try to determine NCS operators and ' +
                                'use them for density averaging. By defalt, ' +
                                'the NCS operators will be obtained from the ' +
                                'anomalous substructure which may be time ' +
                                'consuming with a large substructure.',
                    range     : ['_blank_|Auto',
                                 'True|Yes',
                                 'False|No',
                                ],
                    value     : '_blank_',
                    position  : [18,0,1,1],
                    showon    : {sec1:['crank2']},
                    hideon    : { _:'||',
                                  COMB_PHDMMB_DMFULL_DM_PROGRAM:['solomon'],
                                  MONOMERS_ASYM :['1'],
                                  COMB_PHDMMB_DO:[false],
                                  native : [1],
                                  hkl    : [2,3,4]
                                }
                  },
              COMB_PHDMMB_NCS_DET_MR : {
                    type      : 'checkbox',
                    keyword   : 'ncs_det_mr::',
                    label     : 'from partial model (rather than heavy atoms)',
                    tooltip   : 'The NCS operators for NCS averaging will be ' +
                                'obtained from the initial partial model. ' +
                                'Requires a reasonably good input partial model.',
                    value     : false,
                    translate : ['False','True'], // needed for getKWItem() in basic.py
                    position  : [18,4,1,1],
                    showon    : {sec1:['crank2']},
                    hideon    : { _:'||',
                                  COMB_PHDMMB_DMFULL_DM_PROGRAM:['solomon'],
                                  MONOMERS_ASYM       : ['1'],
                                  COMB_PHDMMB_NCS_DET : ['_blank_','False'],
                                  COMB_PHDMMB_DO      : [false],
                                  'revision.xyz' : [0,-1],
                                  native : [1],
                                  hkl    : [2,3,4]
                                }
                  }

            }
    },
    sec7: { type     : 'section',
            title    : 'Advanced options for poly-alanine tracing',
            open     : false,  // true for the section to be initially open
            position : [7,0,1,5],
            showon   : {sec1:['shelx']},
            contains : {
          }
    }

  }

}

if (__template)
      TaskCrank2.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskCrank2.prototype = Object.create ( TaskTemplate.prototype );
TaskCrank2.prototype.constructor = TaskCrank2;


// ===========================================================================
// export such that it could be used in both node and a browser

TaskCrank2.prototype.icon_small = function()  { return './images/task_crank2_20x20.svg'; }
TaskCrank2.prototype.icon_large = function()  { return './images/task_crank2.svg';       }

TaskCrank2.prototype.currentVersion = function()  { return 0; }

if (!__template)  {


  TaskCrank2.prototype.addCustomDataState = function ( inpDataRef,dataState ) {

    var nHKL = dataState['hkl'];
    var item = this.getInputItem ( inpDataRef,'revision' );
    if (item)  {
      var dropdown = item.dropdown[0];
      /*
      if (dropdown.customGrid.hasOwnProperty('native'))  {
        var cddn     = dropdown.customGrid.native;
        cddn.disableItem ( 'natphasing',(nHKL>1) );
        switch (cddn.getValue())  {
          case 'unused'     : dataState['native'] =  0;  break;
          case 'native'     : dataState['native'] =  1;  break;
          case 'natphasing' : dataState['native'] =  2;  break;
          default           : dataState['native'] = -1;  break;
        }
      }
      */
      var dt = item.dt[dropdown.getValue()];
      if (dt.Structure)  dataState['pmodel'] =  1;
                   else  dataState['pmodel'] = -1;
      if (dropdown.customGrid.hasOwnProperty('nfind'))
        dataState['MONOMERS_ASYM'] = dropdown.customGrid.nfind.getValue();
    }

    return;

  }

  TaskCrank2.prototype.inputChanged = function ( inpParamRef,emitterId,emitterValue )  {

    function makeSuffix ( title,suffix )  {
      return title.split(' (')[0] + ' (' + suffix + ')';
    }

    if ((emitterId=='hkl') || (emitterId=='native') || (emitterId=='pmodel')) {
      var inpDataRef = inpParamRef.grid.inpDataRef;
      var dataState  = this.getDataState ( inpDataRef );
      var nHKL       = dataState['hkl'];
      var nNative    = dataState['native'];
      var nPModel    = dataState['pmodel'];

      //var nHKL    = this.countInputData ( inpDataRef,'hkl'   ,'' );
      //var nNative = this.countInputData ( inpDataRef,'native','' );

      //var IR       = (nNative==2);
      //var isPModel = (nHKL==1) && (!IR) && (nPModel>0);
      var IR = false;
      if (nNative>0)  {
        var native = this.getInputItem ( inpDataRef,'native' );
        if (native)  {
          if (native.dropdown[0].hasOwnProperty('customGrid'))  {
            var customGrid    = native.dropdown[0].customGrid;
            var showUFP_cbx   = (nNative>0) && (nHKL<=1);
            useForPhasing_cbx = customGrid.useForPhasing;
            IR                = useForPhasing_cbx.getValue();
            useForPhasing_cbx.setVisible ( showUFP_cbx );
            customGrid       .setVisible ( showUFP_cbx );
          }
        }
      }

      var pmodel   = this.getInputItem ( inpDataRef,'pmodel' );
      var isPModel = false;
      if (pmodel)  {
        inpParamRef.grid.setRowVisible ( pmodel.dropdown[0].row,
                                         (nHKL==1) && (!IR) );
        isPModel = (nHKL==1) && (!IR) && (pmodel.dropdown[0].getValue()>=0);
      }

      if (this.state==job_code.new)  {

        var name = this.name;
        if (nHKL<=1)  {
          if (nNative<=0)  {
            if (isPModel)  {
              this.title = makeSuffix ( this.title,'MR-SAD' );
              this.name  = makeSuffix ( this.name ,'MR-SAD' );
            } else  {
              this.title = makeSuffix ( this.title,'SAD' );
              this.name  = makeSuffix ( this.name ,'SAD' );
            }
          } else if (IR)  {
            this.title = makeSuffix ( this.title,'SIRAS' );
            this.name  = makeSuffix ( this.name ,'SIRAS' );
          } else  {
            if (isPModel)  {
              this.title = makeSuffix ( this.title,'MR-SAD + Native' );
              this.name  = makeSuffix ( this.name ,'MR-SAD + Native' );
            } else  {
              this.title = makeSuffix ( this.title,'SAD + Native' );
              this.name  = makeSuffix ( this.name ,'SAD + Native' );
            }
          }
        } else  {
          if (nNative<=0)  {
            this.title = makeSuffix ( this.title,'MAD' );
            this.name  = makeSuffix ( this.name ,'MAD' );
          } else  {
            this.title = makeSuffix ( this.title,'MAD + Native' );
            this.name  = makeSuffix ( this.name ,'MAD + Native' );
          }
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

    }

    TaskTemplate.prototype.inputChanged.call ( this,inpParamRef,emitterId,emitterValue );

  }


  TaskCrank2.prototype.updateInputPanel = function ( inputPanel )  {
    if (this.state==job_code.new)  {
      var event = new CustomEvent ( cofe_signals.jobDlgSignal,{
         'detail' : job_dialog_reason.rename_node
      });
      inputPanel.element.dispatchEvent(event);
    }
  }

  TaskCrank2.prototype.collectInput = function ( inputPanel )  {

    var input_msg = TaskTemplate.prototype.collectInput.call ( this,inputPanel );

    function addMessage ( label,message )  {
      if (input_msg.length>0)
        input_msg += '<br>';
      input_msg += '<b>' + label + ':</b> ' + message;
    }

    var hkl    = this.input_data.getData ( 'hkl'    );
    var native = this.input_data.getData ( 'native' );

    for (var i=0;i<hkl.length;i++)  {
      for (var j=i+1;j<hkl.length;j++)
        if (hkl[i].dataId==hkl[j].dataId)
          addMessage ( 'Reflection data','dataset ' + hkl[i].dname + '<br>is ' +
                       'used in more than one input positions, which is not ' +
                       'allowed' );
      if (native.length>0)  {
        if (hkl[i].dataId==native[0].dataId)
          addMessage ( 'Native dataset','dataset ' + hkl[i].dname + '<br>is used ' +
                       'as both anomalous data and native dataset, which is ' +
                       'not allowed.' );
      }
    }

    return input_msg;

  }


} else  {
  //  for server side

  var conf = require('../../js-server/server.configuration');

  TaskCrank2.prototype.makeInputData = function ( jobDir )  {

    // put hkl and structure data in input databox for copying their files in
    // job's 'input' directory

    if ('revision' in this.input_data.data)  {
      var revision = this.input_data.data['revision'][0];
      //if (revision.HKL.nativeKey!='unused')
      //  this.input_data.data['native'] = [revision.HKL];
      if (revision.Structure)
        this.input_data.data['pmodel'] = [revision.Structure];
      this.input_data.data['seq'] = revision.ASU.seq;
    }

    __template.TaskTemplate.prototype.makeInputData.call ( this,jobDir );

  }

  TaskCrank2.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.crank2', exeType, jobDir, this.id];
  }

  // -------------------------------------------------------------------------

  module.exports.TaskCrank2 = TaskCrank2;

}
