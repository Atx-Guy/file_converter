# audio_converter.py
import os
import subprocess
import requests
import zipfile
import logging
import platform
import shutil

logger = logging.getLogger(__name__)

FFMPEG_DIR = "ffmpeg-static"

# Windows-specific FFmpeg URL and binary name
WINDOWS_FFMPEG_URL = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
WINDOWS_BINARY = os.path.join(FFMPEG_DIR, "ffmpeg.exe")

def download_ffmpeg():
    """Download FFmpeg for Windows"""
    if os.path.exists(WINDOWS_BINARY):
        logger.info(f"FFmpeg binary already exists at {WINDOWS_BINARY}")
        return WINDOWS_BINARY

    logger.info("Downloading FFmpeg...")
    os.makedirs(FFMPEG_DIR, exist_ok=True)

    try:
        # Download the zip file
        zip_path = os.path.join(FFMPEG_DIR, "ffmpeg.zip")
        with requests.get(WINDOWS_FFMPEG_URL, stream=True) as r:
            r.raise_for_status()
            with open(zip_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)

        # Extract the zip file
        logger.info("Extracting FFmpeg...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(FFMPEG_DIR)

        # Find and move ffmpeg.exe to the correct location
        for root, _, files in os.walk(FFMPEG_DIR):
            if "ffmpeg.exe" in files:
                source_path = os.path.join(root, "ffmpeg.exe")
                if source_path != WINDOWS_BINARY:
                    shutil.move(source_path, WINDOWS_BINARY)
                break

        # Clean up
        os.remove(zip_path)
        
        # Clean up extracted directories except the binary
        for item in os.listdir(FFMPEG_DIR):
            item_path = os.path.join(FFMPEG_DIR, item)
            if item_path != WINDOWS_BINARY:
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                elif os.path.isfile(item_path):
                    os.remove(item_path)

        logger.info(f"FFmpeg installed successfully at {WINDOWS_BINARY}")
        return WINDOWS_BINARY

    except Exception as e:
        logger.error(f"Error downloading FFmpeg: {str(e)}")
        raise

def convert_audio(input_file: str, output_file: str):
    """Convert an audio file using FFmpeg."""
    ffmpeg_path = download_ffmpeg()
    
    # Ensure paths are absolute
    input_file = os.path.abspath(input_file)
    output_file = os.path.abspath(output_file)
    
    # Get output format from file extension
    output_format = output_file.split('.')[-1].lower()
    
    logger.info(f"Converting {input_file} to {output_file} (format: {output_format})")
    logger.info(f"Using FFmpeg at: {ffmpeg_path}")
    
    try:
        # Base command with input file
        command = [
            ffmpeg_path,
            '-y',  # Overwrite output file if it exists
            '-i', input_file,  # Input file
        ]
        
        # Add format-specific encoding parameters
        if output_format == 'mp3':
            command.extend([
                '-acodec', 'libmp3lame',
                '-ab', '192k',
                '-ar', '44100'
            ])
        elif output_format == 'aac':
            command.extend([
                '-acodec', 'aac',
                '-b:a', '192k',
                '-ar', '44100'
            ])
        elif output_format == 'm4a':
            command.extend([
                '-acodec', 'aac',
                '-b:a', '192k',
                '-ar', '44100',
                '-f', 'mp4'
            ])
        elif output_format == 'ogg':
            command.extend([
                '-acodec', 'libvorbis',
                '-q:a', '4',
                '-ar', '44100'
            ])
        elif output_format == 'flac':
            command.extend([
                '-acodec', 'flac',
                '-ar', '44100',
                '-sample_fmt', 's16'
            ])
        elif output_format == 'wav':
            command.extend([
                '-acodec', 'pcm_s16le',
                '-ar', '44100'
            ])
        else:
            raise ValueError(f"Unsupported output format: {output_format}")
        
        # Add output file to command
        command.append(output_file)
        
        logger.info(f"Running FFmpeg command: {' '.join(command)}")
        
        # Run FFmpeg command
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True
        )
        
        logger.info("Conversion successful")
        return result
        
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg conversion error: {e.stderr}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during conversion: {str(e)}")
        raise

if __name__ == "__main__":
    # Example usage: convert WAV to MP3
    input_wav = "test.wav"
    output_mp3 = "test.mp3"
    convert_audio(input_wav, output_mp3)
    print("Conversion complete.")
