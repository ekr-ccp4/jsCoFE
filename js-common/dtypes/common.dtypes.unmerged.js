
/*
 *  =================================================================
 *
 *    19.09.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/common.dtypes.unmerged.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Common Client/Server Modules -- Unmerged Data Class
 *       ~~~~~~~~~
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2017
 *
 *  =================================================================
 *
 */

var __template = null;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
  __template = require ( './common.dtypes.template' );

// ===========================================================================

// Data classes MUST BE named as 'DataSomething' AND put in file named
// ./js-common/dtypes/common.dtypes.something.js . This convention is used
// for class reconstruction from json strings

function DataUnmerged()  {

  if (__template)  __template.DataTemplate.call ( this );
             else  DataTemplate.call ( this );

  this._type       = 'DataUnmerged';
  this.symm_select = [];
  this.runs        = '';

}


if (__template)
      DataUnmerged.prototype = Object.create ( __template.DataTemplate.prototype );
else  DataUnmerged.prototype = Object.create ( DataTemplate.prototype );
DataUnmerged.prototype.constructor = DataUnmerged;


// ===========================================================================

DataUnmerged.prototype.title      = function()  { return 'Unmerged Data';           }
DataUnmerged.prototype.icon_small = function()  { return './images/data_20x20.svg'; }
DataUnmerged.prototype.icon_large = function()  { return './images/data.svg';       }

// when data class version is changed here, change it also in python
// constructors
DataUnmerged.prototype.currentVersion = function()  { return 0; }

// export such that it could be used in both node and a browser
if (!__template)  {
  //  for client side


  DataUnmerged.prototype.makeDataSummaryPage = function ( task )  {
    var dsp = new DataSummaryPage ( this );

    dsp.makeRow ( 'File name'            ,this.files[0]    ,'Imported file name'    );
    dsp.makeRow ( 'Original dataset name',this.dataset.name,'Original dataset name' );
    dsp.makeRow ( 'Resolution (&Aring;)' ,this.dataset.reso,'Dataset resolution'    );
    dsp.makeRow ( 'Wavelength'           ,this.dataset.wlen,'Wavelength'            );
    if ('HM' in this)
          dsp.makeRow ( 'Space group',this.HM      ,'Space symmetry group' );
    else  dsp.makeRow ( 'Space group','Unspecified','Space symmetry group' );

    var cell_spec = 'Not specified';
    if ('cell' in this.dataset)
      cell_spec = this.dataset.cell[0] + "&nbsp;" +
                  this.dataset.cell[1] + "&nbsp;" +
                  this.dataset.cell[2] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
                  this.dataset.cell[3] + "&nbsp;" +
                  this.dataset.cell[4] + "&nbsp;" +
                  this.dataset.cell[5];

    dsp.makeRow ( 'Cell',cell_spec,'Unit cell parameters' );

    var ranges = '';
    for (var i=0;i<this.dataset.runs.length;i++)
      ranges += '[' + this.dataset.runs[i][1] + ',' + this.dataset.runs[i][2] + ']&nbsp;';
    dsp.makeRow ( 'Ranges',ranges,'Image ranges' );

    return dsp;

  }

  /*
  DataUnmerged.prototype.inspectData = function ( task ) {
    var dlg = new Dialog ( this.dname );

    dlg._options.width = 800;

    dlg.grid = new Grid('');
    dlg.addWidget ( dlg.grid );
    dlg.grid.setLabel ( '<h3>' + this.title() + '</h3>',0,0,1,1 );
    var table = dlg.grid.setTable ( 1,0, 1,1 );

    var trow = 0;
    function makeRow ( header,text,tooltip )  {
      table.setHeaderText ( header, trow,0, 1,1 ).setTooltip ( tooltip ).setNoWrap();
      table.setLabel      ( text  , trow,1, 1,1 );
      table.setHorizontalAlignment ( trow,0,'left' );
      table.setHorizontalAlignment ( trow,1,'left' );
      trow++;
    }

    makeRow ( 'Producing job number' ,this.jobId   ,'Id of job produced this dataset' );
    makeRow ( 'File name'            ,this.files[0]    ,'Imported file name'    );
    makeRow ( 'Original dataset name',this.dataset.name,'Original dataset name' );
    makeRow ( 'Assigned name'        ,this.dname       ,'Assigned dataset name' );
    makeRow ( 'Resolution (&Aring;)' ,this.dataset.reso,'Dataset resolution'    );
    makeRow ( 'Wavelength'           ,this.dataset.wlen,'Wavelength'            );
    if ('HM' in this)
          makeRow ( 'Space group',this.HM      ,'Space symmetry group' );
    else  makeRow ( 'Space group','Unspecified','Space symmetry group' );

    var cell_spec = 'Not specified';
    if ('cell' in this.dataset)
      cell_spec = this.dataset.cell[0] + "&nbsp;" +
                  this.dataset.cell[1] + "&nbsp;" +
                  this.dataset.cell[2] + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
                  this.dataset.cell[3] + "&nbsp;" +
                  this.dataset.cell[4] + "&nbsp;" +
                  this.dataset.cell[5];

    makeRow ( 'Cell',cell_spec,'Unit cell parameters' );

    var ranges = '';
    for (var i=0;i<this.dataset.runs.length;i++)
      ranges += '[' + this.dataset.runs[i][1] + ',' + this.dataset.runs[i][2] + ']&nbsp;';
    makeRow ( 'Ranges',ranges,'Image ranges' );

    dlg.launch();

//    new MessageBox ( "Not implemented","Unmerged Data Viewer not Implemented." );
  }
  */

  DataUnmerged.prototype.layCustomDropdownInput = function ( dropdown ) {

    var customGrid = dropdown.customGrid;

    if (dropdown.layCustom.startsWith('unmerged'))  {

      var row = 0;
      if (dropdown.layCustom=='unmerged-ref')  {
        var symm = $.extend ( true,{},this.dataset.symm );
        customGrid.combosel = new ComboDropdown ( symm,[230,200,180],0 );
        customGrid.setWidget ( customGrid.combosel,row++,0,1,2 );
      } else  {
        customGrid.setLabel ( 'Ranges:',row,0,1,1 ).setFontItalic(true).setWidth ( '70px' );
        customGrid.setVerticalAlignment ( row,0,'middle' );
        var tooltip = 'Available ranges:';
        for (var i=0;i<this.dataset.runs.length;i++)
          tooltip += '  [' + this.dataset.runs[i][1] + ',' + this.dataset.runs[i][2] + ']';
        customGrid.runs = customGrid.setInputText ( this.runs,row,1,1,1 )
                                    .setTooltip ( tooltip )
                                    .setWidth ( '440px' );
        customGrid.setCellSize ( '50px' ,'',row,0 );
      }

     customGrid.setLabel ( ' ',row+1,0,1,2 ).setHeight_px ( 8 );

    }

  }


  DataUnmerged.prototype.collectCustomDropdownInput = function ( dropdown ) {

    var msg = '';   // Ok by default
    var customGrid = dropdown.customGrid;

    if (dropdown.layCustom.startsWith('unmerged'))  {

      if (dropdown.layCustom=='unmerged-ref')  {
        this.dataset.symm = customGrid.combosel.content;
        this.symm_select  = customGrid.combosel.getValues();
      } else
        this.runs = customGrid.runs.getValue().trim();

    }

    return msg;

  }


} else  {
  //  for server side

  module.exports.DataUnmerged = DataUnmerged;

}
