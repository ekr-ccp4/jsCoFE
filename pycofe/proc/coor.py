##!/usr/bin/python

#
# ============================================================================
#
#    01.08.17   <--  Date of Last Modification.
#                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ----------------------------------------------------------------------------
#
#  COORDINATE FILE HANDLING ROUTINES
#
#  Copyright (C) Eugene Krissinel, Andrey Lebedev 2017
#
# ============================================================================
#

from ccp4mg import mmdb2

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
