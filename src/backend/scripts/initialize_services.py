import json
from services.db import Database


#change name to intialize_services 


db_instance=Database()
if not db_instance.is_initialized():
    db_instance.populate()



