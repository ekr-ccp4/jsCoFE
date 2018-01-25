##!/usr/bin/python

#
# ============================================================================
#
#    28.12.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  CCP4EZ Combined Auto-Solver Prepare MTZ class
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

import ccp4ez_base

# ============================================================================

class PrepareMTZ(ccp4ez_base.Base):

    #def mtz_header_id(self):  return "ccp4ez_mtz_header_tab"
    def mtz_page_id  (self):  return "ccp4ez_mtz_tab"
    def mtz_logtab_id(self):  return "ccp4ez_mtz_log_tab"
    def mtz_errtab_id(self):  return "ccp4ez_mtz_err_tab"

    def datared_dir  (self):  return "datared"
    def joined_mtz   (self):  return os.path.join(self.datared_dir(),"joined_tmp.mtz")
    def junk_mtz     (self):  return os.path.join(self.datared_dir(),"junk.mtz")
    def junk_xml     (self):  return os.path.join(self.datared_dir(),"junk.xml")
    def pointless_mtz(self):  return os.path.join(self.datared_dir(),"pointless.mtz")
    def pointless_xml(self):  return os.path.join(self.datared_dir(),"pointless.xml")
    def aimless_mtz  (self):  return os.path.join(self.datared_dir(),"aimless.mtz")
    def aimless_xml  (self):  return os.path.join(self.datared_dir(),"aimless.xml")
    def freer_mtz    (self):  return os.path.join(self.datared_dir(),"freer.mtz")
    def merged_mtz   (self):  return os.path.join(self.datared_dir(),"merged.mtz")
    def ctruncate_xml(self):  return os.path.join(self.datared_dir(),"ctruncate.xml")

    def symm_det     (self):  return "symm_det_table"

    # ----------------------------------------------------------------------

    def prepare_mtz ( self,tree_branch_id ):

        branch_data = None

        # check input data

        if not self.hklpath:
            self.stderr ( " *** reflection file not given -- stop.\n" )
            self.output_meta["retcode"] = "[02-001] hkl file not given"
            self.write_meta()
            return ""

        if not os.path.isfile(self.hklpath):
            self.stderr ( " *** reflection file does not exist -- stop.\n" )
            self.output_meta["retcode"] = "[02-002] hkl file not found"
            self.write_meta()
            return ""

        mf = mtz.mtz_file ( self.hklpath,None )
        #mf.prn()
        if len(mf)<=0:
            self.stderr ( " *** reflection file is empty -- stop.\n" )
            self.output_meta["retcode"] = "[02-003] hkl file empty"
            self.write_meta()
            return ""

        self.input_hkl = mf[0]
        #print " name=" + self.input_hkl.name
        #self.input_hkl.prn()
        if mf.is_merged():
            self.hkl     = self.input_hkl
            self.mtzpath = self.hklpath
            self.stdout ( " ... given reflections are merged\n" )
            #self.putMessageLF ( "<b>" + str(self.stage_no) +
            #                    ". Refection data is merged -- no " +
            #                    "scaling and merging<b>" )
            return ""


        # reflections should be merged, use pointless - aimless pipeline

        self.putWaitMessageLF ( "<b>" + str(self.stage_no+1) +
                                ". Scaling and Merging</b>" )

        branch_data = self.start_branch ( "Scaling and Merging",
                                "CCP4ez Automated Structure Solver: Scaling and Merging",
                                self.datared_dir  (),tree_branch_id,
                                self.mtz_page_id  (),self.mtz_logtab_id(),
                                self.mtz_errtab_id() )

        #self.putMessage ( "<h2>Data Reduction with Aimless</h2>" )
        self.putMessage ( "<h3>1. Extracting images</h3>" )

        self.open_script  ( "pointless1" )
        #self.write_script ( "NAME PROJECT " + self.input_hkl.PROJECT +\
        #                    " CRYSTAL " + self.input_hkl.CRYSTAL +\
        #                    " DATASET 1\n"  )
        self.write_script ( "NAME PROJECT x CRYSTAL y DATASET z\n"  )
        self.write_script ( "HKLIN " + self.hklpath + "\n" )

        for i in range(len(mf.BRNG)):
            self.write_script ( "RUN 1 FILE 1 BATCH " + str(mf.BRNG[i][0]) +
                                " to " + str(mf.BRNG[i][1]-1) + "\n" )

        self.write_script ( "LAUEGROUP HKLIN\n"
                            "SPACEGROUP HKLIN\n"
                            "HKLOUT " + self.joined_mtz() + "\n" )
        self.close_script ()

        self.setGenericLogParser ( True )
        self.runApp ( "pointless",[] )

        self.putMessage   ( "<h3>2. Symmetry assignment</h3>" )

        self.open_script  ( "pointless2" )
        self.write_script ( "HKLIN  " + self.joined_mtz()    + "\n"
                            "HKLOUT " + self.pointless_mtz() + "\n"
                            "XMLOUT " + self.junk_xml()      + "\n" )
        self.close_script ()

        self.setGenericLogParser ( True )
        self.runApp ( "pointless",[] )

        self.putMessage   ( "<h3>3. Generating symmetry tables</h3>" )

        self.open_script  ( "pointless3" )
        self.write_script ( "HKLIN  " + self.pointless_mtz() + "\n"
                            "HKLOUT " + self.junk_mtz()      + "\n"
                            "XMLOUT " + self.pointless_xml() + "\n" )
        self.close_script ()

        panel_id = self.setGenericLogParser ( True )
        self.runApp ( "pointless",[] )

        cursor = self.setOutputPage ( [panel_id,3] )
        self.putSection ( self.symm_det(),"Symmetry determination tables",False )
        try:
            table_list = datred_utils.parse_xmlout ( self.pointless_xml() )
        except:
            self.fail(
                "failed parsing pointless xmlout: possible pointless failure",
                "failed parsing pointless xmlout" )
            self.output_meta["retcode"] = "[02-004] pointless failure"
            self.write_meta()
            self.end_branch ( branch_data,"Data Scaling and Merging failed",
                                          "pointless failure" )
            return ""
        datred_utils.report ( table_list,self.symm_det() )
        self.setOutputPage ( cursor )

        self.putMessage   ( "<h3>4. Scaling and merging</h3>" )

        self.open_script  ( "aimless" )
        self.write_script ( "XMLOUT " + self.aimless_xml() + "\n"
                            "END\n" )
        self.close_script ()

        self.setGenericLogParser ( True )
        self.runApp ( "aimless",[ "HKLIN" ,self.pointless_mtz(),
                                  "HKLOUT",self.aimless_mtz() ] )
        self.unsetLogParser()

        #  checking merged file
        if not os.path.isfile(self.aimless_mtz()):
            self.stderr ( " *** reflection file does not exist -- stop.\n" )
            self.output_meta["retcode"] = "[02-005] aimless failure"
            self.write_meta()
            self.end_branch ( branch_data,"Data Scaling and Merging failed",
                                          "aimless failure" )
            return ""

        # add free R-flag

        self.open_script  ( "freerflag" )
        self.write_script ( "UNIQUE\n" )
        self.close_script ()
        self.runApp ( "freerflag",[ "HKLIN" ,self.aimless_mtz(),
                                    "HKLOUT",self.freer_mtz() ] )

        #  checking output file
        if not os.path.isfile(self.freer_mtz()):
            self.stderr ( " *** reflection file does not exist -- stop.\n" )
            self.output_meta["retcode"] = "[02-006] failed to add free R-flag to merged hkl"
            self.write_meta()
            self.end_branch ( branch_data,"Data Scaling and Merging failed",
                                          "freerflag failure" )
            return ""

        # truncate merged file

        self.putMessage ( "<h3>5. Data analysis</h3>" )

        mf = mtz.mtz_file ( self.freer_mtz(),None )
        #mf.prn()

        cmd = [ "-hklin" ,self.freer_mtz(),
                "-hklout",self.merged_mtz(),
                "-colin" ,"/*/*/[IMEAN,SIGIMEAN]" ]
        try:
            Ipm = mf[0].Ipm
            if Ipm:
                cmd += [ "-colano", "/*/*/[" + Ipm.plus.value  + "," +
                                               Ipm.plus.sigma  + "," +
                                               Ipm.minus.value + "," +
                                               Ipm.minus.sigma + "]" ]
        except:
            pass

        cmd += [ "-xmlout",self.ctruncate_xml(), "-freein" ]

        self.setGenericLogParser ( True )
        self.runApp ( "ctruncate",cmd )

        #  checking output file
        if not os.path.isfile(self.merged_mtz()):
            self.stderr ( " *** reflection file does not exist -- stop.\n" )
            self.output_meta["retcode"] = "[02-007] failed to truncate hkl"
            self.write_meta()
            self.end_branch ( branch_data,"Data Scaling and Merging failed",
                                          "ctruncate failure" )
            return ""

        # get merged file metadata

        self.mtzpath = self.merged_mtz()
        mf = mtz.mtz_file ( self.mtzpath,None )
        if len(mf)<=0:
            self.stderr ( " *** reflection file is empty -- stop.\n" )
            self.output_meta["retcode"] = "[02-008] truncated hkl file empty"
            self.write_meta()
            self.end_branch ( branch_data,"Data Scaling and Merging failed",
                                          "empty merged file" )
            return ""

        self.hkl = mf[0]
        #mf.prn()
        self.stdout ( "\n\n ... merged hkl file created\n\n" )

        self.putMessage ( "<h3>Success</h3>" )

        pyrvapi.rvapi_add_data ( "merged_data_widget_id","Merged reflections",
                                 # always relative to job_dir from job_dir/html
                                 os.path.join("../",self.mtzpath),"hkl:hkl",
                                 self.page_cursor[0],self.page_cursor[1],
                                 0,1,1,-1 )

        self.quit_branch ( branch_data,"Refection data scaled and merged" )

        return self.mtz_page_id()
