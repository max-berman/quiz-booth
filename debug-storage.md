# Firebase Storage Emulator Debug Information

## Where Images Are Stored

### Storage Location

- **Emulator Data Directory**: `./emulator-data/storage_export/`
- **File Path**: `game-logos/{gameId}/{filename}` (as shown in metadata)
- **Actual Storage**: Files are stored as binary blobs with UUID names

### Current Uploaded File

- **Game ID**: `1f01532b-f610-473b-9e0a-ad5ecb4dae01`
- **Filename**: `arcade-gaming.png`
- **File Size**: 66,263 bytes
- **Dimensions**: 1581 x 527 pixels
- **Content Type**: `image/png`

### Storage Structure

```
./emulator-data/storage_export/
├── buckets.json              # Bucket configuration
├── metadata/                 # File metadata (JSON files)
│   └── [uuid].json          # Contains file path, size, type, etc.
└── blobs/                   # Actual file data
    └── [uuid]               # Binary file data
```

### How to Access Files

1. **Check metadata**: Look in `./emulator-data/storage_export/metadata/` for JSON files
2. **Find actual file**: The JSON contains the original file path and links to the blob
3. **View blob**: Files are stored in `./emulator-data/storage_export/blobs/`

### Why Emulator UI Shows Empty

The Firebase Emulator UI at `http://localhost:4000/storage` shows the production bucket URL (`trivia-games-7a81b.firebasestorage.app`) but the emulator actually stores files locally in the `storage_export` directory.

### Verification

The upload is working correctly - files are being stored in the emulator and can be retrieved using the Firebase Storage SDK with the download URL.
