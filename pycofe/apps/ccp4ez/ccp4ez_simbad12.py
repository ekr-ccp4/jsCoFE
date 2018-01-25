##!/usr/bin/python

#
# ============================================================================
#
#    22.01.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  CCP4EZ Combined Auto-Solver Simbad stages 1 and 2 class
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017-2018
#
# ============================================================================
#

import os
import json
import shutil

#  ccp4-python imports
import pyrvapi
import pyrvapi_ext.parsers

import mtz
import datred_utils

import ccp4ez_mtz

# ============================================================================

class Simbad12(ccp4ez_mtz.PrepareMTZ):

    #def simbad12_header_id(self):  return "ccp4ez_simbad12_header_tab"
    def simbad12_summary_id(self):  return "summary_tab"
    def simbad12_page_id   (self):  return "ccp4ez_simbad12_tab"
    def simbad12_logtab_id (self):  return "ccp4ez_simbad12_log_tab"
    def simbad12_errtab_id (self):  return "ccp4ez_simbad12_err_tab"

    def simbad12_dir      (self):  return "simbad12"

    # ----------------------------------------------------------------------

    def get_best_rfree ( self,dirpath,filename ):
        if os.path.isdir(dirpath):
            filepath = os.path.join ( dirpath,filename )
            if os.path.isfile(filepath):
                f = open ( filepath,"r" )
                lines = f.readlines()
                f.close()
                if len(lines)>=2:
                    return float(lines[1].strip().split(",")[4])
        return 10.0

    # ----------------------------------------------------------------------

    def simbad12 ( self,mtz_branch_id ):

        self.putWaitMessageLF ( "<b>" + str(self.stage_no+1) +
                                ". Lattice and Contaminant Searches</b>" )

        branch_data = self.start_branch ( "DB Searches",
                        "CCP4ez Automated Structure Solver: Lattice and " +
                        "Contaminant Searches",
                        self.simbad12_dir       (),mtz_branch_id,
                        self.simbad12_summary_id(),self.simbad12_logtab_id(),
                        self.simbad12_errtab_id() )

        # store document before making command line, because document name
        # can be changed by the framework
        self.storeReportDocument ( self.simbad12_logtab_id() )
        self.flush()

        # Prepare simbad input -- script file
        cmd = [ "-nproc"          ,"1",
                "-F"              ,self.hkl.Fmean.value,
                "-SIGF"           ,self.hkl.Fmean.sigma,
                "-FREE"           ,self.hkl.FREE,
                "-pdb_db"         ,os.environ["PDB_DIR"],
                "--display_gui"   ,
                "-webserver_uri"  ,"jsrview",
                "-work_dir"       ,"./",
                "-rvapi_document" ,self.rvapi_doc_path,
                self.mtzpath
              ]

        # run simbad
        self.runApp ( "simbad",cmd )
        self.setOutputPage ( branch_data["cursor1"] )
        rvapi_meta = self.restoreReportDocument()

        """
        { "nResults": 1,
          "results": [
            { "mtz": "../latt/mr_lattice/1DTX/mr/molrep/refine/1DTX_refinement_output.mtz",
              "source": "latt",
              "dmap": "../latt/mr_lattice/1DTX/mr/molrep/refine/1DTX_refmac_fofcwt.map",
              "best": true,
              "map": "../latt/mr_lattice/1DTX/mr/molrep/refine/1DTX_refmac_2fofcwt.map",
              "pdb": "../latt/mr_lattice/1DTX/mr/molrep/refine/1DTX_refinement_output.pdb",
              "rank": 1,
              "name": "1DTX"
             }
          ]
        }
        """

        simbad_meta = None
        if rvapi_meta:
            try:
                simbad_meta = json.loads ( rvapi_meta )
            except:
                self.putMessage ( "<b>Program error:</b> <i>unparseable metadata from Simbad</i>" +
                                  "<p>'" + rvapi_meta + "'" )
                self.page_cursor[1] -= 1
        else:
            self.putMessage ( "<b>Program error:</b> <i>no metadata from Simbad</i>" )
            self.page_cursor[1] -= 1

        rfree = min ( self.get_best_rfree ( "latt","lattice_mr.csv" ),
                      self.get_best_rfree ( "cont","cont_mr.csv" ) )

        if simbad_meta:

            simbad_meta["rfree"] = rfree
            self.output_meta["simbad12"] = simbad_meta

            if simbad_meta["nResults"] > 0:

                simbad12dir = "simbad12"
                sdir = os.path.join ( self.workdir,self.outputdir,simbad12dir )
                if not os.path.isdir(sdir):
                    os.mkdir ( sdir )

                simbad_xyz  = os.path.join ( self.outputdir,simbad12dir,self.outputname+".pdb" )
                simbad_mtz  = os.path.join ( self.outputdir,simbad12dir,self.outputname+".mtz" )
                simbad_map  = os.path.join ( self.outputdir,simbad12dir,self.outputname+".map" )
                simbad_dmap = os.path.join ( self.outputdir,simbad12dir,self.outputname+"_dmap.map" )

                meta = simbad_meta["results"][0]
                shutil.copy2 ( os.path.join(self.reportdir,meta["pdb"]),simbad_xyz )
                shutil.copy2 ( os.path.join(self.reportdir,meta["mtz"]),simbad_mtz )
                shutil.copy2 ( os.path.join(self.reportdir,meta["map"]),simbad_map )
                shutil.copy2 ( os.path.join(self.reportdir,meta["dmap"]),simbad_dmap )

                simbad_meta["pdb"]  = simbad_xyz
                simbad_meta["mtz"]  = simbad_mtz
                simbad_meta["map"]  = simbad_map
                simbad_meta["dmap"] = simbad_dmap

                self.output_meta["best"] = "simbad12"

                #self.page_cursor[1] -= 1
                if rfree < 0.4:
                    self.output_meta["retcode"] = "solved"     # solution
                    self.quit_branch ( branch_data,"Lattice and Contaminant " +
                                        "Searches (Simbad): solution found" )
                elif rfree < 0.45:
                    self.output_meta["retcode"] = "candidate"  # possible solution
                    self.quit_branch ( branch_data,"Lattice and Contaminant " +
                                    "Searches (Simbad): possible solution found" )
                else:
                    self.output_meta["retcode"] = "not solved" # no solution
                    self.quit_branch ( branch_data,"Lattice and Contaminant " +
                                    "Searches (Simbad): no solution found" )
            else:
                self.output_meta["retcode"] = "not solved" # no solution
                self.quit_branch ( branch_data,"Lattice and Contaminant " +
                                "Searches (Simbad): no solution found" )

        else:
            simbad_meta = {}
            simbad_meta["nResults"] = 0
            simbad_meta["rfree"] = rfree
            self.page_cursor[1] -= 1
            self.output_meta["retcode"]  = "errors"
            self.output_meta["simbad12"] = simbad_meta
            self.quit_branch ( branch_data,"Lattice and Contaminant " +
                                "Searches (Simbad): errors encountered" )
            #self.end_branch ( branch_data,"errors" )

        return self.simbad12_summary_id()
