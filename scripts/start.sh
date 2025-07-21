#!/bin/bash

set -e  # exit on first error

#start api on the background
python -m api.main & 

# run streamlit with env variables read from container's environment
python -m streamlit run gui/login.py --server.port $STREAMLIT_PORT --server.address $STREAMLIT_HOST
