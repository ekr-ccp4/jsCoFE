
/*
 *  =================================================================
 *
 *    10.11.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-client/cofe.communication.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  validateUserData()
 *       ~~~~~~~~~  makeCommErrorMessage()
 *                  serverCommand()
 *                  serverRequest()
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2017
 *
 *  =================================================================
 *
 */


var cofe_signals = {
  jobStarted   : 'job_started',    // fired by JobTree
  treeUpdated  : 'tree_updated',   // fired by JobTree
  jobDlgSignal : 'job_dlg_signal'
}


function validateUserData ( user_inp,email_inp,login_inp )  {
//  All parameters are InputText classes, corresponding to the input of
//  user name, e-mail and login name, respectively
var msg = '';

  if (user_inp.getValue().length<=0)
    msg += '<b>User name</b> must be provided.<p>';
  else if (user_inp.element.validity.patternMismatch)
    msg += '<b>User name</b> should only contain latin letters, dots,<br>' +
           'dashes and spaces.<p>';

  if (email_inp.getValue().length<=0)
    msg += '<b>E-mail address</b> must be provided.<p>';
  else if (email_inp.element.validity.typeMismatch)
    msg += '<b>E-mail address</b> should the correct one. Your temporary<br>' +
           'password will be sent to the e-mail provided.<p>';

  if (login_inp.getValue().length<=0)
    msg += '<b>Login name</b> must be provided.<p>';
  else if (login_inp.element.validity.patternMismatch)
    msg += '<b>Login name</b> should contain only latin letters, numbers,<br> ' +
           'undescores, dashes and dots, and must start with a letter.<p>';

  return msg;

}


function makeCommErrorMessage ( title,response )  {
// starts respective error message dialog
//    title:     dialog title string, which should correspond to error context
//    response:  Response structure

  switch (response.status)  {

    case fe_retcode.readError:
        MessageDataReadError ( title,response.message );
      break;

    case fe_retcode.jobballError:
        MessageDataReadError ( title,response.message );
      break;

    case fe_retcode.writeError:
        MessageDataWriteError ( title,response.message );
      break;

    case fe_retcode.mkDirError:
        MessageMkDirError ( title,response.message );
      break;

    case fe_retcode.notLoggedIn:
        MessageNotLoggedIn ( title );
        makePage ( new LogoutPage(__current_page.element.id) );
      break;

    case fe_retcode.uploadErrors:
        MessageUploadErrors ( title,response.message );
      break;

    case fe_retcode.noJobDir:
        MessageNoJobDir ( title );
      break;

    default:
        MessageUnknownError ( title,response.message );

 }

}


function serverCommand ( cmd,data_obj,page_title,function_response,
                         function_always,function_fail )  {
// used when no user is logged in

  $.ajax ({
    url     : cmd,
    async   : true,
    type    : 'POST',
    data    : JSON.stringify(data_obj),
    dataType: 'text'
  })
  .done ( function(rdata) {

    var response = jQuery.extend ( true, new Response(), jQuery.parseJSON(rdata) );

    if (!function_response(response))
      makeCommErrorMessage ( page_title,response );

  })
  .always ( function(){
    if (function_always)
      function_always();
  })
  .fail ( function(xhr,err){
    if (function_fail)
          function_fail();
    else  MessageAJAXFailure(page_title,xhr,err);
  });

}


function serverRequest ( request_type,data_obj,page_title,function_ok,
                         function_always,function_fail )  {
// used when a user is logged in

  //var request = new Request ( request_type,__login_token.getValue(),data_obj );
  var request = new Request ( request_type,__login_token,data_obj );

  function execute_ajax ( attemptNo )  {

    $.ajax ({
      url     : fe_command.request,
      async   : true,
      type    : 'POST',
      data    : JSON.stringify(request),
      dataType: 'text'
    })
    .done ( function(rdata) {

/*  only for testing!!!!
if ((typeof function_fail === 'string' || function_fail instanceof String) &&
          (function_fail=='persist')) {
  if (attemptNo>0)  {
    execute_ajax ( attemptNo-1 );
    return;
  }
}
*/

      var response = jQuery.extend ( true, new Response(), jQuery.parseJSON(rdata) );
      if (response.status==fe_retcode.ok)  {
        if (function_ok)
          function_ok ( response.data );
      } else
        makeCommErrorMessage ( page_title,response );

      // we put this function here and in fail section because we do not want to
      // have it exwcuted multiple times due to multiple retries
      if (function_always)
        function_always(0);

    })

    .always ( function(){})

    .fail ( function(xhr,err){

      if ((typeof function_fail === 'string' || function_fail instanceof String) &&
          (function_fail=='persist')) {

        if (attemptNo>0)  {
          execute_ajax ( attemptNo-1 );
          return;
        } else
          MessageAJAXFailure ( page_title,xhr,err );

      } else if (function_fail)
        function_fail();
      else
        MessageAJAXFailure ( page_title,xhr,err );

      // we put this function here and in done section because we do not
      // want to have it executed multiple times due to multiple retries
      if (function_always)
        function_always(1);

    });

  }

  execute_ajax ( __persistence_level );

}


function localCommand ( cmd,data_obj,command_title,function_response )  {
// used to communicate with local (client-side) server
//   cmd:               an NC command
//   data_obj:          data object to pass with the command
//   command_title:     identification title for error messages
//   function_response: callback function, invoked when server relpies to
//                      command. The only argumnet to response function is
//                      a common.commands::Response class filled with data
//                      sent by the server. The function should return false
//                      in case something is wrong, in which case a
//                      communication error message box is displayed.

  if (!__local_service)
    return;

// alert ( ' url=' + __local_service + "/" + cmd );

  $.ajax ({
    url     : __local_service + '/' + cmd,
    async   : true,
    type    : 'POST',
    data    : JSON.stringify(data_obj),
    dataType: 'text'
  })
  .done ( function(rdata) {

//    alert ( ' done rdata=' + rdata );

    var response = jQuery.extend ( true,new Response(),jQuery.parseJSON(rdata) );

    if (function_response && (!function_response(response)))
      makeCommErrorMessage ( command_title,response );

  })
  .always ( function(){} )
  .fail   ( function(xhr,err){
    if (function_response && (!function_response(null)))
      MessageAJAXFailure(command_title,xhr,err);
  });

}


function downloadFile ( uri )  {
var hiddenALinkID = 'hiddenDownloader';
var alink = document.getElementById(hiddenALinkID);
  if (!alink)  {
    alink    = document.createElement('a');
    alink.id = hiddenALinkID;
    alink.style.display = 'none';
    alink.type          = 'application/octet-stream';
    document.body.appendChild(alink);
  }
  alink.download = uri.split('/').pop();
  alink.href     = uri;
  alink.click();
}


window.onbeforeunload = function(e)  {
  serverCommand ( fe_command.stop,{},'stopping',null,null,function(){} );
}
