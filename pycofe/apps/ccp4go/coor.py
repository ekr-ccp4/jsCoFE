##!/usr/bin/python

#
# ============================================================================
#
#    07.02.18   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  COORDINATE FILE HANDLING ROUTINES
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017-2018
#
# ============================================================================
#

from ccp4mg import mmdb2

def stripLigWat ( mmFile,outFile ):
    mm  = mmdb2.Manager()
    mm.ReadCoorFile ( str(mmFile) )
    mm.DeleteAltLocs()
    nat1 = mm.GetNumberOfAtoms()         # initial number of atoms
    #mm.DeleteSolvent()
    selHnd = mm.NewSelection()
    mm.Select ( selHnd,2,"*",0 )         # select all residues, new selection
    mm.SelectProperty   ( selHnd,1,2,4 ) # select amino acid residues, subtract
    mm.SelectProperty   ( selHnd,2,2,4 ) # select nucleic acid residues, subtract
    mm.SelectProperty   ( selHnd,4,2,4 ) # select modified aminoacids, subtract
    mm.DeleteSelObjects ( selHnd )       # delete what remains (water and ligands)
    mm.FinishStructEdit ()               # optimise internal indexes
    nat2 = mm.GetNumberOfAtoms()         # final number of atoms
    if outFile.lower().endswith(".pdb"):
        mm.WritePDBASCII ( str(outFile) )
    else:
        mm.WriteCIFASCII ( str(outFile) )
    return  (nat1-nat2)    # !=0 indicates of changes made


def mergeLigands ( mmFile,ligFiles,chainId,outFile ):

    mm  = mmdb2.Manager()
    mm.ReadCoorFile ( str(mmFile) )
    mm_model  = mm.GetFirstDefinedModel()
    mm_xchain = None

    lig   = mmdb2.Manager()
    nligs = 0
    for lf in ligFiles:
        lig.ReadCoorFile ( str(lf) )
        lig_model = lig.GetFirstDefinedModel()
        if mm_model and lig_model:
            lig_nchains = lig_model.GetNumberOfChains()
            for i in range(lig_nchains):
                lig_chain = lig_model.GetChain ( i )
                lig_nres  = lig_chain.GetNumberOfResidues()
                if lig_nres>0:
                    if not mm_xchain:
                        mm_xchain = mm_model.GetChainCreate ( chainId,False )
                    mm_nres = mm_xchain.GetNumberOfResidues()
                    for j in range(lig_nres):
                        res = lig_chain.GetResidue(j)
                        mm_nres += 1
                        res.seqNum = mm_nres
                        mm_xchain.AddResidue ( res )
                    nligs += lig_nres

    mm.WritePDBASCII ( str(outFile) )

    return nligs


def main():

    mergeLigands ( "0065-01_buccaneer.pdb",["fitted-ligand-0-0.pdb"], "X", "out.pdb" )

    return



if __name__ == '__main__':
    main()
