##!/usr/bin/python

#
# ============================================================================
#
#    10.11.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  AIMLESS EXECUTABLE MODULE
#
#  Command-line:
#     ccp4-python aimless.py exeType jobDir jobId
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
import uuid
import glob

#  ccp4-python imports
import pyrvapi

#  application imports
import basic
from   pycofe.proc      import datred_utils, import_merged
from   pycofe.i2reports import aimless_pipe as i2report


# ============================================================================
# Make Aimless driver

class Aimless(basic.TaskDriver):

    # make task-specific definitions
    def pointless_xml   (self):  return "pointless.xml"
    def pointless_mtz   (self):  return "pointless.mtz"
    def pointless_report(self):  return "pointless_report"
    def aimless_xml     (self):  return "aimless.xml"
    def aimless_report  (self):  return "aimless_report"
    def ctruncate_mtz   (self):  return "merged.mtz"
    def ctruncate_report(self):  return "ctruncate_report"
    def symm_det        (self):  return "symm_det_table"

    # the following will provide for import of generated HKL dataset(s)
    def importDir        (self):  return "./"   # import from working directory
    def import_summary_id(self):  return None   # don't make summary table

    def ccp4i2_report_id (self):  return "ccp4i2_report"

    # ------------------------------------------------------------------------

    def run(self):

        # fetch input data
        ds0      = self.input_data.data.ds0[0]
        unmerged = self.makeClass ( self.input_data.data.unmerged )

        resMin   = self.getParameter ( self.task.parameters.sec1.contains.RESMIN  )
        resMax   = self.getParameter ( self.task.parameters.sec1.contains.RESMAX  )
        resCbx   = self.getParameter ( self.task.parameters.sec1.contains.RES_CBX )
        scaCbx   = self.getParameter ( self.task.parameters.sec1.contains.SCA_CBX )

        #self.file_stdout.write ( "$CCP4=" + str(os.environ["CCP4"]) )

        resMin = str(resMin).strip()
        resMax = str(resMax).strip()

        if resMin and resMax and float(resMin) <= float(resMax):
            resMin, resMax = resMax, resMin

        resLine = None
        if resMin or resMax:
            resLine = "RESOLUTION"
            if resMin:
                resLine += " LOW " + resMin

            if resMax:
                resLine += " HIGH " + resMax

        mtzRef      = os.path.join(self.inputDir(),ds0.files[0])
        symm_select = ds0.symm_select if ds0._type=="DataUnmerged" else None

        plist = [[ds.dataset,os.path.join(self.inputDir(),ds.files[0]),ds.runs] for ds in unmerged]
        format_list = [getattr(ds.dataset,'original_format','unknown') for ds in unmerged]
        #print >>self.file_stdout, 'input hkl formats:', format_list
        onlymerge = not sum([f != 'xds_scaled' for f in format_list])
        #print >>self.file_stdout, 'onlymerge:', onlymerge

        """
        self.file_stdout.write ( " ==============================================================================\n" )
        self.file_stdout.write ( str(symm_select) + "\n" )
        self.file_stdout.write ( " ==============================================================================\n" )
        self.file_stdout.write ( str(mtzRef) + "\n" )
        self.file_stdout.write ( " ==============================================================================\n" )
        self.file_stdout.write ( plist[0][0].to_JSON() + "\n" )
        self.file_stdout.write ( str(plist) + "\n" )
        self.file_stdout.write ( " ==============================================================================\n" )
        self.file_stdout.write ( str(scaCbx) + "\n" )
        self.file_stdout.write ( " ==============================================================================\n" )
        """

        script_list = datred_utils.get_point_script (
                            symm_select,mtzRef,plist,
                            self.pointless_mtz(),self.pointless_xml(),
                            self.file_stdout,scaCbx )

        if resLine and resCbx:
            script_list[0] += resLine + "\n"

        if len(script_list)==3:
            title = [ "<h3>1. Extracting selected images</h3>",
                      "<h3>2. Symmetry assignment</h3>",
                      "<h3>3. Generating symmetry tables</h3>" ]
        elif len(script_list)==2:
            title = [ "<h3>1. Extracting selected images and assigning symmetry</h3>",
                      "<h3>2. Generating symmetry tables</h3>" ]
        else:
            self.fail (
                "wrong number of pointless scripts: possible error in datred_utils.py",
                "wrong number of pointless scripts" )
            return

        n = 0
        for script in script_list:
            self.open_stdin()
            self.write_stdin ( script )
            self.close_stdin()

            self.putMessage ( title[n] )

            # Prepare report parser
            panel_id = self.pointless_report() + "_" + str(n)
            self.setGenericLogParser ( panel_id,True )

            self.runApp ( "pointless",[] )
            n += 1

        #self.putSection ( self.symm_det(),"Symmetry determination tables",True )
        pyrvapi.rvapi_add_section ( self.symm_det(),"Symmetry determination tables",
                                    panel_id,3,0,1,1,False )
        try:
            table_list = datred_utils.parse_xmlout(self.pointless_xml())
        except:
            self.fail(
                "failed parsing pointless xmlout: possible pointless failure",
                "failed parsing pointless xmlout" )
            return
        datred_utils.report(table_list, self.symm_det())

        # dump_keyargs = dict(sort_keys=True, indent=4, separators=(',', ': '))
        # print json.dumps(datred_utils.tabs_as_dict(tab_list), **dump_keyargs)

        self.open_stdin()
        if resLine and not resCbx:
            self.write_stdin ( resLine + "\n" )

        if onlymerge:
            self.write_stdin ( "ONLYMERGE\n" )

        self.write_stdin ( "XMLOUT " + self.aimless_xml() + "\n" )
        self.write_stdin ( "END\n" )
        self.close_stdin()

        self.putMessage ( "<h3>" + str(n+1) + ". Scaling and merging</h3>" )
        self.setGenericLogParser ( self.aimless_report(),True )

        self.runApp ( "aimless",[ "HKLIN",self.pointless_mtz(),"HKLOUT",
                                          self.getMTZOFName() ] )

        # ====================================================================
        # do individual data type imports

        self.putTitle ( "Results" )

        # get list of files to import
        output_ok = True
        if scaCbx and (len(unmerged)>1):
            self.files_all = []
            for i in range(len(unmerged)):
                file_i = "aimless_" + str(i+1) + ".mtz"
                if os.path.isfile(file_i):
                    self.files_all += [ file_i ]

                else:
                    output_ok = False
                    break

            if output_ok:
                import_merged.run ( self )

        else:
            file_i = self.getMTZOFName()
            if os.path.isfile(file_i):
                self.files_all = [ file_i ]
                import_merged.run ( self,"Reflection dataset" )

            else:
                output_ok = False

        """
        #
        #  DOES NOT WORK. Throws errors from i2 jscripts, which are absorbed on
        #  localhost but not when served remotely. Possible reason in different
        #  jquery versions between jCoFE and i2, this was not fully investigated.
        #
        # i2 html report
        #
        # (1) copy directory $CCP4/share/ccp4i2/docs/report_files/ to
        #     'js-lib/ccp4i2_support/'
        # (2) remove the next line of code and uncomment the second next line of code
        # (3) html-report relative path: report/aimless_pipe.html
        #
        #i2htmlbase = os.path.join('file://' + i2report.i2top, 'docs', 'report_files')
        i2htmlbase = 'ccp4i2_support'
        i2xml_dict = dict()
        i2xml_dict['pointless'] = 'pointless.xml'
        i2xml_dict['aimless'] = 'aimless.xml'
        i2xml_dict['ctruncate'] = glob.glob('ctruncate*.xml')
        i2xml_tmp = 'aimless_pipe.xml'
        i2html = os.path.join ( 'report','aimless_pipe.html' )
        try:
            i2report.write_html ( i2htmlbase, i2xml_dict, i2xml_tmp, i2html )

            pyrvapi.rvapi_insert_tab ( self.ccp4i2_report_id(),"CCP4i2 Report",
                                       self.log_page_id(),False )
            pyrvapi.rvapi_set_text   ( "<object data='aimless_pipe.html' " +
                    "style='border:none;width:1000px;height:30000px;' " +
                    "></object>",
                                       self.ccp4i2_report_id(),0,0,1,1 )

        except Exception, e:
            self.file_stdout.write('i2 report has not been generated')
            self.file_stderr.write('i2 report has not been generated')
        """

        # close execution logs and quit

        if output_ok:
            self.success()
        else:
            self.file_stdout.write('Aimles has faild, see above.')
            self.fail ( 'Aimless hass faild, see end of Log file for details',
                        'Aimless_Failed' )
        return


# ============================================================================

if __name__ == "__main__":

    drv = Aimless ( "Data Reduction with Aimless",os.path.basename(__file__) )
    drv.run()
