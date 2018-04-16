##!/usr/bin/python

#
# ============================================================================
#
#    10.04.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  DATA IMPORT EXECUTABLE MODULE
#
#  Command-line:
#     ccp4-python import.py exeType jobDir jobId
#
#  where:
#    exeType  is either SHELL or SGE
#    jobDir   is path to job directory, having:
#      jobDir/uploads : directory containing all uploaded files
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

#  ccp4-python imports
import pyrvapi

#  application imports
import basic
from proc import (import_xrayimages, import_unmerged, import_merged,
                  import_xyz, import_sequence)

importers = [import_xrayimages, import_unmerged, import_merged,
             import_xyz, import_sequence]

# import_map can fail if the mrcfile package is not available. Once mrcfile is
# properly included in CCP4 builds, this can be changed to a normal import.
try:
    from proc import import_map
    importers.append(import_map)
except Exception:
    pass

# ============================================================================
# Make Import driver

class Import(basic.TaskDriver):

    # ============================================================================
    # import driver

    def import_all(self):

        # ============================================================================
        # start page construction: summary table

        pyrvapi.rvapi_add_table ( self.import_summary_id(),"<font size='+1'>Import Summary</font>",
                                  self.report_page_id(),self.rvrow+1,0,1,1, 0 )
        pyrvapi.rvapi_set_table_style ( self.import_summary_id(),"table-blue","text-align:left;" )
        pyrvapi.rvapi_add_text ( "&nbsp;",self.report_page_id(),self.rvrow+2,0,1,1 )
        self.rvrow += 3

        pyrvapi.rvapi_put_horz_theader ( self.import_summary_id(),"Imported file",
                                                          "Name of imported file",0 )
        pyrvapi.rvapi_put_horz_theader ( self.import_summary_id(),"Type","Dataset type",1 )
        pyrvapi.rvapi_put_horz_theader ( self.import_summary_id(),"Generated dataset(s)",
                                                          "List of generated datasets",2 )

        # ============================================================================
        # get list of uploaded files

        #self.files_all = [f for f in os.listdir(self.importDir()) if os.path.isfile(os.path.join(self.importDir(),f))]

        self.files_all = []
        for dirName, subdirList, fileList in os.walk(self.importDir(),topdown=False):
            dName = dirName[len(self.importDir())+1:]
            for fname in fileList:
                self.files_all.append ( os.path.join(dName,fname) )

        # ============================================================================
        # do individual data type imports

        for importer in importers:
            importer.run(self)


        # ============================================================================
        # finish import

        if len(self.files_all)>0:
            self.file_stdout.write ( "\n\n" + "="*80 + \
               "\n*** The following files are not recognised and will be ignored:\n" )
            for f in self.files_all:
                self.file_stdout.write ( "     " + f + "\n" )
            self.file_stdout.write ( "\n" )

            for f in self.files_all:
                self.putSummaryLine_red ( f,"UNKNOWN","Failed to recognise, ignored" )

    def run(self):

        self.import_all()

        # modify job name to display in job tree
        ilist = ""
        for key in self.outputDataBox.data:
            ilist += key[4:] + " (" + str(len(self.outputDataBox.data[key])) + ") "
        if ilist:
            if self.task.uname:
                self.task.uname += " / "
            self.task.uname += "imported: <i><b>" + ilist + "</b></i>"
            with open('job.meta','w') as file_:
                file_.write ( self.task.to_JSON() )

        # close execution logs and quit
        self.success()
        return


# ============================================================================

if __name__ == "__main__":

    drv = Import ( "Data Import",os.path.basename(__file__) )
    drv.start()
