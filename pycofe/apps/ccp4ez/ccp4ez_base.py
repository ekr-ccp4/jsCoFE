##!/usr/bin/python

#
# ============================================================================
#
#    31.01.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  CCP4EZ Combined Auto-Solver Base class
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017-2018
#
# ============================================================================
#
#
#  Invocation:
#     ccp4-python ccp4ez.py
#                 [--wkdir          workdir]             \
#                 [--rdir           reportdir]           \
#                 [--outdir         outputdir]           \
#                 [--rvapi-prefix   jsrview]             \
#                 [--rvapi-document rvapi_document]      \
#                 [--jobid          id]                  \
#                 [--sge]                                \
#                 [--qname          name]                \
#                 [--njobs          N]
#
#  Input file:
#
#  HKLIN  mtzpath
#  SEQIN  seqpath
#  XYZIN  xyzpath
#  HATOMS type [number]
#
#  Metadata in rvapi document (will be overwritten by equivalent command-line
#  parameters if they are given):
#
#  { "jobId"         : jobId,         // used for naming output files
#    "stageNo"       : stageNo,       // starting stage number for report sections
#    "sge_q"         : queueName,     // used in MoRDa
#    "sge_tc"        : nSubJobs,      // used in MoRDa
#    "summaryTabId"  : summaryTabId,  // if tab created by calling process
#    "summaryTabRow" : summaryTabRow, // if tab created by calling process
#    "navTreeId"     : navTreeId,     // navigation tree id
#    "outputDir"     : outputdir,     // path for placing final output files
#    "outputName"    : outputName     // name template (no extension) for final
#                                     // output files
#  }
#

import os
import sys
import json
import shutil

#  ccp4-python imports
import pyrvapi
import pyrvapi_ext.parsers

import command


# ============================================================================

class Base(object):

    workdir        = None       # work directory (current directory at start)
    reportdir      = "report"   # report directory within work directory
    outputdir      = "output"   # directpry for output files (fixed name)
    outputname     = "ccp4ez"   # template for output file names
    scriptsdir     = "scripts"  # directory to keep all scripts

    rvapi_prefix   = None       # uri to jstview JS support
    rvapi_doc_path = None       # path to rvapi document

    jobId          = ""         # jobId (comind from jsCoFE)
    exeType        = "--mp"     # or "--sge" if the pipeline runs on SGE cluster
    queueName      = ""         # SGE queue
    nSubJobs       = 1          # permissible number of sub-jobs to launch
    stage_no       = 0          # stage number for headers
    summaryTabId   = "ccp4ez_summary_page"     # summary tab Id
    strow          = 0          # summary tab output row number
    navTreeId      = "ccp4ez_navigation_tree"  # navigation tree Id

    hklpath        = None       # path to input reflection file, merged or unmerged
    seqpath        = None       # path to file with all sequences expected
    xyzpath        = None       # path to file with structure model
    ha_type        = "Se"       # heavy atom type

    input_hkl      = None       # input dataset, merged or unmerged
    hkl            = None       # merged reflections dataset
    mtzpath        = None       # path to merged mtz file

    output_meta    = {}  # output meta json file written in current directory on
                          # termination
    #
    #  output_meta = {
    #    "retcode"    : "",
    #    "report_row" : 0,
    #    "results"    : {}
    #  }
    #

    file_stdout     = sys.stdout
    file_stderr     = sys.stderr

    script_path     = ""
    script_file     = None

    page_cursor     = ["",0]

    log_parser      = None
    log_parser_cnt  = 0  # for generating parser's panel ids

    rvapi_version   = [1,0,15]   # for tree layout, put [1,0,15]
    layout          = 4          # tabbed layout (for debugging)

    def tree_id         (self): return "workflow_tree_id"
    def file_stdout_path(self): return "_stdout.log" # reserved name
    def file_stderr_path(self): return "_stderr.log"

    # ----------------------------------------------------------------------

    def mk_std_streams ( self,subdir_name ):

        if not self.file_stdout is sys.stdout:
            self.file_stdout.close()
        if not self.file_stderr is sys.stderr:
            self.file_stderr.close()

        if subdir_name:
            self.file_stdout = open ( os.path.join(subdir_name,self.file_stdout_path()),'w' )
            self.file_stderr = open ( os.path.join(subdir_name,self.file_stderr_path()),'w' )
        else:
            self.file_stdout = sys.stdout
            self.file_stderr = sys.stderr
        return


    def stdout ( self,message ):
        self.file_stdout.write ( message )
        return

    def stderr ( self,message ):
        self.file_stderr.write ( message )
        return

    # ----------------------------------------------------------------------

    def compare_rvapi_version ( self,v ):
        if   v[0]<self.rvapi_version[0]:  return -1
        elif v[0]>self.rvapi_version[0]:  return  1
        elif v[1]<self.rvapi_version[1]:  return -1
        elif v[1]>self.rvapi_version[1]:  return  1
        elif v[2]<self.rvapi_version[2]:  return -1
        elif v[2]>self.rvapi_version[2]:  return  1
        else:
            return 0

    # ----------------------------------------------------------------------

    def __init__ ( self,args=None ):
        #   args = optional replacement for sys.argv to allow this class to be
        #     called from within other Python programs (such as tests)

        rvapi_v = "...................."
        pyrvapi.rvapi_version  ( rvapi_v )
        rvapi_v = rvapi_v.split(".")
        self.rvapi_version[0] = int(rvapi_v[0])
        self.rvapi_version[1] = int(rvapi_v[1])
        self.rvapi_version[2] = int(rvapi_v[2].replace("\x00",""))

        self.workdir = os.getcwd()
        self.output_meta["retcode"]    = ""
        self.output_meta["report_row"] = 0
        self.output_meta["results"]    = {}

        self.file_stdout = sys.stdout
        self.file_stderr = sys.stderr

        # first parse command-line parameters

        if args is None:
            args = sys.argv[1:]

        narg = 0
        while narg<len(args):
            key   = args[narg]
            narg += 1
            if key=="--sge" or key=="--mp":
                self.exeType = key
            elif narg<len(args):
                value = args[narg]
                if   key == "--wkdir"          : self.workdir        = value
                elif key == "--rdir"           : self.reportdir      = value
                elif key == "--outdir"         : self.outputdir      = value
                elif key == "--rvapi-prefix"   : self.rvapi_prefix   = value
                elif key == "--rvapi-document" : self.rvapi_doc_path = value
                elif key == "--jobid"          : self.jobId          = value
                elif key == "--qname"          : self.queueName      = value
                elif key == "--njobs"          : self.nSubJobs       = int(value)
                else:
                    self.output_meta["retcode"] = "[01-001] unknown command line parameter"
                    self.stderr ( " *** unrecognised command line parameter " + key )
                narg += 1

        # read data from standard input

        self.stdout ( "\n INPUT DATA:" +
                      "\n -----------------------------------------------" )
        ilist = sys.stdin.read().splitlines()
        for i in range(len(ilist)):
            s = ilist[i].strip()
            if s.startswith("HKLIN"):
                self.hklpath = s.replace("HKLIN","",1).strip()
                self.stdout ( "\n HKLIN " + self.hklpath )
            elif s.startswith("SEQIN"):
                self.seqpath = s.replace("SEQIN","",1).strip()
                self.stdout ( "\n SEQIN " + self.seqpath )
            elif s.startswith("XYZIN"):
                self.xyzpath = s.replace("XYZIN","",1).strip()
                self.stdout ( "\n XYZIN " + self.xyzpath )
            elif s.startswith("HATOMS"):
                self.ha_type = s.replace("HATOMS","",1).strip()
                self.stdout ( "\n HATOMS " + self.ha_type )
            elif s:
                self.output_meta["retcode"] = "[01-002] unrecognised input line"
                self.stderr ( " *** unrecognised input line " + s + "\n" )
        self.stdout ( "\n -----------------------------------------------\n" )


        # initialise work directory structure

        self.scriptsdir = os.path.join ( self.workdir,"scripts" )
        if not os.path.isdir(self.scriptsdir):
            os.mkdir ( self.scriptsdir )

        outdir = os.path.join ( self.workdir,self.outputdir )
        if not os.path.isdir(outdir):
            os.mkdir ( outdir )

        # initialise RVAPI report

        self.layout = 4
        if self.compare_rvapi_version([1,0,15]) <= 0:
            self.layout = 0

        self.page_cursor = [self.summaryTabId,0]
        if not self.rvapi_doc_path:  # initialise rvapi report document

            report_type = 1    # report with tabs
            if not self.rvapi_prefix or not self.reportdir:
                report_type = 0x00100000   # report will not be created

            rdir = self.reportdir
            if not rdir:
                rdir = "report"
            rdir = os.path.join ( self.workdir,rdir ) # has to be full path because of Crank-2

            if not os.path.isdir(rdir):
                os.mkdir ( rdir )

            # initialise HTML report document; note that we use absolute path for
            # the report directory, which is necessary for passing RVAPI document
            # to applications via creation of the rvapi_document file with
            # pyrvapi.rvapi_store_document2(..)

            pyrvapi.rvapi_init_document (
                        "jscofe_report",   # document Id
                        rdir,              # report directory
                        "Title",           # title (immaterial)
                        report_type,       # HTML report to be produced
                        self.layout,       # Report will start with plain page
                        self.rvapi_prefix, # where to look for js support
                        None,None,
                        "task.tsk",
                        "i2.xml" )

            if self.layout == 0:
                # Add tree widget
                pyrvapi.rvapi_add_tree_widget (
                        self.navTreeId, # tree widget reference (Id)
                        "Workflow",     # tree widget title
                        "body",         # reference to widget holder (grid)
                        0,              # holder row
                        0,              # holder column
                        1,              # row span
                        1               # column span
                    )
                pyrvapi.rvapi_set_tab_proxy ( self.navTreeId,"" )

            self.page_cursor = self.addTab ( self.summaryTabId,"Summary",True )
            self.putMessage ( "<h2>CCP4 Easy (Combined Automated Structure Solution)</h2>" )

        else:  # continue rvapi document given
            pyrvapi.rvapi_restore_document2 ( self.rvapi_doc_path )
            meta = pyrvapi.rvapi_get_meta();
            #self.stdout ( "\n META = " + meta )
            if meta:
                d = json.loads(meta)
                if "jobId"   in d:  self.jobId    = d["jobId"]
                if "stageNo" in d:  self.stage_no = d["stageNo"]
                if "sge_q"   in d:  self.SGE      = True
                if "sge_tc"  in d:  self.nSubJobs = d["sge_tc"]
                if "summaryTabId"  in d:
                        self.summaryTabId   = d["summaryTabId"]
                        self.page_cursor[0] = self.summaryTabId
                if "summaryTabRow" in d:
                        self.summaryTabRow  = d["summaryTabRow"]
                        self.page_cursor[1] = self.summaryTabRow
                if "navTreeId"     in d:
                        self.navTreeId = d["navTreeId"]
                        pyrvapi.rvapi_set_tab_proxy ( self.navTreeId,"" )
                if "outputDir"  in d:  self.outputdir  = d["outputDir"]
                if "outputName" in d:  self.outputname = d["outputName"]
            #self.stdout ( "\n summaryTabId = " + self.summaryTabId )
            #self.stdout ( "\n summaryTabRow = " + str(self.summaryTabRow) )
            #self.stdout ( "\n layout = " + str(self.layout) )
            #self.stdout ( "\n navTreeId = " + self.navTreeId + "\n" )
            #self.putMessage ( "<h2>YYYYYYYYYYYYYYY</h2>" )
            #self.page_cursor = self.addTab ( "new","New",True )
            #self.putMessage ( "<h2>ZZZZZZZZZZZZZZZZ</h2>" )

        return

    # ----------------------------------------------------------------------

    def start_branch ( self,branch_title,page_title,subdir,branch_id,
                            tree_header_id,logtab_id,errtab_id ):

        # make work directory
        sdir = os.path.join ( self.workdir,subdir )
        if not os.path.isdir(sdir):
            os.mkdir ( sdir )
        sodir = os.path.join ( self.workdir,self.outputdir,subdir )
        if not os.path.isdir(sodir):
            os.mkdir ( sodir )

        self.mk_std_streams ( subdir )

        self.stage_no += 1
        if self.layout == 0:
            pyrvapi.rvapi_set_tab_proxy ( self.navTreeId,branch_id )

        # cursor0 remembers point og output in parent page
        cursor0 = self.addTab ( tree_header_id,
                                str(self.stage_no) + ". " + branch_title,True )
        if page_title:
            if self.jobId:
                title = "["+self.jobId.zfill(4)+"] " + page_title
            else:
                title = str(self.stage_no) + ". " + page_title
            self.putMessage ( "<h2>" + title + "</h2>" )
            #self.putMessage ( "<h3>" + title + ": <i>in progress</i></h3>" )

        if self.layout == 0:
            pyrvapi.rvapi_set_tab_proxy ( self.navTreeId,tree_header_id )

        # cursor1 is set to the begining of new tab page
        cursor1 = self.addTab ( logtab_id,"Log file",True )
        self.addTab ( errtab_id,"Errors",True )
        pyrvapi.rvapi_append_content (
            os.path.join("..",subdir,self.file_stdout_path()+'?capsize'),
            True,logtab_id )
        pyrvapi.rvapi_append_content (
            os.path.join("..",subdir,self.file_stderr_path()),
            True,errtab_id )

        # back to the beginning of head tab
        self.setOutputPage ( cursor1 )

        return {"title":title, "cursor0":cursor0, "cursor1":cursor1}


    def end_pipeline ( self,branch_data,message,detail_message=None ):
        if branch_data:
            self.setOutputPage ( branch_data["cursor1"] )
            self.page_cursor[1] -= 1
            self.putMessage ( "<h2>" + branch_data["title"] + ": <i>" +
                                       message + "</i></h2>" )
            if detail_message:
                self.putMessage ( "<i>" + detail_message + "</>" )
        return

    def quit_branch ( self,branch_data,message=None ):
        if branch_data:
            self.setOutputPage ( branch_data["cursor0"] )
            if message:
                self.putMessageLF ( "<b>" + str(self.stage_no) + ". " +
                                    message + "</b>" )
        self.mk_std_streams ( None )
        if self.layout == 0:
            pyrvapi.rvapi_set_tab_proxy ( self.navTreeId,"" )
        return

    def end_branch ( self,branch_data,message,detail_message=None ):
        if branch_data:
            self.setOutputPage ( branch_data["cursor1"] )
            #self.page_cursor[1] -= 1
            #self.putMessage ( "<h2>" + branch_data["title"] + ": <i>" +
            #                           message + "</i></h2>" )
            self.putMessage ( "<h3>" + message + "<h3>" )
            if detail_message:
                self.putMessage ( "<i>" + detail_message + "</>" )
            self.setOutputPage ( branch_data["cursor0"] )
            self.putMessageLF ( "<i>" + message + "</>" )
            if detail_message:
                self.putMessage ( "<i>" + detail_message + "</>" )
        self.mk_std_streams ( None )
        if self.layout == 0:
            pyrvapi.rvapi_set_tab_proxy ( self.navTreeId,"" )
        return


    # ----------------------------------------------------------------------

    def write_meta ( self ):
        self.output_meta["report_row"] = self.page_cursor[1]
        meta = json.dumps ( self.output_meta )
        with open(os.path.join(self.workdir,"ccp4ez.meta.json"),"w") as f:
            f.write ( meta )
        if self.rvapi_doc_path:
            pyrvapi.rvapi_put_meta ( meta )
            pyrvapi.rvapi_store_document2 ( self.rvapi_doc_path )
        return


    # ----------------------------------------------------------------------

    def setOutputPage ( self,cursor ):
        cursor1 = [self.page_cursor[0],self.page_cursor[1]]
        if cursor:
            self.page_cursor[0] = cursor[0]
            self.page_cursor[1] = cursor[1]
        return cursor1

    def addTab ( self,tabId,tabName,opened ):
        pyrvapi.rvapi_add_tab  ( tabId,tabName,opened )
        return self.setOutputPage ( [tabId,0] )

    def insertTab ( self,tabId,tabName,beforeTabId,opened ):
        pyrvapi.rvapi_insert_tab ( tabId,tabName,beforeTabId,opened )
        return self.setOutputPage ( [tabId,0] )

    def putMessage ( self,message_str ):
        pyrvapi.rvapi_set_text ( message_str,self.page_cursor[0],
                                 self.page_cursor[1],0,1,1 )
        self.page_cursor[1] += 1
        return

    def putMessageLF ( self,message_str ):
        pyrvapi.rvapi_set_text ( "<font style='font-size:120%;'>" + message_str +
                        "</font>",self.page_cursor[0],self.page_cursor[1],0,1,1 )
        self.page_cursor[1] += 1
        return

    def putPanel ( self,panel_id ):
        pyrvapi.rvapi_add_panel ( panel_id,self.page_cursor[0],
                                  self.page_cursor[1],0,1,1 )
        self.page_cursor[1] += 1
        return

    def putSection ( self,sec_id,sectionName,openState_bool=False ):
        pyrvapi.rvapi_add_section ( sec_id,sectionName,self.page_cursor[0],
                                    self.page_cursor[1],0,1,1,openState_bool )
        self.page_cursor[1] += 1
        return

    def putWaitMessageLF ( self,message_str ):
        gridId = self.page_cursor[0] + str(self.page_cursor[1])
        pyrvapi.rvapi_add_grid ( gridId,False,self.page_cursor[0],
                                              self.page_cursor[1],0,1,1 )
        pyrvapi.rvapi_set_text ( "<font style='font-size:120%;'>" + message_str +
                                 "</font>",gridId,0,0,1,1 )
        pyrvapi.rvapi_set_text ( "<div class='activity_bar'/>",gridId,0,1,1,1 )
        self.page_cursor[1] += 1
        return

    def flush(self):
        pyrvapi.rvapi_flush()
        return

    # ----------------------------------------------------------------------

    def putStructureWidget ( self,title_str,fpath_list,openState ):

        wId = self.page_cursor[0] + "_" + "structure" + str(self.page_cursor[1])
        pyrvapi.rvapi_add_data ( wId,title_str,fpath_list[0],
                "xyz",self.page_cursor[0],self.page_cursor[1],0,1,1,openState )
        pyrvapi.rvapi_append_to_data ( wId,fpath_list[1],"hkl:map" )
        pyrvapi.rvapi_append_to_data ( wId,fpath_list[2],"hkl:ccp4_map" )
        pyrvapi.rvapi_append_to_data ( wId,fpath_list[3],"hkl:ccp4_dmap" )

        self.page_cursor[1] +=1
        return


    # ----------------------------------------------------------------------

    def open_script ( self,scriptname ):
        self.script_path = os.path.join ( self.scriptsdir,scriptname+".script" )
        self.script_file = open ( self.script_path,"w" )
        return

    def write_script ( self,line ):
        self.script_file.write ( line )
        return

    def close_script ( self ):
        self.script_file.close()
        return


    # ----------------------------------------------------------------------

    def unsetLogParser ( self ):
        self.file_stdout.flush()
        self.log_parser = None
        pyrvapi.rvapi_flush()
        return

    def setGenericLogParser ( self,split_sections_bool ):
        self.log_parser_cnt += 1
        panel_id = "genlogparser_" + str(self.log_parser_cnt)
        self.putPanel ( panel_id )
        self.log_parser = pyrvapi_ext.parsers.generic_parser (
                                                 panel_id,split_sections_bool )
        pyrvapi.rvapi_flush()
        return panel_id


    # ----------------------------------------------------------------------

    def storeReportDocument(self,meta_str):
        if not self.rvapi_doc_path:
            self.rvapi_doc_path = "rvapi_document"
        if meta_str:
            pyrvapi.rvapi_put_meta ( meta_str )
        pyrvapi.rvapi_store_document2 ( self.rvapi_doc_path )
        return

    def restoreReportDocument(self):
        #if not os.path.isfile(self.rvapi_doc_path):
        #    print " *** NO PATH TO RVAPI DOCUMENT"
        pyrvapi.rvapi_restore_document2 ( self.rvapi_doc_path )
        return pyrvapi.rvapi_get_meta()


    # ----------------------------------------------------------------------

    def runApp ( self,appName,cmd ):

        input_script = None
        if self.script_file:
            input_script = self.script_path

        rc = command.call ( appName,cmd,self.workdir,input_script,
                            self.file_stdout,self.file_stderr,self.log_parser )
        os.chdir ( self.workdir )
        self.script_file = None

        return rc

    # ----------------------------------------------------------------------

    def saveResults ( self, name,dirname,nResults,rfree,resfname,
                            fpath_xyz,fpath_mtz,fpath_map,fpath_dmap,
                            columns ):

        meta = {}
        meta["name"]     = name
        meta["rfree"]    = rfree
        meta["nResults"] = nResults
        quit_message     = ""

        if nResults>0:

            # store results in dedicated subdirectory of "output" directory
            resdir = os.path.join ( self.outputdir,dirname )
            if not os.path.isdir(resdir):
                os.mkdir ( resdir )

            # make new file names in dedicated result directory
            f_xyz  = os.path.join ( resdir, resfname + ".pdb" )
            f_mtz  = os.path.join ( resdir, resfname + ".mtz" )
            f_map  = os.path.join ( resdir, resfname + ".map" )
            f_dmap = os.path.join ( resdir, resfname + "_dmap.map" )

            # copy result files with new names
            if fpath_xyz!=f_xyz:
                shutil.copy2 ( fpath_xyz ,f_xyz  )
                shutil.copy2 ( fpath_mtz ,f_mtz  )
                shutil.copy2 ( fpath_map ,f_map  )
                shutil.copy2 ( fpath_dmap,f_dmap )

            # store new file names in meta structure
            meta["pdb"]  = f_xyz
            meta["mtz"]  = f_mtz
            meta["map"]  = f_map
            meta["dmap"] = f_dmap

            # calculate return code and quit message
            metrics = " (<i>R<sub>free</sub>=" + str(rfree) + "</i>)"
            if rfree < 0.4:
                self.output_meta["retcode"] = "solved"     # solution
                quit_message = "solution found" + metrics
            elif rfree < 0.45:
                self.output_meta["retcode"] = "candidate"  # possible solution
                quit_message = "possible solution found" + metrics
            else:
                self.output_meta["retcode"] = "not solved" # no solution
                quit_message = "no solution found" + metrics

        elif nResults==0:
            self.output_meta["retcode"] = "not solved" # no solution
            quit_message = "no solution found"

        else:
            self.output_meta["retcode"] = "errors"
            quit_message = "errors encountered"


        # put meta structure in output meta data
        meta["columns"] = columns
        self.output_meta["results"][dirname] = meta

        return quit_message
