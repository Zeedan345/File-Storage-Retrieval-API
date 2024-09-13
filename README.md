# File-Storage-Retrieval-API
This API allows users to upload multiple files, store them on the server, and later download them as a zipped archive.

Overview
Upload Endpoint (`POST /upload`):

Accepts multiple file uploads.
Stores the uploaded files on the server.
Returns a unique identifier (uploadId) for the uploaded files.
Download Endpoint (`GET /download/:id`):

Takes the uploadId as a URL parameter.
Zips the corresponding files.
Sends the zipped file as a downloadable response.

```
express-file-api/
├── uploads/       # Directory to store uploaded files
├── zips/          # Directory to store zipped files
├── index.js       # Main server file
├── package.json
└── package-lock.json
```

### Starting the Server:
Start the server using Node JS:
'node index.js'
