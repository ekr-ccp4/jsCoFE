##!/usr/bin/python

#
# ============================================================================
#
#    05.07.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  XYZ HANDLING UTILS
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017
#
# ============================================================================
#

#  python native imports
import os
import sys

#  ccp4-python imports
#import pyrvapi

#  application imports
from pycofe.varut import command

#sys.path.append ( os.path.join(os.path.dirname(os.path.abspath(__file__)),os.pardir) )
#try:
#    from varut import command
#except:
#    print " import failed in 'proc/edmap'"
#    sys.exit ( 200 )

# ============================================================================

def XYZMeta ( json_str ):
    xyz_meta = eval ( json_str )
    if "xyz" in xyz_meta:
        xyz = xyz_meta["xyz"]
        for m in range(len(xyz)):
            model = xyz[m]
            if "chains" in model:
                chains = model["chains"]
                for c in range(len(chains)):
                    if chains[c]["type"]=="AA":
                        chains[c]["type"] = "Protein"
    return xyz_meta


def getXYZMeta ( fpath,file_stdout,file_stderr,log_parser=None ):
# returns chain information as the following list:
#  [  { 'model':1,
#       'chains': [
#         {'id': 'A', 'file': 'fname_A.pdb', 'type': 'Protein', 'size': 100 },  // aminoacids
#         {'id': 'B', 'file': 'fname_B.pdb', 'type': 'DNA', 'size': 50 },   // DNA
#         {'id': 'C', 'file': 'fname_C.pdb', 'type': 'RNA', 'size': 50 },   // RNA
#       ]
#    }
#  ]

    scr_file = open ( "pdbcur.script","w" )
    scr_file.write  ( "PDB_META\nEND\n" )
    scr_file.close  ()

    # Start pdbcur
    rc = command.call ( "pdbcur",['XYZIN',fpath],"./",
                        "pdbcur.script",file_stdout,file_stderr,log_parser )

    # read pdbcur's json
    jsonpath = os.path.splitext(fpath)[0] + ".json"

    if not os.path.isfile(jsonpath):
        return None

    # read pdbcur's json
    with open(jsonpath,'r') as json_file:
        json_str = json_file.read()
    json_file.close()

    return XYZMeta ( json_str )
