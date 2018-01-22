
/*
 *  =================================================================
 *
 *    20.08.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-client/gui/gui.tables.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-powered Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Table        - plain table
 *       ~~~~~~~~~  TableScroll  - table with scrollable body
 *                  TableSort    - table with sortable columns
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2017
 *
 *  =================================================================
 *
 *  Requires: 	jquery.js
 *  	          theme.blue.css  // from tablesorter
 *  	          jquery.tablesorter.js
 *
 *  URL:  https://mottie.github.io/tablesorter/docs/example-css-highlighting.html
 *
 */


// -------------------------------------------------------------------------
// Table class:  plain table, built as a Grid widget with direct access to all
// cells with all Grid convenience functions

function Table()  {
  Grid.call ( this,'None' );
  this.element.setAttribute ( 'class','table-blue' );
}

Table.prototype = Object.create ( Grid.prototype );
Table.prototype.constructor = Table;

Table.prototype.setHeaderWidget = function ( widget, row,col, rowSpan,colSpan ) {
var cell = this.getCell ( row,col );
  cell.rowSpan = rowSpan;
  cell.colSpan = colSpan;
  $(cell).empty();
  cell.setAttribute ( 'class','table-blue-hh' );
  if (widget)  {
    cell.appendChild ( widget.element );
    widget.parent = this;
  }
  return cell;
}


Table.prototype.setHeaderText = function ( text, row,col, rowSpan,colSpan )  {
var label = new Label ( text );
  label.setAttribute ( 'class','label-blue-vh' );
  this.setHeaderWidget ( label, row,col, rowSpan,colSpan );
  return label;
}


Table.prototype.setHeaderRow = function ( header_list,tooltip_list )  {
  var tableRow = this.getCell ( 0,-1 );
  for (var i=0;i<header_list.length;i++)  {
    var headerCell = document.createElement('th');
    headerCell.innerHTML = header_list[i];
    headerCell.setAttribute ( 'class','table-blue-vh' );
    if (tooltip_list.length>0)
      headerCell.setAttribute ( 'title',tooltip_list[i] );
    tableRow.appendChild ( headerCell );
  }
}


Table.prototype.setRow = function ( header,tooltip,cell_list,row,alt_bool )  {

  var col_cnt = 0;
  if (header)  {
    var tableRow   = this.getCell ( row,-1 );
    var headerCell = document.createElement('th');
    headerCell.innerHTML = header;
    headerCell.setAttribute ( 'class','table-blue-vh' );
    if (tooltip)
      headerCell.setAttribute ( 'title',tooltip );
    tableRow.appendChild ( headerCell );
    col_cnt++;
  }

  for (var i=0;i<cell_list.length;i++)  {
    var cell = this.getCell ( row,col_cnt++ );
    cell.rowSpan = 1;
    cell.colSpan = 1;
    $(cell).empty();
    if (alt_bool)
          cell.setAttribute ( 'class','table-blue-alt' );
    else  cell.setAttribute ( 'class','table-blue-td'  );
    cell.innerHTML = cell_list[i];
  }

}


Table.prototype.setColumnCSS = function ( css,col,start_row )  {
  for (var i=start_row;i<this.element.rows.length;i++)
    if (col<this.element.rows[i].cells.length)
       $(this.element.rows[i].cells[col]).css ( css );
}


Table.prototype.setAllColumnCSS = function ( css,start_row,start_col )  {
  for (var i=start_row;i<this.element.rows.length;i++)
    for (var j=start_col;j<this.element.rows[i].cells.length;j++)
       $(this.element.rows[i].cells[j]).css ( css );
}


// -------------------------------------------------------------------------
// TableCell class

function TableCell ( text )  {
  Widget.call ( this,'td' );
  this.element.innerHTML = text;
  this.text = text;
  this.css0 = null;
}

TableCell.prototype = Object.create ( Widget.prototype );
TableCell.prototype.constructor = TableCell;

TableCell.prototype.setNoWrap = function()  {
  this.element.setAttribute ( 'style','white-space: nowrap' );
  return this;
}


// -------------------------------------------------------------------------
// TableHeaderCell class

function TableHeaderCell ( text )  {
  Widget.call ( this,'th' );
  this.element.innerHTML = text;
}

TableHeaderCell.prototype = Object.create ( Widget.prototype );
TableHeaderCell.prototype.constructor = TableHeaderCell;


// -------------------------------------------------------------------------
// TableRow class

function TableRow()  {
  Widget.call ( this,'tr' );
  this.selected = -1;  // 0: not selectable;  1: selected;  -1: not selected
}

TableRow.prototype = Object.create ( Widget.prototype );
TableRow.prototype.constructor = TableRow;

TableRow.prototype.addCell = function ( text )  {
var td = new TableCell ( text );
  this.addWidget ( td );
  return td;
}


// -------------------------------------------------------------------------
// TableScroll class:  table with scrollable body

/*
<div class="scrollingtable">
  <div>
    <div>
      <table>
        <caption>Top Caption</caption>
        <thead>
          <tr>
            <th><div label="Column 1"></div></th>
            <th><div label="Column 2"></div></th>
            <th><div label="Column 3"></div></th>
            <th>
              <!--more versatile way of doing column label; requires 2 identical copies of label-->
              <div><div>Column 4</div><div>Column 4</div></div>
            </th>
            <th class="scrollbarhead"/> <!--ALWAYS ADD THIS EXTRA CELL AT END OF HEADER ROW-->
          </tr>
        </thead>
        <tbody>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
          <tr><td>Lorem ipsum</td><td>Dolor</td><td>Sit</td><td>Amet consectetur</td></tr>
        </tbody>
      </table>
    </div>
    Faux bottom caption
  </div>
</div>
*/

function TableScroll ( topCaption,bottomCaption,header_list,tooltip_list )  {

  Widget.call ( this,'div' );

  this.element.className = 'scrollingtable';
  this.div1 = new Widget ( 'div' );
  this.addWidget ( this.div1 );
  this.div2 = new Widget ( 'div' );
  this.div1.addWidget ( this.div2 );
  this.table = new Widget ( 'table' );
  this.div2.addWidget ( this.table );

  if (bottomCaption)  {
    this.bottomLegend = new Label ( bottomCaption );
    this.div2.addWidget ( this.bottomLegend );
  }
  if (topCaption)  {
    this.topLegend = new Widget ( 'caption' );
    caption.innerHTML = topCaption;
    this.table.addWidget ( this.topLegend );
  }

  this.thead = new Widget ( 'thead' );
  this.tbody = new Widget ( 'tbody' );
  this.table.addWidget ( this.thead );
  this.table.addWidget ( this.tbody );

  var trow = new TableRow();
  for (var i=0;i<header_list.length;i++)  {
    var th    = new TableHeaderCell ( '' );
    var thdiv = new Widget ( 'div' );
    th.setAttribute ( 'class','table-blue-hh' );
    thdiv.setAttribute ( 'label',header_list[i] );
    th.addWidget ( thdiv );
    if (tooltip_list.length>i)
      th.setTooltip ( tooltip_list[i] );
    trow.addWidget ( th );
  }
  var th = new TableHeaderCell ( '' );
  th.element.className = 'scrollbarhead';
  this.thead.addWidget ( trow );

}

TableScroll.prototype = Object.create ( Widget.prototype );
TableScroll.prototype.constructor = TableScroll;

TableScroll.prototype.setHeaderFontSize = function ( size )  {
var trow = this.thead.child[0];
  for (var i=0;i<trow.child.length;i++)
    trow.child[i].setFontSize ( size );
}

TableScroll.prototype.setHeaderNoWrap = function ( col )  {
var trow = this.thead.child[0];
  if (col<0)  {
    for (var i=0;i<trow.child.length;i++)
      trow.child[i].element.setAttribute ( 'style','white-space: nowrap' );
  } else if (col<trow.child.length)
    trow.child[col].element.setAttribute ( 'style','white-space: nowrap' );
}


TableScroll.prototype.addRow = function ( header,tooltip,cell_list,alt_bool )  {

  var trow = new TableRow();

  if (header)  {
    var th = new TableHeaderCell ( header );
    th.setAttribute ( 'class','table-blue-vh' );
    if (tooltip)
      th.setTooltip ( tooltip );
    trow.addWidget  ( th );
  }

  for (var i=0;i<cell_list.length;i++)  {
    var td = new TableCell ( cell_list[i] );
    if (alt_bool)  td.setAttribute ( 'class','table-blue-alt' );
             else  td.setAttribute ( 'class','table-blue-td'  );
    trow.addWidget ( td );
  }

  this.tbody.addWidget ( trow );

  return trow;

}


TableScroll.prototype.clearBody = function()  {
  $(this.tbody.element).empty();
}


// -------------------------------------------------------------------------
// TableSort class:  table with sortable columns

function TableSort()  {
  Widget.call ( this,'table' );
  this.element.className = 'tablesorter widget-zebra';
//  this.element.setAttribute ( 'class','tablesorter widget-zebra' );
  this.head = new Widget('thead');
  this.body = new Widget('tbody');
  this.element.appendChild ( this.head.element );
  this.element.appendChild ( this.body.element );
  this.selectedRow = null;  // none is selected initially
}

TableSort.prototype = Object.create ( Widget.prototype );
TableSort.prototype.constructor = TableSort;

TableSort.prototype.setHeaders = function ( header_list )  {
var trow = new TableRow();
  for (var i=0;i<header_list.length;i++)
    trow.addWidget ( new TableHeaderCell(header_list[i]) );
  this.head.addWidget ( trow );
}

TableSort.prototype.setHeaderFontSize = function ( size )  {
var trow = this.head.child[0];
  for (var i=0;i<trow.child.length;i++)
    trow.child[i].setFontSize ( size );
}

TableSort.prototype.setHeaderNoWrap = function ( col )  {
var trow = this.head.child[0];
  if (col<0)  {
    for (var i=0;i<trow.child.length;i++)
      trow.child[i].element.setAttribute ( 'style','white-space: nowrap' );
  } else if (col<trow.child.length)
    trow.child[col].element.setAttribute ( 'style','white-space: nowrap' );
}

TableSort.prototype.setHeaderColWidth = function ( col,width )  {
  var trow = this.head.child[0];
  trow.child[col].element.style.width = width;
}

TableSort.prototype.selectRow = function ( trow )  {
  if (trow.selected==-1)  {
    // the requested row need to be selected (0 is not selectable)
    if (this.selectedRow)  {
      // deselect curently selected row
      var cell = this.selectedRow.child;
      for (var i=0;i<cell.length;i++)
        $(cell[i].element).css('background',cell[i].css0);
      this.selectedRow.selected = -1;
    }
    // note and select the requested row
    this.selectedRow = trow;
    var cell = this.selectedRow.child;
    for (var i=0;i<cell.length;i++)
      $(cell[i].element).css('background','lightblue');
    this.selectedRow.selected = 1;
  }
}

TableSort.prototype.addRow = function()  {
var tr = new TableRow();
  this.body.addWidget ( tr );
  (function(table,trow)  {
    trow.addOnClickListener ( function(){
      table.selectRow ( trow );
    });
    trow.addOnDblClickListener ( function(){
      table.emitSignal ( 'row_dblclick',tr );
    });
  }(this,tr));
  return tr;
}

TableSort.prototype.removeAllRows = function()  {
  this.body.removeAllChildren();
}

TableSort.prototype.clear = function()  {
  this.element.removeChild ( this.head.element );
  this.element.removeChild ( this.body.element );
  this.head = new Widget('thead');
  this.body = new Widget('tbody');
  this.element.appendChild ( this.head.element );
  this.element.appendChild ( this.body.element );
}

TableSort.prototype.createTable = function()  {
//  alert ( this.parent.element.innerHTML );
  $(this.element).tablesorter({
    theme: 'blue'
  });
  var child = this.body.child;
  for (var i=0;i<child.length;i++)  {
    var childi = child[i].child;
    for (var j=0;j<childi.length;j++)
      childi[j].css0 = $(childi[j].element).css("background");
  }
}

TableSort.prototype.getSortList = function()  {
  return $(this.element)[0].config.sortList;
}

TableSort.prototype.applySortList = function ( sortList )  {
  $(this.element).trigger("sorton",[sortList]);
}
