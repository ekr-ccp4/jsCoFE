##!/usr/bin/python

#
# ============================================================================
#
#    18.01.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  CCP4ez EXECUTABLE MODULE
#
#  Command-line:
#     ccp4-python -m pycofe.tasks.ccp4ez exeType jobDir jobId
#
#  where:
#    exeType  is either SHELL or SGE
#    jobDir   is path to job directory, having:
#      jobDir/output  : directory receiving output files with metadata of
#                       all successful imports
#      jobDir/report  : directory receiving HTML report
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017-2018
#
# ============================================================================
#

#  python native imports
import os
import sys
import json

#  ccp4-python imports
import pyrvapi
import pyrvapi_ext.parsers

#  application imports
import import_task


# ============================================================================
# Make CCP4ez driver

class CCP4ez(import_task.Import):

    def import_page_id    (self):  return "ccp4ez_import_page_id"
    def import_log_page_id(self):  return "ccp4ez_import_log_page_id"
    def import_err_page_id(self):  return "ccp4ez_import_err_page_id"
    def import_stdout_path(self):  return "_import_stdout.log"
    def import_stderr_path(self):  return "_import_stderr.log"

    # redefine name of input script file
    def file_stdin_path(self):  return "ccp4ez.script"

    # ------------------------------------------------------------------------

    def importData(self):

        self.putWaitMessageLF ( "<b>1. Data Import</b>" )
        self.rvrow -= 1

        # -------------------------------------------------------------------
        # import uploaded data
        # make import tab and redirect output to it
        pyrvapi.rvapi_add_tab ( self.import_page_id(),"1. Data Import",False )
        self.setReportWidget  ( self.import_page_id() )

        fstdout = self.file_stdout
        fstderr = self.file_stderr
        self.file_stdout = open ( self.import_stdout_path(),'w' )
        self.file_stderr = open ( self.import_stderr_path(),'w' )

        # create tabs for import standard outputs

        if self.navTreeId:
            pyrvapi.rvapi_set_tab_proxy ( self.navTreeId,self.import_page_id() )
        pyrvapi.rvapi_add_tab ( self.import_log_page_id(),"Log file",False )
        pyrvapi.rvapi_append_content (
                    os.path.join("..",self.import_stdout_path()+'?capsize'),
                                                True,self.import_log_page_id() )
        pyrvapi.rvapi_add_tab ( self.import_err_page_id(),"Errors",False )
        pyrvapi.rvapi_append_content (
                    os.path.join("..",self.import_stderr_path()+'?capsize'),
                                                True,self.import_err_page_id() )

        self.putTitle ( "CCP4ez Automated Structure Solver: Data Import" )
        super ( CCP4ez,self ).import_all()

        # redirect everything back to report page and original standard streams
        self.file_stdout.close()
        self.file_stderr.close()
        self.file_stdout = fstdout
        self.file_stderr = fstderr
        self.resetReportPage()
        if self.navTreeId:
            pyrvapi.rvapi_set_tab_proxy ( self.navTreeId,"" )

        # -------------------------------------------------------------------
        # fetch data for CCP4ez pipeline

        self.unm = None   # unmerged dataset
        self.hkl = None   # selected merged dataset
        self.seq = None   # list of sequence objects
        self.xyz = None   # coordinates (model/apo)

        if 'DataUnmerged' in self.outputDataBox.data:
            self.unm = self.outputDataBox.data['DataUnmerged'][0]

        if 'DataHKL' in self.outputDataBox.data:
            maxres = 10000.0
            for i in range(len(self.outputDataBox.data['DataHKL'])):
                res = self.outputDataBox.data['DataHKL'][i].getHighResolution(True)
                if res<maxres:
                    maxres   = res
                    self.hkl = self.outputDataBox.data['DataHKL'][i]

        if 'DataSequence' in self.outputDataBox.data:
            self.seq = self.outputDataBox.data['DataSequence']

        if 'DataXYZ' in self.outputDataBox.data:
            self.xyz = self.outputDataBox.data['DataXYZ'][0]


        # -------------------------------------------------------------------
        # make data summary table

        tableId = "ccp4ez_summary_table"

        self.putTable ( tableId,"<font style='font-style:normal;font-size:125%;'>1. Input Data</font>",
                                self.report_page_id(),self.rvrow,0 )
        self.rvrow += 1
        self.setTableHorzHeaders ( tableId,["Assigned Name","View"],
                ["Name of the assocuated data object","Data view and export"] )

        def addDataLine ( name,tooltip,object,nrow ):
            if object:
                self.putTableLine ( tableId,name,tooltip,object.dname,nrow[0] )
                self.putInspectButton ( object,"View",tableId,nrow[0]+1,2 )
                nrow[0] +=1
            return

        nrow = [0]
        addDataLine ( "Unmerged Reflections","Reflection data",self.unm,nrow )
        addDataLine ( "Merged Reflections"  ,"Reflection data",self.hkl,nrow )
        if self.seq:
            if len(self.seq)<2:
                addDataLine ( "Sequence","Sequence data",self.seq[0],nrow )
            else:
                for i in range(len(self.seq)):
                    addDataLine ( "Sequence #"+str(i+1),"Sequence data",self.seq[i],nrow )
        addDataLine ( "Structure"           ,"Homologue structure",self.xyz,nrow )

        if self.task.ha_type:
            self.putTableLine ( tableId,"Anomalous scatterers",
                "Chemical type of anomalous scatterers",self.task.ha_type,
                nrow[0] )
            nrow[0] += 1

        return


    # ------------------------------------------------------------------------

    def run(self):

        self.importData()
        self.putMessage ( "&nbsp;" )
        self.flush()

        # run ccp4ez pipeline
        if self.unm or self.hkl:

            # write input file
            self.open_stdin()
            if self.unm:
                self.write_stdin ( "HKLIN " + self.unm.getFilePath(self.outputDir()) )
            elif self.hkl:
                self.write_stdin ( "HKLIN " + self.hkl.getFilePath(self.outputDir()) )
            if self.seq:
                self.write_stdin ( "\nSEQIN " + self.seq[0].getFilePath(self.outputDir()) )
            if self.xyz:
                self.write_stdin ( "\nXYZIN " + self.xyz.getFilePath(self.outputDir()) )
            if self.task.ha_type:
                self.write_stdin ( "\nHATOMS " + self.ha_type )
            self.write_stdin ( "\n" )
            self.close_stdin()

            queueName = "";
            if len(sys.argv)>4:
                if sys.argv[4]!="-":
                    queueName = sys.argv[4]

            if self.exeType == "SGE":
                nSubJobs = "0";
                if len(sys.argv)>5:
                    nSubJobs = sys.argv[5]
            else:
                nSubJobs = "4";

            meta = {}
            meta["jobId"]         = self.job_id
            meta["stageNo"]       = 1
            meta["sge_q"]         = queueName
            meta["sge_tc"]        = nSubJobs
            meta["summaryTabId"]  = self.report_page_id()
            meta["summaryTabRow"] = self.rvrow
            meta["navTreeId"]     = self.navTreeId
            meta["outputDir"]     = self.outputDir()
            meta["outputName"]    = "ccp4ez"

            self.file_stdout.write ( json.dumps(meta) )

            self.storeReportDocument ( json.dumps(meta) )

            ccp4ez_path = os.path.normpath ( os.path.join (
                                os.path.dirname(os.path.abspath(__file__)),
                                "../apps/ccp4ez/ccp4ez.py" ) )
            cmd = [ ccp4ez_path,
                    "--sge" if self.exeType == "SGE" else "--mp",
                    "--rdir","report",
                    "--rvapi-document",self.reportDocumentName()
                  ]

            self.runApp ( "ccp4-python",cmd )
            rvapi_meta = self.restoreReportDocument()

            if rvapi_meta:
                try:
                    rvapi_meta = json.loads ( rvapi_meta )
                    self.rvrow = rvapi_meta["report_row"]
                except:
                    self.putMessage (
                        "<b>Program error:</b> <i>unparseable metadata " +
                        "from CCP4ez</i>" + "<p>'" + str(rvapi_meta) + "'" )


        # close execution logs and quit
        self.success()
        return


# ============================================================================

if __name__ == "__main__":

    drv = CCP4ez ( "CCP4ez Automated Structure Solver",os.path.basename(__file__),
                  { "report_page" : { "show" : True, "name" : "Summary" },
                    "nav_tree"    : { "id"   : "nav_tree_id", "name" : "Workflow" }
                  })

    drv.run()
