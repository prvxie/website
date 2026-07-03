const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method === 'GET' && req.url !== '/profiles') {
        let filePath = path.join(__dirname, req.url === '/' ? 'editor.html' : req.url.split('?')[0]);
        fs.stat(filePath, (err, stats) => {
            if (!err && stats.isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('File Not Found');
                } else {
                    const ext = path.extname(filePath).toLowerCase();
                    const mimeTypes = {
                        '.html': 'text/html',
                        '.js': 'text/javascript',
                        '.css': 'text/css',
                        '.json': 'application/json',
                        '.png': 'image/png',
                        '.jpg': 'image/jpeg',
                        '.gif': 'image/gif',
                        '.svg': 'image/svg+xml',
                        '.wav': 'audio/wav',
                        '.mp3': 'audio/mpeg',
                        '.mp4': 'video/mp4',
                        '.woff': 'application/font-woff',
                        '.ttf': 'application/font-ttf'
                    };
                    const contentType = mimeTypes[ext] || 'application/octet-stream';
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content, 'utf-8');
                }
            });
        });
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        let payload = {};
        try { if (body) payload = JSON.parse(body); } catch(e){}

        if (req.method === 'POST' && req.url === '/save') {
            const profile = payload.profile;
            const code = payload.code;
            if (!profile || !code) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing profile or code' }));
                return;
            }
            const filePath = path.join(__dirname, profile, 'config.js');
            fs.writeFile(filePath, code, 'utf8', (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: `Successfully saved to ${profile}/config.js!` }));
                }
            });
        }
        else if (req.method === 'POST' && req.url === '/save-website') {
            const code = payload.code;
            if (!code) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Missing code' }));
                return;
            }
            const filePath = path.join(__dirname, 'index.html');
            fs.writeFile(filePath, code, 'utf8', (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: `Successfully saved main index.html website!` }));
                }
            });
        }
        else if (req.method === 'POST' && req.url === '/create-profile') {
            const name = payload.name;
            if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid profile name' }));
                return;
            }
            const srcDir = path.join(__dirname, 'koni');
            const destDir = path.join(__dirname, name);

            if (fs.existsSync(destDir)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Profile already exists' }));
                return;
            }

            fs.mkdirSync(destDir);
            const files = fs.readdirSync(srcDir);
            for (const file of files) {
                fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
            }

            // Update the username inside destination config.js
            const configPath = path.join(destDir, 'config.js');
            if (fs.existsSync(configPath)) {
                let conf = fs.readFileSync(configPath, 'utf8');
                conf = conf.replace(/username:\s*"[^"]*"/, `username: "${name}"`);
                conf = conf.replace(/window\.KoniConfig\s*=/, `window.${name.charAt(0).toUpperCase() + name.slice(1)}Config =`);
                fs.writeFileSync(configPath, conf, 'utf8');
            }

            // Also update index.html inside destination to reference the new config and profile files
            const indexPath = path.join(destDir, 'index.html');
            if (fs.existsSync(indexPath)) {
                let idx = fs.readFileSync(indexPath, 'utf8');
                idx = idx.replace(/src="config\.js"/, `src="config.js"`);
                idx = idx.replace(/src="profile\.js"/, `src="profile.js"`);
                fs.writeFileSync(indexPath, idx, 'utf8');
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: `Successfully created profile "${name}"!` }));
        }
        else if (req.method === 'GET' && req.url === '/profiles') {
            fs.readdir(__dirname, { withFileTypes: true }, (err, files) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                } else {
                    const profiles = files
                        .filter(dirent => dirent.isDirectory() && dirent.name !== '.git' && dirent.name !== 'node_modules' && dirent.name !== '.gemini' && dirent.name !== '.agents')
                        .map(dirent => dirent.name);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ profiles }));
                }
            });
        }
        else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    });
});

server.listen(PORT, () => {
    console.log(`alternate.lol background save-server running on http://localhost:${PORT}`);
    console.log(`Keep this process open to enable Quick Saving and Profile Management in editor.html!`);
});
