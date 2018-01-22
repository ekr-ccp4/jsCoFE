
/*
 *  =================================================================
 *
 *    30.09.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-server/server.configuration.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Configuration Module
 *       ~~~~~~~~~
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2017
 *
 *  =================================================================
 *
 */


//  load application modules
var path  = require('path');
var utils = require('./server.utils');
var http  = require('http');

//  prepare log
var log = require('./server.log').newLog(3);


// ===========================================================================
//  Configuration data classes

var desktop       = null;   // Configuration for launching single desktop
var work_server   = null;   // current server configuration (FE or NC/CLIENT)
var fe_server     = null;   // FE server configuration
var nc_servers    = null;   // vector of NC server configurations
var client_server = null;   // Client server configuration
var emailer       = null;   // E-mailer configuration


// ===========================================================================
// ServerConfig class template

function ServerConfig()  {
  this.protocol    = 'http';
  this.host        = 'localhost';
  this.port        = 'port';
  this.externalURL = '';
  this.startDate   = new Date(Date.now()).toUTCString();
}

ServerConfig.prototype.url = function()  {
  if (this.port>0)  {
    // this works on FE side
    return this.protocol + '://' + this.host + ':' + this.port
  } else  {
    // this may be used on NC side if FE uses redirection from
    // its main server, e.g.  http://fe.apache.com/jscofe ->
    // http://localhost:8081 . In this case, set 'host' to
    // 'apache.com' and use port=0
   return this.protocol + '://' + this.host
  }
}

ServerConfig.prototype.getQueueName = function()  {
  if ('exeType' in this)  {
    if (this.exeType=='SGE')  {
      var n = this.exeData.indexOf('-q');
      if ((n>=0) && (n<this.exeData.length-1))
        return this.exeData[n+1];
    }
  }
  return '';
}


// ===========================================================================
// Config service functions

function getDesktopConfig()  {
  return desktop;
}

function getServerConfig()  {
  return work_server;
}

function getFEConfig()  {
  return fe_server;
}

function getNCConfig ( ncNumber )  {
  return nc_servers[ncNumber];
}

function getNCConfigs()  {
  return nc_servers;
}

function getNumberOfNCs()  {
  if (nc_servers)
    return nc_servers.length;
  return 0;
}

function getClientNCConfig()  {
  return client_server;
}

function getEmailerConfig()  {
  return emailer;
}


// ===========================================================================
// Config read function

function _make_path ( filepath )  {
  plist = filepath.split ( '/' );
  for (var i=0;i<plist.length;i++)
    if (plist[i].startsWith('$'))
      plist[i] = process.env[plist[i].slice(1)];
  return plist.join ( '/' );
}

function readConfiguration ( confFilePath,serverType )  {

  var confObj = utils.readObject ( confFilePath );

  if (!confObj)
    return 'configuration file ' + confFilePath + ' not found';

  if (confObj.hasOwnProperty('Desktop'))
    desktop = confObj.Desktop;

  if (confObj.hasOwnProperty('FrontEnd')) {
    fe_server  = new ServerConfig();
    for (var key in confObj.FrontEnd)
      fe_server[key] = confObj.FrontEnd[key];
    if (!fe_server.externalURL)
      fe_server.externalURL = fe_server.url();
    fe_server.userDataPath = _make_path ( fe_server.userDataPath );
    fe_server.projectsPath = _make_path ( fe_server.projectsPath );
  } else if (serverType=='FE')
    return 'front-end configuration is missing in file ' + confFilePath;

  if (confObj.hasOwnProperty('NumberCrunchers')) {
    client_server = null;
    nc_servers    = [];
    for (var i=0;i<confObj.NumberCrunchers.length;i++)  {
      var nc_server = new ServerConfig();
      for (var key in confObj.NumberCrunchers[i])
        nc_server[key] = confObj.NumberCrunchers[i][key];
      nc_server.current_capacity = nc_server.capacity;
      if (!nc_server.externalURL)
        nc_server.externalURL = nc_server.url();
      nc_server.storage = _make_path ( nc_server.storage );
      nc_servers.push ( nc_server );
      if (nc_server.exeType=='CLIENT')
        client_server = nc_server;
    }
  } else
    return 'number cruncher(s) configuration is missing in file ' + confFilePath;

  if (confObj.hasOwnProperty('Emailer')) {
    emailer = confObj.Emailer;
  } else
    return 'emailer configuration is missing in file ' + confFilePath;

  return '';  // empty return is Ok

}

function setServerConfig ( server_config )  {
  work_server = server_config;
}


// ===========================================================================
// Assign ports function: assign available port numbers where they were set
// zero for localhosts

function assignPorts ( assigned_callback )  {

  var servers = [];

  function set_server ( config,callback )  {
    var server  = http.createServer();
    servers.push ( server );
    var port    = config.port;
    config.port = 0;
    server.listen({
      host      : config.host,
      port      : port,
      exclusive : config.exclusive
    },function(){
      config.port = server.address().port;
      callback();
    });
  }

  function setServer ( key,n )  {

    switch (key)  {

      case 0: if (fe_server.port>0)
                    set_server ( fe_server,function(){ setServer(1,0); } );
              else  setServer(1,0);
            break;

      case 1: if (n<nc_servers.length)  {
                if (nc_servers[n].port>0)
                      set_server ( nc_servers[n],function(){ setServer(1,n+1); } );
                else  setServer(1,n+1);
              } else
                setServer ( 2,0 );
            break;

      case 2: if (fe_server.port<=0)
                    set_server ( fe_server,function(){ setServer(3,0); } );
              else  setServer(3,0);
            break;

      case 3: if (n<nc_servers.length)  {
                if (nc_servers[n].port<=0)
                      set_server ( nc_servers[n],function(){ setServer(3,n+1); } );
                else  setServer(3,n+1);
              } else
                setServer ( 4,0 );
            break;

      case 4: default:
            break;

    }

  }

  setServer ( 0,0 );

  // ===========================================================================

  function checkServers ( callback )  {
    var b = (fe_server.port>0);
    nc_servers.forEach ( function(config){ b = b && (config.port>0);} );
    if (b)
      callback();
    else
      setTimeout ( function(){checkServers(callback)},50 );
  }

  checkServers ( function(){

    log.standard ( 1,'FE: url=' + fe_server.url() );
    for (var i=0;i<nc_servers.length;i++)
      log.standard ( 2,'NC['    + i + ']: name=' + nc_servers[i].name +
                       ' type=' + nc_servers[i].exeType +
                       ' url='  + nc_servers[i].url() );

    servers.forEach ( function(server){ server.close(); } );

    if (assigned_callback)
      assigned_callback();

  });

}


// ==========================================================================
// write configuration function

function writeConfiguration ( fpath )  {

  var confObj = {};
  if (desktop)    confObj['Desktop']         = desktop;
  if (fe_server)  confObj['FrontEnd']        = fe_server;
  if (nc_servers) confObj['NumberCrunchers'] = nc_servers;
  if (emailer)    confObj['Emailer']         = emailer;

  if (utils.writeObject(fpath,confObj))
        log.standard ( 3,'configuration written to ' + fpath );
  else  log.error ( 4,'error writing to ' + fpath );

}


var _python_name = 'ccp4-python';
function pythonName()  {
  return _python_name;
}


function isSharedFileSystem()  {
// Returns true in case of shared file system setup, i.e. when access to data
// on client and at least one NC is possible via the file system mount.
var isFSClient = false;
var isFSNC     = false;
var isClient   = false;

  for (var i=0;i<nc_servers.length;i++)
    if (nc_servers[i].in_use)  {
      if (nc_servers[i].exeType=='CLIENT')  {
        isClient   = true;
        isFSClient = (nc_servers[i].fsmount != '');
      } else if (nc_servers[i].fsmount!='')
        isFSNC = true;
    }

  return isClient && isFSClient && isFSNC;

}


function isLocalSetup()  {
// Returns true if all servers are running on localhost.
var isLocal = (fe_server.host == 'localhost');

  for (var i=0;(i<nc_servers.length) && isLocal;i++)
    isLocal = (nc_servers[i].host == 'localhost');

  return isLocal;

}


function getFETmpDir()  {
  return path.join ( getFEConfig().projectsPath,'tmp' );
}

function getNCTmpDir()  {
  return path.join ( getServerConfig().storage,'tmp' );
}


// ==========================================================================
// export for use in node
module.exports.getDesktopConfig   = getDesktopConfig;
module.exports.getServerConfig    = getServerConfig;
module.exports.getFEConfig        = getFEConfig;
module.exports.getNCConfig        = getNCConfig;
module.exports.getNCConfigs       = getNCConfigs;
module.exports.getNumberOfNCs     = getNumberOfNCs;
module.exports.getClientNCConfig  = getClientNCConfig;
module.exports.getEmailerConfig   = getEmailerConfig;
module.exports.readConfiguration  = readConfiguration;
module.exports.setServerConfig    = setServerConfig;
module.exports.assignPorts        = assignPorts;
module.exports.writeConfiguration = writeConfiguration;
module.exports.pythonName         = pythonName;
module.exports.isSharedFileSystem = isSharedFileSystem;
module.exports.isLocalSetup       = isLocalSetup;
module.exports.getFETmpDir        = getFETmpDir;
module.exports.getNCTmpDir        = getNCTmpDir;
