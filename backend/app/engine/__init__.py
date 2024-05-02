import os
import logging
from llama_index.core.settings import Settings
from llama_index.core.agent import AgentRunner
from llama_index.core.tools import QueryEngineTool, ToolMetadata
from llama_index.core import set_global_handler
from app.engine.tools import ToolFactory
from app.engine.index import get_index
from app.engine.notes import note_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger()

set_global_handler("simple")

def get_chat_engine(email :str):
    logger.info("Start: Get chat engine for {email}")

    #system_prompt = os.getenv("SYSTEM_PROMPT")
    top_k = os.getenv("TOP_K", "3")
    tools = [note_engine]

    # Add query tool if index exists
    index = get_index()
    if index is not None:
        query_engine = index.as_query_engine(similarity_top_k=int(top_k)) 
        query_engine_tool = QueryEngineTool(
            query_engine=query_engine,
            metadata=ToolMetadata(
                name="amazon_book_data",
                description="This tool gives detailed information about Amazon books description and reviews",
            )
        )

    tools.append(query_engine_tool)

    # Add additional tools
    tools += ToolFactory.from_env()

    return AgentRunner.from_llm(
        llm=Settings.llm,
        tools=tools,
        #system_prompt=system_prompt,
        verbose=True,
    )
