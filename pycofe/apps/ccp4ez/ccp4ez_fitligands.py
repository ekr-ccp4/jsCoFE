##!/usr/bin/python

#
# ============================================================================
#
#    06.02.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  CCP4EZ Combined Auto-Solver FitLigands module
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017-2018
#
# ============================================================================
#

import os
import shutil

#  ccp4-python imports
#import pyrvapi

import edmap
import coor

import ccp4ez_acedrg

# ============================================================================

class FitLigands(ccp4ez_acedrg.AceDrg):

    # ----------------------------------------------------------------------

    def fitLigands ( self,datadir,resultdir,parent_branch_id ):

        if not self.tryFitLigands:
            self.file_stdout.write ( "\n *** use of FitLigands is switched off\n" )
            return ""

        if self.output_meta["results"]["acedrg"]["nResults"] <= 0:
            return ""  # no ligands to fit

        self.file_stdout.write ( "\n ... run FitLigands\n" )
        #self.putMessage       ( "&nbsp;" )
        self.putWaitMessageLF ( "<b>" + str(self.stage_no+1) +
                                ". Fitting ligands (Coot)</b>" )
        self.page_cursor[1] -= 1

        branch_data = self.start_branch ( "Fitting ligands",
                        "CCP4ez Automated Structure Solver: Fit " +
                        "Ligands with Coot", resultdir,parent_branch_id )
        self.flush()

        # make dimple work directory
        dimpledir = os.path.join ( resultdir,"dimple_tmp" )
        if not os.path.isdir(dimpledir):
            os.mkdir ( dimpledir )

        # define dimple log files
        dstdout = os.path.join ( dimpledir,"dimple_stdout.log" )
        dstderr = os.path.join ( dimpledir,"dimple_stderr.log" )

        strmeta = self.output_meta["results"][datadir]
        columns = strmeta["columns"]
        rfree   = strmeta["rfree"]

        # copy files in resulting directory

        xyzPath  = os.path.join ( resultdir,"fitligands.pdb" )
        mtzPath  = os.path.join ( resultdir,"fitligands.mtz" )
        mapPath  = os.path.join ( resultdir,"fitligands.map" )
        dmapPath = os.path.join ( resultdir,"fitligands.diff.map" )
        libPath  = os.path.join ( resultdir,"fitligands.lib" )
        libIndex = []

        shutil.copy2 ( strmeta["pdb"] ,xyzPath  )
        shutil.copy2 ( strmeta["mtz"] ,mtzPath  )
        shutil.copy2 ( strmeta["map"] ,mapPath  )
        shutil.copy2 ( strmeta["dmap"],dmapPath )
        if "lib" in strmeta:
            shutil.copy2 ( strmeta["lib"],libPath )
            libIndex = strmeta["libindex"]

        # loop over ligands

        ligmeta      = self.output_meta["results"]["acedrg"]["ligands"]
        nResults     = 0
        quit_message = ""
        rfree        = 1.0
        rfactor      = 1.0

        for code in ligmeta:

            ligLibPath = ligmeta[code]["cif"]

            # make command-line parameters
            cmd = [ "--pdbin"       ,xyzPath,
                    "--hklin"       ,mtzPath,
                    "--dictionary"  ,ligLibPath,
                    "--f"           ,columns["DELFWT"],
                    "--phi"         ,columns["PHDELWT"],
                    "--clusters"    ,"10",
                    "--fit-fraction","0.75",
                    "--sigma"       ,"2.0",
                    "--flexible","--samples","800",
                    ligmeta[code]["xyz"]
                  ]

            # Start findligand
            self.runApp ( os.path.join(os.environ["CCP4"],"libexec","findligand-bin"),cmd )

            # check results
            ligands = [fn for fn in os.listdir("./") if fn.startswith("fitted-ligand-") and fn.endswith(".pdb") ]
            #self.file_stdout.write ( "ligands=" + str(ligands) + "\n" )
            if len(ligands)>0:

                # merge all ligands in the coordinate file
                nligs  = coor.mergeLigands ( xyzPath,ligands,"X",xyzPath )

                # remove ligands files
                for lig in ligands:
                    os.remove ( lig )

                nResults += 1
                quit_message += code + "(" + str(nligs) + ") "

                if nResults==1:
                    self.putMessage ( "<h2>Results</h2>" )
                self.putMessage ( "<h3>" + str(nligs) + " ligand(s) " + code +
                                  " fitted.</h3>" )

                # maintain refmac library file
                if not libIndex:
                    shutil.copy2 ( ligLibPath,libPath )
                    libIndex.append ( code )

                elif not code in libIndex:
                    libtmp = "libtmp.lib"
                    self.open_script ( "libcheck_" + code )
                    self.write_script (
                        "_Y"          +\
                        "\n_FILE_L  " + libPath     +\
                        "\n_FILE_L2 " + ligLibPath  +\
                        "\n_FILE_O  " + libtmp +\
                        "\n_END\n" )
                    self.close_script()
                    self.runApp ( "libcheck",[] )
                    shutil.copy2 ( libtmp,libPath )
                    libIndex.append ( code )

                # refine the result with dimple
                cmd = [ mtzPath,xyzPath,dimpledir, "--slow","--slow",
                        "--libin",libPath,"--free-r-flags","-" ]
                # run dimple
                self.runApp ( "dimple",cmd,dstdout,dstderr )
                # copy dimple result into work files
                shutil.copy2 ( os.path.join(dimpledir,"final.pdb"),xyzPath )
                shutil.copy2 ( os.path.join(dimpledir,"final.mtz"),mtzPath )

                refmac_pattern = "refmac5 restr"
                with open(dstdout,'r') as logf:
                    for line in logf:
                        if line.find(refmac_pattern)>=0:
                            list    = filter ( None,line.replace("/"," ").split() )
                            rfree   = float(list[len(list)-1])
                            rfactor = float(list[len(list)-2])


        if nResults>0:

            # calculate final electron density maps
            edmap.calcCCP4Maps ( mtzPath,
                    os.path.join(resultdir,"fitligands"),
                    "./",self.file_stdout,self.file_stderr,"refmac",None )

            if nResults==1:
                quit_message = "fitted ligand " + quit_message
            else:
                quit_message = "fitted ligands " + quit_message
            quit_message += " (<i>R<sub>free</sub>=" + str(rfree) + "</i>)"

            # put structure vew widget; files will be made into place latyer
            # by self.saveResults(...)
            dfpath = os.path.join ( "..",self.outputdir,resultdir,"fitligands" )
            self.putStructureWidget ( "Structure and density map",
                                    [ dfpath+".pdb",dfpath+".mtz",dfpath+".map",
                                      dfpath+"_dmap.map" ],-1 )

        else:
            self.putMessage ( "<h2><i>No ligands could be fitted</i></h2>" )
            quit_message = "no ligands fitted"
            if not "lib" in strmeta:
                libPath = None

        self.saveResults ( "FitLigands",resultdir,nResults,
            rfree,rfactor,"fitligands", xyzPath,mtzPath,mapPath,dmapPath,libPath,
            libIndex,columns,None )  # no space group change at fitting ligands

        self.quit_branch ( branch_data,resultdir,
                           "Fitting ligands (Coot): " + quit_message )

        return  branch_data["pageId"]
