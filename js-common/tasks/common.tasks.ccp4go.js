
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
 *  **** Content :  CCP4go Task Class
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

function TaskCCP4go()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type   = 'TaskCCP4go';
  this.name    = 'ccp4go';
  this.oname   = 'ccp4go';  // default output file name template
  this.title   = 'CCP4go "Don\'t make me think!" (experimental)';
  this.helpURL = './html/jscofe_task_ccp4go.html';

  this.files   = ['','',''];
  this.ha_type = '';
  this.ligands = [];
  for (var i=0;i<10;i++)
    this.ligands.push ( { 'source':'none', 'smiles':'', 'code':'' } );

  this.input_dtypes = [1];  // input data types

  this.parameters = { // input parameters
    sec1  : { type     : 'section',
              title    : 'Components control (advanced)',
              open     : false,  // true for the section to be initially open
              position : [0,0,1,8],
              contains : {
                /*
                DATASET_SEL : {
                        type     : 'combobox',
                        keyword  : 'dataset',
                        label    : 'Reflection dataset to use',
                        //lwidth   : 60,        // label width in px
                        //reportas : 'Down-weighting model',
                        tooltip  : 'If input reflection file contains several ' +
                                   'dataset, you may specify the desired ' +
                                   'dataset number, or allow for automatic ' +
                                   'choice.',
                        range    : ['A|choose automatically',
                                    'G|take dataset number'],
                        value    : 'A',
                        position : [0,0,1,1]
                      },
                DATASET_NO : {
                        type      : 'integer',
                        keyword   : 'dataset-no',
                        label     : '',
                        iwidth    : 40,
                        tooltip   : 'Give dataset number (dataset with base ' +
                                    'H,K,L columns has number 0).',
                        range     : [1,100],
                        value     : '1',
                        default   : '1',
                        position  : [0,3,1,1],
                        showon    : {'DATASET_SEL':['G']}
                      },
                TITLE1 : {
                        type      : 'label',  // just a separator
                        label     : '<h3>Components control</h3><i>Uncheck ' +
                                    'components which <u>should not</u> ' +
                                    'be used:</i><sub>&nbsp;</sub>',
                        position : [1,0,1,5],
                      },
                      */
                TITLE1 : {
                        type      : 'label',  // just a separator
                        label     : '<i>Uncheck components which <u>should not</u> ' +
                                    'be used:</i><sub>&nbsp;</sub>',
                        position  : [0,0,1,5],
                      },
                SIMBAD12_CBX : {
                        type      : 'checkbox',
                        keyword   : 'simbad12',
                        label     : 'Compatible lattice and contaminant search',
                        tooltip   : 'Uncheck to skip database searches on ' +
                                    'compatible lattice parameters and possible ' +
                                    'contaminants.',
                        iwidth    : 350,
                        value     : true,
                        position  : [1,0,1,3]
                      },
                MORDA_CBX : {
                        type      : 'checkbox',
                        keyword   : 'morda',
                        label     : 'Automated Molecular Replacement',
                        tooltip   : 'Uncheck to skip phasing with automated ' +
                                    'molecular replacement.',
                        iwidth    : 350,
                        value     : true,
                        position  : [2,0,1,3]
                      },
                CRANK2_CBX : {
                        type      : 'checkbox',
                        keyword   : 'crank2',
                        label     : 'Automated Experimental Phasing',
                        tooltip   : 'Uncheck to skip automated experimental ' +
                                    'phasing.',
                        iwidth    : 350,
                        value     : true,
                        position  : [3,0,1,3]
                      },
                FITLIGANDS_CBX : {
                        type      : 'checkbox',
                        keyword   : 'findligands',
                        label     : 'Fitting Ligands',
                        tooltip   : 'Uncheck to skip fitting ligands.',
                        iwidth    : 350,
                        value     : true,
                        position  : [4,0,1,3]
                      }
              }
            }
  };

}

if (__template)
      TaskCCP4go.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskCCP4go.prototype = Object.create ( TaskTemplate.prototype );
TaskCCP4go.prototype.constructor = TaskCCP4go;


// ===========================================================================

TaskCCP4go.prototype.icon_small = function()  { return './images/task_ccp4go_20x20.svg'; }
TaskCCP4go.prototype.icon_large = function()  { return './images/task_ccp4go.svg';       }

TaskCCP4go.prototype.currentVersion = function()  { return 0; }

// export such that it could be used in both node and a browser
if (!__template)  {
  // for client side

  // reserved function name
  TaskCCP4go.prototype.makeInputPanel = function ( dataBox )  {
  // makes input panel for Import task; dataBox is not used as import task
  // does not have any input data from the project
  var nSeqInputs = 1;

    var div = this.makeInputLayout();

    this.setInputDataFields ( div.grid,0,dataBox,this );

    if ((this.state==job_code.new) || (this.state==job_code.running)) {
      div.header.setLabel ( ' ',2,0,1,1 );
      div.header.setLabel ( ' ',2,1,1,1 );
    } else
      div.header.uname_inp.setValue ( this.uname.replace(/<(?:.|\n)*?>/gm, '') );

    div.customData = {};
    div.customData.login_token = __login_token;
    div.customData.project     = this.project;
    div.customData.job_id      = this.id;
    div.customData.file_mod    = {'rename':{},'annotation':[]}; // file modification and annotation

    div.upload_files = [];

    div.grid.setLabel ( '<h2>Input Data</h2>',0,0,1,4 ).setFontItalic(true).setNoWrap();
    var row = 1;

    function setLabel ( rowNo,text,tooltip )  {
      var lbl = div.grid.setLabel ( text,rowNo,0,1,1 ).setTooltip(tooltip)
                        .setFontItalic(true).setFontBold(true).setNoWrap();
      div.grid.setVerticalAlignment ( rowNo,0,'middle' );
      return lbl;
    }

    function setFileSelect ( rowNo,label,tooltip,accept_str,fname )  {
      var lbl   = setLabel ( rowNo,label,tooltip );
      var fsel  = div.grid.setSelectFile ( false,accept_str,rowNo,2,1,1 );
      fsel.hide();
      var btn   = div.grid.addButton ( 'Browse','./images/open_file.svg',rowNo,2,1,1 );
//                          .setWidth_px ( 86 );
      var filename = fname;
      if (this.state==job_code.new)
        filename = '';
      var itext = div.grid.setInputText ( filename,rowNo,3,1,2 )
                          .setWidth_px(300).setReadOnly(true).setNoWrap(true);
      div.grid.setVerticalAlignment ( rowNo,2,'middle' );
      div.grid.setVerticalAlignment ( rowNo,3,'middle' );
      btn.addOnClickListener ( function(){
        fsel.click();
      });
      return { 'label':lbl, 'fsel':fsel, 'browse':btn, 'itext':itext };
    }

    function setMTZFileSelect ( rowNo,fname )  {
      var wset = setFileSelect ( rowNo,'Reflection data',
             '[Mandatory] Provide a path to MTZ file with merged or unmerged ' +
             'reflections.','.mtz',fname );
      wset['fsel'].addOnChangeListener ( function(){
        var files = wset['fsel'].getFiles();
        if (files.length>0)
          wset['itext'].setValue ( files[0].name );
      });
      /*
      wset['fsel'].addOnChangeListener ( function(){
        var files = wset['fsel'].getFiles();
        if (files.length>0)  {
          new UploadDialog ( 'Upload ' + files[0].name,files,div.customData,false,
                              function(returnCode){
            if (!returnCode)
              wset['itext'].setValue ( files[0].name );
          });
        }
      });
      */
      return wset;
    }


    div.grid.setLabel ( '&nbsp;',row,1,1,1 ).setNoWrap();
    div.mtz_select = setMTZFileSelect ( row,this.files[0] );
    div.grid.setLabel ( '&nbsp;',row++,4,1,1 ).setNoWrap();

    function setSeqControls()  {
      var lastShown = 0;
      for (var i=0;i<div.seq_select.length;i++)  {
        if (div.seq_select[i]['browse'].isVisible())
          lastShown = i;
        div.seq_select[i]['add'   ].hide();
        div.seq_select[i]['remove'].hide();
      }
      if ((lastShown<nSeqInputs-1) && (div.seq_select[lastShown]['itext'].getValue()))
        div.seq_select[lastShown]['add'].show();
      if (lastShown>0)
        div.seq_select[lastShown]['remove'].show();
      return lastShown;
    }


    function setSeqFileSelect ( rowNo,fname,seqNo )  {

      var wset = null;
      if (seqNo==0)  {
        wset = setFileSelect ( rowNo,'Sequence(s)',
                  '[Desired] Provide a path to sequence file in .fasta or .pir ' +
                  'format. For importing several sequences put them all in a ' +
                  'single file.','.pir, .seq, .fasta',fname );
      } else  {
        wset = setFileSelect ( rowNo,'Sequence #' + (seqNo+1),
                  'Provide a path to additinal sequence file if needed',
                  '.pir, .seq, .fasta',fname );
      }

      wset['add'] = div.grid.addButton ( '','./images/add.svg',rowNo,5,1,1 )
                            .setHeight_px(14).setWidth_px(4).setTooltip('add');
      wset['remove'] = div.grid.addButton ( '','./images/remove.svg',rowNo,6,1,1 )
                         .setHeight_px(14).setWidth_px(4).setTooltip('remove');
      div.grid.setVerticalAlignment ( rowNo,5,'middle' );
      div.grid.setVerticalAlignment ( rowNo,6,'middle' );

      wset['add'   ].hide();
      wset['remove'].hide();
      if (seqNo>0)  {
        wset['label' ].hide();
        wset['browse'].hide();
        wset['itext' ].hide();
      }

      wset['add'].addOnClickListener ( function(){
        if (seqNo<9)  {
          div.seq_select[seqNo+1]['label' ].show();
          div.seq_select[seqNo+1]['browse'].show();
          div.seq_select[seqNo+1]['itext' ].show();
          setSeqControls();
        }
      });

      wset['remove'].addOnClickListener ( function(){
        if (seqNo>0)  {
          div.seq_select[seqNo]['label' ].hide();
          div.seq_select[seqNo]['browse'].hide();
          div.seq_select[seqNo]['itext' ].hide();
          setSeqControls();
        }
      });

      wset['fsel'].addOnChangeListener ( function(){
        // file modification and annotation reset only in case of single
        // sequence input
        div.customData.file_mod = {'rename':{},'annotation':[]};
        var files = wset['fsel'].getFiles();
        if (files.length>0)
          _import_checkFiles ( files,div.customData.file_mod,
                               div.upload_files,function(){
              wset['itext'].setValue ( files[0].name );
              setSeqControls();
          });
      });

      /*
      wset['fsel'].addOnChangeListener ( function(){
        var files = wset['fsel'].getFiles();
        if (files.length>0)  {
          new UploadDialog ( 'Upload ' + files[0].name,files,div.customData,false,
                              function(returnCode){
            if (!returnCode)
              _import_checkFiles ( files,div.customData.file_mod,
                                   div.upload_files,function(){
                  wset['itext'].setValue ( files[0].name );
                  setSeqControls();
              });
          });
        }
      });
      */

      return wset;

    }

    div.seq_select = [];
    for (var i=0;i<nSeqInputs;i++)
      div.seq_select.push ( setSeqFileSelect ( row++,this.files[1],i ) );


    function setCoorFileSelect ( rowNo,fname )  {
      var wset = setFileSelect ( rowNo,'Structure',
             '[Optional] Provide a path to a PDB or mmCIF file with ' +
             'known (and close) structural homologue, or an apo structure.',
             '.pdb, .ent, .mmcif, .pdbx, .cif',fname );
      wset['fsel'].addOnChangeListener ( function(){
        var files = wset['fsel'].getFiles();
        if (files.length>0)
          wset['itext'].setValue ( files[0].name );
      });
      /*
      wset['fsel'].addOnChangeListener ( function(){
        var files = wset['fsel'].getFiles();
        if (files.length>0)  {
          new UploadDialog ( 'Upload ' + files[0].name,files,div.customData,false,
                              function(returnCode){
            if (!returnCode)
              wset['itext'].setValue ( files[0].name );
          });
        }
      });
      */
      return wset;
    }

    div.coor_select = setCoorFileSelect ( row++,this.files[2] );
    var row0 = row;
    div.grid.setLabel ( '',row++,0,1,1 ).setHeight_px(8);


    /*
    div.grid.setLabel ( '&nbsp;&nbsp;&nbsp;&nbsp;',row,3,1,1 ).setNoWrap();
    div.mtz_view = div.grid.setButton ( 'ViewHKL','./images/display.svg',row,4,1,1 );
    div.mtz_view.hide();
    div.mtz_select.addOnChangeListener ( function(){
      div.mtz_view.setVisible ( div.mtz_select.getFiles().length>0 );
    });
    div.mtz_view.addOnClickListener ( function(){
      var files = div.mtz_select.getFiles();
      alert ( 'n=' + files.length + ',   ' + JSON.stringify(files[0].name));
      if (files.length>0)
        startViewHKL ( files[0].name,files[0] );
    });
    */

    setLabel ( row,'Heavy atom type','[Optional] Provide chemical element of ' +
                   'anomalous scatterers if anomalous signal is observed, ' +
                   'and leave blank otherwise.' );
    div.ha_type = div.grid.setInputText ( this.ha_type, row++,2,1,1 )
                          .setMaxInputLength ( 2 ).setWidth_px ( 40 );

    div.grid.setLabel ( '&nbsp;',row++,0,1,1 ).setHeight_px(8);

    div.code_lbl   = div.grid.setLabel ( '<b><i>Code</i></b>',row,3,1,1 )
                        .setTooltip ( '3-letter code to identify the ligand. ' +
                          'If no SMILES string is given, the code must match ' +
                          'one from RCSB Compound dictionary. However, if ' +
                          'SMILES string is provided, the code must not match ' +
                          'any of known ligands, e.g., "DRG".' );
    div.smiles_lbl = div.grid.setLabel ( '<b><i>SMILES String</i></b>',row++,4,1,1 )
                        .setTooltip ( 'SMILES string describing ligands ' +
                          'structure.' );

    // list of ligands (self-expanding)
    div.ligands = [];

    function showLigands()  {
      var n = -1;
      for (var i=0;i<div.ligands.length;i++)
        if (div.ligands[i].selection.getValue()!='none')
          n = i;
      var code   = false;
      var smiles = false;
      for (var i=0;i<div.ligands.length;i++)  {
        var visible = (i<=n+1);
        var source  = div.ligands[i].selection.getValue();
        div.ligands[i].label    .setVisible ( visible );
        div.ligands[i].selection.setVisible ( visible );
        div.ligands[i].smiles   .setVisible ( visible && (source=='smiles') );
        div.ligands[i].code     .setVisible ( visible && (source!='none')   );
        if (source=='smiles')  smiles = true;
        if (source!='none')    code   = true;
      }
      div.code_lbl  .setVisible ( code   );
      div.smiles_lbl.setVisible ( smiles );
    }

    for (var i=0;i<this.ligands.length;i++)  {
      var lbl = setLabel ( row,'Ligand #' + (i+1),
                    '[Optional] Provide description of ' +
                    'ligand to fit in electron density, using either a SMILES ' +
                    'string or 3-letter code. Up to ' +
                    this.ligands.length + ' ligands may be specified.' );
      var sel = new Dropdown();
      sel.setWidth ( '120px' );
      div.grid.setWidget ( sel,row,2,1,1 );
      sel.addItem ( 'None'  ,'','none'  ,this.ligands[i].source=='none'   );
      sel.addItem ( 'SMILES','','smiles',this.ligands[i].source=='smiles' );
      sel.addItem ( 'Code'  ,'','code'  ,this.ligands[i].source=='code'   );
      sel.make();
      var code   = div.grid.setInputText ( this.ligands[i].code,row,3,1,1 )
                           .setWidth_px(50).setNoWrap(true).setMaxInputLength(3)
                           .setVisible(this.ligands[i].source=='code');
      var smiles = div.grid.setInputText ( this.ligands[i].smiles,row,4,1,1 )
                           .setWidth_px(600).setNoWrap(true)
                           .setVisible(this.ligands[i].source=='smiles');
      div.grid.setVerticalAlignment ( row,2,'middle' );
      div.grid.setVerticalAlignment ( row,3,'middle' );
      div.grid.setVerticalAlignment ( row,4,'middle' );
      div.ligands.push ( {'label':lbl, 'selection':sel, 'smiles':smiles, 'code':code} );
      sel.sno = i;
      sel.addOnChangeListener ( function(text,value){
        div.ligands[this.sno].code  .setVisible ( value!='none'   );
        div.ligands[this.sno].smiles.setVisible ( value=='smiles' );
        showLigands();
      });
      row++;
    }

    showLigands();

    this.layParameters ( div.grid,div.grid.getNRows()+1,0 );

    var ncols = div.grid.getNCols();
    for (var i=1;i<ncols;i++)  {
      div.grid.setLabel    ( ' ',row0,i,1,1   ).setHeight_px(8);
      div.grid.setCellSize ( 'auto','',row0,i );
    }
    div.grid.setLabel    ( ' ',row0,ncols,1,1  ).setHeight_px(8);
    div.grid.setCellSize ( '95%','',row0,ncols );

    return div;

  }

  /*
  TaskCCP4go.prototype.disableInputWidgets = function ( widget,disable_bool ) {
    TaskTemplate.prototype.disableInputWidgets.call ( this,widget,disable_bool );
    if (widget.hasOwnProperty('upload'))  {
      widget.upload.button.setDisabled ( disable_bool );
      if (widget.upload.link_button)
        widget.upload.link_button.setDisabled ( disable_bool );
    }
  }
  */


  // reserved function name
  TaskCCP4go.prototype.collectInput = function ( inputPanel )  {
    // collects data from input widgets, created in makeInputPanel() and
    // stores it in internal fields
    var msg   = '';  // Ok if stays empty
    var files = inputPanel.mtz_select['fsel'].getFiles();
    this.ha_type = inputPanel.ha_type.getValue();
    for (var i=0;i<this.ligands.length;i++)  {
      this.ligands[i].source = inputPanel.ligands[i].selection.getValue();
      this.ligands[i].smiles = inputPanel.ligands[i].smiles.getValue();
      this.ligands[i].code   = inputPanel.ligands[i].code.getValue();
      if (this.ligands[i].source!='none')  {
        if (!this.ligands[i].code)
          msg += '<b><i>Code for ligand #' + (i+1) + ' is not given</i></b>';
        if ((this.ligands[i].source=='smiles') && (!this.ligands[i].smiles))
          msg += '<b><i>SMILES string for ligand #' + (i+1) + ' is not given</i></b>';
      }
    }
    var unique = true;
    for (var i=0;(i<this.ligands.length) && unique;i++)
      if ((this.ligands[i].source!='none') && (this.ligands[i].code))  {
        for (var j=i+1;(j<this.ligands.length) && unique;j++)
          if ((this.ligands[j].source!='none') &&
              (this.ligands[i].code==this.ligands[j].code))  {
            unique = false;
            msg += '<b><i>Repeat use of ligand code ' + this.ligands[i].code +
                   '</i></b>';
          }
      }
    if (files.length<1)
      msg += '<b><i>Reflection data is not specified</i></b>';

    TaskTemplate.prototype.collectInput.call ( this,inputPanel );

    return  msg;
  }

  //  This function is called when task is finally sent to FE to run. Should
  // execute function given as argument, or issue an error message if run
  // should not be done.
  TaskCCP4go.prototype.doRun = function ( inputPanel,run_func )  {
  var files  = [inputPanel.mtz_select  ['fsel'].getFiles()];
  var sfiles = inputPanel.seq_select[0]['fsel'].getFiles();
  var cfiles = inputPanel.coor_select  ['fsel'].getFiles();

    this.files = ['','',''];
    if (files.length>0)
      this.files[0] = files[0][0].name;
    if (sfiles.length>0)  {
      files.push ( sfiles );
      this.files[1] = sfiles[0].name;
    }
    if (cfiles.length>0)  {
      files.push ( cfiles );
      this.files[2] = cfiles[0].name;
    }

    if (files[0].length<0)  {
      new MessageBox ( 'Stop run','Task cannot be run as no reflection<br>' +
                                  'data are given' );
    } else  {
      new UploadDialog ( 'Upload data',files,inputPanel.customData,true,
                          function(returnCode){
        if (!returnCode)
          run_func();
        else
          new MessageBox ( 'Stop run','Task cannot be run due to upload ' +
                                'errors:<p><b><i>' + returnCode + '</i></b>' );
      });
    }

  }


  // This function is called at cloning jobs and should do copying of all
  // custom class fields not found in the Template class
  TaskCCP4go.prototype.customDataClone = function ( task )  {
    this.ha_type = task.ha_type;
    this.ligands = [];
    for (var i=0;i<task.ligands.length;i++)
      this.ligands.push ( { 'source' : task.ligands[i].source,
                            'smiles' : task.ligands[i].smiles,
                            'code'   : task.ligands[i].code } );
  }


  // reserved function name
  //TaskCCP4go.prototype.runButtonName = function()  { return 'Import'; }

} else  {
  // for server side

  var conf = require('../../js-server/server.configuration');

  TaskCCP4go.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.ccp4go_task', exeType, jobDir, this.id];
  }

  module.exports.TaskCCP4go = TaskCCP4go;

}
