##!/usr/bin/python

#
# ============================================================================
#
#    20.12.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  CCP4EZ Combined Auto-Solver MoRDa module
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017
#
# ============================================================================
#

import os

#  ccp4-python imports
import pyrvapi
import pyrvapi_ext.parsers

import mtz
import datred_utils

import ccp4ez_simbad12

# ============================================================================

class MoRDa(ccp4ez_simbad12.Simbad12):

    def morda_header_id(self):  return "ccp4ez_morda_header_tab"
    def morda_page_id  (self):  return "ccp4ez_morda_tab"
    def morda_logtab_id(self):  return "ccp4ez_morda_log_tab"
    def morda_errtab_id(self):  return "ccp4ez_morda_err_tab"

    def morda_dir      (self):  return "mordadata"

    # ----------------------------------------------------------------------

    def morda ( self,mtz_branch_id ):

        branch_data = self.start_branch ( "Auto-MR",
                        "Automated Molecular Replacement",
                        self.morda_dir      (),mtz_branch_id,
                        self.morda_header_id(),self.morda_logtab_id(),
                        self.morda_errtab_id() )

        if not self.seqpath:
            self.end_branch ( branch_data,"not attempted",
                              "Automated MR not attempted because no sequence "
                              "data are given." )
            return

        morda_xyz  = os.path.join ( self.morda_dir(),self.output_xyz )
        morda_mtz  = os.path.join ( self.morda_dir(),self.output_mtz )
        morda_map  = os.path.join ( self.morda_dir(),self.output_map )
        morda_dmap = os.path.join ( self.morda_dir(),self.output_dmap )

        self.flush()
        self.storeReportDocument (
            '{ "jobId"     : "' + self.jobId              + '",' +
            '  "logTabId"  : "' + self.morda_logtab_id()  + '",' +
            '  "name_xyz"  : "' + morda_xyz               + '",' +
            '  "name_mtz"  : "' + morda_mtz               + '",' +
            '  "name_map"  : "' + morda_map               + '",' +
            '  "name_dmap" : "' + morda_dmap              + '",' +
            '  "sge_q"     : "' + self.queueName          + '",' +
            '  "sge_tc"    : "' + str(self.nSubJobs)      + '",' +
            '  "subjobs"   : "subjobs" ' +
            '}'
        )

        # make command-line parameters for morda_sge.py
        cmd = [ "-m","morda",
                "--sge" if self.SGE else "--mp",
                "-f",self.mtzpath,
                "-s",self.seqpath,
                "-d",self.rvapi_doc_path,
                #"-a",
                "-n","1"
              ]

        #if self.task.parameters.sec1.contains.NMODELS.value:
        #    cmd = cmd + [ "-n",str(self.task.parameters.sec1.contains.NMODELS.value) ]

        # run morda
        self.runApp ( "ccp4-python",cmd )

        self.restoreReportDocument()

        #  MoRDa puts final files in "output" directory, so update our paths
        morda_xyz = os.path.join ( self.outputdir,morda_xyz )

        # check for solution
        morda_meta = {}
        if os.path.isfile(morda_xyz):
            self.output_meta["retcode"] = "solved"     # solution
            f = open ( os.path.join(self.outputdir,"morda.res") )
            flines = f.readlines()
            f.close()
            rfree = float(flines[1])
            morda_meta["nResults"] = 1
            morda_meta["rfree"] = rfree
            morda_meta["pdb"]   = morda_xyz
            morda_meta["mtz"]   = os.path.join ( self.outputdir,morda_mtz )
            morda_meta["map"]   = os.path.join ( self.outputdir,morda_map )
            morda_meta["dmap"]  = os.path.join ( self.outputdir,morda_dmap )
            if self.output_meta["best"]:
                if rfree < self.output_meta[self.output_meta["best"]]["rfree"]:
                    self.output_meta["best"] = "morda"
            else:
                self.output_meta["best"] = "morda"
            self.output_meta["morda"] = morda_meta
            self.end_branch ( branch_data,"solution found" )

        else:
            self.output_meta["retcode"] = "not solved" # no solution
            morda_meta["nResults"] = 0
            self.output_meta["morda"] = morda_meta
            self.end_branch ( branch_data,"no solution found" )

        return
