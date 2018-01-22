##!/usr/bin/python

#
# ============================================================================
#
#    29.12.17   <--  Date of Last Modification.
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

import ccp4ez_morda

# ============================================================================

class Crank2(ccp4ez_morda.MoRDa):

    def crank2_header_id(self):  return "ccp4ez_crank2_header_tab"
    def crank2_page_id  (self):  return "ccp4ez_crank2_tab"
    def crank2_logtab_id(self):  return "ccp4ez_crank2_log_tab"
    def crank2_errtab_id(self):  return "ccp4ez_crank2_err_tab"

    def crank2_dir      (self):  return "crank2data"

    # ----------------------------------------------------------------------

    def crank2 ( self,mtz_branch_id ):

        branch_data = self.start_branch ( "Auto-EP",
                        "Automated Experimental Phasing",
                        self.crank2_dir      (),mtz_branch_id,
                        self.crank2_header_id(),self.crank2_logtab_id(),
                        self.crank2_errtab_id() )

        # check data availability

        na_message = ""
        if not self.hkl.Fpm and not self.hkl.Ipm:
            na_message = "no anomalous data"
        if not self.seqpath:
            if na_message:
                na_message += " and "
            na_message += "no sequence data"
        if na_message:
            self.end_branch ( branch_data,"not attempted",
                        "Automated EP not attempted because " + na_message +
                        " are given." )
            return


        # make report tab

        cursor2 = self.insertTab ( "results_tab","Report",
                                   self.crank2_logtab_id(),True )
        self.putMessage ( "<h2>Automated Experimental Phasing with Crank-2</h2>" )

        # write input script

        self.open_script ( "crank2" )

        if self.hkl.Ipm:
            self.write_script ( "fsigf plus dname=peak file=" + self.mtzpath +
                                      " i=" + self.hkl.Ipm.plus.value  +
                                   " sigi=" + self.hkl.Ipm.plus.sigma  + "\n"
                "fsigf minus dname=peak i=" + self.hkl.Ipm.minus.value +
                                   " sigi=" + self.hkl.Ipm.minus.sigma + "\n" )
        else:
            self.write_script ( "fsigf plus dname=peak file=" + self.mtzpath +
                                      " f=" + self.hkl.Fpm.plus.value  +
                                   " sigf=" + self.hkl.Fpm.plus.sigma  + "\n"
                "fsigf minus dname=peak f=" + self.hkl.Fpm.minus.value +
                                   " sigf=" + self.hkl.Fpm.minus.sigma + "\n" )

        exp_num_atoms = ""
        if self.ha_number>0:
            exp_num_atoms = " exp_num_atoms=" + str(self.ha_number)

        self.write_script (
            "target::SAD\n"
            "model substr atomtype=" + self.ha_type + exp_num_atoms + " d_name=peak\n"
            "sequence solvent_content=0.5 file=" + self.seqpath + "\n"
            "createfree no_output_to_next_step::True\n"
            "faest\n"
            "substrdet\n"
            "refatompick\n"
            "handdet\n"
            "dmfull\n"
            "comb_phdmmb exclude obj_from=0,typ=freeR mb buccaneer\n"
            "ref target::MLHL exclude obj_from=0,typ=freeR\n"
        )

        self.close_script()


        # save rvapi document
        self.storeReportDocument ( "" )

        # make command-line parameters

        #crank2_xyz  = os.path.join ( self.crank2_dir(),self.output_xyz )
        #crank2_mtz  = os.path.join ( self.crank2_dir(),self.output_mtz )

        crank2_xyz = "crank2.xyz"
        crank2_mtz = "crank2.mtz"

        cmd = [
            os.path.join(os.environ["CCP4"],"share","ccp4i","crank2","crank2.py"),
            "--xyzout"          ,crank2_xyz,
            "--hklout"          ,crank2_mtz,
            "--dirout"          ,"report",
            "--rvapi-viewer"    ,"0",
            "--rvapi-uri-prefix","./",
            "--rvapi-document"  ,os.path.join(self.workdir,self.rvapi_doc_path),
            "--rvapi-no-tree"
        ]

        # run crank-2

        self.runApp ( "ccp4-python",cmd )
        self.restoreReportDocument()

        self.end_branch ( branch_data,"no solution found" )


        """
         ccp4-python \
              '/Applications/ccp4-7.0/share/ccp4i/crank2/crank2.py' '--xyzout'         \
              '/Users/eugene/Projects/jsCoFE/cofe-nc-storage/jobs/job_955/output/0139-01_crank2.pdb'  \
              '--hklout'                                                               \
              '/Users/eugene/Projects/jsCoFE/cofe-nc-storage/jobs/job_955/output/0139-01_crank2.mtz'  \
              '--dirout' 'report' '--rvapi-viewer' '0' '--rvapi-uri-prefix' './'       \
              '--rvapi-document'                                                       \
              '/Users/eugene/Projects/jsCoFE/cofe-nc-storage/jobs/job_955/rvapi_document'  \
              '--rvapi-no-tree'

        --------------------------------------------------------------------------------
        ## KEYWORD INPUT:

        fsigf plus dname=peak file=input/0093-01.mtz i=I(+) sigi=SIGI(+)
        fsigf minus dname=peak i=I(-) sigi=SIGI(-)
        target::SAD
        model substr atomtype=Se d_name=peak
        sequence monomers_asym=1 solvent_content=0.5618624 file=crank2.seq
        createfree no_output_to_next_step::True
        faest
        substrdet
        refatompick
        handdet
        dmfull
        comb_phdmmb exclude obj_from=0,typ=freeR mb buccaneer
        ref target::MLHL exclude obj_from=0,typ=freeR
        """
        #
        """
        morda_xyz  = os.path.join ( self.morda_dir(),self.output_xyz )
        morda_mtz  = os.path.join ( self.morda_dir(),self.output_mtz )
        morda_map  = os.path.join ( self.morda_dir(),self.output_map )
        morda_dmap = os.path.join ( self.morda_dir(),self.output_dmap )

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
        """

        return
