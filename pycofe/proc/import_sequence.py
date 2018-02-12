##!/usr/bin/python

#
# ============================================================================
#
#    30.11.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  SEQUENCE DATA IMPORT FUNCTION
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017
#
# ============================================================================
#

#  python native imports
import os
import sys

#  ccp4-python imports
import pyrvapi

#  application imports
from dtypes import dtype_sequence
from varut  import jsonut


aaWeight = {
  "A": 71.079,
  "B": 115.089,
  "C": 103.144,
  "D": 115.089,
  "E": 129.116,
  "F": 147.177,
  "G": 57.052,
  "H": 137.142,
  "I": 113.160,
  "J": 113.160,
  "K": 128.174,
  "L": 113.160,
  "M": 131.198,
  "N": 114.104,
  "O": 114.104,
  "P": 97.117,
  "Q": 128.131,
  "R": 156.188,
  "S": 87.078,
  "T": 101.105,
  "U": 150.0379,
  "V": 99.133,
  "W": 186.213,
  "X": 99.133,
  "Y": 163.170,
  "Z": 57.052
}

naWeight = {
  "A": 251.2,
  "B": 227.2,
  "C": 227.2,
  "D": 242.2,
  "G": 267.3,
  "I": 227.2,
  "K": 242.2,
  "H": 227.2,
  "M": 227.2,
  "N": 227.2,
  "R": 251.2,
  "S": 227.2,
  "T": 242.2,
  "U": 228.2,
  "V": 227.2,
  "W": 242.2,
  "Y": 227.2
}


# ============================================================================
# Sequence import function

def run ( body,sectionTitle="Macromolecular sequences" ):  # body is reference to the main Import class

    files_seq = []
    for f in body.files_all:
        fl = f.lower();
        if fl.endswith(('.seq','.fasta','.pir')):
            files_seq.append ( f )

    if len(files_seq) <= 0:
        return

    annotation = None;
    try:
        f = open ( 'annotation.json','r' )
        annotation = jsonut.jObject ( f.read() ).annotation
    except:
        pass

    body.file_stdout.write ( "\n" + "%"*80 + "\n"  )
    body.file_stdout.write ( "%%%%%  IMPORT OF SEQUENCES\n" )
    body.file_stdout.write ( "%"*80 + "\n" )

    if not annotation:
        body.file_stdout.write (
            "\n ******** Sequence annotation file NOT FOUND OR CORRUPT (error)\n" )
        body.file_stderr.write (
            "\n ******** Sequence annotation file NOT FOUND OR CORRUPT (error)\n" )
        return

    seqSecId = "seq_sec_" + str(body.widget_no)
    body.widget_no += 1

    pyrvapi.rvapi_add_section ( seqSecId,sectionTitle,
                                body.report_page_id(),body.rvrow,0,1,1,False )
    k = 0
    for f in files_seq:

        body.files_all.remove ( f )

        annot = None
        for a in annotation:
            for item in a.items:
                if item.rename==f:
                    annot = item
        if not annot:
            body.file_stdout.write (
                "\n ******** Sequence annotation file DOES NOT MATCH UPLOAD (error)\n" )
            body.file_stderr.write (
                "\n ******** Sequence annotation file DOES NOT MATCH UPLOAD (error)\n" )
            return

        subSecId = seqSecId
        if len(files_seq)>1:
            subSecId = seqSecId + str(k)
            pyrvapi.rvapi_add_section ( subSecId,"Import "+f,seqSecId,
                                        k,0,1,1,False )

        seq = dtype_sequence.DType ( body.job_id )
        seq.addSubtype  ( annot.type )
        seq.setFile     ( f )
        seq.convert2Seq ( body.importDir(),body.outputDir() )
        body.dataSerialNo += 1
        seq.makeDName   ( body.dataSerialNo )

        os.rename ( os.path.join(body.importDir(),f),os.path.join(body.outputDir(),f) )
        seq.makeUniqueFNames ( body.outputDir() )

        body.outputDataBox.add_data ( seq )

        seqTableId = "seq_" + str(k) + "_table"
        body.putTable     ( seqTableId,"",subSecId,0 )
        body.putTableLine ( seqTableId,"File name","Imported file name",f,0 )
        body.putTableLine ( seqTableId,"Assigned name",
                                       "Assigned data name",seq.dname,1 )
        body.putTableLine ( seqTableId,"Type","Polymer type",seq.subtype[0],2 )

        lines = filter ( None,
            (line.rstrip() for line in open(os.path.join(body.outputDir(),seq.files[0]),"r")))

        htmlLine = ""
        body.file_stdout.write ( "\n" )

        weights = aaWeight
        if annot.type!="protein":
            weights = naWeight

        for i in range(0,len(lines)):
            if i > 0:
                body.file_stdout.write ( "    " )
            #body.file_stdout.write ( lines[i] + "\n" )
            if i > 0:
                htmlLine += "<br>"
                seq.size += len ( lines[i].strip() )
                for j in range(len(lines[i])):
                    if lines[i][j] in weights:
                        seq.weight += weights[lines[i][j]]
            htmlLine += lines[i]

        body.putTableLine ( seqTableId,"Contents","Data contents"   ,htmlLine,3 )
        body.putTableLine ( seqTableId,"Length  ","Sequence length" ,str(seq.size),4 )
        body.putTableLine ( seqTableId,"Weight  ","Molecular weight",str(seq.weight),5 )

        body.putSummaryLine ( f,"SEQ",seq.dname )

        body.file_stdout.write ( "\n... processed: " + f + "\n    " )
        k += 1

    body.rvrow += 1
    pyrvapi.rvapi_flush()

    return
