from dotenv import load_dotenv

load_dotenv()

import os
import logging
from llama_index.core.storage import StorageContext
from llama_index.core.indices import VectorStoreIndex
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch

from datasets import load_dataset
import pandas as pd

from app.settings import init_settings
from app.engine.loaders import get_documents

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()


def generate_datasource():
    init_settings()
    logger.info("Creating new index")
    # load the documents and create the index
    documents = get_documents()
    store = MongoDBAtlasVectorSearch(
        db_name=os.environ["MONGODB_DATABASE"],
        collection_name=os.environ["MONGODB_VECTORS"],
        index_name=os.environ["MONGODB_VECTOR_INDEX"],
    )
    storage_context = StorageContext.from_defaults(vector_store=store)
    VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        show_progress=True,  # this will show you a progress bar as the embeddings are created
    )
    logger.info(
        f"Successfully created embeddings in the MongoDB collection {os.environ['MONGODB_VECTORS']}"
    )
    logger.info(
        """IMPORTANT: You can't query your index yet because you need to create a vector search index in MongoDB's UI now.
See https://github.com/run-llama/mongodb-demo/tree/main?tab=readme-ov-file#create-a-vector-search-index"""
    )

def load_datasource():
    init_settings()

    logger.info("Loading dataset from HuggingFace")
    dataset = load_dataset("cogsci13/Amazon-Reviews-2023-Books-Meta", split="full", streaming=True, verification_mode="no_checks")
    dataset_head = dataset.take(2)
    print(dataset_head)
    
    
    logger.info("Converting the dataset to a pandas dataframe")
    dataset_df = pd.DataFrame(dataset_head)
    #logger.info("Columns with null")
    #print(dataset_df.isnull().sum())

    
    logger.info("Creating new index")
    # load the documents and create the index
    documents = dataset_df.to_dict('records')
    
    store = MongoDBAtlasVectorSearch(
        db_name=os.environ["MONGODB_DATABASE"],
        collection_name=os.environ["MONGODB_VECTORS"],
        index_name=os.environ["MONGODB_VECTOR_INDEX"],
    )
    storage_context = StorageContext.from_defaults(vector_store=store)
    VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        show_progress=True,  # this will show you a progress bar as the embeddings are created
    )
    logger.info(
        f"Successfully created embeddings in the MongoDB collection {os.environ['MONGODB_VECTORS']}"
    )
    logger.info(
        """IMPORTANT: You can't query your index yet because you need to create a vector search index in MongoDB's UI now.
See https://github.com/run-llama/mongodb-demo/tree/main?tab=readme-ov-file#create-a-vector-search-index"""
    )


if __name__ == "__main__":
    generate_datasource()
    #load_datasource()