
/*
 *  =================================================================
 *
 *    25.10.17   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-client/cofe.page_login.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Login page
 *       ~~~~~~~~~
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2017
 *
 *  =================================================================
 *
 */


// -------------------------------------------------------------------------
// login page class

function LoginPage ( sceneId )  {

  //  **********************************

  //if (__login_token)  __login_token.empty();
  //if (__login_user)   __login_user .empty();
  __login_token = '';
  __login_user  = '';

  // prepare the scene and make top-level grid
  BasePage.call ( this,sceneId,'-full','LoginPage' );

  // adjust scene grid attributes such that login panel is centered
  this.grid.setCellSize          ( '45%','',0,0,1,1 );
  this.grid.setVerticalAlignment ( 0,1,'middle' );
  this.grid.setCellSize          ( '10%','',0,1,1,1 );
  this.grid.setCellSize          ( '45%','',0,2,1,1 );
  this.makeLogoPanel             ( 1,0,3 );

  // make login panel
  var panel = new Grid('');
  panel.setWidth      ( '300pt' );
  this.grid.setWidget ( panel,0,1,1,1 );

  var ccp4_lbl  = new Label     ( 'CCP4 Login'  );
  var login_lbl = new Label     ( 'Login name:' );
  var pwd_lbl   = new Label     ( 'Password:'   );
  var login_inp = new InputText ( '' );
  var pwd_inp   = new InputText ( '' );
  ccp4_lbl .setFont             ( 'times','300%',true,true ).setNoWrap();
  login_lbl.setFontSize         ( '125%' );
  pwd_lbl  .setFontSize         ( '125%' );
  login_inp.setFontSize         ( '112%' );
  login_inp.setStyle            ( 'text',"^[A-Za-z0-9\\-\\._]+$",
                                  'Your CCP4 login','' );
  /*
                                  'Login name should contain only latin ' +
                                  'letters, numbers,\n undescores, dashes ' +
                                  'and dots, and must start with a letter' );
  */
  login_inp.setFontItalic       ( true   );
  pwd_inp  .setFontSize         ( '112%' );
  pwd_inp  .setStyle            ( 'password','','Your CCP4 password','' );
  pwd_inp  .setFontItalic       ( true  );
  login_inp.setWidth            ( '95%' );
  pwd_inp  .setWidth            ( '95%' );

  var row = 0;
  panel.setWidget               ( ccp4_lbl, row,0,1,2 );
  panel.setHorizontalAlignment  ( row++ ,0,'center' );
  panel.setCellSize             ( '','20pt',row++,0 );
  panel.setWidget               ( login_lbl,row  ,0,1,1 );
  panel.setWidget               ( pwd_lbl  ,row+1,0,1,1 );
  panel.setVerticalAlignment    ( row  ,0,'middle' );
  panel.setVerticalAlignment    ( row+1,0,'middle' );
  panel.setWidget               ( login_inp,row++,1,1,1 );
  panel.setWidget               ( pwd_inp  ,row++,1,1,1 );

  panel.setCellSize             ( '','12pt',row++,0 );
  panel.setWidget               ( new HLine('3pt'), row++,0,1,2 );
  panel.setCellSize             ( '','1pt',row++,0 );

  var login_btn = new Button    ( 'Login','./images/login.svg' );
  var pwd_btn   = new Button    ( 'Forgotten password','./images/reminder.svg' );
  var reg_btn   = new Button    ( 'Registration','./images/new_file.svg' );

//  login_btn.setFontSize         ( '100%' );
//  pwd_btn  .setFontSize         ( '100%' );
//  reg_btn  .setFontSize         ( '100%' );

  login_btn.setWidth            ( '100%' );
  pwd_btn  .setWidth            ( '100%' );
  reg_btn  .setWidth            ( '100%' );

  panel.setWidget               ( login_btn,row++,0,1,2 );
  panel.setWidget               ( pwd_btn  ,row++,0,1,2 );
  panel.setWidget               ( reg_btn  ,row++,0,1,2 );
  panel.setCellSize             ( '','24pt',row++,0 );

  reg_btn.addOnClickListener ( function(){ makeRegisterPage      (sceneId) } );
  pwd_btn.addOnClickListener ( function(){ makeForgottenLoginPage(sceneId) } );

  login_btn.addOnClickListener ( function(){

    // Validate the input
    var msg = '';

    if (login_inp.getValue().length<=0)
      msg += '<b>Login name</b> must be provided.<p>';
    else if (login_inp.element.validity.patternMismatch)
      msg += 'Login name should contain only latin letters, numbers,\n ' +
             'undescores, dashes and dots, and must start with a letter.<p>';

    if (pwd_inp.getValue().length<=0)
      msg += '<b>Password</b> must be provided.';

    if (msg)  {

      new MessageBox ( 'Login',
         'Login cannot be done due to the following reasons:<p>' +
          msg + '<p>Please provide all needful data and try again' );

    } else  {

      ud       = new UserData();
      ud.login = login_inp.getValue();
      ud.pwd   = pwd_inp  .getValue();

      serverCommand ( fe_command.login,ud,'Login',function(response){

        switch (response.status)  {

          case fe_retcode.ok:
                  var userData  = response.data.userData;
                  __login_token = response.message;
                  __login_user  = userData.name;
                  __admin       = userData.admin;
                  /*
                  if (!__login_token)  {
                     __login_token = new InputText ( response.message );
                     __login_token.setStyle ( 'hidden','','','' );
                     document.body.appendChild ( __login_token.element );
                     __login_user = new InputText ( userData.name );
                     __login_user.setStyle ( 'hidden','','','' );
                     document.body.appendChild ( __login_user.element );
                  } else {
                    __login_token.setValue ( response.message );
                    __login_user .setValue ( userData.name    );
                  }
                  */
                  if ('helpTopics' in userData)
                        __doNotShowList = userData.helpTopics;
                  else  __doNotShowList = [];
                  __local_setup = response.data.localSetup;
                  loadKnowledge ( 'Login' )
                  if (__admin)
                        makeAdminPage       ( sceneId );
                  else  makeProjectListPage ( sceneId );
              return true;

          case fe_retcode.wrongLogin:
                    new MessageBox ( 'Login',
                      '<b>Login data cannot be recognised.</b><p>' +
                      'Please check that provided login name and password are ' +
                      'correct.' );
              return true;

          default: ;

        }

        return false;

      },null,null);

    }

  });

  setDefaultButton ( login_btn,this.grid );

}

LoginPage.prototype = Object.create ( BasePage.prototype );
LoginPage.prototype.constructor = LoginPage;

function makeLoginPage ( sceneId )  {
  makePage ( new LoginPage(sceneId) );
}
