##!/usr/bin/python

#
# ============================================================================
#
#    28.01.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  CCP4EZ Combined Auto-Solver Dimple module
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017-2018
#
# ============================================================================
#

import os

#  ccp4-python imports
#import pyrvapi

import edmap

import ccp4ez_mtz

# ============================================================================

class Dimple(ccp4ez_mtz.PrepareMTZ):

    def dimple_header_id(self):  return "ccp4ez_dimple_header_tab"
    def dimple_page_id  (self):  return "ccp4ez_dimple_tab"
    def dimple_logtab_id(self):  return "ccp4ez_dimple_log_tab"
    def dimple_errtab_id(self):  return "ccp4ez_dimple_err_tab"

    def dimple_dir      (self):  return "dimple_results"

    # ----------------------------------------------------------------------

    def dimple ( self,parent_branch_id ):

        if not self.xyzpath:
            return ""

        self.putWaitMessageLF ( "<b>" + str(self.stage_no+1) +
                                ". Homologue Molecular Replacement (Dimple)</b>" )
        self.page_cursor[1] -= 1

        branch_data = self.start_branch ( "Homologue MR",
                        "CCP4ez Automated Structure Solver: Homologue MR with Dimple",
                        self.dimple_dir      (),parent_branch_id,
                        self.dimple_header_id(),self.dimple_logtab_id(),
                        self.dimple_errtab_id() )

        self.flush()
        self.storeReportDocument ( "" )

        # make command-line parameters for dimple_sge.py
        cmd = [ self.mtzpath,self.xyzpath,self.dimple_dir(), "--slow","--slow",
                "--free-r-flags","-" ]

        # run dimple
        self.runApp ( "dimple",cmd )

        self.restoreReportDocument()

        # check for solution
        nResults    = 0
        rfree       = 1.0
        dimple_xyz  = os.path.join ( self.dimple_dir(),"final.pdb" )
        dimple_mtz  = os.path.join ( self.dimple_dir(),"final.mtz" )
        dimple_map  = os.path.join ( self.dimple_dir(),"final.map" )
        dimple_dmap = os.path.join ( self.dimple_dir(),"final.diff.map" )
        if os.path.isfile(dimple_xyz):

            edmap.calcCCP4Maps ( dimple_mtz,os.path.join(self.dimple_dir(),"final"),
                   "./",self.file_stdout,self.file_stderr,"refmac",None )

            nResults = 1
            self.mk_std_streams ( None )
            refmac_pattern = "refmac5"
            with open(os.path.join(self.dimple_dir(),self.file_stdout_path()),'r') as logf:
                for line in logf:
                    if line.find(refmac_pattern)>=0:
                        list = filter ( None,line.replace("/"," ").split() )
                        rfree = float(list[len(list)-1])

            self.putMessage ( "<h2><i>Solution found</i></h2>" )
            dfpath = os.path.join ( "..",self.outputdir,self.dimple_dir(),"dimple" )
            self.putStructureWidget ( "Structure and density map",
                                    [ dfpath+".pdb",dfpath+".mtz",dfpath+".map",
                                      dfpath+"_dmap.map" ],-1 )

        else:
            dimple_xyz = ""

        columns = {
          "F"    : self.hkl.Fmean.value,
          "SIGF" : self.hkl.Fmean.sigma,
          "FREE" : self.hkl.FREE,
          "PHI"  : "PHIC_ALL_LS",
          "FOM"  : "FOM"
        }

        quit_message = self.saveResults ( "Dimple",self.dimple_dir(),nResults,
                rfree,"dimple", dimple_xyz,dimple_mtz,dimple_map,dimple_dmap,
                columns )

        self.quit_branch ( branch_data,"Homologue Molecular Replacement (Dimple): " +
                                       quit_message )

        return self.dimple_header_id()
