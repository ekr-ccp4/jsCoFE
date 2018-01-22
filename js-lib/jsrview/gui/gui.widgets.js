
/*
 *  =================================================================
 *
 *    18.12.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-client/gui/gui.widgets.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-powered Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Common GUI widgets
 *       ~~~~~~~~~
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2017
 *
 *  =================================================================
 *
 *  Requires: 	jquery.js
 *
 *  http://usejsdoc.org
 *
 */


// -------------------------------------------------------------------------
// Base widget class

var __id_cnt = 0;  // counter used to autogenerate html ids

/** This is a Widget.
  @constructor
  @param {string} type - the widget type
*/
function Widget ( type )  {
  /** @lends Widget.prototype */
  this.id      = type + '_' + __id_cnt++;
  this.type    = type;
  this.child   = [];
  this.parent  = null;
  this.element = document.createElement ( type );
  this.element.setAttribute ( 'id',this.id );
}

/** Setting HTML id attribute for Widget.
  @param {string}  id - the widget id
  @return {Widget} reference to Widget
*/
Widget.prototype.setId = function ( id )  {
  this.id = id;
  this.element.setAttribute ( 'id',this.id );
  return this;
}

Widget.prototype.delete = function()  {
  if (this.parent)
    this.parent.removeChild ( this );
  else if (this.element.parentNode)
    this.element.parentNode.removeChild ( this.element );
}

Widget.prototype.setAttribute = function ( attr,value )  {
  this.element.setAttribute ( attr,value );
  return this;
}

Widget.prototype.hasAttribute = function ( attr )  {
  return this.element.hasAttribute ( attr );
}

Widget.prototype.getAttribute = function ( attr )  {
  return this.element.getAttribute ( attr );
}

Widget.prototype.removeAttribute = function ( attr )  {
  this.element.removeAttribute ( attr );
  return this;
}

Widget.prototype.setTooltip = function ( text )  {
  this.element.setAttribute ( 'title',text );
  return this;
}

Widget.prototype.setWidth = function ( width )  {
  this.element.style.width = width;
  return this;
}

Widget.prototype.setWidth_px = function ( width_int )  {
  $(this.element).width ( width_int );
  return this;
}

Widget.prototype.setHeight = function ( height )  {
  this.element.style.height = height;
  return this;
}

Widget.prototype.setHeight_px = function ( height_int )  {
  $(this.element).height ( height_int );
  return this;
}

Widget.prototype.setSize = function ( width,height )  {
  if (width.length>0)
    this.element.style.width  = width;
  if (height.length>0)
    this.element.style.height = height;
  return this;
}

Widget.prototype.setSize_px = function ( width_int,height_int )  {
  $(this.element).outerWidth  ( width_int  );
  $(this.element).outerHeight ( height_int );
  return this;
}

Widget.prototype.width_px = function ()  {
  return $(this.element).outerWidth();
}

Widget.prototype.height_px = function ()  {
  return $(this.element).outerHeight();
}

Widget.prototype.setFontSize = function ( size )  {
  $(this.element).css ({"font-size":size});
  return this;
}

Widget.prototype.setFontBold = function ( bold )  {
  if (bold)  this.element.style.fontWeight = 'bold';
       else  this.element.style.fontWeight = 'normal';
  return this;
}

Widget.prototype.setFontWeight = function ( weight )  {
  this.element.style.fontWeight = weight;  // 400 is normal, 700 is bold
  return this;
}

Widget.prototype.setFontItalic = function ( italic )  {
  if (italic)  this.element.style.fontStyle = 'italic';
         else  this.element.style.fontStyle = 'normal';
  return this;
}


Widget.prototype.setFontColor = function ( color )  {
  this.element.style.color = color;
  return this;
}

Widget.prototype.setFontFamily = function ( family )  {
  this.element.style.fontFamily = family;
  return this;
}

Widget.prototype.setFont = function ( family,size,bold,italic )  {
  this.element.style.fontFamily = family;
  this.element.style.fontSize   = size;
  if (bold)    this.element.style.fontWeight = 'bold';
       else    this.element.style.fontWeight = 'normal';
  if (italic)  this.element.style.fontStyle  = 'italic';
         else  this.element.style.fontStyle  = 'normal';
  return this;
}

Widget.prototype.setScrollable = function ( onx_value,ony_value )  {
  if (onx_value.length>0)
    $(this.element).css ({'overflow-x':onx_value});
  if (ony_value.length>0)
    $(this.element).css ({'overflow-y':ony_value});
  return this;
}

Widget.prototype.setHorizontalAlignment = function ( alignment )  {
  $(this.element).css ({"text-align":alignment});
  return this;
}

Widget.prototype.setVerticalAlignment = function ( alignment )  {
  $(this.element).css ({"vertical-align":alignment});
  return this;
}

Widget.prototype.setNoWrap = function()  {
  $(this.element).css({'white-space':'nowrap'});
  return this;
}

Widget.prototype.addWidget = function ( widget )  {
  this.child.push ( widget );
  this.element.appendChild ( widget.element );
  widget.parent = this;
  return this;
}

Widget.prototype.insertWidget = function ( widget,pos )  {
  this.child.splice ( pos,0,widget );
  this.element.insertBefore ( widget.element,this.element.childNodes[pos] );
  widget.parent = this;
  return this;
}

Widget.prototype.removeChild = function ( widget )  {
  var child = [];
  for (var i=0;i<this.child.length;i++)
    if (this.child[i].id==widget.id)  {
      this.element.removeChild ( widget.element );
    } else {
      child.push ( this.child[i] );
    }
  this.child = child;
  return this;
}

Widget.prototype.removeAllChildren = function()  {
  while (this.element.firstChild)
    this.element.removeChild(this.element.firstChild);
  this.child = [];
  return this;
}

Widget.prototype.empty = function()  {
  $(this.element).empty();
  return this;
}

Widget.prototype.hide = function()  {
  $(this.element).hide();
  return this;
}

Widget.prototype.show = function()  {
  $(this.element).show();
  return this;
}

Widget.prototype.setVisible = function ( yn_bool )  {
  if (yn_bool)  $(this.element).show();
          else  $(this.element).hide();
  return this;
}

Widget.prototype.isVisible = function()  {
  return $(this.element).is(':visible');
}

Widget.prototype.toggle = function()  {
  $(this.element).toggle();
  return this;
}

Widget.prototype.setDisabled = function ( disabled_bool )  {
  this.element.disabled = disabled_bool;
  return this;
}

Widget.prototype.setEnabled = function ( enabled_bool )  {
  this.element.disabled = (!enabled_bool);
  return this;
}

Widget.prototype.isEnabled = function()  {
  return (!this.element.disabled);
}

Widget.prototype.isDisabled = function()  {
  return this.element.disabled;
}

Widget.prototype.setDisabledAll = function ( disabled_bool )  {
  (function(w){
    window.setTimeout ( function(){
      $(w.element).find(':input').prop('disabled',disabled_bool);
    },0 );
  }(this))
  $(this.element).find(':input').prop('disabled',disabled_bool);
  return this;

}

Widget.prototype.setEnabledAll = function ( enabled_bool )  {
  (function(w){
    window.setTimeout ( function(){
      $(w.element).find(':input').prop('disabled',!enabled_bool);
    },0 );
  }(this))
  $(this.element).find(':input').prop('disabled',!enabled_bool);
  return this;
}

Widget.prototype.addOnClickListener = function ( listener_func )  {
  this.element.addEventListener('click',listener_func );
  return this;
}

Widget.prototype.addOnDblClickListener = function ( listener_func )  {
  this.element.addEventListener('dblclick',listener_func );
  return this;
}

Widget.prototype.addOnChangeListener = function ( listener_func )  {
  this.element.addEventListener('change',listener_func );
  return this;
}

Widget.prototype.emitSignal = function ( signal,data )  {
  var event = new CustomEvent ( signal,{
    'detail' : data
  });
  this.element.dispatchEvent ( event );
}


Widget.prototype.postSignal = function ( signal,data,delay )  {
  (function(w){
    window.setTimeout ( function(){
      w.emitSignal ( signal,data );
    },delay );
  }(this))
}

Widget.prototype.addSignalHandler = function ( signal,onReceive )  {
  this.element.addEventListener ( signal,function(e){
    onReceive ( e.detail );
  },false );
}

Widget.prototype.click = function()  {
  this.element.click();
}


// -------------------------------------------------------------------------
// Grid class

function Grid ( style )  {
  Widget.call ( this,'table' );
  if (style!='None')
    this.element.setAttribute ( 'class','grid-layout'+style );
}

Grid.prototype = Object.create ( Widget.prototype );
Grid.prototype.constructor = Grid;

Grid.prototype.clear = function()  {
  this.element.innerHTML = '';
}

Grid.prototype.setStyle = function ( style )  {
  if (style!='None')
    this.element.setAttribute ( 'class','grid-layout'+style );
}

Grid.prototype.hideRow = function ( row )  {
  while (this.element.rows.length<=row)  {
    this.element.insertRow ( -1 ); // this adds a row
  }
  $(this.element.rows[row]).hide();
  this.element.rows[row]._was_hidden = true;
}

Grid.prototype.showRow = function ( row )  {
  while (this.element.rows.length<=row)
    this.element.insertRow ( -1 ); // this adds a row
  $(this.element.rows[row]).show();
  this.element.rows[row]._was_hidden = false;
}

Grid.prototype.wasRowHidden = function ( row )  {
  if (row>=this.element.rows.length)
    return false;
  if ('_was_hidden' in this.element.rows[row])
    return this.element.rows[row]._was_hidden;
  return false;
}

Grid.prototype.setRowVisible = function ( row,visible_bool )  {
  if (visible_bool)  this.showRow ( row );
               else  this.hideRow ( row );
}

Grid.prototype.getCell = function ( row,col )  {
  var r = this.element.rows.length;
  while (this.element.rows.length<=row)  {
    this.element.insertRow ( -1 ); // this adds a row
    this.element.rows[r].setAttribute ( 'id',this.id + '__' + r );
    r++;
  }
  var gridRow = this.element.rows[row];
  if (col>=0)  {
    while (gridRow.cells.length<=col)
      gridRow.insertCell ( -1 ); // this adds a cell
    return gridRow.cells[col];
  } else {
    return gridRow;
  }
}

Grid.prototype.getNRows = function()  {
  return this.element.rows.length;
}

Grid.prototype.getNCols = function()  {
  var ncols = 0;
  for (var i=0;i<this.element.rows.length;i++)
    ncols = Math.max ( ncols,this.element.rows[i].cells.length );
  return ncols;
}

Grid.prototype.setWidget = function ( widget, row,col, rowSpan,colSpan )  {
var cell = this.getCell ( row,col );
  cell.rowSpan = rowSpan;
  cell.colSpan = colSpan;
  $(cell).empty();
  if (widget)  {
    cell.appendChild ( widget.element );
    widget.parent = this;
  }
  return cell;
}

Grid.prototype.addWidget = function ( widget, row,col, rowSpan,colSpan )  {
var cell = this.getCell ( row,col );
  cell.rowSpan = rowSpan;
  cell.colSpan = colSpan;
  if (widget)  {
    cell.appendChild ( widget.element );
    widget.parent = this;
  }
  return cell;
}

Grid.prototype.setSpan = function ( row,col, rowSpan,colSpan )  {
var cell = this.getCell ( row,col );
  cell.rowSpan = rowSpan;
  cell.colSpan = colSpan;
  return cell;
}


Grid.prototype.setPanel = function ( row,col, rowSpan,colSpan )  {
var panel = new Widget ( 'div' );
  this.setWidget ( panel, row,col, rowSpan,colSpan );
  return panel;
}


Grid.prototype.setFieldset = function ( title, row,col, rowSpan,colSpan )  {
var fieldset = new Fieldset ( title );
  this.setWidget ( fieldset, row,col, rowSpan,colSpan );
  return fieldset;
}


Grid.prototype.setGrid = function ( style, row,col, rowSpan,colSpan )  {
var grid = new Grid ( style );
  this.setWidget ( grid, row,col, rowSpan,colSpan );
  return grid;
}

Grid.prototype.setTable = function ( row,col, rowSpan,colSpan )  {
var table = new Table();
  this.setWidget ( table, row,col, rowSpan,colSpan );
  return table;
}

Grid.prototype.setButton = function ( text,icon_uri, row,col, rowSpan,colSpan )  {
var button = new Button ( text,icon_uri );
  this.setWidget ( button, row,col, rowSpan,colSpan );
  return button;
}

Grid.prototype.setRadioSet = function ( row,col, rowSpan,colSpan )  {
var radio = new RadioSet();
  this.setWidget ( radio, row,col, rowSpan,colSpan );
  this.setNoWrap ( row,col );
  return radio;
}

Grid.prototype.setLabel = function ( text, row,col, rowSpan,colSpan )  {
var label = new Label ( text );
  this.setWidget ( label, row,col, rowSpan,colSpan );
  return label;
}

Grid.prototype.addLabel = function ( text, row,col, rowSpan,colSpan )  {
var label = new Label ( text );
  this.addWidget ( label, row,col, rowSpan,colSpan );
  return label;
}

Grid.prototype.setInputText = function ( text, row,col, rowSpan,colSpan )  {
var input = new InputText ( text );
  this.setWidget ( input, row,col, rowSpan,colSpan );
  return input;
}

Grid.prototype.addInputText = function ( text, row,col, rowSpan,colSpan )  {
var input = new InputText ( text );
  this.addWidget ( input, row,col, rowSpan,colSpan );
  return input;
}

Grid.prototype.setTextArea = function ( text, placeholder, nrows,ncols,
                                        row,col, rowSpan,colSpan )  {
var textarea = new TextArea ( text,placeholder, nrows,ncols );
  this.setWidget ( textarea, row,col, rowSpan,colSpan );
  return textarea;
}

Grid.prototype.addTextArea = function ( text, placeholder, nrows,ncols,
                                        row,col, rowSpan,colSpan )  {
var textarea = new TextArea ( text,placeholder, nrows,ncols );
  this.addWidget ( textarea, row,col, rowSpan,colSpan );
  return textarea;
}

Grid.prototype.setHLine = function ( size, row,col, rowSpan,colSpan )  {
var hline = new HLine ( size );
  this.setWidget ( hline, row,col, rowSpan,colSpan );
  return hline;
}

Grid.prototype.setImageButton = function ( icon_uri,width,height, row,col, rowSpan,colSpan )  {
var ibutton = new ImageButton ( icon_uri,width,height );
  this.setWidget ( ibutton, row,col, rowSpan,colSpan );
  return ibutton;
}

Grid.prototype.setImage = function ( icon_uri,width,height, row,col, rowSpan,colSpan )  {
var image = new Image ( icon_uri,width,height );
  this.setWidget ( image, row,col, rowSpan,colSpan );
  return image;
}

Grid.prototype.setTree = function ( rootName, row,col, rowSpan,colSpan )  {
var tree = new Tree ( rootName );
  this.setWidget ( tree, row,col, rowSpan,colSpan );
  return tree;
}

Grid.prototype.setProgressBar = function ( max_value, row,col, rowSpan,colSpan )  {
var pBar = new ProgressBar ( max_value );
  this.setWidget ( pBar, row,col, rowSpan,colSpan );
  return pBar;
}

Grid.prototype.setSelectFile = function ( multiple_bool,accept_str, row,col, rowSpan,colSpan )  {
var sfile = new SelectFile ( multiple_bool,accept_str );
  this.setWidget ( sfile, row,col, rowSpan,colSpan );
  return sfile;
}

Grid.prototype.setSection = function ( title_str,open_bool, row,col, rowSpan,colSpan )  {
var section = new Section ( title_str,open_bool );
  this.setWidget ( section, row,col, rowSpan,colSpan );
  return section;
}

Grid.prototype.setCombobox = function ( row,col, rowSpan,colSpan )  {
var combobox = new Combobox();
  this.setWidget ( combobox, row,col, rowSpan,colSpan );
  return combobox;
}

Grid.prototype.setCheckbox = function ( label_txt, checked_bool, row,col, rowSpan,colSpan )  {
var checkbox = new Checkbox ( label_txt,checked_bool );
  this.setWidget ( checkbox, row,col, rowSpan,colSpan );
  return checkbox;
}

Grid.prototype.addCheckbox = function ( label_txt, checked_bool, row,col, rowSpan,colSpan )  {
var checkbox = new Checkbox ( label_txt,checked_bool );
  this.addWidget ( checkbox, row,col, rowSpan,colSpan );
  return checkbox;
}

Grid.prototype.setCellSize = function ( width,height, row,col )  {
// Sets specified widths to cell in row,col
var cell = this.getCell ( row,col );
  if (width .length>0)  cell.style.width  = width;
  if (height.length>0)  cell.style.height = height;
  /*
  if (width .length>0)
    $(cell).css ({"width":width});
  if (height.length>0)
    $(cell).css ({"height":height});
  */
  return this;
}

Grid.prototype.setNoWrap = function ( row,col )  {
var cell = this.getCell ( row,col );
  cell.setAttribute ( 'style','white-space: nowrap' );
  return this;
}

Grid.prototype.setHorizontalAlignment = function ( row,col,alignment )  {
var cell = this.getCell ( row,col );
  $(cell).css ({"text-align":alignment});
  return this;
}

Grid.prototype.setVerticalAlignment = function ( row,col,alignment )  {
var cell = this.getCell ( row,col );
  $(cell).css ({"vertical-align":alignment});
  return this;
}


// -------------------------------------------------------------------------
// Fieldset class

function Fieldset ( title )  {
  Widget.call ( this,'fieldset' );
  this.legend = new Widget ( 'legend' );
  this.legend.element.innerHTML = title;
  this.addWidget ( this.legend );
}

Fieldset.prototype = Object.create ( Widget.prototype );
Fieldset.prototype.constructor = Fieldset;


// -------------------------------------------------------------------------
// Label class

function Label ( text )  {
  Widget.call ( this,'div' );
  this.element.innerHTML = text;
}

Label.prototype = Object.create ( Widget.prototype );
Label.prototype.constructor = Label;

Label.prototype.setText = function ( text )  {
  this.element.innerHTML = text;
  return this;
}

Label.prototype.getText = function()  {
  return this.element.innerHTML;
}


// -------------------------------------------------------------------------
// IconLabel class

function IconLabel ( text,icon_uri )  {
  Widget.call ( this,'div' );
  this.setIconLabel ( text,icon_uri );
}

IconLabel.prototype = Object.create ( Widget.prototype );
IconLabel.prototype.constructor = IconLabel;

IconLabel.prototype.setIconLabel = function ( text,icon_uri )  {
  this.element.innerHTML = text;
  if (icon_uri.length>0)  {
    $(this.element).css(
      {'text-align':'center',
//       'margin-left':'1.2em',
       'background-image'   :'url("'+icon_uri+'")',
       'background-repeat'  :'no-repeat',
       'background-size'    :'22px',
       'background-position':'0.5em center'});
  }
}



// -------------------------------------------------------------------------
// InputText class

function InputText ( text )  {
  Widget.call ( this,'input' );
  this.element.setAttribute ( 'type','text' );
  this.element.setAttribute ( 'value',text  );
}

InputText.prototype = Object.create ( Widget.prototype );
InputText.prototype.constructor = InputText;

InputText.prototype.setStyle = function ( type,pattern,placeholder,tooltip )  {
  if (placeholder) this.element.setAttribute ( 'placeholder',placeholder );
  if (tooltip)     this.element.setAttribute ( 'title'  ,tooltip );
  if (type)        this.element.setAttribute ( 'type'   ,type    );
  if (pattern)     {
    if ((pattern=='integer') || (pattern=='integer_'))
      this.element.setAttribute ( 'pattern','^(-?[0-9]+\d*)$|^0$' );
    else if ((pattern=='real') || (pattern=='real_'))
      this.element.setAttribute ( 'pattern','^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$' );
    else
      this.element.setAttribute ( 'pattern',pattern );
  }
  return this;
}

InputText.prototype.setReadOnly = function ( yn_bool )  {
  this.element.readOnly = yn_bool;
  return this;
}

InputText.prototype.setMaxInputLength = function ( maxlength_int )  {
  this.element.setAttribute ( 'maxlength',maxlength_int );
  return this;
}


InputText.prototype.setDisabled = function ( disable_bool )  {
  this.element.disabled = disable_bool;
  return this;
}


InputText.prototype.getValue = function()  {
  return this.element.value;
}

InputText.prototype.setValue = function ( text )  {
  return this.element.value = text;
}

InputText.prototype.addOnInputListener = function ( listener_func )  {
  this.element.addEventListener('input',listener_func );
  return this;
}

InputText.prototype.setOnEnterListener = function ( socket_function )  {
  (function(self){
    $(self.element).keypress ( function(e){
      if (e.keyCode == 13)
       socket_function ( self.getValue() );
    });
  }(this))
}



// -------------------------------------------------------------------------
// TextArea class

function TextArea ( text,placeholder, nrows,ncols )  {
  Widget.call ( this,'textarea' );
  this.element.setAttribute ( 'rows',nrows );
  this.element.setAttribute ( 'cols',ncols );
  this.element.setAttribute ( 'placeholder',placeholder );
  this.element.value = text;
}

TextArea.prototype = Object.create ( Widget.prototype );
TextArea.prototype.constructor = TextArea;

TextArea.prototype.getValue = function()  {
  return this.element.value;
}


// -------------------------------------------------------------------------
// Horizontal line class

function HLine ( size )  {
  Widget.call ( this,'hr' );
  if (size.length>0)
    this.element.style.height = size;
}

HLine.prototype = Object.create ( Widget.prototype );
HLine.prototype.constructor = HLine;


// -------------------------------------------------------------------------
// Image class

function Image ( source,width,height )  {
  Widget.call ( this,'img' );
  if (source.length>0)  this.element.setAttribute ( 'src'   ,source );
  if (width .length>0)  this.element.setAttribute ( 'width' ,width  );
  if (height.length>0)  this.element.setAttribute ( 'height',height  );
}

Image.prototype = Object.create ( Widget.prototype );
Image.prototype.constructor = Image;


// -------------------------------------------------------------------------
// Button class

function Button ( text,icon_uri )  {
  Widget.call ( this,'button' );
  this.div = document.createElement ( 'div' );
  this.element.appendChild ( this.div );
  this._set_button ( text,icon_uri );
}

Button.prototype = Object.create ( Widget.prototype );
Button.prototype.constructor = Button;

Button.prototype._set_button = function ( text,icon_uri )  {
  this.div.innerHTML = text;
  if (icon_uri.length>0)  {
    $(this.div).css({'text-align':'center',
                     'margin-left':'1.2em'});
    $(this.element).css(
      {'background-image'   :'url("'+icon_uri+'")',
       'background-repeat'  :'no-repeat',
       'background-size'    :'22px',
       'background-position':'0.5em center'});
  }
  $(this.element).button();
}

Button.prototype.setButton = function ( text,icon_uri )  {
  this._set_button ( text,icon_uri );
  return this;
}

Button.prototype.setDisabled = function ( disabled_bool )  {
  $(this.element).button ( "option", "disabled", disabled_bool );
  return this;
}

Button.prototype.setEnabled = function ( enabled_bool )  {
  $(this.element).button ( "option", "disabled", (!enabled_bool) );
  return this;
}


Button.prototype.isDisabled = function()  {
  return $(this.element).button ( 'option','disabled' );
}

Button.prototype.setSize = function ( width,height )  {
  var w = parseInt(width);
  var h = parseInt(height);
  var icon_size = Math.min ( w,h );
  var margin    = Math.max ( 1,Math.floor(icon_size/8) );
  icon_size -= 2*margin;
  var lm = (w-icon_size)/2.25;
  if (this.div.innerHTML.length>0)
    lm = Math.min ( (h-icon_size)/2,lm );
  $(this.element).css({'background-size'     : icon_size+'px',
                       'background-position' : lm + 'px' });
  return Widget.prototype.setSize.call ( this,width,height );
}

Button.prototype.setSize_px = function ( width,height )  {
  $(this.element).css({'background-size':(height-4)+'px'});
  this.element.style.width  = width  + 'px';
  this.element.style.height = height + 'px';
  return this;
}


// -------------------------------------------------------------------------
// Image Button class

function ImageButton ( icon_uri,width,height )  {
  Label.call ( this,' ' );
  var image = new Image ( icon_uri,width,height );
  this.addWidget ( image  );
  this.setWidth  ( width  );
  this.setHeight ( height );
}

ImageButton.prototype = Object.create ( Label.prototype );
ImageButton.prototype.constructor = ImageButton;

function setDefaultButton ( button,context_widget )  {
  button.element.style.fontWeight = 'bold';
  jQuery(context_widget.element).keydown ( function(e){
    if (e.keyCode == 13) {
      // handle click logic here
      button.element.click();
    }
  });
}

function unsetDefaultButton ( button,context_widget )  {
  button.element.style.fontWeight = 'normal';
  jQuery(context_widget.element).keydown();
}


// -------------------------------------------------------------------------
// RadioSet class


function RadioSet()  {
  Widget.call ( this,'div' );
  this.name = 'radio_' + this.element.id;
  // now use addButton to stuff Set with buttons,
  // then call make()
  this.selected = '';
}

RadioSet.prototype = Object.create ( Widget.prototype );
RadioSet.prototype.constructor = RadioSet;

RadioSet.prototype.addButton = function ( text,btnId,tooltip,checked_bool )  {
  var _id = this.element.id + '_' + btnId;

  var label = new Widget ( 'label' );
  label.element.setAttribute ( 'for',_id );
  label.element.innerHTML = text;
  this.addWidget ( label );
  if (tooltip)
    label.element.setAttribute ( 'title',tooltip );

  var button = new Widget ( 'input' );
  button.element.setAttribute ( 'type','radio' );
  button.setId ( _id );
  button.element.setAttribute ( 'name',this.name );
  if (checked_bool)  {
    button.element.setAttribute ( 'checked','checked' );
    this.selected = btnId;
  }
  this.addWidget ( button );

  return this;  // for chaining
}

RadioSet.prototype.make = function (  onClick_func  )  {
  (function(rs){
    function onClick()  {
      for (var i=0;i<rs.child.length;i++)
        if (rs.child[i].type=='input')  {
          if (rs.child[i].element.checked)  {
            rs.selected = rs.child[i].element.id.substr(rs.element.id.length+1);
            if (onClick_func)
              onClick_func ( rs.selected );
          }
        }
    }
    for (var i=0;i<rs.child.length;i++)
      if (rs.child[i].type=='input')
        rs.child[i].addOnClickListener ( onClick );
  }(this));

//  $( 'input[name="' + this.name + '"]' ).checkboxradio();
//  $(this.element).buttonset();
  $(this.element).controlgroup();
  return this;
}

RadioSet.prototype.selectButton = function ( btnId )  {
  var _id = this.element.id + '_' + btnId;
  for (var i=0;i<this.child.length;i++)
    if (this.child[i].element.id==_id)
      $(this.child[i].element).click();
  return this;
}

RadioSet.prototype.setDisabled = function ( disabled_bool )  {
  $(this.element).controlgroup ( 'option','disabled',disabled_bool );
  return this;
}

RadioSet.prototype.setEnabled = function ( enabled_bool )  {
  $(this.element).controlgroup ( 'option','disabled',!enabled_bool );
  return this;
}

RadioSet.prototype.isDisabled = function()  {
  return $(this.element).controlgroup ( 'option','disabled' );
}

RadioSet.prototype.getValue = function()  {
  return this.selected;
}


/*
function RadioSet()  {
  Widget.call ( this,'div' );
  // now use addButton to stuff Set with buttons,
  // then call make()
}

RadioSet.prototype = Object.create ( Widget.prototype );
RadioSet.prototype.constructor = RadioSet;

RadioSet.prototype.addButton = function ( text,btnId,tooltip,checked_bool )  {
  var _id = this.element.id + '_' + btnId;
  var button = new Widget ( 'input' );
  button.element.setAttribute ( 'type','radio' );
  button.setId ( _id );
  button.element.setAttribute ( 'name',this.element.id );
  if (tooltip)
    button.element.setAttribute ( 'title',tooltip );
  if (checked_bool)
    button.element.setAttribute ( 'checked','checked' );
  this.addWidget ( button );
  var label = new Widget ( 'label' );
  label.element.setAttribute ( 'for',_id );
  label.element.innerHTML = text;
  this.addWidget ( label );
  return this;  // for chaining
}


RadioSet.prototype.make = function (  onClick_func  )  {
  (function(rs){
    function onClick()  {
      for (var i=0;i<rs.child.length;i++)
        if (rs.child[i].type=='input')  {
          if (rs.child[i].element.checked)  {
            onClick_func ( rs.child[i].element.id.substr(rs.element.id.length+1) );
          }
        }
    }
    for (var i=0;i<rs.child.length;i++)
      if (rs.child[i].type=='input')
        rs.child[i].addOnClickListener ( onClick );
  }(this));
  $(this.element).buttonset();
//  $(this.element).controlgroup();
  return this;
}

RadioSet.prototype.selectButton = function ( btnId )  {
  var _id = this.element.id + '_' + btnId;
  for (var i=0;i<this.child.length;i++)
    if (this.child[i].element.id==_id)
      $(this.child[i].element).click();
  return this;
}

RadioSet.prototype.setDisabled = function ( disabled_bool )  {
  $(this.element).buttonset ( 'option','disabled',disabled_bool );
  return this;
}

RadioSet.prototype.setEnabled = function ( enabled_bool )  {
  $(this.element).buttonset ( 'option','disabled',!enabled_bool );
  return this;
}

RadioSet.prototype.isDisabled = function()  {
  return $(this.element).buttonset ( 'option','disabled' );
}
*/


// -------------------------------------------------------------------------
// ProgressBar class

function ProgressBar ( max_value )  {
  Widget.call ( this,'div' );
  if (max_value>0)  {
    $(this.element).progressbar({
      max  : max_value,
      value: 0
    });
  } else  {
    $(this.element).progressbar({
      value: false
    });
  }
}

ProgressBar.prototype = Object.create ( Widget.prototype );
ProgressBar.prototype.constructor = ProgressBar;

ProgressBar.prototype.setMaxValue = function ( max_value ) {
  $(this.element).progressbar( "option", "max", max_value );
}

ProgressBar.prototype.getMaxValue = function() {
  return $(this.element).progressbar( "option", "max" );
}

ProgressBar.prototype.setValue = function ( value ) {
  $(this.element).progressbar( 'value', value );
}

ProgressBar.prototype.getValue = function() {
  return $(this.element).progressbar( 'value' );
}


// -------------------------------------------------------------------------
// SelectFile class

function SelectFile ( multiple_bool,accept_str )  {
  Widget.call ( this,'input' );
  this.element.setAttribute ( 'type','file' );
  this.element.setAttribute ( 'name','uploads[]' );
  if (multiple_bool)
    this.element.setAttribute ( 'multiple','multiple' );
  if (accept_str)
    this.element.setAttribute ( 'accept',accept_str );
}

SelectFile.prototype = Object.create ( Widget.prototype );
SelectFile.prototype.constructor = SelectFile;


// -------------------------------------------------------------------------
// ToolBar class

function ToolBar()  {
  Grid.call ( this,'' );
  this.element.setAttribute ( 'class','toolbar ui-widget-header ui-corner-all' );
}

ToolBar.prototype = Object.create ( Grid.prototype );
ToolBar.prototype.constructor = ToolBar;


// -------------------------------------------------------------------------
// IFrame class

function IFrame ( uri )  {
  Widget.call ( this,'iframe' );
  if (uri.length>0)
    this.element.setAttribute ( 'src',uri );
  $(this.element).css ( {'border':'none'} );
  /*
  (function(iframe){
    iframe.element.onload = function(){ iframe.setVisible(true); };
  }(this))
  */
}

IFrame.prototype = Object.create ( Widget.prototype );
IFrame.prototype.constructor = IFrame;

IFrame.prototype.loadPage = function ( uri )  {
  //this.setVisible ( false );
  this.element.src = uri;
}

IFrame.prototype.setHTML = function ( html )  {
  //this.setVisible ( false );
  this.element.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
}

IFrame.prototype.getURL = function()  {
  return this.element.src;
}

IFrame.prototype.clear = function()  {
  //this.setVisible ( false );
  this.element.src = 'about:blank';
}

IFrame.prototype.reload = function()  {
  //this.setVisible ( false );
  this.element.src = this.element.src;
}


// -------------------------------------------------------------------------
// Section class

function Section ( title_str,open_bool )  {
  Widget.call ( this,'div' );
  this.header  = new Widget ( 'h3' );
  this.titleId = this.id + '_title';
  this.header.element.innerHTML = '<span id="' + this.titleId + '">' + title_str + '</span>';
  this.addWidget ( this.header );
  this.body = new Widget ( 'div' );
  this.addWidget ( this.body );
  this.grid = new Grid ('');
  this.body.addWidget ( this.grid );
  var options = {
      collapsible : true,
      heightStyle : "content"
  };
  if (open_bool)  options.active = 0;
            else  options.active = false;
  $( this.element ).accordion ( options );
}


Section.prototype = Object.create ( Widget.prototype );
Section.prototype.constructor = Section;

Section.prototype.isOpen = function()  {
var active = $( this.element ).accordion( "option", "active" );
  if (active==0)  return true;
  return false;
}


Section.prototype.open = function()  {
  $( this.element ).accordion( "option", "active", 0 );
}

Section.prototype.close = function()  {
  $( this.element ).accordion( "option", "active", false );
}

Section.prototype.setTitle = function ( title_str )  {
  $( '#'+this.titleId ).html ( title_str );
}

/*
Section.prototype.setVisible = function ( yn_bool )  {
  alert ( 'cs ' + yn_bool + ' ' + this.header.element.innerHTML );
}
*/

// -------------------------------------------------------------------------
// Combobox class

function Combobox()  {
  Widget.call ( this,'select' );
//  this.element.setAttribute ( 'name',this.id );
  // now use addItem to stuff Set with buttons,
  // then call make()
  this.selected_value = null;
  this.selected_text  = null;
}

Combobox.prototype = Object.create ( Widget.prototype );
Combobox.prototype.constructor = Combobox;

Combobox.prototype.addItem = function ( text,itemId,selected_bool )  {
  var item = new Widget ( 'option' );
  item.element.setAttribute ( 'value',itemId );
  item.element.setAttribute ( 'name',itemId  );
  if (selected_bool)  {
    item.element.setAttribute ( 'selected','selected' );
    this.selected_value = itemId;
    this.selected_text  = text;
  }
  item.element.innerHTML = text;
  this.addWidget ( item );
  return this;  // for chaining
}

Combobox.prototype.make = function()  {

  $(this.element).selectmenu();
  //.addClass( "combobox-overflow" );
  (function(combobox){
    $(combobox.element).on('change', function(){
      combobox.selected_value = combobox.element.value;
      combobox.selected_text  =
                combobox.element.options[combobox.element.selectedIndex].text;
    });
  }(this));

  return this;

}



// -------------------------------------------------------------------------
// Checkbox class

function Checkbox ( label_txt,checked_bool )  {

  Widget.call ( this,'label' );
  var _id = 'cbx-' + this.id;

  this.element.htmlFor   = _id;
  this.element.innerHTML = label_txt;
  $(this.element).css({'white-space':'nowrap','text-align':'left'});

  this.checkbox = document.createElement ( 'input' );
  this.checkbox.setAttribute ( 'type','checkbox' );
  this.checkbox.setAttribute ( 'id'  ,_id );
  this.checkbox.setAttribute ( 'name',_id );
//  $(this.element).css ({"text-align":"left"});

  this.element.appendChild ( this.checkbox );
  this.checkbox.checked = checked_bool;
  $(this.checkbox).checkboxradio();

}

Checkbox.prototype = Object.create ( Widget.prototype );
Checkbox.prototype.constructor = Checkbox;

Checkbox.prototype.addOnClickListener = function ( listener_func )  {
  this.checkbox.addEventListener('click',listener_func );
  return this;
}

Checkbox.prototype.getValue = function() {
  return this.checkbox.checked;
}

Checkbox.prototype.setDisabled = function ( disabled_bool )  {
  if (disabled_bool)
        $(this.checkbox).checkboxradio( "disable" );
  else  $(this.checkbox).checkboxradio( "enable" );
  return this;
}



// -------------------------------------------------------------------------
// RadioButton class

function RadioButton ( label_txt,checked_bool )  {

  Widget.call ( this,'label' );
  var _id = 'cbx-' + this.id;

  this.element.htmlFor   = _id;
  this.element.innerHTML = label_txt;
  $(this.element).css({'white-space':'nowrap'});

  this.radio = document.createElement ( 'input' );
  this.radio.setAttribute ( 'type','radio' );
  this.radio.setAttribute ( 'id'  ,_id );
  this.radio.setAttribute ( 'name',_id );
  $(this.element).css ({"text-align":"left"});

  this.element.appendChild ( this.radio );
  this.radio.checked = checked_bool;
  $(this.radio).checkboxradio();

}

RadioButton.prototype = Object.create ( Widget.prototype );
RadioButton.prototype.constructor = RadioButton;


RadioButton.prototype.getValue = function() {
  return this.radio.checked;
}

RadioButton.prototype.setValue = function ( checked_bool ) {
  this.radio.checked = checked_bool;
  $(this.radio).checkboxradio('refresh');
}

RadioButton.prototype.setDisabled = function ( disabled_bool )  {
  if (disabled_bool)
        $(this.radio).checkboxradio( "disable" );
  else  $(this.radio).checkboxradio( "enable" );
}


// -------------------------------------------------------------------------
// Slider class

function Slider ( range )  {

  Widget.call ( this,'div' );

  $(this.element).slider({
    range : "max",
    min   : 0,
    max   : range,
    value : 0
  });

}

Slider.prototype = Object.create ( Widget.prototype );
Slider.prototype.constructor = Slider;


Slider.prototype.setListener = function ( socket_function )  {
  $(this.element).on ( "slide",function(event,ui){
    socket_function ( ui.value );
  });
}

Slider.prototype.setValue = function ( value )  {
  $(this.element).slider ( 'value',value );
}

Slider.prototype.getValue = function()  {
  return $(this.element).slider ( 'value' );
}


// -------------------------------------------------------------------------
// Spinner class

function Spinner ( minV,maxV,stepV,pageV )  {
  Widget.call ( this,'div' );
  this.spinner = new Widget ( 'input' );
  this.addWidget ( this.spinner );
  this.minV   = minV;
  this.maxV   = maxV;
  this.steps  = [];
  this._lastV = 0;
  $(this.spinner.element).spinner({
    min  : minV,
    max  : maxV,
    step : stepV,
    page : pageV
  });
}

Spinner.prototype = Object.create ( Widget.prototype );
Spinner.prototype.constructor = Spinner;


Spinner.prototype.setWidth_px = function ( width_px )  {
  this.spinner.setWidth_px ( width_px );
}

Spinner.prototype.setCustomSteps = function ( step_list,stepNo )  {
// step_list[] should contain step values in order of increasing
// stepNo is the initial step to set in the spinner
  this.setMinValue ( step_list[0] );
  this.setMaxValue ( step_list[step_list.length-1] );
  this.steps = [];
  for (var i=0;i<step_list.length;i++)
    this.steps.push ( step_list[i] );
  this.setValue ( this.steps[stepNo] );
}


Spinner.prototype.setListener = function ( socket_function )  {

  (function(self){

    $(self.spinner.element).on ( "spin",function(event,ui){
      var v = ui.value;
      if (self.steps.length>0)  {
        if (v>self._lastV)  {
          var i = 0;
          while ((v>self.steps[i]) && (i<self.steps.length-1))
            i++;
          v = self.steps[i];
        } else  {
          var i = self.steps.length-1;
          while ((v<self.steps[i]) && (i>0))
            i--;
          v = self.steps[i];
        }
        window.setTimeout ( function(){
          self.setValue ( v );
        },0 );
      } else  {
        self._lastV = v;
        socket_function ( v );
      }
    });

    function call_socket()  {
      var v  = self.getValue();
      var v1 = Math.max(self.minV,Math.min(self.maxV,v));
      if (v!=v1)
        self.setValue ( v1 );
      self._lastV = v;
      socket_function ( v1 );
    }

    $(self.spinner.element).on ( "spinchange",function(event,ui){
      call_socket();
    });

    $(self.spinner.element).keypress ( function(e){
      if (e.keyCode == 13)
        call_socket();
    });

  }(this))

}

/*
Spinner.prototype.setChangeListener = function ( socket_function )  {
  (function(self){

    function call_socket()  {
      var v  = self.getValue();
      var v1 = Math.max(self.minV,Math.min(self.maxV,v));
      if (v!=v1)
        self.setValue ( v1 );
      socket_function ( v1 );
    }

    $(self.spinner.element).on ( "spinchange",function(event,ui){
      call_socket();
    });

    $(self.spinner.element).keypress ( function(e){
      if (e.keyCode == 13)
        call_socket();
    });

  }(this))
}
*/

Spinner.prototype.setMaxValue = function ( value )  {
  this.maxV = value;
  $(this.spinner.element).spinner( 'option', 'max', value );
}

Spinner.prototype.getMaxValue = function()  {
  return $(this.spinner.element).spinner( 'option', 'max' );
}

Spinner.prototype.setMinValue = function ( value )  {
  this.minV = value;
  $(this.spinner.element).spinner( 'option', 'min', value );
}

Spinner.prototype.getMinValue = function()  {
  return $(this.spinner.element).spinner( 'option', 'min' );
}

Spinner.prototype.setValue = function ( value )  {
  this._lastV = Math.max(this.minV,Math.min(this.maxV,value));
  $(this.spinner.element).spinner ( 'value',this._lastV );
}

Spinner.prototype.getValue = function()  {
  return $(this.spinner.element).spinner ( 'value' );
}
