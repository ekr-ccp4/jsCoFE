
/*
 *  =================================================================
 *
 *    06.01.18   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-common/cofe.tasks.xyz2revision.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Convert XYZ-to-Revision Task Class
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

function TaskXyz2Revision()  {

  if (__template)  __template.TaskTemplate.call ( this );
             else  TaskTemplate.call ( this );

  this._type   = 'TaskXyz2Revision';
  this.name    = 'convert xyz to revision';
  this.oname   = '*'; // asterisk means do not use (XYZ name will be used)
  this.title   = 'Convert Coordinates to "Structure Revision"';
  this.helpURL = './html/jscofe_task_xyz2revision.html';

  this.input_dtypes = [{      // input data types
      data_type   : {'DataHKL':[]}, // data type(s) and subtype(s)
      label       : 'Reflections',  // label for input dialog
      inputId     : 'hkl',       // input Id for referencing input fields
      customInput : 'cell-info', // lay custom fields next to the selection
      min         : 1,           // minimum acceptable number of data instances
      max         : 1            // maximum acceptable number of data instances
    },{
      data_type   : {'DataXYZ':[]}, // data type(s) and subtype(s)
      label       : 'Coordinates',  // label for input dialog
      inputId     : 'xyz',       // input Id for referencing input fields
      customInput : 'cell-info', // lay custom fields next to the selection
      min         : 1,           // minimum acceptable number of data instances
      max         : 1            // maximum acceptable number of data instances
    }
  ];

}


if (__template)
      TaskXyz2Revision.prototype = Object.create ( __template.TaskTemplate.prototype );
else  TaskXyz2Revision.prototype = Object.create ( TaskTemplate.prototype );
TaskXyz2Revision.prototype.constructor = TaskXyz2Revision;


// ===========================================================================
// export such that it could be used in both node and a browser

TaskXyz2Revision.prototype.icon_small = function()  { return './images/task_formstructure_20x20.svg'; }
TaskXyz2Revision.prototype.icon_large = function()  { return './images/task_formstructure.svg';       }

TaskXyz2Revision.prototype.currentVersion = function()  { return 0; }

if (!__template)  {
  // for client side

  TaskXyz2Revision.prototype.inputChanged = function ( inpParamRef,emitterId,emitterValue )  {

    TaskTemplate.prototype.inputChanged.call ( this,inpParamRef,emitterId,emitterValue );

    if ((emitterId=='hkl') || (emitterId=='xyz'))  {
      var inpDataRef = inpParamRef.grid.inpDataRef;

      hkl_ddn = inpDataRef.input[0].dropdown[0];
      hkl     = inpDataRef.input[0].dt[hkl_ddn.getValue()];
      xyz_ddn = inpDataRef.input[1].dropdown[0];
      xyz     = inpDataRef.input[1].dt[xyz_ddn.getValue()];

      var message = '';
      if (xyz.getSpaceGroup()=='Unspecified') {
        message = 'No space group -- cannot convert';
      } else if (xyz.getSpaceGroup()!=hkl.getSpaceGroup())  {
        message = 'Unmatched space group -- cannot convert';
      } else  {
        hklp = hkl.getCellParameters();
        xyzp = xyz.getCellParameters();
        if (xyzp[0]<2.0)  {
          message = 'No cell parameters -- cannot convert';
        } else if ((Math.abs(hklp[3]-xyzp[3])>2.0) ||
                   (Math.abs(hklp[4]-xyzp[4])>2.0) ||
                   (Math.abs(hklp[5]-xyzp[5])>2.0))  {
          message = 'Too distant cell parameters -- cannot convert';
        } else  {
          var ok = true;
          for (var i=0;i<3;i++)
            if (Math.abs(hklp[i]-xyzp[i])/hklp[i]>0.01)
              ok = false;
          if (!ok)
            message = 'Too distant cell parameters -- cannot convert';
        }
      }

      xyz_ddn.customGrid.setLabel ( message.fontcolor('red'),0,2,1,1 )
                        .setFontItalic(true).setNoWrap();

      // Use postponed emit here, which will work at Job Dialog creation,
      // when inputPanel with possibly unsuitable input is created
      // first, and signal slot is activated later. Zero delay means simply
      // that the signal will be emitted in first available thread.
      inpParamRef.grid.inputPanel.postSignal ( 'task_ready',message,0 );

    }

  }


} else  {  //  for server side

  var conf = require('../../js-server/server.configuration');

  TaskXyz2Revision.prototype.getCommandLine = function ( exeType,jobDir )  {
    return [conf.pythonName(), '-m', 'pycofe.tasks.xyz2revision', exeType, jobDir, this.id];
  }

  // -------------------------------------------------------------------------

  module.exports.TaskXyz2Revision = TaskXyz2Revision;

}
