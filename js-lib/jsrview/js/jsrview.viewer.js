//
//  =================================================================
//
//    03.02.18   <--  Date of Last Modification.
//                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//  -----------------------------------------------------------------
//
//  **** Module  :  jsrview.viewer.js  <interface>
//       ~~~~~~~~~
//  **** Project :  HTML5-based presentation system
//       ~~~~~~~~~
//  **** Content :  RVAPI javascript layer's window module
//       ~~~~~~~~~
//
//  (C) E. Krissinel 2013-2018
//
//  =================================================================
//

var _jsrview_uri       = "";

//var _viewer_def_width  = 800;
//var _viewer_def_height = 600;


// ===========================================================================

function makeUglyMolHtml ( xyz_uri,map_uri,diffmap_uri )  {
var html   =
    '<!doctype html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '  <meta charset="utf-8">\n' +
    '  <meta name="viewport" content="width=device-width, user-scalable=no">\n' +
    '  <meta name="theme-color" content="#333333">\n' +
    '  <link rel="stylesheet" type="text/css" href="' + _jsrview_uri + 'uglymol/uglymol.css"/>\n' +
    '  <script src="' + _jsrview_uri + 'uglymol/three.min.js"><\/script>\n' +
    '  <script src="' + _jsrview_uri + 'uglymol/uglymol.min.js"><\/script>\n' +
    '</head>\n' +
    '<body style="overflow:hidden;">\n' +
    '  <div id="viewer" style="position:absolute; left:0px; top:0px; ' +
                              'overflow:hidden;"></div>\n' +
    '  <header id="hud" onmousedown="event.stopPropagation();"\n' +
    '                   onmousemove="event.stopPropagation();"\n' +
    '                   ondblclick="event.stopPropagation();">\n' +
    '             This is uglymol not coot.\n' +
    '           <a href="#" onclick="V.toggle_help(); return false;">\n' +
    '             H shows help.\n' +
    '           </a>\n' +
    '  </header>\n' +
    '  <footer id="help"></footer>\n' +
    '  <div id="inset"></div>\n' +
    '  <script>\n' +
    '    V = new UM.Viewer({viewer:"viewer",hud:"hud",help:"help"});\n';

  if (xyz_uri.length>0)
    html = html + '    V.load_pdb("' + xyz_uri + '");\n';

//  alert ( "xyz_uri='" + xyz_uri + "'\n map_uri='"+ map_uri + "'\n diffmap_uri='" + diffmap_uri + "'" );

  if ((map_uri.length>0) && (diffmap_uri.length>0))
    html = html + '    V.load_ccp4_maps("' + map_uri + '","' + diffmap_uri + '");\n';
  else if (map_uri.length>0)
    html = html + '    V.load_map("' + map_uri + '",{diff_map: false, format: "ccp4"});\n';
  else if (diffmap_uri.length>0)
    html = html + '    V.load_map("' + diffmap_uri + '",{diff_map: true, format: "ccp4"});\n';

  html = html +
    '  <\/script>\n' +
    '</body>\n' +
    '</html>\n';

//  alert ( " html=" + html );

  return html;

}

/*
<body style="background-color: black">
  <div id="viewer"></div>
  <header id="hud" onmousedown="event.stopPropagation();"
                   ondblclick="event.stopPropagation();"
             >This is uglymol not coot. <a href="#"
                         onclick="V.toggle_help(); return false;"
                         >H shows help.</a></header>
  <footer id="help"></footer>
  <div id="inset"></div>
  <script>
    V = new UM.Viewer({viewer: "viewer", hud: "hud", help: "help"});
    V.load_pdb("data/1mru.pdb");
    V.load_ccp4_maps("data/1mru.map", "data/1mru_diff.map");
  </script>
</body>
*/



function startUglyMol ( title,xyz_uri,map_uri,diffmap_uri )  {

  var doc = window.parent.document;
  var jq  = window.parent.$;

  //var jq  = window.$;
  //var doc = window.document;
  //var jq = $;

  var dialog = doc.createElement ( 'div' );
  jq(dialog).css({'box-shadow' : '8px 8px 16px 16px rgba(0,0,0,0.2)',
                  'overflow'   : 'hidden'
  });
  doc.body.appendChild ( dialog );

  var iframe = doc.createElement ( 'iframe' );
  jq(iframe).css ( {'border'   : 'none',
                    'overflow' : 'hidden'
  });

  /*
  var w = window.parent.innerWidth
          || doc.documentElement.clientWidth
          || doc.body.clientWidth;

  var h = window.parent.innerHeight
          || doc.documentElement.clientHeight
          || doc.body.clientHeight;
  */

  var w = jq(window.parent).width () - 50;
  var h = jq(window.parent).height() - 70;

  jq(iframe).width  ( 3*w/4 );
  jq(iframe).height ( 7*h/8 );

//  jq(iframe).width  ( _viewer_def_width  );
//  jq(iframe).height ( _viewer_def_height );

  dialog.appendChild ( iframe );

  jq(dialog).dialog({
      resizable  : true,
      height     : 'auto',
      width      : 'auto',
      modal      : false,
      title      : title,
      effect     : 'fade',
      create     : function() { iframe.contentWindow.focus(); },
      focus      : function() { iframe.contentWindow.focus(); },
      open       : function() { iframe.contentWindow.focus(); },
      dragStop   : function() { iframe.contentWindow.focus(); },
      resizeStop : function() { iframe.contentWindow.focus(); },
      buttons: {}
  });

  var html = makeUglyMolHtml ( xyz_uri,map_uri,diffmap_uri );
  iframe.contentWindow.document.write(html);
  iframe.contentWindow.document.close();

  jq(dialog).on ( 'dialogresize', function(event,ui){
    var w = jq(dialog).width ();
    var h = jq(dialog).height();
    jq(iframe).width  ( w );
    jq(iframe).height ( h );
  });

  jq(dialog).on( "dialogclose",function(event,ui){
    window.setTimeout ( function(){
      jq(dialog).dialog( "destroy" );
      if (dialog.parentNode)
        dialog.parentNode.removeChild ( dialog );
    },10 );
  });

  jq(dialog).click ( function() {
    iframe.contentWindow.focus();
  });

}


function _startUglyMol ( data )  {
//  data is a string made of title and 3 file uri:
//  title>>>xyz_uri*map_uri*diffmap_uri

  var title     = "";
  var xyz_path  = "";
  var map_path  = "";
  var dmap_path = "";

  var tlist = data.split('>>>');
  var dlist = [];
  if (tlist.length<=1)  {
    dlist = data.split('*');
    if (dlist.length>0)  {
      // take structure file basename as title
      title = dlist[0].split(/[\\/]/).pop();
    } else {
      title = "No title";
    }
  } else  {
    title = tlist[0];
    dlist = tlist[1].split('*');
  }

  if (dlist.length>0)  {
    xyz_path = dlist[0];
    if (dlist.length>1)  {
      map_path = dlist[1];
      if (dlist.length>2)
        dmap_path = dlist[2];
    }
  }

  startUglyMol ( title,xyz_path,map_path,dmap_path );

}


// ===========================================================================


function makeViewHKLHtml ( title,mtz_uri )  {
var html   =
    '<!DOCTYPE html>\n' +
    '<html>\n' +
    '  <head>\n' +
    '    <meta http-equiv="content-type" content="text/html; charset=UTF-8">\n' +
    '    <meta charset="utf-8">\n' +
    '    <meta name="viewport" content="width=device-width, user-scalable=no">\n' +
    '    <meta name="theme-color" content="#333333">\n' +
    '    <meta http-equiv="pragma"  content="no-cache">\n' +
    '    <meta http-equiv="expires" content="0">\n' +
    '    <title>ViewHKL ' + title + '</title>\n' +
    '  </head>\n' +
    '  <link rel="stylesheet" type="text/css" href="' + _jsrview_uri + 'jquery-ui/css/jquery-ui.css"/>\n' +
    '  <link rel="stylesheet" type="text/css" href="' + _jsrview_uri + 'viewhkl/css/gui/gui.widgets.css"/>\n' +
    '  <link rel="stylesheet" type="text/css" href="' + _jsrview_uri + 'viewhkl/css/gui/gui.tables.css"/>\n' +
    '  <link rel="stylesheet" type="text/css" href="' + _jsrview_uri + 'viewhkl/css/gui/gui.tabs.css"/>\n' +
    '  <script src="' + _jsrview_uri + 'jquery-ui/js/jquery.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'jquery-ui/js/jquery-ui.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/gui/gui.widgets.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/gui/gui.tables.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/gui/gui.tabs.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/gui/gui.menu.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/gui/gui.canvas.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/mtz.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/viewhkl.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/viewhkl_tab1.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/viewhkl_tab2.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/viewhkl_tab3.js"></script>\n' +
    '  <script src="' + _jsrview_uri + 'viewhkl/viewhkl_tab4.js"></script>\n' +
    '<body>\n' +
    '  <div id="scene"></div>\n' +
    '   <script>\n' +
    '      $(document).ready(function()  {\n' +
    '          $(function() {\n' +
    '            $( document ).tooltip();\n' +
    '          });\n' +
    '          var viewhkl = new ViewHKL ( "scene",true );\n' +
    '          viewhkl.Load ( "' + mtz_uri + '" );\n' +
    '        });\n' +
    '      </script>\n' +
    '</body>\n' +
    '</html>';

  return html;

}


function startViewHKL ( title,mtz_uri )  {

  // take structure file basename as title
  var dlg_title = title;
  if (!dlg_title)
    dlg_title = mtz_uri.split(/[\\/]/).pop();

  var doc = window.parent.document;
  var jq  = window.parent.$;

  var dialog = doc.createElement ( 'div' );
  $(dialog).css({'box-shadow' : '8px 8px 16px 16px rgba(0,0,0,0.2)',
                 'overflow'   : 'hidden'
  });
  doc.body.appendChild ( dialog );

  var iframe = doc.createElement ( 'iframe' );
  jq(iframe).css ( {'border'   : 'none',
                    'overflow' : 'hidden'
  });


  var w = jq(window.parent).width () - 50;
  var h = jq(window.parent).height() - 70;

  jq(iframe).width  ( 3*w/4 );
  jq(iframe).height ( 7*h/8 );

  //jq(iframe).width  ( _viewer_def_width  );
  //jq(iframe).height ( _viewer_def_height );

  dialog.appendChild ( iframe );

  jq(dialog).dialog({
      resizable  : true,
      height     : 'auto',
      width      : 'auto',
      modal      : false,
      title      : 'ViewHKL [' + dlg_title + ']',
      effect     : 'fade',
      create     : function() { iframe.contentWindow.focus(); },
      focus      : function() { iframe.contentWindow.focus(); },
      open       : function() { iframe.contentWindow.focus(); },
      dragStop   : function() { iframe.contentWindow.focus(); },
      resizeStop : function() { iframe.contentWindow.focus(); },
      buttons: {}
  });

  var html = makeViewHKLHtml ( dlg_title,mtz_uri );
  iframe.contentWindow.document.write(html);
  iframe.contentWindow.document.close();

  jq(dialog).on ( 'dialogresize', function(event,ui){
    var w = jq(dialog).width ();
    var h = jq(dialog).height();
    jq(iframe).width  ( w );
    jq(iframe).height ( h );
  });

  jq(dialog).on( "dialogclose",function(event,ui){
    window.setTimeout ( function(){
      jq(dialog).dialog( "destroy" );
      if (dialog.parentNode)
        dialog.parentNode.removeChild ( dialog );
    },10 );
  });

  jq(dialog).click ( function() {
    iframe.contentWindow.focus();
  });

}
