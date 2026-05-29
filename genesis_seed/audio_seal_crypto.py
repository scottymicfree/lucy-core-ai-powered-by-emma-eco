try:
    from audioseal import AudioSeal
    import torch

    # Load the AudioSeal Generator
    generator = AudioSeal.load_generator("facebook/audioseal")
    detector = AudioSeal.load_detector("facebook/audioseal")
except ImportError:
    generator = None
    detector = None

def secure_synthetic_audio(cloned_voice_tensor, sample_rate=16000):
    if generator is None: return cloned_voice_tensor
    
    # Extract the localized cryptographic watermark tensor
    watermark = generator.get_watermark(cloned_voice_tensor, sample_rate)

    # Blend the watermark into the generation
    # alpha controls the perceptual strength/stealth of the watermark
    alpha = 1.0 
    secured_audio = cloned_voice_tensor + (alpha * watermark)
    return secured_audio

def detect_watermark(secured_audio, sample_rate=16000):
    if detector is None: return False
    
    result, message = detector(secured_audio, sample_rate)
    # The result tensor is batch x 2 x frames. Index 1 holds positive detection probabilities.
    # A verified frame will return > 0.5 probability of containing the seal.
    positive_probabilities = result[:, 1, :]
    print(f"Watermark integrity check: {positive_probabilities}")
    return positive_probabilities.max().item() > 0.5
