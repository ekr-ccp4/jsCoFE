##!/usr/bin/python

#
# ============================================================================
#
#    28.01.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  CCP4EZ Combined Auto-Solver Lorestr module
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017-2018
#
# ============================================================================
#

import os

#  ccp4-python imports
#import pyrvapi

import edmap

import ccp4ez_buccaneer

# ============================================================================

class Lorestr(ccp4ez_buccaneer.Buccaneer):

    def lorestr_page_id  (self):  return "ccp4ez_lorestr_tab"
    def lorestr_logtab_id(self):  return "ccp4ez_lorestr_log_tab"
    def lorestr_errtab_id(self):  return "ccp4ez_lorestr_err_tab"

    def lorestr_dir      (self):  return "lorestr_results"

    # ----------------------------------------------------------------------

    def lorestr ( self,datadir,parent_branch_id ):

        if datadir.endswith(self.crank2_dir()) or not self.seqpath:
            return ""

        self.putWaitMessageLF ( "<b>" + str(self.stage_no+1) +
                                ". Refinement (Lorestr)</b>" )
        self.page_cursor[1] -= 1

        branch_data = self.start_branch ( "Refinement",
                        "CCP4ez Automated Structure Solver: Refinement " +
                        "with Lorestr",
                        self.lorestr_dir      (),parent_branch_id,
                        self.lorestr_page_id  (),self.lorestr_logtab_id(),
                        self.lorestr_errtab_id() )

        self.flush()

        ccp4    = os.environ["CCP4"]
        meta    = self.output_meta["results"][datadir]
        columns = meta["columns"]
        refpath = os.path.join(ccp4,"lib","data","reference_structures","reference-1tqw")

        self.open_script  ( "lorestr" )
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
            "pdbout " + os.path.join(self.lorestr_dir(),"lorestr.pdb") + "\n" +
            "cycles 5\n" +
            "lorestr-anisotropy-correction\n" +
            "lorestr-build-semet\n" +
            "lorestr-fast\n" +
            "lorestr-1st-cycles 3\n" +
            "lorestr-1st-sequence-reliability 0.95\n" +
            "lorestr-nth-cycles 2\n" +
            "lorestr-nth-sequence-reliability 0.95\n" +
            "lorestr-nth-correlation-mode\n" +
            "lorestr-resolution 2\n" +
            "lorestr-new-residue-name UNK\n" +
            "lorestr-keyword mr-model-filter-sigma 3\n" +
            "jobs 2\n"  +
            "pdbin-mr " + meta["pdb"] + "\n" +
            "prefix ./" + self.lorestr_dir() + "/\n"
        )
        self.close_script()

        # make command-line parameters for lorestr_sge.py
        cmd = [ "-u",os.path.join(ccp4,"bin","lorestr_pipeline"),"-stdin" ]

        # run lorestr
        self.setGenericLogParser ( True )
        self.runApp ( "ccp4-python",cmd )
        self.unsetLogParser()

        # check for solution
        nResults    = 0
        rfree       = 1.0
        lorestr_xyz  = os.path.join ( self.lorestr_dir(),"refine.pdb" )
        lorestr_mtz  = os.path.join ( self.lorestr_dir(),"refine.mtz" )
        lorestr_map  = os.path.join ( self.lorestr_dir(),"refine.map" )
        lorestr_dmap = os.path.join ( self.lorestr_dir(),"refine.diff.map" )
        if os.path.isfile(lorestr_xyz):

            edmap.calcCCP4Maps ( lorestr_mtz,os.path.join(self.lorestr_dir(),"refine"),
                        "./",self.file_stdout,self.file_stderr,"refmac",None )

            nResults = 1
            self.mk_std_streams ( None )
            rfree_pattern = "             R free"
            with open(os.path.join(self.lorestr_dir(),self.file_stdout_path()),'r') as logf:
                for line in logf:
                    if line.find(rfree_pattern)>=0:
                        list = filter ( None,line.split() )
                        rfree = float(list[len(list)-1])

            self.putMessage ( "<h2><i>Solution found</i></h2>" )
            dfpath = os.path.join ( "..",self.outputdir,self.lorestr_dir(),"lorestr" )
            self.putStructureWidget ( "Structure and density map",
                                    [ dfpath+".pdb",dfpath+".mtz",dfpath+".map",
                                      dfpath+"_dmap.map" ],-1 )

        else:
            lorestr_xyz = ""

        columns = {
          "F"    : self.hkl.Fmean.value,
          "SIGF" : self.hkl.Fmean.sigma,
          "FREE" : self.hkl.FREE,
          "PHI"  : "PHIC_ALL_LS",
          "FOM"  : "FOM"
        }

        quit_message = self.saveResults ( "Lorestr",self.lorestr_dir(),nResults,
            rfree,"lorestr", lorestr_xyz,lorestr_mtz,lorestr_map,lorestr_dmap,
            columns )

        self.quit_branch ( branch_data,"Refinement (Lorestr): " +
                                       quit_message )

        return self.lorestr_page_id()
