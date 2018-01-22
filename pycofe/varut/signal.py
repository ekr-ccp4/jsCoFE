##!/usr/bin/python

#
# ============================================================================
#
#    05.07.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  JOB PROGRESS SIGNALS
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017
#
# ============================================================================
#

import os
import sys

# ============================================================================


def signal_file_name():  return "signal"


def clear():
    try:  # quite often, this will try to remove signal file that does not exist
        os.remove ( signal_file_name() )
    except:
        pass
    return


def import_failed(): # actually this one cannot be used if varut import failed :)
    with open ( signal_file_name(),'w' ) as f: f.write ( "fail_import\n200" )
    sys.exit ( 200 )


def task_read_failed():
    with open ( signal_file_name(),'w' ) as f: f.write ( "fail_task_read\n201" )
    sys.exit ( 201 )


def job_failed ( message_str ):
    with open ( signal_file_name(),'w') as f: f.write ( "fail_job " + message_str + "\n202" )
    sys.exit ( 203 )


def success():
    with open ( signal_file_name(),'w') as f: f.write ( "success\n0" )
    sys.exit ( 0 )
