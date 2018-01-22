#!/bin/bash

server_dir=/Users/eugene/Projects/jsCoFE
ccp4_dir=/Applications/ccp4-7.0
#ccp4_dir=/Users/eugene/Projects/ccp4jh/ccp4-dev
morda_dir=/Users/eugene/Projects/MoRDa_DB
pdb_dir=/Users/eugene/pdb/pdb

source $ccp4_dir/bin/ccp4.setup-sh
source $morda_dir/morda_env_osx_sh
export PDB_DIR=$pdb_dir
export JSPISA_CFG=/Users/eugene/Projects/PISA/jspisa/jscofe/jspisa.cfg

cd $server_dir

node ./nc_server.js config/ccp4/conf.local.nc.json 0
