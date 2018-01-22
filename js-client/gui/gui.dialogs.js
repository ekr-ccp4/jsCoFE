
/*
 *  =================================================================
 *
 *    14.11.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-client/gui/gui.dialogs.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-powered Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Various dialog templates
 *       ~~~~~~~~~
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2017
 *
 *  =================================================================
 *
 *  Requires: 	jquery.js
 *              gui.widgets.js
 *
 */


// -------------------------------------------------------------------------
// MessageBox class

function Dialog ( title )  {

  Widget.call ( this,'div' );
  this.element.setAttribute ( 'title',title );
  document.body.appendChild ( this.element );

  this._options = {
    resizable : false,
    height    : 'auto',
    width     : 'auto',
    modal     : true,
    buttons   : {
      "Ok": function() {
        $( this ).dialog( "close" );
      }
    }
  }

}

Dialog.prototype = Object.create ( Widget.prototype );
Dialog.prototype.constructor = Dialog;

Dialog.prototype.launch = function()  {
  $(this.element).dialog ( this._options );
}


// -------------------------------------------------------------------------
// MessageBox class

function MessageBox ( title,message )  {

  Widget.call ( this,'div' );
  this.element.setAttribute ( 'title',title );
  this.element.innerHTML = message;
  document.body.appendChild ( this.element );

  $(this.element).dialog({
    resizable : false,
    height    : 'auto',
    width     : 'auto',
    modal     : true,
    buttons: {
      "Ok": function() {
        $( this ).dialog( "close" );
      }
    }
  });

}

MessageBox.prototype = Object.create ( Widget.prototype );
MessageBox.prototype.constructor = MessageBox;



function MessageBoxW ( title,message,width_ratio )  {

  Widget.call ( this,'div' );
  this.element.setAttribute ( 'title',title );
  this.element.innerHTML = message;
  document.body.appendChild ( this.element );

  var w = Math.round(width_ratio*$(window).width()) + 'px';

  $(this.element).dialog({
    resizable : false,
    height    : 'auto',
    width     : w,
    modal     : true,
    buttons: {
      "Ok": function() {
        $( this ).dialog( "close" );
      }
    }
  });

}

MessageBoxW.prototype = Object.create ( Widget.prototype );
MessageBoxW.prototype.constructor = MessageBoxW;



// -------------------------------------------------------------------------
// HelpBox class

function HelpBox ( title,helpURL,onDoNotShowAgain_func )  {

  if (onDoNotShowAgain_func)  {
    if (!onDoNotShowAgain_func(0,helpURL))
      return;
  }

  Widget.call ( this,'div' );
  if (title.length>0)
        this.element.setAttribute ( 'title','Online Help -- ' + title );
  else  this.element.setAttribute ( 'title','Online Help' );
  this.display = new IFrame ( '' );  // always initially empty
  $(this.display.element).css({'overflow':'hidden'});
  this.addWidget ( this.display );
  $(this.element).css({'overflow':'hidden'});

  document.body.appendChild ( this.element );

  this.resizeDisplay = function ( w,h )  {
    this.display.setSize_px ( w-16,h-4 );
  }

  this.options = {
    resizable : true,
    width     : 800,
    height    : 600,
    modal     : false,
    buttons   : []
  };

  if (onDoNotShowAgain_func)  {
    this.options.buttons = [
      { text : "Do not show again",
        click: function() {
          onDoNotShowAgain_func ( 1,helpURL );
          $( this ).dialog( "close" );
        }
      },
      { text : "Ok",
        click: function() {
          onDoNotShowAgain_func ( 2,helpURL );
          $( this ).dialog( "close" );
        }
      }
    ];
  } else  {
    this.options.buttons = [
      { text : "Ok",
        click: function() {
          $( this ).dialog( "close" );
        }
      }
    ];
  }

  (function(dlg){

    $(dlg.element).on ( 'dialogresize', function(event,ui){
      dlg.resizeDisplay ( dlg.width_px(),dlg.height_px() );
    });

    $(dlg.display.element).on('load',function(){
      $(dlg.element).dialog(dlg.options);
      dlg.resizeDisplay ( 800,600 );
    });

  }(this))

  this.display.loadPage ( helpURL );

}

HelpBox.prototype = Object.create ( Widget.prototype );
HelpBox.prototype.constructor = HelpBox;

function launchHelpBox ( title,helpURL,onDoNotShowAgain_func,delay_msec )  {
  window.setTimeout ( function(){
    new HelpBox ( title,helpURL,onDoNotShowAgain_func );
  },delay_msec);
}


// -------------------------------------------------------------------------
// WaitDialog class

function WaitDialog ( title,message,process_wait )  {
//  process_wait ( callback_when_ready_to_close() )

  Widget.call ( this,'div' );
  this.element.setAttribute ( 'title',title );
  this.element.innerHTML = message;
  document.body.appendChild ( this.element );

  $(this.element).dialog({
    resizable : false,
    height    : 'auto',
    width     : 'auto',
    modal     : true
  });

  (function(dlg){
    process_wait ( function(){
      $(dlg).dialog('close');
    });
  }(this.element));

}

WaitDialog.prototype = Object.create ( Widget.prototype );
WaitDialog.prototype.constructor = WaitDialog;


// -------------------------------------------------------------------------
// QuestionBox class

function QuestionBox ( title,message,btn1_name,onButton1_func,
                                     btn2_name,onButton2_func )  {

  Widget.call ( this,'div' );
  this.element.setAttribute ( 'title',title );
  this.element.innerHTML = message;
  document.body.appendChild ( this.element );

  $(this.element).dialog({
    resizable : false,
    height    : 'auto',
    width     : 'auto',
    modal     : true,
    buttons: {
      [btn1_name] : function() {
        if (onButton1_func)
          onButton1_func();
        $( this ).dialog( "close" );
      },
      [btn2_name] : function() {
        if (onButton2_func)
          onButton2_func();
        $( this ).dialog( "close" );
      }
    }
  });

}

QuestionBox.prototype = Object.create ( Widget.prototype );
QuestionBox.prototype.constructor = QuestionBox;


// -------------------------------------------------------------------------
// InputBox class

function InputBox ( title )  {
  Widget.call ( this,'div' );
  this.element.setAttribute ( 'title',title );
  document.body.appendChild ( this.element );
}

InputBox.prototype = Object.create ( Widget.prototype );
InputBox.prototype.constructor = InputBox;

InputBox.prototype.setText = function ( text )  {
  this.element.innerHTML = text;
}

InputBox.prototype.launch = function ( name_btn,add_func )  {

  $(this.element).dialog({
    resizable : false,
    height    : 'auto',
    width     : 'auto',
    modal     : true,
    buttons   : {
      [name_btn] : function() {
        if (add_func())
          $(this).dialog( "close" );
      },
      "Cancel": function() {
        $(this).dialog( "close" );
      }
    }
  });

}
