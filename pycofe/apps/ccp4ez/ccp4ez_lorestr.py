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

        self.putMessage       ( "&nbsp;" )
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

        # prepare data
        meta    = self.output_meta["results"][datadir]
        columns = meta["columns"]

        lorestr_xyz  = os.path.join ( self.lorestr_dir(),"lorestr.pdb" )
        lorestr_mtz  = os.path.join ( self.lorestr_dir(),"lorestr.mtz" )
        lorestr_map  = os.path.join ( self.lorestr_dir(),"lorestr.map" )
        lorestr_dmap = os.path.join ( self.lorestr_dir(),"lorestr.diff.map" )

        cmd = [ "-p1",meta["pdb"],
                "-f" ,meta["mtz"],
                "-save_space",
                "-xyzout",lorestr_xyz,
                "-hklout",lorestr_mtz,
                "-labin" ,"FP="     + columns["F"]    +
                          " SIGFP=" + columns["SIGF"] +
                          " FREE="  + columns["FREE"],
                "-auto"
              ]

        """
        if self.getParameter(self.task.parameters.sec1.contains.PDB_CBX)=="True":
            cmd += [ "-auto" ]

        minres = self.getParameter(self.task.parameters.sec1.contains.MINRES)
        if minres:
            cmd += [ "-minres",minres ]

        if self.getParameter(self.task.parameters.sec1.contains.DNA_CBX)=="True":
            cmd += [ "-dna" ]

        if self.getParameter(self.task.parameters.sec1.contains.MR_CBX)=="True":
            cmd += [ "-mr" ]
        """

        #cmd += ["-xml","lorestr.xml"]

        # Start lorestr
        self.setGenericLogParser ( True )
        self.runApp ( "lorestr",cmd )
        self.unsetLogParser()

        # check solution and register data
        nResults     = 0
        rfree        = 1.0
        quit_message = ""
        if os.path.isfile(lorestr_xyz):

            edmap.calcCCP4Maps ( lorestr_mtz,os.path.join(self.lorestr_dir(),"lorestr"),
                        "./",self.file_stdout,self.file_stderr,"refmac",None )

            nResults = 1
            self.mk_std_streams ( None )
            rfree_pattern = "Rfree (before/after):"
            with open(os.path.join(self.lorestr_dir(),self.file_stdout_path()),'r') as logf:
                for line in logf:
                    if line.find(rfree_pattern)>=0:
                        list = filter ( None,line.split() )
                        rfree = float(list[len(list)-1])

            self.putMessage ( "<h2><i>Refined solution</i></h2>" )
            dfpath = os.path.join ( "..",self.outputdir,self.lorestr_dir(),"lorestr" )
            self.putStructureWidget ( "Structure and density map",
                                    [ dfpath+".pdb",dfpath+".mtz",dfpath+".map",
                                      dfpath+"_dmap.map" ],-1 )

            quit_message = "refined to <i>R<sub>free</sub>=" + str(rfree) + "</i>"

        else:
            lorestr_xyz  = ""
            quit_message = "FAILED."

        lorestr_columns = {
          "F"    : columns["F"],
          "SIGF" : columns["SIGF"],
          "FREE" : columns["FREE"],
          "PHI"  : "PHIC_ALL_LS",
          "FOM"  : "FOM"
        }


        self.saveResults ( "Lorestr",self.lorestr_dir(),nResults,
            rfree,"lorestr", lorestr_xyz,lorestr_mtz,lorestr_map,lorestr_dmap,
            lorestr_columns )

        self.quit_branch ( branch_data,"Refinement (Lorestr): " +
                                       quit_message )

        return self.lorestr_page_id()
