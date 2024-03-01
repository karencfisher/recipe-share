import logging
from pathlib import Path


class ErrorLog:
    def __init__(self):
        logfile = Path("logs/error-log.log")
        logging.basicConfig(level=logging.INFO, 
                            format='%(asctime)s %(message)s')
        self.logger = logging.getLogger('error_log')

    def log_error(self, error):
        self.logger.exception(error)


