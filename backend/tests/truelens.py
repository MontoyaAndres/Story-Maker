from dotenv import load_dotenv

load_dotenv()

import os
import logging
from time import sleep
from llama_index.core.settings import Settings
from llama_index.llms.openai import OpenAI
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.constants import DEFAULT_TEMPERATURE
from llama_index.core.indices import VectorStoreIndex
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
from app.settings import init_settings
from app.engine.loaders import get_documents


# TrueLens stuff

from trulens_eval import Tru
from trulens_eval import TruLlama
from trulens_eval.app import App
from trulens_eval import Feedback
from trulens_eval.feedback import Groundedness
from trulens_eval.feedback.provider.openai import OpenAI as TruOpenAI
from trulens_eval.generate_test_set import GenerateTestSet
from trulens_eval.feedback import Embeddings
import numpy as np


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger()



def run_trulens():

    model_provider = os.getenv("MODEL_PROVIDER")
    if model_provider == "openai":
        max_tokens = os.getenv("LLM_MAX_TOKENS")
        config = {
            "model": os.getenv("MODEL"),
            "temperature": float(os.getenv("LLM_TEMPERATURE", DEFAULT_TEMPERATURE)),
            "max_tokens": int(max_tokens) if max_tokens is not None else None,
        }
        Settings.llm = OpenAI(**config)
        dimension = os.getenv("EMBEDDING_DIM")
        config = {
            "model": os.getenv("EMBEDDING_MODEL"),
            "dimension": int(dimension) if dimension is not None else None,
        }
        Settings.embed_model = OpenAIEmbedding(**config)
    elif model_provider == "ollama":
        Settings.llm = Ollama(model=os.getenv("OLLAMA_MODEL"))
        Settings.embed_model = OllamaEmbedding(model_name=os.getenv("OLLAMA_EMBEDDING_MODEL"))

    logger.info("Connecting to index from MongoDB...")
    top_k = os.getenv("TOP_K", "3")
    store = MongoDBAtlasVectorSearch(
        db_name=os.environ["MONGODB_DATABASE"],
        collection_name=os.environ["MONGODB_VECTORS"],
        index_name=os.environ["MONGODB_VECTOR_INDEX"],
    )
    index = VectorStoreIndex.from_vector_store(store)
    logger.info("Finished connecting to index from MongoDB.")

    query_engine = index.as_query_engine(similarity_top_k=int(top_k)) 

    
    # Trulens
    '''
    model_name = 'text-embedding-ada-002'
    embed_model = OpenAIEmbedding(
        model=model_name,
        openai_api_key=os.environ["OPENAI_API_KEY"]
    )
    embed = Embeddings(embed_model=embed_model)
    f_embed_dist = (
        Feedback(embed.cosine_distance)
        .on_input()
        .on(TruLlama.select_source_nodes().node.text)
    )
    '''
    logger.info("trulens: TruOpenAI")
    openai = TruOpenAI()
    logger.info("trulens: Context")
    context = App.select_context(query_engine)
    logger.info("trulens: Groundedness")
    #breakpoint()
    grounded = Groundedness(groundedness_provider=openai)
    logger.info("Creating functions")
    f_groundedness = (
        Feedback(grounded.groundedness_measure_with_cot_reasons)
        .on(context.collect()) # collect context chunks into a list
        .on_output()
        .aggregate(grounded.grounded_statements_aggregator)
    )

    # Question/answer relevance between overall question and answer.
    f_qa_relevance = Feedback(openai.relevance).on_input_output()

    # Question/statement relevance between question and each context chunk.
    f_qs_relevance = (
        Feedback(openai.qs_relevance)
        .on_input()
        .on(context)
        .aggregate(np.mean)
    )

    logger.info("Creating TruLlama recorders")
    
    groundedness_recorder = TruLlama(query_engine,
        app_id='Story-Maker',
        feedbacks=[f_groundedness])
    qa_relevance_recorder = TruLlama(query_engine,
        app_id='Story-Maker',
        feedbacks=[f_qa_relevance])
    qs_relevance_recorder = TruLlama(query_engine,
        app_id='Story-Maker',
        feedbacks=[f_qs_relevance])
    
    logger.info("Creating test set")
    #test = GenerateTestSet(app_callable = query_engine.query)
    # Generate the test set of a specified breadth and depth without examples automatically
    # test_set = test.generate_test_set(test_breadth = 1, test_depth = 1)

    test_set = [
        "What are the top 3 keywords to publish fiction books in Amazon?",
        "What should be the words lenght of fiction and non-fiction books in Amazon?"
    ]
    
    logger.info("Running test set queries")
    with groundedness_recorder as recording:
        for test_prompt in test_set:
                response = query_engine.query(test_prompt)
                logger.info("Waiting 1 min for OpenAI ratelimits")
                sleep(61)
    with qa_relevance_recorder as recording:
        for test_prompt in test_set:
                response = query_engine.query(test_prompt)
                logger.info("Waiting 1 min for OpenAI ratelimits")
                sleep(61)            
    with qs_relevance_recorder as recording:
        for test_prompt in test_set:
                response = query_engine.query(test_prompt)
                logger.info("Waiting 1 min for OpenAI ratelimits")
                sleep(61)

if __name__ == "__main__":
    tru = Tru()
    #tru.reset_database()
    tru.run_dashboard()
    run_trulens()
    tru.get_leaderboard()
    
