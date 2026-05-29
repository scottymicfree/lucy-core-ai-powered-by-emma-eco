import weaviate
import datetime

# Initialize the Weaviate Python Client connection to the local cluster
client = None

def execute_hippocampal_pruning(collection_name="EpisodicMemory", decay_days=30, salience_threshold=0.3):
    global client
    if client is None:
        client = weaviate.Client("http://localhost:8080")

    """
    Executes biological memory decay, pruning vectors from the database that are 
    both chronologically stale and analytically irrelevant, preventing hallucination drift.
    """
    # Calculate the ISO-8601 decay horizon
    decay_horizon = datetime.datetime.now() - datetime.timedelta(days=decay_days)
    iso_date_string = decay_horizon.isoformat() + "Z"
    
    # Construct a GraphQL-like 'where' filter for batch deletion
    # Identifies memory nodes that haven't been accessed recently AND have low baseline salience
    pruning_filter = {
        'operator': 'And',
        'operands': [
            {
                'path': ['last_accessed_timestamp'],
                'operator': 'LessThan',
                'valueDate': iso_date_string
            },
            {
                'path': ['analytical_salience_score'],
                'operator': 'LessThan',
                'valueNumber': salience_threshold
            }
        ]
    }
    
    # Execute batch delete operation
    result = client.batch.delete_objects(
        class_name=collection_name,
        where=pruning_filter
    )
    
    pruned_count = result.get('results', {}).get('successful', 0)
    print(f" N2 Spindle Pruning Complete. {pruned_count} vectors decayed.")
