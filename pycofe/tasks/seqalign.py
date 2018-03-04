##!/usr/bin/python

#
# ============================================================================
#
#    03.04.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  SEQALIGN EXECUTABLE MODULE
#
#  Command-line:
#     ccp4-python -m pycofe.tasks.seqalign exeType jobDir jobId
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
import sys

#  ccp4-python imports
import pyrvapi

#  application imports
import basic


# ============================================================================
# Make SeqAlign driver

class SeqAlign(basic.TaskDriver):

    def file_seq_path (self): return "seq.fasta"  # name of input sequence file
    def file_aln_path (self): return "seq.aln"    # name of alignment file
    def file_stat_path(self): return "seq.stat"   # name of alignment stat file

    # ------------------------------------------------------------------------

    def seqHTML ( self,seqLine,align ):
        S = ""
        i = 0
        while i<len(seqLine):
            while i<len(seqLine) and align[i]==" ":
                S += seqLine[i]
                i += 1
            if i<len(seqLine) and align[i]=="*":
                S += "<span style='color:cyan;'>"
                while i<len(seqLine) and align[i]=="*":
                    S += seqLine[i]
                    i += 1
                S += "</span>"
        return S

    def putTableLine2 ( self,tableId,header,v1,v2,row ):
        self.putTableLine ( tableId,header,"",v1,row )
        pyrvapi.rvapi_put_table_string ( tableId,v2,row,1 )
        return


    def run(self):

        # Prepare seqalign input
        # fetch input data
        seq     = self.input_data.data.seq

        seqfile = open ( self.file_seq_path(),'wb' )
        nseq    = 0   # number of sequences
        smap    = {}  # map of sequence names
        seqtype = ""  # for checking sequence types

        for s in seq:
            s1 = self.makeClass ( s )
            if s1._type=='DataSequence':
                nseq    += 1
                seqname  = "s" + str(nseq).zfill(3)
                smap[seqname] = {}
                smap[seqname]["name" ] = s1.dname
                smap[seqname]["align"] = ""
                seqfile.write ( "\n>" + seqname  +
                                "\n"  + s1.getSequence(self.inputDir()) + "\n" )
                stype = s1.getType()
                if not seqtype:
                    seqtype = stype
                elif seqtype!=stype:
                    seqtype = "x"
            else:
                chains = s1.xyzmeta.xyz[0].chains
                for c in chains:
                    if s1.chainSel=="(all)" or s1.chainSel==c.id:
                        nseq   += 1
                        seqname = "s" + str(nseq).zfill(3)
                        smap[seqname] = {}
                        smap[seqname]["name"]  = s1.dname + ":" + c.id
                        smap[seqname]["align"] = ""
                        seqfile.write ( "\n>" + seqname +
                                        "\n"  + c.seq   + "\n" )
                    stype = c.type.lower()
                    if not seqtype:
                        seqtype = stype
                    elif seqtype!=stype:
                        seqtype = "x"
        seqfile.close()

        if nseq<2:
            self.putTitle   ( "Input Error" )
            self.putMessage ( "Number of sequences is less than 2" )
        elif seqtype=="" or seqtype=="x":
            self.putTitle   ( "Input Error" )
            self.putMessage ( "Inconsistent sequence types (mixed protein, dna and rna)" )
        else:

            if seqtype!="protein":
                seqtype = "dna"
            cmd = [self.file_seq_path(),"-type="+seqtype,"-stats="+self.file_stat_path()]
            # Start clustalw2
            self.runApp ( os.path.join(os.environ["CCP4"],"libexec","clustalw2"),cmd )

            # check solution file and display results
            if os.path.isfile(self.file_aln_path()) and os.path.isfile(self.file_stat_path()):

                len_max = "0"
                len_min = "0"
                len_avg = "0"
                len_dev = "0"
                len_med = "0"
                id_max  = "0"
                id_min  = "0"
                id_avg  = "0"
                id_dev  = "0"
                id_med  = "0"
                lines   = [line.rstrip('\n') for line in open(self.file_stat_path(),'r')]
                for l in lines:
                    w = l.split(" ")
                    if w[0]=="seqlen":
                        if w[1]=="longest:" : len_max = w[2]
                        if w[1]=="shortest:": len_min = w[2]
                        if w[1]=="avg:"     : len_avg = w[2]
                        if w[1]=="std-dev:" : len_dev = w[2]
                        if w[1]=="median:"  : len_med = w[2]
                    if w[0]=="aln":
                        if w[1]=="pw-id":
                            if w[2]=="highest:": id_max = w[3]
                            if w[2]=="lowest:" : id_min = w[3]
                            if w[2]=="avg:"    : id_avg = w[3]
                            if w[2]=="std-dev:": id_dev = w[3]
                            if w[2]=="median:" : id_med = w[3]

                lines = [line.rstrip('\n') for line in open(self.file_aln_path(),'r')]
                smap["align"] = ""
                i = 0
                while i < len(lines):
                    if lines[i].startswith("s"):
                        for j in range(nseq):
                            smap[lines[i][:4]]["align"] += lines[i][16:]
                            i += 1
                        smap["align"] += lines[i][16:]
                    i += 1

                len_cmb = len(smap["align"])
                id_cmb  = 0
                for c in smap["align"]:
                    if c=="*":
                        id_cmb += 1
                if float(len_avg)>0:
                    id_cmb = id_cmb/float(len_avg)
                id_cmb = "%.2f" % id_cmb

                tableId = "stat_table"
                self.putTable ( tableId,"<span style='font-size:1.25em'>" +
                                        "Alignment statistics</span>",
                                        self.report_page_id(),self.rvrow,0 )
                self.setTableHorzHeaders ( tableId,["Length","Score"],
                                        ["Sequence length","Sequence ID"] )
                self.putTableLine2 ( tableId,"Highest",len_max,id_max,0 )
                self.putTableLine2 ( tableId,"Lowest" ,len_min,id_min,1 )
                self.putTableLine2 ( tableId,"Average",len_avg,id_avg,2 )
                self.putTableLine2 ( tableId,"Std-Dev",len_dev,id_dev,3 )
                self.putTableLine2 ( tableId,"Median" ,len_med,id_med,4 )
                self.putTableLine2 ( tableId,"Combined",str(len_cmb),
                                             "<b>"+id_cmb+"%</b>",5 )

                self.rvrow += 2
                self.putMessage ( "&nbsp;" )
                tableId = "align_table"
                self.putTable ( tableId,"<span style='font-size:1.25em'>" +
                                        "Aligned sequences</span>",
                                        self.report_page_id(),self.rvrow,100 )
                self.setTableHorzHeaders ( tableId,["Sequence","Alignment"],
                                                   ["Sequence","Alignment"] )
                for r in range(nseq):
                    sname = "s" + str(r+1).zfill(3)
                    self.putTableLine ( tableId,str(r+1),"",smap[sname]["name"],r )
                    pyrvapi.rvapi_put_table_string ( tableId,
                        self.seqHTML(smap[sname]["align"],smap["align"]),r,1 )
                    pyrvapi.rvapi_shape_table_cell ( tableId,r,1,"",
                        "background:black;color:yellow","",1,1 );

            else:
                self.putTitle ( "Alignment was not generated" )

        # close execution logs and quit
        self.success()
        return


# ============================================================================

if __name__ == "__main__":

    drv = SeqAlign ( "",os.path.basename(__file__) )
    drv.start()
