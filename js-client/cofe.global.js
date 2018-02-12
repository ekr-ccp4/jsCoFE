
/*
 *  =================================================================
 *
 *    12.02.18   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-client/cofe.global.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Global variables
 *       ~~~~~~~~~
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2018
 *
 *  =================================================================
 *
 */


// ===========================================================================
// version tag

var jsCoFE_version = '0.1.0 [12.02.2018]';


// ===========================================================================
// mainteiner's e-mail

var maintainerEmail = 'ccp4@ccp4.ac.uk';


// ===========================================================================
// session identification

var __login_token  = '';
var __login_user   = '';
var __admin        = false;

var __current_page = null;
var __local_setup  = false;

var __touch_device = ('ontouchstart' in document.documentElement);
// the following will also include desktops with touch screens:
//var __touch_device = (navigator.maxTouchPoints || 'ontouchstart' in document.documentElement);

$(window).resize ( function(){
  if (__current_page)
    __current_page.onResize ( window.innerWidth,window.innerHeight );
});

// ===========================================================================
// various constants

var __check_job_interval  = 2000;  // milliseconds
var __persistence_level   = 100;   // number of retries due to poor internet connection

//  task list parameters
var __suggested_task_prob = 0.03;  // do not list tasks with combined probability
                                   // less than 3%
var __suggested_task_nmin = 3;     // minimum 3 tasks to suggest


var __rvapi_config_coot_btn = false;  // switch Coot button off in RVAPI

// ===========================================================================
// miscellaneous functions

function getDateString()  {
  var d = new Date();
  var date_str = d.getDate();
  if (date_str.length<2)  date_str = '0' + date_str;
  date_str = (d.getMonth()+1) + '-' + date_str;
  if (date_str.length<5)  date_str = '0' + date_str;
  return d.getFullYear() + '-' + date_str;
}

// auxiliary function for getObjectInstance(), not to be used by itself
function __object_to_instance ( key,value ) {

  if (!value)
    return value;

  if (!value.hasOwnProperty('_type'))
    return value;

  var obj= eval('new '+value._type+'()');
  //alert ( value._type );

  for (var property in value)
    obj[property]=value[property];

  return obj;

}

// recreates particular class instance from stringified object
function getObjectInstance ( data_json )  {
  return JSON.parse ( data_json,__object_to_instance );
}


// ===========================================================================
// client type identification

var client_code = {
  ccp4     : 'ccp4',    // ccp4 client
  ccpem    : 'ccpem'    // ccpem client
}

var __client = client_code.ccp4;

function setClientCode ( code )  {
  __client = code;
}

function getClientCode()  {
  return __client;
}

function getClientName()  {
  switch (__client)  {
    default :
    case client_code.ccp4  : return "CCP4";
    case client_code.ccpem : return "CCPEM";
  }
  return "CCP4";
}

function getFEURL()  {
  return window.location.protocol + '//' + window.location.host + window.location.pathname;
}

// ===========================================================================
// help support

__doNotShowList = [];

function doNotShowAgain ( key,url )  {

  var topic = url.replace ( /^.*\/|\.[^.]*$/g,'' );

  if (key==0)  {

    return  (__doNotShowList.indexOf(topic)<0) &&
            (__doNotShowList.indexOf('*')<0);

  } else if (key==1)  {

    if (__doNotShowList.indexOf(topic)<0)  {
      __doNotShowList.push ( topic );
      var userData = {};
      userData.helpTopics = __doNotShowList;
      serverRequest ( fe_reqtype.saveHelpTopics,userData,'My Account',null,null,
                      'persist' );
    }

  }

  return false;

}


// ===========================================================================
// allow HTML markup in tooltips

$(document).tooltip({
  content: function (callback) {
     callback($(this).prop('title'));
  }
});
