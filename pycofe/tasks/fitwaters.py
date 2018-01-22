##!/usr/bin/python

#
# ============================================================================
#
#    20.10.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  FITWATERS EXECUTABLE MODULE
#
#  Command-line:
#     ccp4-python -m pycofe.tasks.fitwaters exeType jobDir jobId
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

#  application imports
import basic
from   pycofe.proc   import coor
from   pycofe.dtypes import dtype_revision


# ============================================================================
# Make Refmac driver

class FitLigand(basic.TaskDriver):

    # ------------------------------------------------------------------------

    def run(self):

        # Prepare makeligand input
        # fetch input data

        istruct = self.makeClass ( self.input_data.data.istruct[0] )
        sec1    = self.task.parameters.sec1.contains

        # make command-line parameters
        pdbin   = istruct.getXYZFilePath ( self.inputDir() )
        mtzin   = istruct.getMTZFilePath ( self.inputDir() )
        watout  = "waters.pdb"
        cmd = [ "--pdbin"       ,pdbin,
                "--hklin"       ,mtzin,
                "--pdbout"      ,watout,
                "--f"           ,istruct.DELFWT,
                "--phi"         ,istruct.PHDELWT,
                "--sigma"       ,self.getParameter(sec1.SIGMA)
              ]
        if self.getParameter(sec1.FLOOD_CBX)=="True":
            cmd += [ "--flood","--flood-atom-radius",
                     self.getParameter(sec1.FLOOD_RADIUS) ]
        #else:
        #    cmd += [ "--min-dist"    ,self.getParameter(sec1.MIN_DIST),
        #             "--max-dist"    ,self.getParameter(sec1.MAX_DIST) ]

        # Start findligand
        self.runApp ( os.path.join(os.environ["CCP4"],"libexec","findwaters-bin"),cmd )

        pdbout  = self.outputFName + ".pdb"
        nwaters = coor.mergeLigands ( pdbin,[watout],"W",pdbout )
        if nwaters>0:
            structure = self.registerStructure ( pdbout,mtzin,
                            istruct.getMapFilePath (self.inputDir()),
                            istruct.getDMapFilePath(self.inputDir()),
                            istruct.getLibFilePath (self.inputDir()) )
            if structure:
                structure.copyAssociations ( istruct )
                structure.copySubtype      ( istruct )
                structure.copyLabels       ( istruct )
                structure.copyLigands      ( istruct )
                structure.addWaterSubtype  ()
                self.putTitle   ( "Results" )
                self.putMessage ( "<b>Total " + str(nwaters) +\
                                  " water molecules were fitted</b><br>&nbsp;" )
                self.putStructureWidget ( "structure_btn_",
                                          "Structure and electron density",
                                          structure )
                # update structure revision
                revision = self.makeClass ( self.input_data.data.revision[0] )
                revision.setStructureData ( structure )
                self.registerRevision     ( revision  )

        else:
            self.putTitle ( "No water molecules were found and fitted." )

        # close execution logs and quit
        self.success()
        return


# ============================================================================

if __name__ == "__main__":

    drv = FitLigand ( "",os.path.basename(__file__) )
    drv.run()
