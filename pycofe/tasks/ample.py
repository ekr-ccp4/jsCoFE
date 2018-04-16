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
from   pycofe.proc   import xyzmeta


# ============================================================================
# Make Morda driver

class Ample(basic.TaskDriver):

    # make task-specific definitions
    # tab ids for running MORDA on a SHELL-type node

    # ------------------------------------------------------------------------

    def run(self):

        # Prepare ample job

        # fetch input data
        hkl = self.makeClass ( self.input_data.data.hkl[0] )
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

        #test_ample_path = os.path.join ( os.environ["CCP4"],"bin","ample_mock.py" )

        # run ample
        #self.runApp ( "ccp4-python",[test_ample_path] + cmd )
        self.runApp ( "ample",cmd )

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
                self.putMessage ( "<b>Program error:</b> <i>unparseable metadata from Ample</i>" +
                                  "<p>'" + rvapi_meta + "'" )
        else:
            self.putMessage ( "<b>Program error:</b> <i>no metadata from Ample</i>" )
            ample_meta = {}
            ample_meta["results"] = []

        results = ample_meta["results"]
        if len(results)<=0:
            self.putTitle ( "Solution Not Found" )
        else:

            generic_parser_summary = None
            for i in range(len(results)):
                result = results[i]
                self.putTitle ( "Solution " + result["name"] )

                mtzfile   = os.path.join ( self.reportDir(),result["mtz"] )
                final_pdb = os.path.join ( self.reportDir(),result["pdb"] )
                sol_hkl   = hkl

                meta = xyzmeta.getXYZMeta ( final_pdb,self.file_stdout,
                                            self.file_stderr )
                if "cryst" in meta:
                    sol_spg    = meta["cryst"]["spaceGroup"]
                    spg_change = self.checkSpaceGroupChanged ( sol_spg,hkl,mtzfile )
                    if spg_change:
                        mtzfile = spg_change[0]
                        sol_hkl = spg_change[1]

                # ================================================================
                # make output structure and register it

                structure = self.finaliseStructure ( final_pdb,self.outputFName,
                                                     sol_hkl,None,[seq],1,False,"" )

                if structure:
                    # update structure revision
                    revision = self.makeClass  ( self.input_data.data.revision[0] )
                    revision.setReflectionData ( sol_hkl   )
                    revision.setStructureData  ( structure )
                    self.registerRevision      ( revision,i+1,"" )
                    if not generic_parser_summary:
                        generic_parser_summary = self.generic_parser_summary.copy()

                else:
                    self.putMessage ( "Structure Data cannot be formed (probably a bug)" )

            if generic_parser_summary:
                self.generic_parser_summary = generic_parser_summary.copy()


        # close execution logs and quit
        self.success()
        return


# ============================================================================

if __name__ == "__main__":

#    drv = Ample ( "Ab-initio Molecular Replacement with AMPLE",os.path.basename(__file__),
#                  { "report_page" : { "show" : False } }  )

    drv = Ample ( "",os.path.basename(__file__) )

    drv.start()
