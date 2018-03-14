#!/usr/bin/python

#
# ============================================================================
#
#    14.03.18   <--  Date of Last Modification.
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
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017-2018
#
# ============================================================================
#

#  python native imports
import os
import sys
import shutil
import json

#  ccp4-python imports
import pyrvapi

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
                "-rvapi_document",self.reportDocumentName() ]

        # pass rvapi document with metadata
        """
        self.storeReportDocument(
            '{ "jobId"       : "' + str(self.job_id).zfill(4) + '",' +
            '  "reportTabId" : "' + self.report_page_id() + '",'
            '  "logTabId"    : "' + self.log_page_id()    + '"'
            '}'
        )
        """
        self.storeReportDocument ( self.log_page_id() )

        test_ample_path = os.path.join ( os.environ["CCP4"],"bin","ample_mock.py" )

        # run ample
        self.runApp ( "ccp4-python",[test_ample_path] + cmd )

        self.restoreReportDocument()
        f = open ( 'xxx.json','w' )
        f.write ( pyrvapi.rvapi_get_meta() )
        f.close()

        """
        {"results": [
          {"info": "SHELXE trace of MR result",
             "mtz": "../../../../../../opt/ample.git/ample_testing/from_existing_models/MRBUMP/search_c1_t100_r3_polyAla_mrbump/data/loc0_ALL_c1_t100_r3_polyAla/unmod/mr/phaser/build/shelxe/shelxe_phaser_loc0_ALL_c1_t100_r3_polyAla_UNMOD.mtz",
             "type": "SHELXE",
             "name": "c1_t100_r3_polyAla",
             "pdb": "../../../../../../opt/ample.git/ample_testing/from_existing_models/MRBUMP/search_c1_t100_r3_polyAla_mrbump/data/loc0_ALL_c1_t100_r3_polyAla/unmod/mr/phaser/build/shelxe/shelxe_phaser_loc0_ALL_c1_t100_r3_polyAla_UNMOD.pdb"
           },
           {"info": "SHELXE trace of MR result",
             "mtz": "../../../../../../opt/ample.git/ample_testing/from_existing_models/MRBUMP/search_c1_t49_r1_polyAla_mrbump/data/loc0_ALL_c1_t49_r1_polyAla/unmod/mr/phaser/build/shelxe/shelxe_phaser_loc0_ALL_c1_t49_r1_polyAla_UNMOD.mtz",
             "type": "SHELXE",
             "name": "c1_t49_r1_polyAla",
             "pdb": "../../../../../../opt/ample.git/ample_testing/from_existing_models/MRBUMP/search_c1_t49_r1_polyAla_mrbump/data/loc0_ALL_c1_t49_r1_polyAla/unmod/mr/phaser/build/shelxe/shelxe_phaser_loc0_ALL_c1_t49_r1_polyAla_UNMOD.pdb"
            },
            {"info": "SHELXE trace of MR result",
             "mtz": "../../../../../../opt/ample.git/ample_testing/from_existing_models/MRBUMP/search_c1_t49_r3_polyAla_mrbump/data/loc0_ALL_c1_t49_r3_polyAla/unmod/mr/phaser/build/shelxe/shelxe_phaser_loc0_ALL_c1_t49_r3_polyAla_UNMOD.mtz",
             "type": "SHELXE",
             "name": "c1_t49_r3_polyAla",
             "pdb": "../../../../../../opt/ample.git/ample_testing/from_existing_models/MRBUMP/search_c1_t49_r3_polyAla_mrbump/data/loc0_ALL_c1_t49_r3_polyAla/unmod/mr/phaser/build/shelxe/shelxe_phaser_loc0_ALL_c1_t49_r3_polyAla_UNMOD.pdb"
            }
          ]
        }
        """

        rvapi_meta = pyrvapi.rvapi_get_meta()
        if rvapi_meta:
            try:
                ample_meta = json.loads ( rvapi_meta )
            except:
                self.putMessage ( "<b>Program error:</b> <i>unparseable metadata from Simbad</i>" +
                                  "<p>'" + rvapi_meta + "'" )
        else:
            self.putMessage ( "<b>Program error:</b> <i>no metadata from Simbad</i>" )
            ample_meta = {}
            ample_meta["nResults"] = 0

        # close execution logs and quit
        self.success()
        return


# ============================================================================

if __name__ == "__main__":

#    drv = Ample ( "Ab-initio Molecular Replacement with AMPLE",os.path.basename(__file__),
#                  { "report_page" : { "show" : False } }  )

    drv = Ample ( "",os.path.basename(__file__) )

    drv.start()
