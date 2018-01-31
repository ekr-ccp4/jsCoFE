##!/usr/bin/python

#
# ============================================================================
#
#    28.01.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  CCP4EZ Combined Auto-Solver Buccaneer module
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017-2018
#
# ============================================================================
#

import os

#  ccp4-python imports
#import pyrvapi

import edmap

import ccp4ez_crank2

# ============================================================================

class Buccaneer(ccp4ez_crank2.Crank2):

    def buccaneer_page_id  (self):  return "ccp4ez_buccaneer_tab"
    def buccaneer_logtab_id(self):  return "ccp4ez_buccaneer_log_tab"
    def buccaneer_errtab_id(self):  return "ccp4ez_buccaneer_err_tab"

    def buccaneer_dir      (self):  return "buccaneer_results"

    # ----------------------------------------------------------------------

    def buccaneer ( self,datadir,parent_branch_id ):

        if datadir.endswith(self.crank2_dir()) or not self.seqpath:
            return ""

        self.putMessage       ( "&nbsp;" )
        self.putWaitMessageLF ( "<b>" + str(self.stage_no+1) +
                                ". Automated Model Building (Buccaneer)</b>" )
        self.page_cursor[1] -= 1

        branch_data = self.start_branch ( "Auto-Build",
                        "CCP4ez Automated Structure Solver: Automated Model " +
                        "Building with Buccaneer",
                        self.buccaneer_dir      (),parent_branch_id,
                        self.buccaneer_page_id  (),self.buccaneer_logtab_id(),
                        self.buccaneer_errtab_id() )

        self.flush()

        ccp4    = os.environ["CCP4"]
        meta    = self.output_meta["results"][datadir]
        columns = meta["columns"]
        refpath = os.path.join(ccp4,"lib","data","reference_structures","reference-1tqw")

        self.open_script  ( "buccaneer" )
        self.write_script (
            "title Job "    + self.jobId.zfill(4) + "-"   +
                              str(self.stage_no).zfill(2) + "\n" +
            "pdbin-ref "    + refpath  + ".pdb\n" +
            "mtzin-ref "    + refpath  + ".mtz\n" +
            "colin-ref-fo FP.F_sigF.F,FP.F_sigF.sigF\n" +
            "colin-ref-hl FC.ABCD.A,FC.ABCD.B,FC.ABCD.C,FC.ABCD.D\n" +
            "seqin "        + self.seqpath    + "\n" +
            "mtzin "        + meta["mtz"]     + "\n" +
            "colin-fo "     + columns["F"]    + ","  + columns["SIGF"] + "\n" +
            "colin-free "   + columns["FREE"] + "\n" +
            "colin-phifom " + columns["PHI"]  + ","  + columns["FOM"]  + "\n" +
            "pdbout " + os.path.join(self.buccaneer_dir(),"buccaneer.pdb") + "\n" +
            "cycles 5\n" +
            "buccaneer-anisotropy-correction\n" +
            "buccaneer-build-semet\n" +
            "buccaneer-fast\n" +
            "buccaneer-1st-cycles 3\n" +
            "buccaneer-1st-sequence-reliability 0.95\n" +
            "buccaneer-nth-cycles 2\n" +
            "buccaneer-nth-sequence-reliability 0.95\n" +
            "buccaneer-nth-correlation-mode\n" +
            "buccaneer-resolution 2\n" +
            "buccaneer-new-residue-name UNK\n" +
            "buccaneer-keyword mr-model-filter-sigma 3\n" +
            "jobs 2\n"  +
            "pdbin-mr " + meta["pdb"] + "\n" +
            "prefix ./" + self.buccaneer_dir() + "/\n"
        )
        self.close_script()

        # make command-line parameters for buccaneer_sge.py
        cmd = [ "-u",os.path.join(ccp4,"bin","buccaneer_pipeline"),"-stdin" ]

        # run buccaneer
        self.setGenericLogParser ( True )
        self.runApp ( "ccp4-python",cmd )
        self.unsetLogParser()

        # check for solution
        nResults       = 0
        rfree          = 1.0
        quit_message   = ""
        buccaneer_xyz  = os.path.join ( self.buccaneer_dir(),"refine.pdb" )
        buccaneer_mtz  = os.path.join ( self.buccaneer_dir(),"refine.mtz" )
        buccaneer_map  = os.path.join ( self.buccaneer_dir(),"refine.map" )
        buccaneer_dmap = os.path.join ( self.buccaneer_dir(),"refine.diff.map" )
        if os.path.isfile(buccaneer_xyz):

            edmap.calcCCP4Maps ( buccaneer_mtz,os.path.join(self.buccaneer_dir(),"refine"),
                        "./",self.file_stdout,self.file_stderr,"refmac",None )

            nResults = 1
            self.mk_std_streams ( None )
            rfree_pattern = "             R free"
            with open(os.path.join(self.buccaneer_dir(),self.file_stdout_path()),'r') as logf:
                for line in logf:
                    if line.find(rfree_pattern)>=0:
                        list = filter ( None,line.split() )
                        rfree = float(list[len(list)-1])

            self.putMessage ( "<h2><i>Structure built with <i>R<sub>free</sub>=" +
                              str(rfree) +"</i></h2>" )
            dfpath = os.path.join ( "..",self.outputdir,self.buccaneer_dir(),"buccaneer" )
            self.putStructureWidget ( "Structure and density map",
                                    [ dfpath+".pdb",dfpath+".mtz",dfpath+".map",
                                      dfpath+"_dmap.map" ],-1 )

            quit_message = "built with <i>R<sub>free</sub>=" + str(rfree) + "</i>"

        else:
            buccaneer_xyz = ""
            quit_message  = "FAILED."

        buccaneer_columns = {
          "F"    : columns["F"],
          "SIGF" : columns["SIGF"],
          "FREE" : columns["FREE"],
          "PHI"  : "PHIC_ALL_LS",
          "FOM"  : "FOM"
        }

        self.saveResults ( "Buccanneer",self.buccaneer_dir(),
            nResults,rfree,"buccaneer", buccaneer_xyz,buccaneer_mtz,
            buccaneer_map,buccaneer_dmap,buccaneer_columns )

        self.quit_branch ( branch_data,"Automated Model Building (Buccaneer): " +
                                       quit_message )

        return self.buccaneer_page_id()
