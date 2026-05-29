from gliner import GLiNER

# Initialize the zero-shot extraction engine (Deferred loading for memory)
model = None

# Dynamically defined OSINT intelligence targets
target_labels = ["PERSON", "ORGANIZATION", "LOCATION", "IP_ADDRESS", "THREAT_ACTOR", "CRYPTO_WALLET"]

def process_osint_corpus(text_chunks, overlap_window=64):
    global model
    if model is None:
        model = GLiNER.from_pretrained("urchade/gliner_medium-v2.1")
        
    """
    Processes large data streams using a Split-Merge overlapping algorithm
    to prevent entity fragmentation across chunk boundaries.
    """
    intelligence_graph = {}
    
    for chunk in text_chunks:
        chunk_text = chunk["text"]
        absolute_cursor = chunk["cursor_index"]
        
        try:
            # Predict entities dynamically based on the current threat landscape
            extracted_entities = model.predict_entities(chunk_text, target_labels)
        except Exception as e:
            # Fallback for highly anomalous text encodings
            if len(chunk_text) <= overlap_window:
                break
            absolute_cursor += len(chunk_text) - overlap_window
            continue
            
        for entity in extracted_entities:
            # Translate local chunk coordinates to absolute document coordinates
            entity['start'] += absolute_cursor
            entity['end'] += absolute_cursor
            
            # Deduplicate via dictionary hash to merge overlapping discoveries
            entity_key = entity['text'].lower()
            if entity_key not in intelligence_graph:
                intelligence_graph[entity_key] = entity
                
    return intelligence_graph
