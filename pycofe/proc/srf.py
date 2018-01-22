##!/usr/bin/python

#
# ============================================================================
#
#    17.12.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  SRF (Self-Rotation Function) UTILS
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017
#
# ============================================================================
#

#  python native imports
import os
#import sys

#  ccp4-python imports
import pyrvapi

#  application imports
from pycofe.varut import command

# ============================================================================

def putSRFDiagram ( hkl,          # hkl data object
                    dirPath,      # directory with hkl object files (outputDir)
                    reportDir,    # directory with html report (reportDir)
                    holderId,     # rvapi holder of SRF widget
                    row,col,      # rvapi coordinates for SRF widget
                    rowSpan,colSpan, # coordinate spans for STF widget
                    file_stdout,     # standard output stream
                    file_stderr,     # standard error stream
                    log_parser=None  # log file parser
                  ):

    fpath = hkl.getFilePath ( dirPath,0 )
    Fmean = hkl.getMeta ( "Fmean.value","" )
    sigF  = hkl.getMeta ( "Fmean.sigma","" )

    if Fmean == ""  or  sigF == "":
        file_stderr.write ( "Fmean and sigFmean columns not found in " +\
                            hkl.files[0] + " -- SRF not calculated\n" )
        return [-1,"Fmean and sigFmean columns not found"]

    scr_file = open ( "molrep_srf.script","w" )
    scr_file.write ( "file_f " + fpath +\
                     "\nlabin F=" + Fmean + " SIGF=" + sigF + "\n" )
    scr_file.close ()

    """
    cols  = hkl.getMeanColumns()
    if cols[2]!="F":
        file_stderr.write ( "Fmean and sigFmean columns not found in " +\
                            hkl.files[0] + " -- SRF not calculated\n" )
        return [-1,"Fmean and sigFmean columns not found"]

    scr_file = open ( "molrep_srf.script","w" )
    scr_file.write ( "file_f " + fpath +\
                     "\nlabin F=" + cols[0] + " SIGF=" + cols[1] + "\n" )
    scr_file.close ()
    """

    # Start pdbcur
    rc = command.call ( "molrep",["-i"],"./",
                        "molrep_srf.script",file_stdout,file_stderr,log_parser )

    if not os.path.isfile("molrep_rf.ps"):
        file_stderr.write ( "SRF postscript was not generated for " +\
                            hkl.files[0] + "\n" )
        return [-2,rc.msg]

    rc = command.call ( "ps2pdf",["molrep_rf.ps"],"./",
                        None,file_stdout,file_stderr,log_parser )

    if not os.path.isfile("molrep_rf.pdf"):
        file_stderr.write ( "SRF pdf was not generated for " +\
                            hkl.files[0] + "\n" )
        return [-3,rc.msg]

    pdfpath = os.path.splitext(hkl.files[0])[0] + ".pdf"
    os.rename ( "molrep_rf.pdf",os.path.join(reportDir,pdfpath) )

    subsecId = holderId + "_srf"
    pyrvapi.rvapi_add_section ( subsecId,"Self-Rotation Function",
                                holderId,row,col,rowSpan,colSpan,False )

    pyrvapi.rvapi_set_text ( "<object data=\"" + pdfpath +\
            "\" type=\"application/pdf\" " +\
            "style=\"border:none;width:100%;height:1000px;\"></object>",
            subsecId,0,0,1,1 )
    pyrvapi.rvapi_flush()

    return [0,"Ok"]
