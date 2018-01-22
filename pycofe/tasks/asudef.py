##!/usr/bin/python

#
# ============================================================================
#
#    13.12.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  ASUDEF EXECUTABLE MODULE
#
#  Command-line:
#     ccp4-python asudef.py exeType jobDir jobId
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
from   xml.dom import minidom
import json
import math

#  ccp4-python imports
import pyrvapi

#  application imports
from   pycofe.tasks  import basic
from   pycofe.dtypes import dtype_revision, dtype_sequence
from   pycofe.proc   import import_sequence
from   pycofe.varut  import rvapi_utils


# ============================================================================
# Make ASUDef driver

class ASUDef(basic.TaskDriver):

    # ------------------------------------------------------------------------

    # make task-specific definitions
    def matthews_report(self):  return "refmac_report"
    def getXMLFName    (self):  return "matthews.xml"
    def seq_table_id   (self):  return "seq_table"
    def res_table_id   (self):  return "res_table"

    # the following will provide for import of generated sequences
    def importDir        (self):  return "./"   # import from working directory
    def import_summary_id(self):  return None   # don't make import summary table

    # ------------------------------------------------------------------------

    def makeRevision ( self,hkl,seq,composition,altEstimateKey,altNRes,
                            altMolWeight,resLimit,
                            revision0=None,resultTitle="Results" ):

        revision   = None

        spaceGroup = hkl.getSpaceGroup()
        cell       = hkl.getCellParameters()

        if spaceGroup == "Unspecified":
            self.putTitle ( "Failure" )
            self.fail ( "Space Group unspecified in Reflection Dataset",
                        "No Space Group" )

        if cell[0] == 0.0:
            self.putTitle ( "Failure" )
            self.fail ( "Call parameters not found in Reflection Dataset",
                        "No Cell Parameters" )

        self.open_stdin()
        self.write_stdin (
            "CELL " + str(cell[0]) + " " + str(cell[1]) + " " + str(cell[2]) +\
                " " + str(cell[3]) + " " + str(cell[4]) + " " + str(cell[5]) +\
            "\nSYMM \"" + spaceGroup + "\"\n"
        )

        nRes      = 0
        molWeight = 0
        dataKey   = 0

        nc0   = -1
        sol0  = -1

        if len(seq)>0:  # optional data parameter

            isProtein = False;
            isRNA     = False;
            isDNA     = False;
            for i in range(len(seq)):
                seq[i] = self.makeClass ( seq[i] )
                nRes      += seq[i].ncopies*seq[i].size
                molWeight += seq[i].ncopies*seq[i].weight
                dataKey   += seq[i].ncopies
                if seq[i].isProtein():
                    isProtein = True
                if seq[i].isRNA():
                    isRNA = True
                if seq[i].isDNA():
                    isDNA = True

            comp = ""
            c    = 0;
            if isProtein:
                comp = "protein"
                c += 1
            if isRNA:
                if comp:
                    comp += " and "
                comp += "RNA"
                c += 1
            if isDNA:
                if comp:
                    comp += "/"
                comp += "DNA"
                c += 1
            if c>1:
                comp += " complex"

            self.write_stdin ( "MOLWEIGHT " + str(molWeight) + "\n" )

            tdict1 = {
                "title": "<b>Content unit:</b> " + comp +\
                         " molecule(s) with the following sequence(s)",
                "state": 0, "class": "table-blue", "css": "text-align:right;",
                "horzHeaders" :  [
                    { "label": "Structural unit components", "tooltip": "Sequence data" },
                    { "label": "Type"  , "tooltip": "Sequence type" },
                    { "label": "Size"  , "tooltip": "Number of residues" },
                    { "label": "Weight", "tooltip": "Weight in Daltons" }
                ],
                "rows" : []
            }

            for i in range(len(seq)):
                trow = { "header":{ "label": str(i+1), "tooltip": ""}, "data": [
                        str(seq[i].ncopies) + "x&nbsp;" + seq[i].dname + "&nbsp;",
                        seq[i].subtype[0].upper() + "&nbsp;",
                        str(seq[i].size) + "&nbsp;",
                        str(seq[i].weight) + "&nbsp;"
                ]}
                tdict1["rows"].append ( trow )

            tdict1["rows"].append ({
              "data" : ["<i><b>Total residues/weight:</b></i>","",
                        "<i><b>" + str(nRes) + "</b></i>&nbsp;",
                        "<i><b>" + str(molWeight) + "</b></i>&nbsp;"]
            })

            rvapi_utils.makeTable ( tdict1, self.seq_table_id(),self.report_page_id(),
                                    self.rvrow,0,1,1 )
            self.rvrow += 1

        elif altEstimateKey == "NR":
            nRes = altNRes
            self.write_stdin ( "NRES " + str(nRes) + "\n" )
            dataKey = -1
            if composition == "P":
                cnt = " aminoacid residues"
            elif composition == "C":
                cnt = " aminoacid and nucleic acid residues"
            else:
                cnt = " nucleis acid residues"
            self.putMessage ( "<b>Content unit:</b> one or several molecules " +\
                              "having " + str(nRes) + cnt + " in total" )

        else:
            molWeight = altMolWeight
            self.write_stdin ( "MOLWEIGHT " + str(molWeight) + "\n" )
            datakey = -2
            if composition == "P":
                cnt = " protein"
            elif composition == "C":
                cnt = " protein and polynucletide"
            else:
                cnt = " polynucletide"
            self.putMessage ( "<b>Content unit:</b> one or several " + cnt +\
                              " molecules with the combined molecular weight of " +\
                              str(molWeight) + " Daltons" )

        self.write_stdin (
            "NMOL 1\n" +\
            "AUTO\n"   +\
            "XMLO\n"
        )
        if resLimit:
            self.write_stdin ( "RESO " + str(resLimit) + "\n" )
        self.write_stdin ( "MODE " + composition )

        self.close_stdin()

        # Run matthews
        self.runApp ( "matthews_coef",["XMLFILE",self.getXMLFName()] )

        if not os.path.isfile(self.getXMLFName()):
            self.putTitle ( "Failure" )
            self.fail ( "Output XML file was not created",
                        "No XML output file" )

        if resultTitle:
            self.putTitle ( resultTitle )
        else:
            self.putMessage ( "&nbsp;" )

        xmldoc = minidom.parse ( self.getXMLFName() )
        cellv  = xmldoc.getElementsByTagName("cell")
        if len(cellv)>0:
            self.putMessage ( "<b>Cell volume:</b>&nbsp;" +\
                              cellv[0].attributes["volume"].value.strip() +\
                              "&nbsp;&Aring;<sup>3</sup>" )

        items = xmldoc.getElementsByTagName ( "result" )

        if len(items)<=0:
            if dataKey==-2:
                self.putMessage ( "<h3 class='header-red'>No molecule with " +\
                                  "given weight (" + str(molWeight) +\
                                  " Daltons) can be fit " + "in asymmetric " +\
                                  "unit.<br>No structure revision created.</h3>" )
            elif dataKey==-1:
                self.putMessage ( "<h3 class='header-red'>No molecule with " +\
                                  "given size (" + str(nRes) + " residues) " +\
                                  "can be fit in asymmetric unit.<br> No " +\
                                  "structure revision created.</h3>" )
            elif dataKey==0:
                self.putMessage ( "<h3 class='header-red'>Error: default data " +\
                                  "key, please report to developer or " +\
                                  "maintainer.</h3>" )
            elif dataKey==1:
                self.putMessage ( "<h3 class='header-red'>No molecule with " +\
                                  "given sequence (" + str(nRes) + " residues) " +\
                                  "can be fit in asymmetric unit.<br>No " +\
                                  "structure revision created.</h3>" )
            else:
                self.putMessage ( "<h3 class='header-red'>Given sequences " +\
                                  "(total " + str(nRes) + " residues) cannot " +\
                                  "be fit in asymmetric unit.<br>No structure " +\
                                  "revision created.<h3>" )

        else:

            tdict2 = {
                "title": "Molecule fitting statistics",
                "state": 0, "class": "table-blue", "css": "text-align:right;",
                "horzHeaders" :  [
                    { "label": "N<sub>copies</sub>"  , "tooltip":
                       "Number of given content units placed in asymmetric unit" },
                    { "label": "Matthews"            , "tooltip": "Matthews coefficient" },
                    { "label": "% solvent"           , "tooltip": "Solvent percent" },
                    { "label": "P<sub>matthews</sub>", "tooltip": "Probability" }
                ],
                "rows" : []
            }

            mc1   = -1
            sol1  = -1
            prb1  = -1
            dsol0 = 100.0
            i0    = -1

            for i in range(len(items)):
                nc  = items[i].attributes["nmol_in_asu"].value.strip()
                mc  = float(items[i].attributes["matth_coef"].value.strip())
                sol = float(items[i].attributes["percent_solvent"].value.strip())
                prb = float(items[i].attributes["prob_matth"].value.strip())
                tdict2["rows"].append ({
                  "data" : [ str(nc)+"&nbsp;",
                             "%.2f&nbsp;" % mc,
                             "%.2f&nbsp;" % sol,
                             "%.3f&nbsp;" % prb]
                })
                if int(nc) == 1:
                    mc1  = mc
                    sol1 = sol
                    prb1 = prb
                dsol = abs ( sol - 50.0 );
                if dsol < dsol0:
                    nc0   = int(nc)
                    sol0  = sol
                    dsol0 = dsol
                    i0    = i

            if nc0 > 0:
                tdict2["rows"][i0]["data"][0] = "* " + str(nc0) + "&nbsp;"

            rvapi_utils.makeTable ( tdict2, self.res_table_id(),self.report_page_id(),
                                    self.rvrow,0,1,1 )
            self.rvrow += 1

            #  create first structure revision
            revision = revision0
            if not revision:
                revision = dtype_revision.DType ( -1 )
            revision.setReflectionData ( hkl )
            revision.setASUData ( seq,nRes,molWeight,dataKey,mc1,sol1,prb1 )

        return (revision,nc0,sol0)

    # ------------------------------------------------------------------------

    def revisionFromStructure ( self,hkl,structure,name ):

        chains  = structure.xyzmeta["xyz"][0]["chains"]
        seq     = []
        nocc    = []
        id      = []
        stype   = []
        type_aa = 0
        type_nr = 0
        for i in range(len(chains)):
            s = chains[i]["seq"]
            if chains[i]["type"]!="UNK":
                n = 1
                for j in range(len(seq)):
                    if s==seq[j]:
                        n += 1
                        nocc[j] += 1
                if n==1:
                    seq  .append ( s )
                    nocc .append ( 1 )
                    id   .append ( chains[i]["id"] )
                    stype.append ( chains[i]["type"].lower() )
                    if chains[i]["type"]=="Protein":
                        type_aa += 1
                    else:
                        type_nr += 1

        annotation = {"rename":{}, "annotation":[] }
        self.files_all = []
        for i in range(len(seq)):
            if self.outputFName!="*":
                fname = self.outputFName +  "_"
            else:
                fname = ""
            fname += name + "_" + id[i] + ".fasta"
            dtype_sequence.writeSeqFile ( fname,name + "_" + id[i],seq[i] )
            self.files_all.append ( fname )
            annot = { "file":fname, "rename":fname, "items":[
              { "rename":fname, "contents": seq[i], "type": stype[i] }
            ]}
            annotation["annotation"].append ( annot )

        f = open ( "annotation.json","w" )
        f.write ( json.dumps(annotation) )
        f.close ()

        #  import sequence data
        import_sequence.run ( self,"Sequences imported from " + name )
        self.rvrow += 1

        #  finally, create structure revision

        if self.outputFName=="*":
            self.outputFName = name

        self.putMessage ( "&nbsp;<br><h3>Asymmetric Unit Analysis</h3>" )

        seqs = self.outputDataBox.data[dtype_sequence.dtype()]
        for i in range(len(seqs)):
            seqs[i].ncopies = nocc[i]

        composition = "P"
        if type_aa<1:
            composition = "D"
        elif type_nr>0:
            composition = "C"

        revision = self.makeRevision ( hkl,seqs,composition,"NR","1","1",
                                       "",None,"" )
        if revision[0]:
            revision[0].setStructureData ( structure   )
            self.registerRevision        ( revision[0] )

        return revision[0]


    # ------------------------------------------------------------------------

    def run(self):

        # Just in case (of repeated run) remove the TEMPORARY XML file.
        if os.path.isfile(self.getXMLFName()):
            os.remove(self.getXMLFName())

        # Prepare matthews input

        # fetch input data
        hkl  = self.makeClass ( self.input_data.data.hkl[0] )
        sec1 = self.task.parameters.sec1.contains
        seq  = []
        if hasattr(self.input_data.data,"seq"):  # optional data parameter
            seq  = self.input_data.data.seq

        revision = self.makeRevision ( hkl,seq,
                                       self.getParameter(sec1.COMPOSITION_SEL),
                                       self.getParameter(sec1.ESTIMATE_SEL),
                                       self.getParameter(sec1.NRES),
                                       self.getParameter(sec1.MOLWEIGHT),
                                       self.getParameter(sec1.RESLIMIT) )

        nc0  = revision[1]
        sol0 = revision[2]
        if nc0==1 and sol0>35.0:
            self.putMessage ( "<h3 class='header-green'>The suggested " +\
                              "composition of ASU appears to be the optimal " +\
                              "one.</h3>" )
        elif nc0 > 1:
            self.putMessage ( "<h3 class='header-red'>WARNING: the suggested " +\
                              "composition of ASU has higher, than usual, " +\
                              "solvent fraction.<br>" +\
                              "Try to increase the scattering mass by a " +\
                              "factor of " + str(nc0) + "</h3>"  )
        elif nc0 > 0:
            self.putMessage ( "<h3 class='header-red'>WARNING: the suggested " +\
                              "composition of ASU has lower, than usual, " +\
                              "solvent fraction.<br>" +\
                              "Try to decrease the scattering mass by a " +\
                              "factor of " + str(math.ceil(350.0/sol0)/10.0) +\
                              "</h3>" )

        if revision[0]:
            self.registerRevision ( revision[0] )

        # close execution logs and quit
        self.success()
        return


# ============================================================================

if __name__ == "__main__":

    drv = ASUDef ( "",os.path.basename(__file__) )
    drv.run()
