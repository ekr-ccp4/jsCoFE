
/*
 *  =================================================================
 *
 *    18.01.18   <--  Date of Last Modification.
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
  __template = require ( './common.tasks.template' );


// ===========================================================================

function TaskCCP4ez()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type   = 'TaskCCP4ez';
  this.name    = 'ccp4ez';
  this.oname   = 'ccp4ez';  // default output file name template
  this.title   = 'CCP4ez Automated Structure Solver';
  this.helpURL = './html/jscofe_task_ccp4ez.html';

  this.ha_type = '';

}

if (__template)
      TaskCCP4ez.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskCCP4ez.prototype = Object.create ( TaskTemplate.prototype );
TaskCCP4ez.prototype.constructor = TaskCCP4ez;


// ===========================================================================

TaskCCP4ez.prototype.icon_small = function()  { return './images/task_ccp4ez_20x20.svg'; }
TaskCCP4ez.prototype.icon_large = function()  { return './images/task_ccp4ez.svg';       }

TaskCCP4ez.prototype.currentVersion = function()  { return 0; }

// export such that it could be used in both node and a browser
if (!__template)  {
  // for client side

  // reserved function name
  TaskCCP4ez.prototype.makeInputPanel = function ( dataBox )  {
  // makes input panel for Import task; dataBox is not used as import task
  // does not have any input data from the project
  var nSeqInputs = 1;

    var div = this.makeInputLayout();

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
      var itext = div.grid.setInputText ( fname,rowNo,3,1,1 )
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
    div.mtz_select = setMTZFileSelect ( row,'' );
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
      div.seq_select.push ( setSeqFileSelect ( row++,'',i ) );


    function setCoorFileSelect ( rowNo,fname )  {
      var wset = setFileSelect ( rowNo,'Structure',
             '[Optional] Provide a path to a PDB or mmCIF file with ' +
             'structural homologue, or an apo structure (optional)',
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

    div.coor_select = setCoorFileSelect ( row++,'' );
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

    return div;

  }

  /*
  TaskCCP4ez.prototype.disableInputWidgets = function ( widget,disable_bool ) {
    TaskTemplate.prototype.disableInputWidgets.call ( this,widget,disable_bool );
    if (widget.hasOwnProperty('upload'))  {
      widget.upload.button.setDisabled ( disable_bool );
      if (widget.upload.link_button)
        widget.upload.link_button.setDisabled ( disable_bool );
    }
  }
  */


  // reserved function name
  TaskCCP4ez.prototype.collectInput = function ( inputPanel )  {
    // collects data from input widgets, created in makeInputPanel() and
    // stores it in internal fields
    var files = inputPanel.mtz_select['fsel'].getFiles();
    this.ha_type = inputPanel.ha_type.getValue();
    if (files.length<1)
      return '<b><i>Reflection data is not specified.</i></b>';
    return '';
  }

  //  This function is called when task is finally sent to FE to run. Should
  // execute function given as argument, or issue an error message if run
  // should not be done.
  TaskCCP4ez.prototype.doRun = function ( inputPanel,run_func )  {
  var files  = [inputPanel.mtz_select ['fsel'].getFiles()];
  var sfiles = inputPanel.seq_select[0]['fsel'].getFiles();
  var cfiles = inputPanel.coor_select['fsel'].getFiles();

    if (sfiles.length>0)  files.push ( sfiles );
    if (cfiles.length>0)  files.push ( cfiles );

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


  // reserved function name
  //TaskCCP4ez.prototype.runButtonName = function()  { return 'Import'; }

} else  {
  // for server side

  var conf = require('../../js-server/server.configuration');

  TaskCCP4ez.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.ccp4ez_task', exeType, jobDir, this.id];
  }

  module.exports.TaskCCP4ez = TaskCCP4ez;

}
