#!/usr/bin/python

#
# ============================================================================
#
#    05.07.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  AMPLE EXECUTABLE MODULE
#
#  Command-line:
#     ccp4-python ample.py exeType jobDir jobId [queueName [nSubJobs]]
#
#  where:
#    exeType    is either SHELL or SGE
#    jobDir     is path to job directory, having:
#      jobDir/output  : directory receiving output files with metadata of
#                       all successful imports
#      jobDir/report  : directory receiving HTML report
#    jobId      is job id assigned by jsCoFE (normally an integer but should
#               be treated as a string with no assumptions)
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017
#
# ============================================================================
#

#  python native imports
import os
import sys
import shutil

#  application imports
import basic

# ============================================================================
# Make Morda driver

class Ample(basic.TaskDriver):

    # make task-specific definitions
    # tab ids for running MORDA on a SHELL-type node

    # ------------------------------------------------------------------------

    def run(self):

        # Prepare ample job

        # fetch input data
        hkl = self.input_data.data.hkl[0]
        seq = self.input_data.data.seq[0]

        # make command line parameters
        cmd = [ os.path.join(self.inputDir(),hkl.files[0]),
                os.path.join(self.inputDir(),seq.files[0]),
                "-d",self.reportDocumentName() ]

        # pass rvapi document with metadata
        self.storeReportDocument(
            '{ "jobId"       : "' + str(self.job_id).zfill(4) + '",' +
            '  "reportTabId" : "' + self.report_page_id() + '",'
            '  "logTabId"    : "' + self.log_page_id()    + '"'
            '}'
        )

        test_ample_path = os.path.join ( os.environ["CCP4"],"bin","ample1.py" )

        # run ample
        self.runApp ( "ccp4-python",[test_ample_path] + cmd )

        # close execution logs and quit
        self.success()
        return


# ============================================================================

if __name__ == "__main__":

#    drv = Ample ( "Ab-initio Molecular Replacement with AMPLE",os.path.basename(__file__),
#                  { "report_page" : { "show" : False } }  )

    drv = Ample ( "Ab-initio Molecular Replacement with AMPLE",os.path.basename(__file__) )

    drv.run()
