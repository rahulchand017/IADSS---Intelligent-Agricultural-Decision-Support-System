import os
import faiss
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer

# load the embedding model once at startup
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# path to our knowledge base text file
KNOWLEDGE_BASE_PATH = Path(__file__).resolve().parent / "knowledge_base" / "agri_docs.txt"


def load_chunks():
    """Read the knowledge base file and split into chunks."""
    with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
        text = f.read()

    # split by double newline to get paragraphs
    raw_chunks = text.split("\n\n")

    # clean up and keep only non-empty chunks
    chunks = [chunk.strip() for chunk in raw_chunks if len(chunk.strip()) > 50]
    return chunks


def build_faiss_index(chunks):
    """Convert chunks to embeddings and build a FAISS index."""
    embeddings = embedding_model.encode(chunks, convert_to_numpy=True)

    # normalize embeddings for cosine similarity
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    embeddings = embeddings / norms

    # build flat inner product index (cosine sim after normalization)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings)

    return index, embeddings


# build index at module load time
print("Loading knowledge base and building FAISS index...")
CHUNKS = load_chunks()
FAISS_INDEX, _ = build_faiss_index(CHUNKS)
print(f"FAISS index built with {len(CHUNKS)} chunks.")


def retrieve_top_k(query: str, k: int = 4) -> list[str]:
    """Retrieve the top-k most relevant chunks for a given query."""
    query_embedding = embedding_model.encode([query], convert_to_numpy=True)

    # normalize query embedding
    query_embedding = query_embedding / np.linalg.norm(query_embedding)

    # search the FAISS index
    distances, indices = FAISS_INDEX.search(query_embedding, k)

    results = []
    for idx in indices[0]:
        if idx < len(CHUNKS):
            results.append(CHUNKS[idx])

    return results
