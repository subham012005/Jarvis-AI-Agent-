import os
import time
import json
import sqlite3
import datetime
import logging
import signal
import sys
import math
import random
import struct
import threading
from pathlib import Path
from typing import Optional, List, Tuple, Dict, Any, Union
from fastapi import FastAPI, HTTPException, Request, Body
from pydantic import BaseModel
import uvicorn
from neonize.client import NewClient
from neonize.events import MessageEv, ConnectedEv, LoggedOutEv, HistorySyncEv
from neonize.proto.Neonize_pb2 import JID
from neonize.proto.waE2E.WAWebProtobufsE2E_pb2 import Message as WAMessage
from qrcode import QRCode

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("WhatsAppBridge")

app = FastAPI(title="WhatsApp Bridge API")

class MessageStore:
    def __init__(self, db_path: str = "store/messages.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.execute("PRAGMA foreign_keys = 1")
        self.conn.execute("PRAGMA journal_mode = WAL")
        self.create_tables()

    def create_tables(self):
        with self.conn:
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS chats (
                    jid TEXT PRIMARY KEY,
                    name TEXT,
                    last_message_time TIMESTAMP
                )
            """)
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT,
                    chat_jid TEXT,
                    sender TEXT,
                    content TEXT,
                    timestamp TIMESTAMP,
                    is_from_me BOOLEAN,
                    media_type TEXT,
                    filename TEXT,
                    url TEXT,
                    media_key BLOB,
                    file_sha256 BLOB,
                    file_enc_sha256 BLOB,
                    file_length INTEGER,
                    PRIMARY KEY (id, chat_jid),
                    FOREIGN KEY (chat_jid) REFERENCES chats(jid)
                )
            """)

    def store_chat(self, jid: str, name: str, last_message_time: datetime.datetime):
        if last_message_time.tzinfo is None:
            last_message_time = last_message_time.astimezone()
        ts_str = last_message_time.strftime("%Y-%m-%d %H:%M:%S %z")
        with self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO chats (jid, name, last_message_time) VALUES (?, ?, ?)",
                (jid, name, ts_str)
            )

    def store_message(self, msg_id: str, chat_jid: str, sender: str, content: str, 
                      timestamp: datetime.datetime, is_from_me: bool,
                      media_type: str = "", filename: str = "", url: str = "", 
                      media_key: bytes = b"", file_sha256: bytes = b"", 
                      file_enc_sha256: bytes = b"", file_length: int = 0):
        if not content and not media_type:
            return

        if timestamp.tzinfo is None:
            timestamp = timestamp.astimezone()
        ts_str = timestamp.strftime("%Y-%m-%d %H:%M:%S %z")
        with self.conn:
            self.conn.execute(
                "INSERT OR REPLACE INTO messages (id, chat_jid, sender, content, timestamp, is_from_me, media_type, filename, url, media_key, file_sha256, file_enc_sha256, file_length) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (msg_id, chat_jid, sender, content, ts_str, 1 if is_from_me else 0, media_type, filename, url, media_key, file_sha256, file_enc_sha256, file_length)
            )

    def get_media_info(self, msg_id: str, chat_jid: str):
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT media_type, filename, url, media_key, file_sha256, file_enc_sha256, file_length FROM messages WHERE id = ? AND chat_jid = ?",
            (msg_id, chat_jid)
        )
        return cursor.fetchone()

    def close(self):
        self.conn.close()

def extract_text_content(msg: WAMessage) -> str:
    if not msg:
        return ""
    if msg.conversation:
        return msg.conversation
    if msg.extendedTextMessage and msg.extendedTextMessage.text:
        return msg.extendedTextMessage.text
    return ""

def extract_caption(msg: WAMessage) -> str:
    for msg_type in ["imageMessage", "videoMessage", "documentMessage"]:
        m = getattr(msg, msg_type, None)
        if m:
            caption = getattr(m, "caption", None)
            if caption:
                return caption
    return ""

def extract_media_info(msg: WAMessage) -> Dict[str, Any]:
    info = {
        "media_type": "",
        "filename": "",
        "url": "",
        "media_key": b"",
        "file_sha256": b"",
        "file_enc_sha256": b"",
        "file_length": 0
    }
    
    now_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    if getattr(msg, "imageMessage", None):
        m = msg.imageMessage
        info.update({
            "media_type": "image",
            "filename": f"image_{now_str}.jpg",
            "url": getattr(m, "url", getattr(m, "URL", "")),
            "media_key": getattr(m, "mediaKey", getattr(m, "MediaKey", b"")),
            "file_sha256": getattr(m, "fileSha256", getattr(m, "FileSha256", b"")),
            "file_enc_sha256": getattr(m, "fileEncSha256", getattr(m, "FileEncSha256", b"")),
            "file_length": getattr(m, "fileLength", getattr(m, "FileLength", 0))
        })
    elif getattr(msg, "videoMessage", None):
        m = msg.videoMessage
        info.update({
            "media_type": "video",
            "filename": f"video_{now_str}.mp4",
            "url": getattr(m, "url", getattr(m, "URL", "")),
            "media_key": getattr(m, "mediaKey", getattr(m, "MediaKey", b"")),
            "file_sha256": getattr(m, "fileSha256", getattr(m, "FileSha256", b"")),
            "file_enc_sha256": getattr(m, "fileEncSha256", getattr(m, "FileEncSha256", b"")),
            "file_length": getattr(m, "fileLength", getattr(m, "FileLength", 0))
        })
    elif getattr(msg, "audioMessage", None):
        m = msg.audioMessage
        info.update({
            "media_type": "audio",
            "filename": f"audio_{now_str}.ogg",
            "url": getattr(m, "url", getattr(m, "URL", "")),
            "media_key": getattr(m, "mediaKey", getattr(m, "MediaKey", b"")),
            "file_sha256": getattr(m, "fileSha256", getattr(m, "FileSha256", b"")),
            "file_enc_sha256": getattr(m, "fileEncSha256", getattr(m, "FileEncSha256", b"")),
            "file_length": getattr(m, "fileLength", getattr(m, "FileLength", 0))
        })
    elif getattr(msg, "documentMessage", None):
        m = msg.documentMessage
        info.update({
            "media_type": "document",
            "filename": getattr(m, "fileName", f"doc_{now_str}"),
            "url": getattr(m, "url", getattr(m, "URL", "")),
            "media_key": getattr(m, "mediaKey", getattr(m, "MediaKey", b"")),
            "file_sha256": getattr(m, "fileSha256", getattr(m, "FileSha256", b"")),
            "file_enc_sha256": getattr(m, "fileEncSha256", getattr(m, "FileEncSha256", b"")),
            "file_length": getattr(m, "fileLength", getattr(m, "FileLength", 0))
        })
        
    return info

# Global bridge state
bridge_client: Optional[NewClient] = None
message_store: Optional[MessageStore] = None

class SendMessageRequest(BaseModel):
    recipient: str
    message: str = ""
    media_path: Optional[str] = None

class DownloadRequest(BaseModel):
    message_id: str
    chat_jid: str

@app.post("/api/send")
async def send_message(req: SendMessageRequest):
    recipient = req.recipient
    message_text = req.message
    media_path = req.media_path

    if not recipient:
        raise HTTPException(status_code=400, detail="Recipient is required")

    try:
        # Parse recipient JID
        if "@" in recipient:
            user, server = recipient.split("@", 1)
            target_jid = JID(User=user, Server=server, Device=0, Integrator=0, IsEmpty=False, RawAgent=0)
        else:
            target_jid = JID(User=recipient, Server="s.whatsapp.net", Device=0, Integrator=0, IsEmpty=False, RawAgent=0)

        # Retry logic
        last_error = "Unknown error"
        for attempt in range(3):
            try:
                if not bridge_client.is_connected:
                    logger.info("Bridge disconnected, waiting for reconnection...")
                    time.sleep(2)
                
                if media_path:
                    # Detect media type and use appropriate method
                    import mimetypes
                    mime, _ = mimetypes.guess_type(media_path)
                    
                    if mime:
                        if mime.startswith('image/'):
                            bridge_client.send_image(target_jid, media_path, caption=message_text)
                        elif mime.startswith('video/'):
                            bridge_client.send_video(target_jid, media_path, caption=message_text)
                        elif mime.startswith('audio/'):
                            bridge_client.send_audio(target_jid, media_path)
                        else:
                            bridge_client.send_document(target_jid, media_path, caption=message_text, filename=os.path.basename(media_path))
                    else:
                        # Fallback to document
                        bridge_client.send_document(target_jid, media_path, caption=message_text, filename=os.path.basename(media_path))
                else:
                    bridge_client.send_message(target_jid, message_text)
                return {"success": True, "message": f"Message sent to {recipient}"}
            except Exception as e:
                last_error = str(e)
                logger.error(f"Attempt {attempt+1} failed: {last_error}")
                
                if "not connected" in last_error.lower() or "websocket" in last_error.lower() or "stream" in last_error.lower():
                    logger.info("Connection error detected, waiting for background reconnection...")
                    time.sleep(2)
                    continue
                break
        
        raise HTTPException(status_code=500, detail=f"Failed after retries: {last_error}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in send_message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/download")
async def download_api(req: DownloadRequest):
    msg_id = req.message_id
    chat_jid = req.chat_jid

    try:
        media_info = message_store.get_media_info(msg_id, chat_jid)
        if not media_info or not media_info[0]:
            raise HTTPException(status_code=404, detail="Media info not found")

        media_type, filename, url, media_key, file_sha256, file_enc_sha256, file_length = media_info
        
        chat_dir = f"store/{chat_jid.replace(':', '_')}"
        os.makedirs(chat_dir, exist_ok=True)
        local_path = os.path.join(chat_dir, filename)
        abs_path = os.path.abspath(local_path)

        if os.path.exists(local_path):
            return {"success": True, "message": "File already exists", "filename": filename, "path": abs_path}

        media_data = bridge_client.download_any(url, media_key, file_sha256, file_enc_sha256, file_length, media_type)
        
        with open(local_path, "wb") as f:
            f.write(media_data)

        return {"success": True, "message": f"Successfully downloaded {media_type} media", "filename": filename, "path": abs_path}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Download failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    return {
        "is_connected": bridge_client.is_connected if bridge_client else False,
        "is_logged_in": bridge_client.is_logged_in if bridge_client else False
    }

@app.get("/api/chats")
async def get_chats():
    try:
        cursor = message_store.conn.cursor()
        cursor.execute("SELECT jid, name, last_message_time FROM chats ORDER BY last_message_time DESC")
        chats = [{"jid": row[0], "name": row[1], "last_time": row[2]} for row in cursor.fetchall()]
        return {"success": True, "chats": chats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/messages")
async def get_messages(jid: str, limit: int = 20):
    try:
        cursor = message_store.conn.cursor()
        cursor.execute(
            "SELECT sender, content, timestamp, is_from_me, media_type, filename FROM messages WHERE chat_jid = ? ORDER BY timestamp DESC LIMIT ?",
            (jid, limit)
        )
        msgs = [{
            "sender": row[0],
            "content": row[1],
            "timestamp": row[2],
            "is_from_me": bool(row[3]),
            "media_type": row[4],
            "filename": row[5]
        } for row in cursor.fetchall()]
        return {"success": True, "messages": msgs[::-1]} # Return in chronological order
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def on_message(client: NewClient, message: MessageEv):
    chat_jid = message.Info.MessageSource.Chat.User + "@" + message.Info.MessageSource.Chat.Server
    sender = message.Info.MessageSource.Sender.User
    ts_val = message.Info.Timestamp
    if ts_val > 2000000000:
        ts_val = ts_val / 1000
    try:
        timestamp = datetime.datetime.fromtimestamp(ts_val)
    except (OSError, ValueError):
        timestamp = datetime.datetime.now()
    is_from_me = message.Info.MessageSource.IsFromMe
    
    # Simple chat name resolution
    name = chat_jid
    try:
        if "@g.us" in chat_jid:
            info = client.get_group_info(message.Info.MessageSource.Chat)
            if info and info.Name:
                name = info.Name
        else:
            contact = client.store.contacts.get_contact(message.Info.MessageSource.Chat)
            if contact and contact.FullName:
                name = contact.FullName
    except:
        pass

    message_store.store_chat(chat_jid, name, timestamp)
    
    content = extract_text_content(message.Message)
    media_info = extract_media_info(message.Message)
    
    message_store.store_message(
        msg_id=message.Info.ID,
        chat_jid=chat_jid,
        sender=sender,
        content=content,
        timestamp=timestamp,
        is_from_me=is_from_me,
        **media_info
    )
    
    direction = "→" if is_from_me else "←"
    if media_info["media_type"]:
        print(f"[{timestamp}] {direction} {sender}: [{media_info['media_type']}: {media_info['filename']}] {content}")
    else:
        print(f"[{timestamp}] {direction} {sender}: {content}")

def connect_thread():
    while True:
        try:
            if not bridge_client.is_connected:
                logger.info(f"Connection check: is_logged_in={bridge_client.is_logged_in}")
                if bridge_client.is_logged_in:
                    logger.info("Attempting to connect to WhatsApp...")
                    try:
                        bridge_client.disconnect()
                    except:
                        pass
                    time.sleep(1)
                    bridge_client.connect()
                else:
                    logger.warning("Client not logged in! Waiting for QR scan via main thread...")
                    bridge_client.connect()
            else:
                time.sleep(10)
        except Exception as e:
            logger.error(f"Connection error: {e}")
            time.sleep(5)
        
        logger.warning("Connection lost or connect returned. Retrying in 5 seconds...")
        time.sleep(5)

def main():
    global bridge_client, message_store
    
    store_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "store")
    os.makedirs(store_dir, exist_ok=True)
    
    message_store = MessageStore(os.path.join(store_dir, "messages.db"))
    bridge_client = NewClient(os.path.join(store_dir, "whatsapp.db"))
    
    @bridge_client.event(MessageEv)
    def on_message_wrapper(client: NewClient, message: MessageEv):
        on_message(client, message)
    
    @bridge_client.event(ConnectedEv)
    def on_connected(_, __):
        logger.info("Connected to WhatsApp")

    @bridge_client.qr
    def on_qr(client, qr_code):
        print("\nScan this QR code with your WhatsApp app:")
        qr = QRCode()
        qr.add_data(qr_code)
        qr.print_ascii(invert=True)
        
        # Also save to file for easy access
        try:
            img = qr.make_image(fill_color="black", back_color="white")
            img.save("qr.png")
            # Also save to parent dir if possible
            img.save("../qr.png")
            logger.info("QR code saved to qr.png")
        except Exception as e:
            logger.error(f"Failed to save QR image: {e}")

    @app.get("/qr")
    async def get_qr():
        if os.path.exists("qr.png"):
            from fastapi.responses import FileResponse
            return FileResponse("qr.png")
        raise HTTPException(status_code=404, detail="QR code not found or already logged in")

    @app.get("/status")
    async def get_status():
        return {
            "connected": bridge_client.is_connected,
            "logged_in": bridge_client.is_logged_in,
            "timestamp": datetime.datetime.now().isoformat()
        }

    # Start connection thread
    threading.Thread(target=connect_thread, daemon=True).start()
    
    # Handle signals
    def signal_handler(sig, frame):
        logger.info("Exiting...")
        bridge_client.disconnect()
        message_store.close()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    print("Bridge is running on port 8081. Press Ctrl+C to exit.")
    uvicorn.run(app, host="0.0.0.0", port=8081)

if __name__ == "__main__":
    main()
