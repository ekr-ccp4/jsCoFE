##!/usr/bin/python

#
# ============================================================================
#
#    06.02.18   <--  Date of Last Modification.
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
#                 [--njobs          N]                   \
#                 [--no-simbad12]                        \
#                 [--no-morda]                           \
#                 [--no-crank2]
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

import ccp4ez_fitligands

# ============================================================================

class CCP4ez(ccp4ez_fitligands.FitLigands):

    # ----------------------------------------------------------------------

    def getBestResults(self):
        dirname = ""
        rfree   = 2.0
        results = self.output_meta["results"]
        for d in results:
            if results[d]["nResults"]>0:
                if results[d]["rfree"]<rfree:
                    rfree   = results[d]["rfree"]
                    dirname = d
        return [dirname,rfree]

    def checkResult ( self,resdir,defdir,rfree ):
        results = self.output_meta["results"]
        d       = defdir
        r       = rfree
        if r<0.0:
            r = results["defdir"]
        if resdir in results:
            if results[resdir]["nResults"]>0:
                if results[resdir]["rfree"]<r:
                    d = resdir
        return d

    def run(self):

        branch_id = self.prepare_mtz ( "" )

        if not self.output_meta["retcode"]:
            self.dimple ( None,"dimple_mr","mr","" )

        if self.output_meta["retcode"] != "solved":
            self.simbad12 ( "" )

        if self.output_meta["retcode"] != "solved":
            self.morda ( "" )

        if self.output_meta["retcode"] != "solved":
            self.crank2 ( "" )

        res = self.getBestResults()
        d   = res[0]

        if d:
            self.buccaneer  ( d,"buccaneer","" )
            d = self.checkResult ( "buccaneer",d,1.0 )
            self.acedrg     ( "acedrg","" )
            if "ligands" in self.output_meta:
                self.dimple     ( d,"dimple_refine","refine","" )
                d = self.checkResult ( "dimple_refine",d,1.0 )
                self.fitLigands ( d,"fitligands","" )
                #d1 = self.checkResult ( "fitligands",d,1.0 )
                #if d1!=d:
                #    self.lorestr ( "fitligands","" )
            else:
                self.dimple ( d,"dimple_refine","refine","" )
                #self.lorestr ( d,"lorestr","" )

        self.putMessage ( "<h3><i>---- Structure solution workflow " +
                          "completed.</i></h3>" )

        self.write_meta()
        return


# ============================================================================

if __name__ == '__main__':

    ccp4ez = CCP4ez()
    ccp4ez.run()
