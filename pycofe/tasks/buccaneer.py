##!/usr/bin/python

#
# ============================================================================
#
#    18.10.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  BUCCANEER EXECUTABLE MODULE
#
#  Command-line:
#     ccp4-python bbuccaneermr.py exeType jobDir jobId
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
import shutil

#  application imports
import basic
from   pycofe.dtypes import dtype_template, dtype_revision


# ============================================================================
# Make Molrep driver

class BuccaneerMR(basic.TaskDriver):

    # redefine name of input script file
    def file_stdin_path (self):  return "buccaneer.script"

    # make task-specific definitions
    def buccaneer_seq   (self):  return "buccaneer.seq"
    def buccaneer_xyz   (self):  return "buccaneer.pdb"
    def buccaneer_mtz   (self):  return "buccaneer.mtz"
    def buccaneer_tmp   (self):  return "buccaneer_pipeline"

    # ------------------------------------------------------------------------

    def addCmdLine ( self,keyword,line ):
        self.write_stdin ( keyword + " " + line + "\n" )
        return

    def run(self):

        # Just in case (of repeated run) remove the output xyz file. When buccaneer
        # succeeds, this file is created.
        if os.path.isfile(self.buccaneer_xyz()):
            os.remove(self.buccaneer_xyz())

        if not os.path.exists(self.buccaneer_tmp()):
            os.makedirs(self.buccaneer_tmp())

        # Prepare buccaneer input
        # fetch input data

        idata   = self.input_data.data
        sec1    = self.task.parameters.sec1.contains
        sec2    = self.task.parameters.sec2.contains
        sec3    = self.task.parameters.sec3.contains

        istruct = self.makeClass ( idata.istruct[0] )
        seq     = idata.seq

        #self.makeFullASUSequenceFile ( seq,self.buccaneer_seq() )

        with open(self.buccaneer_seq(),'wb') as newf:
            if len(seq)>0:
                for s in seq:
                    s1 = self.makeClass ( s )
                    with open(s1.getFilePath(self.inputDir()),'rb') as hf:
                        newf.write(hf.read())
                    newf.write ( '\n' );
            else:
                newf.write ( ">polyUNK\nU\n" );

        refname = "reference-" + sec2.REFMDL_SEL.value
        #isCoor  = ("MR" in istruct.subtype) or ("EP" in istruct.subtype)
        isCoor  = istruct.hasXYZSubtype()

        self.open_stdin()

        self.addCmdLine ( "title Job",self.job_id.zfill(4) )
        self.addCmdLine ( "pdbin-ref",os.path.join(os.environ["CCP4"],"lib","data","reference_structures",refname+".pdb") )
        self.addCmdLine ( "mtzin-ref",os.path.join(os.environ["CCP4"],"lib","data","reference_structures",refname+".mtz") )
        self.addCmdLine ( "colin-ref-fo","FP.F_sigF.F,FP.F_sigF.sigF" )
        self.addCmdLine ( "colin-ref-hl","FC.ABCD.A,FC.ABCD.B,FC.ABCD.C,FC.ABCD.D" )
        self.addCmdLine ( "seqin"     ,self.buccaneer_seq() )
        self.addCmdLine ( "mtzin"     ,istruct.getMTZFilePath(self.inputDir()) )
        self.addCmdLine ( "colin-fo"  ,istruct.FP + "," + istruct.SigFP )
        self.addCmdLine ( "colin-free",istruct.FreeR_flag )

        if isCoor:
            self.addCmdLine ( "colin-phifom",istruct.PHI + "," + istruct.FOM )
        else:
            self.addCmdLine ( "colin-hl",istruct.HLA + "," + istruct.HLB + "," +\
                                         istruct.HLC + "," + istruct.HLD )

        # Fixed model to be preserved by Buccaneer

        xmodel = None

        #if istruct.hasSubtype("xyz"):
        #    xmodel = istruct
        #    self.addCmdLine ( "pdbin",os.path.join(self.inputDir(),xmodel.files[0]) )

        if hasattr(idata,"xmodel"):
            xmodel = idata.xmodel[0]
            self.addCmdLine ( "pdbin",os.path.join(self.inputDir(),xmodel.files[0]) )

        if hasattr(idata,"smodel"):
            self.addCmdLine ( "pdbin-sequence-prior",
                              os.path.join(self.inputDir(),idata.smodel[0].files[0]) )

        self.addCmdLine ( "pdbout",self.buccaneer_xyz()  )

        self.write_stdin (
            self.putKWParameter ( sec1.NCYCLES          ) + \
            self.putKWParameter ( sec2.FIX_POSITION_CBX ) + \
            self.putKWParameter ( sec1.ANISO_CBX        ) + \
            self.putKWParameter ( sec1.SELEN_CBX    ) + \
            self.putKWParameter ( sec1.FASTEST_CBX  ) + \
            self.putKWParameter ( sec2.NICYCLES1    ) + \
            self.putKWParameter ( sec2.SEQASGN1_SEL ) + \
            self.putKWParameter ( sec2.CORRTF1_CBX  ) + \
            self.putKWParameter ( sec2.NICYCLES2    ) + \
            self.putKWParameter ( sec2.SEQASGN2_SEL ) + \
            self.putKWParameter ( sec2.CORRTF2_CBX  ) + \
            self.putKWParameter ( sec2.RESMIN       ) + \
            self.putKWParameter ( sec2.UNKRESN      )
            #self.putKWParameter ( sec2.FILTERBF     ) + \
            #self.putKWParameter ( sec2.FILTERBFMR   )
        )

        if xmodel:
            self.addCmdLine ( "buccaneer-keyword model-filter-sigma",str(xmodel.BFthresh) )

        if isCoor:
            self.addCmdLine ( "buccaneer-keyword mr-model-filter-sigma",str(istruct.BFthresh) )

        #if sec2.KEEPATMCID.visible:
        #    self.write_stdin ( "buccaneer-keyword known-structure " + \
        #                       sec2.KEEPATMCID.value + ":" + \
        #                       str(sec2.KEEPATMRAD.value) + "\n" )

        if hasattr(sec1,"NCPUS"):
            self.write_stdin ( self.putKWParameter ( sec1.NCPUS ) )
        else:
            self.write_stdin ( "jobs 2\n" )

        self.write_stdin ( self.putKWParameter ( sec3.USEPHI_CBX ) )

        if isCoor:
            self.addCmdLine ( "pdbin-mr",istruct.getXYZFilePath(self.inputDir()) )
            if istruct.useModelSel!="N":
                self.addCmdLine ( "buccaneer-keyword",istruct.useModelSel )
            #self.write_stdin ( self.putKWParameter ( sec1.USEMR_SEL ) )

        self.write_stdin ( self.putKWParameter ( sec3.REFTWIN_CBX ) )

        if self.getParameter(sec3.AUTOWEIGH_CBX)=="False":
            self.addCmdLine ( "refmac-weight",self.getParameter(sec3.WEIGHTVAL) )

        self.addCmdLine ( "prefix","./" + self.buccaneer_tmp() + "/" )

        self.close_stdin()

        # make command-line parameters
        cmd = [ "-u",
                os.path.join(os.environ["CCP4"],"bin","buccaneer_pipeline"),
                "-stdin"
              ]

        # prepare report parser
        self.setGenericLogParser ( "buccaneer_report",True )

        # start buccaneer
        self.runApp ( "ccp4-python",cmd )

        # check solution and register data
        if os.path.isfile(self.buccaneer_xyz()):

            shutil.copyfile ( os.path.join(self.buccaneer_tmp(),"refine.mtz"),
                                           self.buccaneer_mtz() )

            self.putTitle ( "Buccaneer Output" )
            self.unsetLogParser()

            # calculate maps for UglyMol using final mtz from temporary location
            fnames = self.calcCCP4Maps ( self.buccaneer_mtz(),"buccaneer" )

            # register output data from temporary location (files will be moved
            # to output directory by the registration procedure)

            structure = self.registerStructure (
                                    self.buccaneer_xyz(),self.buccaneer_mtz(),
                                    fnames[0],fnames[1],None )
            if structure:
                structure.copyAssociations ( istruct )
                structure.copySubtype      ( istruct )
                structure.removeSubtype    ( dtype_template.subtypeSubstructure() )
                structure.addXYZSubtype    ()
                structure.copyLabels       ( istruct )
                structure.copyLigands      ( istruct )
                self.putStructureWidget    ( "structure_btn",
                                             "Structure and electron density",
                                             structure )
                # update structure revision
                revision = self.makeClass  ( self.input_data.data.revision[0] )
                revision.removeSubtype     ( dtype_template.subtypeSubstructure() )
                revision.setStructureData  ( structure )
                self.registerRevision      ( revision  )

        else:
            self.putTitle ( "No Output Generated" )

        # close execution logs and quit
        self.success()
        return


# ============================================================================

if __name__ == "__main__":

    drv = BuccaneerMR ( "",os.path.basename(__file__) )
    drv.start()
