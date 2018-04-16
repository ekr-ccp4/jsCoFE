
/*
 *  =================================================================
 *
 *    27.03.18   <--  Date of Last Modification.
 *                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  -----------------------------------------------------------------
 *
 *  **** Module  :  js-client/cofe.jobtree.js
 *       ~~~~~~~~~
 *  **** Project :  jsCoFE - javascript-based Cloud Front End
 *       ~~~~~~~~~
 *  **** Content :  Job Tree
 *       ~~~~~~~~~
 *
 *  (C) E. Krissinel, A. Lebedev 2016-2018
 *
 *  =================================================================
 *
 *    requires:  js-common/dtypes/common.dtypes.box.js
 *
 *   class JobTree : Tree {
 *
 *      constructor JobTree();
 *
 *      function customIcon      ();
 *      function getTaskByNodeId ( nodeId );
 *      function getTask         ( taskId );
 *      function getTaskNodeId   ( taskId ) ;
 *      function readProjectData ( page_title,
 *                                 onLoaded_func  ,onRightClick_func,
 *                                 onDblClick_func,onSelect_func );
 *      function makeNodeId      ( task_id );
 *      function makeNodeName    ( task );
 *      function setNodeName     ( nodeId,save_bool );
 *      function resetNodeName   ( nodeId );
 *      function __checkTaskLoop ();
 *      function startTaskLoop   ();
 *      function stopTaskLoop    ();
 *      function getSelectedTask ();
 *      function saveProjectData ( tasks_add,tasks_del,onDone_func );
 *      function hasRunningJobs  ( nodeId );
 *      function addJob          ( insert_bool,onAdd_func );
 *      function moveJobUp       ();
 *      function deleteJob       ( onDelete_func );
 *      function closeAllJobDialogs();
 *      function stopJob         ( nodeId );
 *      function openJob         ( dataBox );
 *      function cloneJob        ( onAdd_func );
 *      function harvestTaskData ( includeSelected_bool,harvestedTaskIds );
 *      function inspectData     ( jobId,dataType,dataId );
 *      function getAllAncestors ();
 *
 *   }
 *
 */


// -------------------------------------------------------------------------
// JobTree class

function JobTree()  {

  Tree.call ( this,'___' );

  this.projectData = null;
  this.task_map    = {};  // map[nodeId]==task of all tasks in the tree
  this.run_map     = {};  // map[taskId]==nodeId of all running tasks
  this.dlg_map     = {};  // map[taskId]==dialog of open job dialogs

  this.checkTimeout = null;  // timeout timer Id

}

JobTree.prototype = Object.create ( Tree.prototype  );
JobTree.prototype.constructor = JobTree;


// -------------------------------------------------------------------------

JobTree.prototype.customIcon = function() {
//  var ci = new TreeNodeCustomIcon ( './images/brass_gears.gif','32px','22px','hidden' );
  var ci = new TreeNodeCustomIcon ( './images/activity.gif','22px','22px','hidden' );
  return ci;
}


JobTree.prototype.getTaskByNodeId = function ( nodeId )  {
  if (nodeId in this.task_map)
    return this.task_map[nodeId];
  return null;
}


JobTree.prototype.getTask = function ( taskId )  {
// not a very slick function, but it should be used relatively rare
var task = null;
  for (var nodeId in this.task_map)
    if (this.task_map[nodeId].id==taskId)  {
      task = this.task_map[nodeId];
      break;
    }
  return task;
}


JobTree.prototype.getTaskNodeId = function ( taskId )  {
// not a very slick function, but it should be used relatively rare
var nodeId = null;
  for (var nId in this.task_map)
    if (this.task_map[nId].id==taskId)  {
      nodeId = nId;
      break;
    }
  return nodeId;
}


var __notViewedStyle = 'color:#00A000;';

JobTree.prototype.readProjectData = function ( page_title,
                                               onLoaded_func,
                                               onRightClick_func,
                                               onDblClick_func,
                                               onSelect_func )  {

  this.task_map = {};  // map[nodeId]==task of all tasks in the tree
  this.run_map  = {};  // map[taskId]==nodeId of all running tasks
  this.dlg_map  = {};  // map[taskId]==dialog of open job dialogs

  this.stopTaskLoop();

  this.checkLoop = false;  // true if job check loop is running

  (function(tree){
    serverRequest ( fe_reqtype.getProjectData,0,page_title,function(data){

      if ('message' in data)
        MessageDataReadError ( page_title,data['message'] );

      tree.projectData = jQuery.extend ( true, new ProjectData(),data.meta );
      tree.projectData.desc.dateLastUsed = getDateString();

      if (tree.projectData.tree.length<=0)  {

        tree.addRootNode ( '<b>[' + tree.projectData.desc.name  + ']</b> ' +
                           '<i>'  + tree.projectData.desc.title + '</i>',
                           './images/project_20x20.svg',tree.customIcon() );

      } else  {

        tree.setNodes ( tree.projectData.tree );
        var t_map = {};
        for (var i=0;i<data.tasks_add.length;i++)
          t_map[data.tasks_add[i].id] = data.tasks_add[i];
        for (var key in tree.node_map)  {
          var dataId = tree.node_map[key].dataId;  // dataId of tree node's data
//          if (dataId!='')  {
          if (dataId in t_map)  {
            var json = JSON.stringify ( t_map[dataId] );
            tree.task_map[key] = getObjectInstance ( json );
            tree.task_map[key].treeItemId = key;
            tree.task_map[key].project    = tree.projectData.desc.name;
            if ((tree.task_map[key].state==job_code.running) ||
                (tree.task_map[key].state==job_code.exiting))  {
              tree.run_map [dataId] = key;
              tree.node_map[key].setCustomIconVisible ( true );
            } else  {
              tree.setNodeName ( key,false );
              tree.node_map[key].setCustomIconVisible ( false );
            }
          }
        }
      }

      tree.createTree ( function(){
        for (var key in tree.task_map)  {
          if (!tree.task_map[key].job_dialog_data.viewed)
            tree.setStyle ( tree.node_map[key],__notViewedStyle,0 );
        }
        onLoaded_func();
      },onRightClick_func,onDblClick_func,onSelect_func );

    },function(){
      tree.startTaskLoop();
    },'persist');

  }(this));

}


JobTree.prototype.makeNodeId = function ( task_id )  {
  return '[' + padDigits(task_id,4) + ']';
}


JobTree.prototype.makeNodeName = function ( task )  {

  var node_name = this.makeNodeId(task.id) + ' ';

  if (task.uname.length>0)
        node_name += task.uname;
  else  node_name += task.name;

  switch (task.state)  {

    case job_code.exiting  : node_name += ' <b><i>-- exiting.</i></b>';
                             break;

    case job_code.finished : var S = task.score_string();
                             if (S=='')  S = '-- done.';
                             node_name += ' <b><i>' + S + '</i></b>';
                             break;

    case job_code.failed   : node_name += ' <b><i>-- failed.</i></b>';
                             break;

    case job_code.stopped  : node_name += ' <b><i>-- terminated.</i></b>';
                             break;

    default: ;

  }

  return node_name;

}


JobTree.prototype.setNodeName = function ( nodeId,save_bool )  {
  var newName = this.makeNodeName ( this.task_map[nodeId] );
  if (newName!=this.node_map[nodeId].text)  {
    this.setText ( this.node_map[nodeId],newName );
    this.confirmCustomIconsVisibility();
    if (save_bool)
      this.saveProjectData ( [],[], null );
  }
}


JobTree.prototype.resetNodeName = function ( nodeId )  {
  this.setText ( this.node_map[nodeId],this.makeNodeName(this.task_map[nodeId]) );
  this.confirmCustomIconsVisibility();
}


JobTree.prototype.__checkTaskLoop = function()  {
// checks on running tasks

  (function(tree){

    tree.checkTimeout = window.setTimeout ( function(){

      var request_data = {};
      request_data.project = tree.projectData.desc.name;
      request_data.run_map = tree.run_map;

      serverRequest ( fe_reqtype.checkJobs,request_data,'Check jobs state',
        function(data){

          var completedJobs   = data;
          var wasCompletedJob = false;
          for (var key in completedJobs)  {

            var json   = JSON.stringify ( completedJobs[key] );
            var task   = getObjectInstance ( json );
            var nodeId = null;
            if (task.id in tree.run_map)
              nodeId = tree.run_map[task.id];  // task.id == key
            else {
              alert ( 'error [89761] -- inform developer' );
            }

            if (nodeId in tree.task_map)  {
              task.treeItemId       = nodeId;
              tree.task_map[nodeId] = task;
              tree.setNodeName ( nodeId,false );
              tree.setStyle ( tree.node_map[nodeId],__notViewedStyle,0 );
              tree.node_map[nodeId].setCustomIconVisible ( false );
              wasCompletedJob = true;
            }

            if (key in tree.dlg_map)  {
              tree.dlg_map[key].task = task;
              tree.dlg_map[key].setDlgState();
              if (task.state==job_code.failed)
                tree.dlg_map[key].outputPanel.reload();
            }

          }

          tree.run_map = mapMaskOut ( tree.run_map,completedJobs );

          if (wasCompletedJob)  {
            tree.emitSignal ( cofe_signals.treeUpdated,{} );
            tree.saveProjectData ( [],[], null );
          }

      },function(){  // always check on job and resume the task loop as necessary

        if ((Object.keys(tree.run_map).length>0) &&  // there are jobs to check on
            tree.checkTimeout)  // and loop was not terminated
              tree.__checkTaskLoop();     // resume the loop then
        else  tree.checkTimeout = null;   // otherwise, terminate and mark terminated

      },
      function(){}  // depress ajax failure messages in this particular case!
      );

    },__check_job_interval );

  }(this));

}


JobTree.prototype.startTaskLoop = function()  {
// starts timeout loop for checking on running jobs

  if (!this.checkTimeout)  { // otherwise the loop is running already
    if (Object.keys(this.run_map).length>0)  {  // there are jobs to check on
      this.__checkTaskLoop();
    }
  }

}

JobTree.prototype.stopTaskLoop = function()  {
// stops timeout loop for checking on running jobs

  if (this.checkTimeout)  {
    window.clearTimeout ( this.checkTimeout );
    this.checkTimeout = null;  // mark as not running
  }

}


JobTree.prototype.getSelectedTask = function()  {
  if (this.selected_node_id in this.task_map)  {
    return this.task_map[this.selected_node_id];
  } else  {
    return null;
  }
}


JobTree.prototype.saveProjectData = function ( tasks_add,tasks_del,
                                               onDone_func )  {
  if (this.projectData)  {
    this.projectData.desc.dateLastUsed = getDateString();
    this.projectData.tree = this.root_nodes;
    var data       = {};
    data.meta      = this.projectData;
    data.tasks_add = tasks_add;  // array
    data.tasks_del = tasks_del;  // array
    serverRequest ( fe_reqtype.saveProjectData,data,'Project',onDone_func,null,
                    'persist' );
  }
}


JobTree.prototype.hasRunningJobs = function ( nodeId )  {

  function hrj ( tree,node_id )  {
    var areRunningJobs = false;
    if (node_id in tree.task_map)  {
      areRunningJobs = (tree.task_map[node_id].state == job_code.running);
      var children = tree.node_map[node_id].children;
      for (var i=0;(i<children.length) && (!areRunningJobs);i++)
        areRunningJobs = hrj ( tree,children[i].id);
    }
    return areRunningJobs;
  }

  return hrj ( this,nodeId );

}


JobTree.prototype.addJob = function ( insert_bool,onAdd_func )  {

//  var sids = this.calcSelectedNodeId();
//  alert ( ' sids='+JSON.stringify(sids) );

  (function(tree){

    var dataBox = tree.harvestTaskData ( true,[] );
    var branch_task_list = tree.getAllAncestors ( tree.getSelectedTask() );
    new TaskListDialog ( dataBox,branch_task_list,function(task){

      if (tree.selected_node_id)  {

        tree.projectData.jobCount++;

        task.project           = tree.projectData.desc.name;
        task.id                = tree.projectData.jobCount;
        task.harvestedTaskIds  = dataBox.harvestedTaskIds;

        var node;
        if (insert_bool)
              node = tree.insertNodeAfterSelected ( tree.makeNodeName ( task ),
                                           task.icon_small(),tree.customIcon() );
        else  node = tree.addNodeToSelected ( tree.makeNodeName ( task ),
                                           task.icon_small(),tree.customIcon() );

        tree.task_map[node.id] = task;
        task.treeItemId        = node.id;
        node.dataId            = task.id;

        // make harvest data links
        for (var i=0;i<task.harvestedTaskIds.length;i++)  {
          var taski = tree.getTask ( task.harvestedTaskIds[i] );
          if (taski)
            taski.addHarvestLink ( task.id )
        }

        if (onAdd_func)
          onAdd_func();

        tree.saveProjectData ( [task],[], null );
        tree.openJob         ( dataBox         );

      } else
        alert ( ' no selection in the tree! ' );

    });

  }(this));

}


JobTree.prototype.moveJobUp = function()  {
  if (this.selected_node_id)  {
    this.moveSelectedNodeUp();
    this.saveProjectData ( [],[], null );
  } else
    alert ( ' no selection in the tree! ' );
}


JobTree.prototype.deleteJob = function ( onDelete_func ) {

  if (this.selected_node_id)  {

//    this.forceSingleSelection();

    (function(tree){

      // calculate lead nodes of branches to delete
      var delNodeId = tree.calcSelectedNodeId();
      if (delNodeId.length<=0)
        delNodeId.push ( tree.getSelectedNodeId() );

      // add all harvested links
      for (var i=0;i<delNodeId.length;i++)  {
        var task = tree.task_map[delNodeId[i]];
        if (task)
          for (var j=0;j<task.harvestLinks.length;j++)  {
            var nodeId = tree.getTaskNodeId ( task.harvestLinks[j] );
            if (nodeId && (delNodeId.indexOf(nodeId)<0))
              delNodeId.push ( nodeId );
          }
      }

      // sort node ids in descending order in order to avoid clashes in case
      // of nodes selected in same branch
      delNodeId.sort ( function(a,b){return b-a;} );

      // indicate deleted jobs in the tree and idebtify running jobs
      var isRunning = false;
      var nDel      = 0;
      for (var i=0;i<delNodeId.length;i++)  {
        tree.setStyle ( tree.node_map[delNodeId[i]],
                        'color:#FF0000;text-decoration:line-through;',1 );
        if (tree.hasRunningJobs(delNodeId[i]))
          isRunning = true;
        nDel += 1 + tree.node_map[delNodeId[i]].children.length;
      }

      var message;
      if (nDel==1)  {
        var jobId = '';
        if (tree.selected_node_id in tree.task_map)
          jobId = tree.makeNodeId ( tree.task_map[tree.selected_node_id].id );
        if (isRunning)
          message = 'Selected job ' + jobId +
                    ' is running and should not be removed from<br>' +
                    'the project before stopping. Deleting running jobs may<br>' +
                    'corrupt your project, and should be exercised only<br>' +
                    'when absolutely necessary.<p>' +
                    'Are you certain to proceed? Alternatively, try to stop<br>' +
                    'the job first and delete it after it is reported as<br>' +
                    'terminated.';
        else
          message = 'Selected job ' + jobId + ' will be deleted.<br>' +
                    'Are you sure?';
      } else if (isRunning)
        message = 'Deleting the selected job(s) will also delete all jobs<br>' +
                  'associated with them and/or found in descending branches of<br>' +
                  'the project (shown in the tree). Some of these jobs are still<br>' +
                  'running. Deleting running jobs may corrupt your project and<br>' +
                  'should be exercised only when absolutely necessary.<p>' +
                  'Please press "No" and try to stop all running jobs, scheduled<br>' +
                  'for deletion. If this does not work, proceed with deleting them<br>' +
                  'in running state at risk of possible project corruption.';
      else
        message = 'Selected job(s), indicated in the job tree, will be deleted.<br>' +
                  'Are you sure?';

      new QuestionBox ( 'Delete Job',message, 'Yes',function(){

        for (var i=0;i<delNodeId.length;i++)
          tree.deleteNode ( tree.node_map[delNodeId[i]] );

        // find deleted tasks and trim the task map
        var tasks_del = [];
        var task_map  = {};  // new task map
        var run_map   = {};

        for (var key in tree.task_map)  {  // key === nodeId
          if (key in tree.node_map)  {
            // node for the task was not deleted
            task_map[key] = tree.task_map[key];
          } else  {
            // node for the task was deleted, delete the task now
            var delId = tree.task_map[key].id;
            tasks_del.push ( delId ); // store only ids here! -- for server request
            if (delId in tree.dlg_map)  {
              tree.dlg_map[delId].close();
              tree.dlg_map = mapExcludeKey ( tree.dlg_map,delId );
            }
          }
        }
        tree.task_map = task_map;

        for (var key in tree.run_map)
          if (tree.run_map[key] in tree.node_map)  // running task was deleted
            run_map[key] = tree.run_map[key];
        tree.run_map = run_map;

        if (onDelete_func)
          onDelete_func();

        tree.saveProjectData ( [],tasks_del,null );

      },'No',function(){

        for (var i=0;i<delNodeId.length;i++)
          tree.setStyle ( tree.node_map[delNodeId[i]],'',1 );

      });

    }(this));

  } else {
    alert ( ' no selection in the tree! ' );
  }

}


JobTree.prototype.closeAllJobDialogs = function()  {
  for (var delId in this.dlg_map)
    this.dlg_map[delId].close();
  this.dlg_map = {};
}


JobTree.prototype.stopJob = function ( nodeId )  {

  this.forceSingleSelection();

  var jobId = this.makeNodeId ( this.task_map[this.selected_node_id].id );

  var data = {};
  var word = '';
  if (nodeId)  {
    data.meta = this.task_map[nodeId];
    word = 'this';
  } else  {
    data.meta = this.task_map[this.selected_node_id];
    word = 'selected';
  }
  data.job_token = data.meta.job_dialog_data.job_token;

  if (data.meta.state==job_code.running)  {

    new QuestionBox ( 'Stop Job','Stop ' + word +
                      ' job ' + jobId + '? Once a job is stopped, it ' +
                      'cannot be resumed,<br>and no output data (even ' +
                      'partially produced) can be<br>passed on ' +
                      'subsequent jobs.','Stop',function(){

      // Raise the exiting state here, which will prevent requesting FE with
      // task update if the job dialog is currently opened and gets closed
      // before job actually terminates (see the close_btn listener in JobDialog).
      // This is necessary to enoforce, or this request may overwrite data
      // FE receives back from NC upon job termination.
      data.meta.state = job_code.exiting;

      if (data.meta.nc_type=='client')
           localCommand  ( nc_command.stopJob,data,data.meta.title,null );
      else serverRequest ( fe_reqtype.stopJob,data,data.meta.title,null,null,null );

      setTimeout ( function(){
        new MessageBox ( 'Job ' + jobId + ' is being stopped',
                         'Job ' + jobId + ' is being stopped, ' +
                         'please wait a while.' );
      },100 );

    },'Cancel',null );

  } else  {

    new MessageBox ( 'Stop Job','The job ' + jobId +
                     ' is not running -- nothing to do.' );

  }

}


JobTree.prototype.openJob = function ( dataBox )  {

  if (this.selected_node_id)  {

    this.forceSingleSelection();

    if (this.selected_node_id in this.task_map)  {
      (function(tree){

        var nodeId = tree.selected_node_id;
        var taskId = tree.task_map[nodeId].id;

        if (taskId in tree.dlg_map)  {

          $(tree.dlg_map[taskId].element).dialog('open');

        } else  {

          var dBox = dataBox;

          if (!dBox)
            dBox = tree.harvestTaskData ( false,
                                          tree.task_map[nodeId].harvestedTaskIds );

          var params       = {};
          params.dataBox   = dBox;
          params.ancestors = tree.getAllAncestors ( tree.task_map[nodeId] );
          var dlg = new JobDialog ( params,

            function(task_id){
              // trigerred when job is launched

              tree.run_map [task_id] = nodeId;
              tree.node_map[nodeId ].setCustomIconVisible ( true );
              tree.setNodeName ( nodeId,true );
              tree.emitSignal ( cofe_signals.jobStarted,{
                'nodeId' : nodeId,
                'taskId' : task_id
              });
              tree.startTaskLoop();

            },function(task_id){
              // trigerred when job dialog is closed

              tree.dlg_map = mapExcludeKey ( tree.dlg_map,task_id );

            },function(task_id,reason){
              // trigerred on custom events

              switch (reason)  {
                case job_dialog_reason.rename_node :
                          tree.setNodeName   ( nodeId,true );           break;
                case job_dialog_reason.reset_node  :
                          tree.node_map[nodeId].setCustomIconVisible ( false );
                          tree.resetNodeName ( nodeId );                break;
                case job_dialog_reason.select_node :
                          tree.selectSingle  ( tree.node_map[nodeId] ); break;
                case job_dialog_reason.stop_job    :
                          tree.stopJob       ( nodeId );                break;
                default : ;
              }

            });

          tree.dlg_map[dlg.task.id] = dlg;

        }

      }(this));

    }

  } else {
    alert ( ' no selection in the tree! ' );
  }

}


JobTree.prototype.cloneJob = function ( onAdd_func )  {

  if (this.selected_node_id)  {

    this.forceSingleSelection();

    (function(tree){
      var nodeId = tree.selected_node_id;
      var task0  = tree.task_map[nodeId];
      var task   = eval ( 'new ' + task0._type + '()' );
      if (task0.version<task.currentVersion())  {
        new MessageBox ( 'Cannot clone',
          '<b>This job cannot be cloned.</b><p>' +
          'The job was created with a lower version of jsCoFE and cannot ' +
          'be cloned.<br>Please create the job as a new one, using ' +
          '"<i>Add Job</i>" button from the<br>control bar.' );
      } else  {
        if ((task._type!='TaskImport') && (task._type!='TaskFacilityImport'))  {
          task.uname      = task0.uname;
          task.uoname     = task0.uoname;
          task.input_data = $.extend ( true,{},task0.input_data );
          task.parameters = $.extend ( true,{},task0.parameters );
          for (var i=0;i<task0.harvestedTaskIds.length;i++)
            task.harvestedTaskIds.push ( task0.harvestedTaskIds[i] );
        }
        task.customDataClone ( task0 );
        tree.projectData.jobCount++;
        task.project = tree.projectData.desc.name;
        task.id      = tree.projectData.jobCount;
        var node = tree.addSiblingToSelected ( tree.makeNodeName ( task ),
                                               task.icon_small(),tree.customIcon() );
        tree.task_map[node.id] = task;
        task.treeItemId        = node.id;
        node.dataId            = task.id;
        if (onAdd_func)
          onAdd_func();
        tree.saveProjectData ( [task],[],null );
        tree.openJob ( null );
      }

    }(this));

  } else {
    alert ( ' no selection in the tree! ' );
  }

}


JobTree.prototype.harvestTaskData = function ( includeSelected_bool,
                                               harvestedTaskIds )  {
// Searches (actual) output data records of all tasks up the job tree brunch
// starting with (and including) current node, and returns them as the DataBox
// object. Within the Box, data objects are sorted reversely on jobIds, so
// that the latest data appear in leading positions.

  var dataBox = new DataBox();

  dataBox.inp_assoc = {};  // created for future use in
                           //         TaskTemplate.setInputDataFields()

  dataBox.harvestedTaskIds = [];  // will keep ids of multiply selected tasks,
                           // which are used when Job Dialog is repeatedly created

  if (harvestedTaskIds.length>0)  {
    // harvest data from specified tasks (typically for a repeat action)

    for (var i=0;i<harvestedTaskIds.length;i++)
      for (var nodeId in this.task_map)  {
        var task = this.task_map[nodeId];
        if (task.id==harvestedTaskIds[i])  {
          dataBox.addTaskData ( task,false );
          dataBox.harvestedTaskIds.push ( task.id );
          break;
        }
      }

    dataBox.data_n0 = {};
    for (var dt in dataBox.data)
      dataBox.data_n0[dt] = dataBox.data[dt].length;

  } else  {
    // harvest data from task(s) currently selected in the tree

    var selId = this.calcSelectedNodeId();

    if (selId.length<=1)  {
      // single node selected -- collect data all up the tree branch

      var nodeId = this.selected_node_id;

      if (!includeSelected_bool)  // skip the selected one
        nodeId = this.node_map[nodeId].parentId;

      while (nodeId)  {
        if (nodeId in this.task_map)  {
          dataBox.addTaskData ( this.task_map[nodeId],
                      (nodeId!=this.selected_node_id) || includeSelected_bool );
          if (!('data_n0' in dataBox))  {
            dataBox.data_n0 = {};
            for (var dt in dataBox.data)
              dataBox.data_n0[dt] = dataBox.data[dt].length;
          }
        }
        nodeId = this.node_map[nodeId].parentId;
      }

    } else  {
      // multiply selected nodes -- collect data only from them

      // reshuffle such that data from chosen parent goes first -- this is
      // useful if a revision (no backtrace) is involved
      for (var i=1;i<selId.length;i++)
        if (selId[i]==this.selected_node_id)  {
          selId[i] = selId[0];
          selId[0] = this.selected_node_id;
        }

      for (var i=0;i<selId.length;i++)
        if (selId[i] in this.task_map)  {
          dataBox.addTaskData ( this.task_map[selId[i]],false );
          dataBox.harvestedTaskIds.push ( this.task_map[selId[i]].id );
        }

      dataBox.data_n0 = {};
      for (var dt in dataBox.data)
        dataBox.data_n0[dt] = dataBox.data[dt].length;

    }

  }

  return dataBox;

}


JobTree.prototype.inspectData = function ( jobId,dataType,dataId )  {
var task = this.getTask ( jobId );

  if (!task)  {
    new MessageBox ( 'Job ' + jobId + ' not found',
              'Job ' + jobId + ' not found. This may be a bug, please ' +
              'contact jsCoFE developer.' );
  } else  {

    var td  = task.output_data.data;
    var td0 = null;
    for (var dtype in td)
      if (dtype==dataType)  {
        tdr = td[dtype];
        for (var i=0;(i<tdr.length) && (!td0);i++)
          if (tdr[i].dataId==dataId)
            td0 = tdr[i];
        if (td0)
          break;
      }

    if (!td0)  {

      new MessageBox ( 'Data ' + dataType.substr(4) + ' [' + dataId + '] not found',
                '<h3><i>Data ' + dataType.substr(4) + ' [' + dataId +
                                                 '] not found in job ' + jobId +
                '</i></h3><p>If job is still running, wait until it finishes ' +
                'and try again.'  );

    } else  {

      td0 = $.extend ( true,eval('new ' + dataType + '()'),td0 );
      td0.inspectData ( task );

    }

  }

}


JobTree.prototype.getAllAncestors = function ( task )  {

  if (!task)
    return [];

  var tasks  = [task];
  var nodeId = this.getTaskNodeId ( task.id );

  nodeId = this.node_map[nodeId].parentId;
  while (nodeId)  {
    if (nodeId in this.task_map)
      tasks.push ( this.task_map[nodeId] );
    nodeId = this.node_map[nodeId].parentId;
  }

  return tasks;

}
