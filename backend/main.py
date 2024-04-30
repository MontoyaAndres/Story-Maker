from dotenv import load_dotenv

load_dotenv()

import logging
import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.api.routers.chat import chat_router
from app.settings import init_settings
from app.observability import init_observability
from fastapi import File, UploadFile
from typing import List

app = FastAPI()

init_settings()
init_observability()

environment = os.getenv("ENVIRONMENT", "dev")  # Default to 'development' if not set


if environment == "dev":
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("uvicorn")
    logger.warning("Running in development mode - allowing CORS for all origins")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Redirect to documentation page when accessing base URL
    @app.get("/")
    async def redirect_to_docs():
        return RedirectResponse(url="/docs")


app.include_router(chat_router, prefix="/api/chat")

@app.get("/healthcheck")
def read_root():
     return {"status": "ok"}

@app.post("/upload")
def upload(email: str, file: UploadFile = File(...)):
    try:
        data_dir = 'data/'+email.replace('@','_at_')
        os.makedirs(data_dir, exist_ok=True)
        contents = file.file.read()
        with open(data_dir+'/'+file.filename, 'wb') as f:
            f.write(contents)
    except Exception as error:
        logger.info("An error occurred:", error)
        return {"message": f"There was an error uploading the file: {type(error).__name__}"}
    finally:
        file.file.close()   

    return {"message": f"Successfully uploaded {file.filename}"}

@app.post("/upload-multiple")
def upload(email: str, files: List[UploadFile] = File(...)):
    for file in files:
        try:
            data_dir = 'data/'+email.replace('@','_at_')
            os.makedirs(data_dir, exist_ok=True)
            contents = file.file.read()
            with open(data_dir+'/'+file.filename, 'wb') as f:
                f.write(contents)
        except Exception:
            return {"message": "There was an error uploading the file(s)"}
        finally:
            file.file.close()

    return {"message": f"Successfuly uploaded {[file.filename for file in files]}"}    

if __name__ == "__main__":
    app_host = os.getenv("APP_HOST", "0.0.0.0")
    app_port = int(os.getenv("APP_PORT", "8080"))
    reload = True if environment == "dev" else False

    uvicorn.run(app="main:app", host=app_host, port=app_port, reload=reload)
