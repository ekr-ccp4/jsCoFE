##!/usr/bin/python

#
# ============================================================================
#
#    31.01.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  CCP4EZ Combined Auto-Solver
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017-2018
#
# ============================================================================
#
#
#  Invocation:
#     ccp4-python ccp4ez.py
#                 [--rvapi-prefix   jsrview]             \
#                 [--rdir           reportdir]           \
#                 [--rvapi-document rvapi_document]      \
#                 [--wkdir          workdir]             \
#                 [--outdir         outputdir]           \
#                 [--jobid          id]                  \
#                 [--sge]                                \
#                 [--qname          name]                \
#                 [--njobs          N]
#
#  Input file:
#
#  HKLIN  mtzpath
#  SEQIN  seqpath
#  XYZIN  xyzpath
#  HATOMS type [number]
#
#  Metadata in rvapi document (will be overwritten by equivalent command-line
#  parameters if they are given):
#
#  { "jobId"         : jobId,         // used for naming output files
#    "stageNo"       : stageNo,       // starting stage number for report sections
#    "sge_q"         : queueName,     // used in MoRDa
#    "sge_tc"        : nSubJobs,      // used in MoRDa
#    "summaryTabId"  : summaryTabId,  // if tab created by calling process
#    "summaryTabRow" : summaryTabRow, // if tab created by calling process
#    "navTreeId"     : navTreeId,     // navigation tree id
#    "outputDir"     : outputDir,     // path for placing final output files
#    "outputName"    : outputName     // name template (no extension) for final
#                                     // output files
#  }
#

import ccp4ez_lorestr

# ============================================================================

class CCP4ez(ccp4ez_lorestr.Lorestr):

    #def summary_page_id  (self):  return "ccp4ez_summary_tab"

    # ----------------------------------------------------------------------

    def run(self):

        #cursor0 = self.addTab ( self.summary_page_id(),"Summary",True )
        #self.putMessage ( "<h2>CCP4 Easy (Combined Automated Structure Solution)</h2>" )
        #self.putMessage ( "<h3><i>Structure solution in progress ...</i></h3>" )

        branch_id = self.prepare_mtz ( "" )

        if not self.output_meta["retcode"]:
            self.dimple ( "" )

        #if self.output_meta["retcode"] != "solved":
        #    self.simbad12 ( "" )

        if self.output_meta["retcode"] != "solved":
            self.morda ( "" )

        if self.output_meta["retcode"] != "solved":
            self.crank2 ( "" )

        dirname = ""
        rfree   = 2.0
        results = self.output_meta["results"]
        for d in results:
            if results[d]["nResults"]>0:
                if results[d]["rfree"]<rfree:
                    rfree   = results[d]["rfree"]
                    dirname = d

        if d:
            #self.lorestr   ( d,"" )
            self.buccaneer ( d,"" )
            self.lorestr   ( self.buccaneer_dir(),"" )

        #self.page_cursor[1] -= 1
        #self.putMessage ( "<h3><i>Structure solution workflow completed.</i></h3>" )

        self.write_meta()
        return


# ============================================================================

if __name__ == '__main__':

    ccp4ez = CCP4ez()
    ccp4ez.run()
