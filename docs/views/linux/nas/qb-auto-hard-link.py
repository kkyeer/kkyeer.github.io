#!/usr/bin/python3

import sys
import os
import shutil
import logging
from pathlib import PurePath

# byte :4M
size_threshold = 1024*1024*4

# file mask
file_mask = 0o777


if __name__ == '__main__':
    logging.basicConfig(
                    stream=sys.stdout,
                    level=logging.DEBUG,
                    filemode="w",
                    format="%(asctime)s -%(levelname)-5s-%(lineno)s: %(message)s",
                    datefmt="%Y-%m-%d %H:%M:%S" 
                    )
    
    logger = logging.getLogger("auto-handle")
    logger.info("----start-------")
    logger.info("recieve params:%s", str(sys.argv))
    source_folder_path = PurePath(sys.argv[1])
    logger.info("source_folder_path:%s", source_folder_path)
    target_folder_path = PurePath(sys.argv[2])
    logger.info("target_folder_path:%s", target_folder_path)
    to_keep_seed_dir = sys.argv[3]
    logger.info("to keep seed path:%s", to_keep_seed_dir)
    if not str(to_keep_seed_dir).startswith(str(source_folder_path)):
        logger.info("to_keep_seed_dir not start with source_folder_path")
    else:
        for dirpath, sub_dir_names, filenames in os.walk(to_keep_seed_dir):
            logging.debug("handling dir:%s", dirpath)
            dir_pure_path = PurePath(dirpath)
            if (os.path.isdir(dirpath)):
                # if not dir_pure_path.is_relative_to(source_folder_path):
                #     raise Exception("Not sub folder of source")
                relpath = dir_pure_path.relative_to(source_folder_path)
                logging.debug("relpath:%s", relpath)
                target_file_path = os.path.join(target_folder_path, relpath)
                logging.debug("target dir:%s", dirpath)
                if not os.path.exists(target_file_path):
                    logger.info("should create folder:%s", target_file_path)
                    os.mkdir(target_file_path)
                    os.chmod(target_file_path,file_mask)
                else:
                    logger.info("skip dir create:%s", target_file_path)
                    os.chmod(target_file_path,file_mask)
            logger.debug("filenames:%s", filenames)
            for fileName in filenames:
                file_path = PurePath(os.path.join(dir_pure_path, fileName))
                logger.info("handling file:%s", file_path)
                # if not file_path.is_relative_to(source_folder_path):
                #     raise Exception("Not sub file of source")
                fileSize = os.path.getsize(file_path)
                logger.info("size:%s", fileSize)
                relpath = file_path.relative_to(source_folder_path)
                logging.debug("relpath:%s", relpath)
                target_file_path = os.path.join(target_folder_path, relpath)
                logging.debug("target file:%s", target_file_path)
                if not os.path.exists(target_file_path):
                    if fileSize > size_threshold:
                        logger.info("should hard link:%s,%s",
                                    file_path, target_file_path)
                        os.link(file_path, target_file_path)
                        os.chmod(target_file_path,file_mask)
                    else:
                        logger.info("should copy file:%s,%s",
                                    file_path, target_file_path)
                        shutil.copyfile(file_path, target_file_path)
                        os.chmod(target_file_path,file_mask)
                else:
                    logger.info("should skip file:%s", file_path)
                    os.chmod(target_file_path,file_mask)
    logger.info("----end----")
