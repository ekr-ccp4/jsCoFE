##!/usr/bin/python

#
# ============================================================================
#
#    05.07.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  PISA EXECUTABLE MODULE
#
#  Command-line:
#     ccp4-python -m pycofe.tasks.pisa exeType jobDir jobId
#
#  where:
#    exeType  is either SHELL or SGE
#    jobDir   is path to job directory, having:
#      jobDir/output  : directory receiving output files with metadata of
#                       all successful imports
#      jobDir/report  : directory receiving HTML report
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017
#
# ============================================================================
#

#  python native imports
import os
import sys
import uuid
import shutil

#  application imports
import basic


# ============================================================================
# Make Refmac driver

class PISA(basic.TaskDriver):

    def log_page_id(self):  return "@log_tab"

    # ------------------------------------------------------------------------

    def run(self):

        if "JSPISA_CFG" not in os.environ:
            pyrvapi.rvapi_set_text (
                "<b>Error: jsCoFE is not configured to work with jsPISA.</b><p>" + \
                "Please look for support.",
                self.report_page_id(),self.rvrow,0,1,1 )

            self.fail ( " *** Error: jsCofe is not configured to work with jsPISA.\n" + \
                        "     Please look for support\n","jsPISA is not configured" )

        # Prepare pisa input
        # fetch input data
        xyz = self.input_data.data.xyz[0]

        xyzPath   = os.path.join ( self.inputDir(),str(xyz.files[0]) )
        reportDir = os.path.join ( os.getcwd(),self.reportDir() )
        shutil.copy ( xyzPath,reportDir )


        # make command-line parameters for bare morda run on a SHELL-type node
        cmd = [ "-process-all",xyzPath,reportDir,
                "--rvapi-doc",self.reportDocumentName() ]
        if len(xyz.exclLigs)>0:
            cmd.append ( "--lig-exclude='" + ",".join(xyz.exclLigs) + "'" )

        cmd += [ "--lig=" + self.getParameter(self.task.parameters.sec1.contains.LIGANDKEY_SEL),
                os.environ["JSPISA_CFG"] ]

        self.storeReportDocument ( self.outputDir() )

        # Start pisa
        self.runApp ( "jspisa",cmd )

        self.restoreReportDocument()

        # close execution logs and quit
        self.success()
        return


# ============================================================================

if __name__ == "__main__":

    drv = PISA ( "",os.path.basename(__file__),
                 { "report_page" : { "show" : False } } )
    drv.start()
